import * as Sentry from '@sentry/react';
import { SentryLogLevel } from '../core/sentry-types';

interface GameCronLog {
    message: string;
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    timestamp: number;
    context?: Record<string, any>;
    componentName?: string;
}

interface GameCronBatch {
    gameCronId: string;
    gameName: string;
    logs: GameCronLog[];
    lastFlushTime: number;
    isFlushing: boolean;
    hasIssues: boolean; // Track if there are warnings/errors/fatal
    startTime: number;
    endTime?: number;
}

interface GameCronConfig {
    gameId: string;
    gameName: string;
    systemType: 'SG' | 'VG' | 'GN';
    environment: string;
    maxBatchSize: number;
    flushInterval: number;
    onlySendOnIssues: boolean; // Only send to Sentry if there are warnings/errors/fatal
}

class SentryGameCronBatchManager {
    private static instance: SentryGameCronBatchManager;
    private gameCronBatches: Map<string, GameCronBatch> = new Map();
    private gameCronConfigs: Map<string, GameCronConfig> = new Map();
    private flushTimer: NodeJS.Timeout | null = null;
    private isInitialized = false;
    private defaultConfig: GameCronConfig;

    private constructor() {
        this.defaultConfig = {
            gameId: 'default',
            gameName: 'Unknown Game',
            systemType: 'SG',
            environment: 'LOCAL1',
            maxBatchSize: 100,
            flushInterval: 10000, // 10 seconds for game crons
            onlySendOnIssues: true // Only send to Sentry when there are issues
        };
    }

    static getInstance(): SentryGameCronBatchManager {
        if (!SentryGameCronBatchManager.instance) {
            SentryGameCronBatchManager.instance = new SentryGameCronBatchManager();
        }
        return SentryGameCronBatchManager.instance;
    }

    initialize(): void {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;
        this.startFlushTimer();
        console.log('SentryGameCronBatchManager initialized');
    }

    // Register a game cron with configuration
    registerGameCron(gameCronId: string, config: Partial<GameCronConfig>): void {
        const finalConfig: GameCronConfig = {
            ...this.defaultConfig,
            ...config,
            gameId: config.gameId || gameCronId
        };

        this.gameCronConfigs.set(gameCronId, finalConfig);

        // Initialize batch for this game cron
        if (!this.gameCronBatches.has(gameCronId)) {
            this.gameCronBatches.set(gameCronId, {
                gameCronId,
                gameName: finalConfig.gameName,
                logs: [],
                lastFlushTime: Date.now(),
                isFlushing: false,
                hasIssues: false,
                startTime: Date.now()
            });
        }

        console.log(`Game cron registered: ${gameCronId} (${finalConfig.gameName})`);
    }

    // Add log to a specific game cron
    addLog(
        gameCronId: string,
        message: string,
        level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
        context?: Record<string, any>,
        componentName?: string
    ): void {
        if (!this.isInitialized) {
            console.warn('SentryGameCronBatchManager not initialized');
            return;
        }

        // Get or create batch for game cron
        let batch = this.gameCronBatches.get(gameCronId);
        if (!batch) {
            // Auto-register with default config if not registered
            this.registerGameCron(gameCronId, { gameName: gameCronId });
            batch = this.gameCronBatches.get(gameCronId)!;
        }

        // Add log to batch
        batch.logs.push({
            message,
            level,
            timestamp: Date.now(),
            context,
            componentName
        });

        // Check if this log indicates an issue
        if (level === 'warn' || level === 'error' || level === 'fatal') {
            batch.hasIssues = true;
        }

        // Check if we should flush immediately
        if (this.shouldFlushImmediately(batch)) {
            this.flushGameCronBatch(gameCronId);
        }
    }

    private shouldFlushImmediately(batch: GameCronBatch): boolean {
        const config = this.gameCronConfigs.get(batch.gameCronId) || this.defaultConfig;

        // Flush immediately for fatal errors
        const hasFatalError = batch.logs.some(log => log.level === 'fatal');

        // Flush if batch is getting too large
        const isBatchFull = batch.logs.length >= config.maxBatchSize;

        // Flush if it's been too long since last flush
        const isTimeToFlush = Date.now() - batch.lastFlushTime > config.flushInterval;

        // Flush if there are issues and onlySendOnIssues is true
        const shouldFlushIssues = config.onlySendOnIssues && batch.hasIssues;

        return hasFatalError || isBatchFull || isTimeToFlush || shouldFlushIssues;
    }

    private async flushGameCronBatch(gameCronId: string): Promise<void> {
        const batch = this.gameCronBatches.get(gameCronId);
        if (!batch || batch.isFlushing || batch.logs.length === 0) {
            return;
        }

        const config = this.gameCronConfigs.get(gameCronId) || this.defaultConfig;

        // If onlySendOnIssues is true and there are no issues, don't send to Sentry
        if (config.onlySendOnIssues && !batch.hasIssues) {
            // Just clear the batch without sending to Sentry
            batch.logs = [];
            batch.lastFlushTime = Date.now();
            batch.hasIssues = false;
            return;
        }

        batch.isFlushing = true;

        try {
            // Group logs by level
            const logsByLevel = this.groupLogsByLevel(batch.logs);

            // Create a summary message
            const summary = this.createGameCronSummaryMessage(batch, logsByLevel);

            // Determine the highest level for the batch
            const highestLevel = this.getHighestLevel(batch.logs);

            // Create detailed context
            const context = this.createGameCronBatchContext(batch, logsByLevel, config);

            // Send to Sentry
            await this.sendToSentry(summary, highestLevel, context);

            // Clear the batch
            batch.logs = [];
            batch.lastFlushTime = Date.now();
            batch.hasIssues = false;

        } catch (error) {
            console.error('Failed to flush game cron batch:', error);
        } finally {
            batch.isFlushing = false;
        }
    }

    private groupLogsByLevel(logs: GameCronLog[]): Record<string, GameCronLog[]> {
        const grouped: Record<string, GameCronLog[]> = {
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: []
        };

        logs.forEach(log => {
            grouped[log.level].push(log);
        });

        return grouped;
    }

    private createGameCronSummaryMessage(batch: GameCronBatch, logsByLevel: Record<string, GameCronLog[]>): string {
        const totalLogs = Object.values(logsByLevel).reduce((sum, logs) => sum + logs.length, 0);
        const levelCounts = Object.entries(logsByLevel)
            .filter(([_, logs]) => logs.length > 0)
            .map(([level, logs]) => `${level}: ${logs.length}`)
            .join(', ');

        const duration = batch.endTime ? batch.endTime - batch.startTime : Date.now() - batch.startTime;
        const hasIssues = batch.hasIssues ? ' (WITH ISSUES)' : '';

        return `[Game Cron: ${batch.gameName}] Batch Log Summary - Total: ${totalLogs} (${levelCounts}) - Duration: ${duration}ms${hasIssues}`;
    }

    private getHighestLevel(logs: GameCronLog[]): 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' {
        const levelPriority = {
            'trace': 0,
            'debug': 1,
            'info': 2,
            'warn': 3,
            'error': 4,
            'fatal': 5
        };

        let highestLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' = 'trace';
        let highestPriority = -1;

        logs.forEach(log => {
            const priority = levelPriority[log.level];
            if (priority > highestPriority) {
                highestPriority = priority;
                highestLevel = log.level;
            }
        });

        return highestLevel;
    }

    private createGameCronBatchContext(
        batch: GameCronBatch,
        logsByLevel: Record<string, GameCronLog[]>,
        config: GameCronConfig
    ): Record<string, any> {
        const context: Record<string, any> = {
            gameCronId: batch.gameCronId,
            gameName: batch.gameName,
            systemType: config.systemType,
            environment: config.environment,
            batchSize: batch.logs.length,
            timestamp: Date.now(),
            duration: batch.endTime ? batch.endTime - batch.startTime : Date.now() - batch.startTime,
            hasIssues: batch.hasIssues,
            levels: {}
        };

        // Add level-specific information
        Object.entries(logsByLevel).forEach(([level, levelLogs]) => {
            if (levelLogs.length > 0) {
                context.levels[level] = {
                    count: levelLogs.length,
                    messages: levelLogs.map(log => ({
                        message: log.message,
                        timestamp: log.timestamp,
                        componentName: log.componentName,
                        context: log.context
                    }))
                };
            }
        });

        // Add recent logs (last 15) for quick reference
        const recentLogs = batch.logs.slice(-15);
        context.recentLogs = recentLogs.map(log => ({
            level: log.level,
            message: log.message,
            timestamp: log.timestamp,
            componentName: log.componentName
        }));

        // Add component breakdown
        const componentBreakdown: Record<string, number> = {};
        batch.logs.forEach(log => {
            const component = log.componentName || 'unknown';
            componentBreakdown[component] = (componentBreakdown[component] || 0) + 1;
        });
        context.componentBreakdown = componentBreakdown;

        return context;
    }

    private async sendToSentry(
        message: string,
        level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
        context: Record<string, any>
    ): Promise<void> {
        try {
            const sentryLevel = this.convertToSentryLevel(level);

            if (level === 'error' || level === 'fatal') {
                await Sentry.captureException(new Error(message), {
                    level: sentryLevel,
                    tags: context
                });
            } else {
                await Sentry.captureMessage(message, {
                    level: sentryLevel,
                    tags: context
                });
            }
        } catch (error) {
            console.error('Failed to send game cron batch to Sentry:', error);
        }
    }

    private convertToSentryLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): Sentry.SeverityLevel {
        switch (level) {
            case 'trace':
            case 'debug':
                return 'debug';
            case 'info':
                return 'info';
            case 'warn':
                return 'warning';
            case 'error':
                return 'error';
            case 'fatal':
                return 'fatal';
            default:
                return 'info';
        }
    }

    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            this.flushAllGameCronBatches();
        }, 5000); // Check every 5 seconds
    }

    private async flushAllGameCronBatches(): Promise<void> {
        const gameCronIds = Array.from(this.gameCronBatches.keys());
        const flushPromises = gameCronIds.map(gameCronId =>
            this.flushGameCronBatch(gameCronId)
        );

        await Promise.all(flushPromises);
    }

    // Public method to force flush all game cron batches
    async flushAllBatches(): Promise<void> {
        await this.flushAllGameCronBatches();
    }

    // Public method to flush a specific game cron
    async flushGameCron(gameCronId: string): Promise<void> {
        await this.flushGameCronBatch(gameCronId);
    }

    // Complete a game cron (mark as finished)
    completeGameCron(gameCronId: string, success = true, metadata?: Record<string, any>): void {
        const batch = this.gameCronBatches.get(gameCronId);
        if (batch) {
            batch.endTime = Date.now();

            // Add completion log
            this.addLog(
                gameCronId,
                `Game cron ${success ? 'completed successfully' : 'failed'}`,
                success ? 'info' : 'error',
                metadata
            );

            // Force flush to send final batch
            this.flushGameCronBatch(gameCronId);
        }
    }

    // Get game cron batch statistics
    getGameCronBatchStats(): Record<string, {
        logCount: number;
        lastFlushTime: number;
        hasIssues: boolean;
        duration: number;
        gameName: string;
    }> {
        const stats: Record<string, {
            logCount: number;
            lastFlushTime: number;
            hasIssues: boolean;
            duration: number;
            gameName: string;
        }> = {};

        this.gameCronBatches.forEach((batch, gameCronId) => {
            const duration = batch.endTime ? batch.endTime - batch.startTime : Date.now() - batch.startTime;
            stats[gameCronId] = {
                logCount: batch.logs.length,
                lastFlushTime: batch.lastFlushTime,
                hasIssues: batch.hasIssues,
                duration,
                gameName: batch.gameName
            };
        });

        return stats;
    }

    // Get all registered game crons
    getRegisteredGameCrons(): string[] {
        return Array.from(this.gameCronConfigs.keys());
    }

    // Update game cron configuration
    updateGameCronConfig(gameCronId: string, config: Partial<GameCronConfig>): void {
        const existingConfig = this.gameCronConfigs.get(gameCronId);
        if (existingConfig) {
            this.gameCronConfigs.set(gameCronId, { ...existingConfig, ...config });
        }
    }

    // Cleanup method
    cleanup(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        // Flush all remaining batches
        this.flushAllGameCronBatches().then(() => {
            this.gameCronBatches.clear();
            this.gameCronConfigs.clear();
            this.isInitialized = false;
        });
    }

    // Set default configuration
    setDefaultConfig(config: Partial<GameCronConfig>): void {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    // Get default configuration
    getDefaultConfig(): GameCronConfig {
        return { ...this.defaultConfig };
    }
}

// Export singleton instance
export const sentryGameCronBatchManager = SentryGameCronBatchManager.getInstance();

// Export convenience functions
export const addGameCronLog = (
    gameCronId: string,
    message: string,
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    context?: Record<string, any>,
    componentName?: string
) => sentryGameCronBatchManager.addLog(gameCronId, message, level, context, componentName);

export const registerGameCron = (gameCronId: string, config?: Partial<GameCronConfig>) =>
    sentryGameCronBatchManager.registerGameCron(gameCronId, config || {});

export const completeGameCron = (gameCronId: string, success?: boolean, metadata?: Record<string, any>) =>
    sentryGameCronBatchManager.completeGameCron(gameCronId, success ?? true, metadata);

export const flushAllGameCronBatches = () => sentryGameCronBatchManager.flushAllBatches();
export const flushGameCronBatches = (gameCronId: string) => sentryGameCronBatchManager.flushGameCron(gameCronId);
export const getGameCronBatchStats = () => sentryGameCronBatchManager.getGameCronBatchStats();
export const getRegisteredGameCrons = () => sentryGameCronBatchManager.getRegisteredGameCrons();
export const cleanupGameCronBatchManager = () => sentryGameCronBatchManager.cleanup();

// Export types
export type { GameCronConfig, GameCronLog, GameCronBatch };

export default SentryGameCronBatchManager; 