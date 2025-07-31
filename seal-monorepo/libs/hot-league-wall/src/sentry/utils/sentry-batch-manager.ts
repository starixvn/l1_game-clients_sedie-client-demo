import * as Sentry from '@sentry/react';
import { SentryLogLevel } from '../core/sentry-types';

interface BatchedLog {
    message: string;
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    timestamp: number;
    context?: Record<string, any>;
}

interface ComponentBatch {
    componentName: string;
    logs: BatchedLog[];
    lastFlushTime: number;
    isFlushing: boolean;
}

class SentryBatchManager {
    private static instance: SentryBatchManager;
    private componentBatches: Map<string, ComponentBatch> = new Map();
    private flushInterval = 5000; // 5 seconds
    private maxBatchSize = 50; // Maximum logs per batch
    private flushTimer: NodeJS.Timeout | null = null;
    private isInitialized = false;

    private constructor() {
        this.startFlushTimer();
    }

    static getInstance(): SentryBatchManager {
        if (!SentryBatchManager.instance) {
            SentryBatchManager.instance = new SentryBatchManager();
        }
        return SentryBatchManager.instance;
    }

    initialize(): void {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;
        console.log('SentryBatchManager initialized');
    }

    addLog(
        componentName: string,
        message: string,
        level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
        context?: Record<string, any>
    ): void {
        if (!this.isInitialized) {
            console.warn('SentryBatchManager not initialized');
            return;
        }

        // Get or create batch for component
        let batch = this.componentBatches.get(componentName);
        if (!batch) {
            batch = {
                componentName,
                logs: [],
                lastFlushTime: Date.now(),
                isFlushing: false
            };
            this.componentBatches.set(componentName, batch);
        }

        // Add log to batch
        batch.logs.push({
            message,
            level,
            timestamp: Date.now(),
            context
        });

        // Check if we should flush immediately
        if (this.shouldFlushImmediately(batch)) {
            this.flushComponentBatch(componentName);
        }
    }

    private shouldFlushImmediately(batch: ComponentBatch): boolean {
        // Flush immediately for errors and warnings
        const hasHighPriorityLogs = batch.logs.some(log =>
            log.level === 'error' || log.level === 'fatal' || log.level === 'warn'
        );

        // Flush if batch is getting too large
        const isBatchFull = batch.logs.length >= this.maxBatchSize;

        // Flush if it's been too long since last flush
        const isTimeToFlush = Date.now() - batch.lastFlushTime > this.flushInterval;

        return hasHighPriorityLogs || isBatchFull || isTimeToFlush;
    }

    private async flushComponentBatch(componentName: string): Promise<void> {
        const batch = this.componentBatches.get(componentName);
        if (!batch || batch.isFlushing || batch.logs.length === 0) {
            return;
        }

        batch.isFlushing = true;

        try {
            // Group logs by level
            const logsByLevel = this.groupLogsByLevel(batch.logs);

            // Create a summary message
            const summary = this.createSummaryMessage(componentName, logsByLevel);

            // Determine the highest level for the batch
            const highestLevel = this.getHighestLevel(batch.logs);

            // Create detailed context
            const context = this.createBatchContext(batch.logs, logsByLevel);

            // Send to Sentry
            await this.sendToSentry(summary, highestLevel, context);

            // Clear the batch
            batch.logs = [];
            batch.lastFlushTime = Date.now();

        } catch (error) {
            console.error('Failed to flush component batch:', error);
        } finally {
            batch.isFlushing = false;
        }
    }

    private groupLogsByLevel(logs: BatchedLog[]): Record<string, BatchedLog[]> {
        const grouped: Record<string, BatchedLog[]> = {
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

    private createSummaryMessage(componentName: string, logsByLevel: Record<string, BatchedLog[]>): string {
        const totalLogs = Object.values(logsByLevel).reduce((sum, logs) => sum + logs.length, 0);
        const levelCounts = Object.entries(logsByLevel)
            .filter(([_, logs]) => logs.length > 0)
            .map(([level, logs]) => `${level}: ${logs.length}`)
            .join(', ');

        return `[${componentName}] Batch Log Summary - Total: ${totalLogs} (${levelCounts})`;
    }

    private getHighestLevel(logs: BatchedLog[]): 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' {
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

    private createBatchContext(logs: BatchedLog[], logsByLevel: Record<string, BatchedLog[]>): Record<string, any> {
        const context: Record<string, any> = {
            batchSize: logs.length,
            timestamp: Date.now(),
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
                        context: log.context
                    }))
                };
            }
        });

        // Add recent logs (last 10) for quick reference
        const recentLogs = logs.slice(-10);
        context.recentLogs = recentLogs.map(log => ({
            level: log.level,
            message: log.message,
            timestamp: log.timestamp
        }));

        return context;
    }

    private async sendToSentry(
        message: string,
        level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
        context: Record<string, any>
    ): Promise<void> {
        try {
            // Convert our level to Sentry's SeverityLevel
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
            console.error('Failed to send batch to Sentry:', error);
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
            this.flushAllBatches();
        }, this.flushInterval);
    }

    private async flushAllBatches(): Promise<void> {
        const componentNames = Array.from(this.componentBatches.keys());
        const flushPromises = componentNames.map(componentName =>
            this.flushComponentBatch(componentName)
        );

        await Promise.all(flushPromises);
    }

    // Public method to force flush all batches
    async flushAll(): Promise<void> {
        await this.flushAllBatches();
    }

    // Public method to flush a specific component
    async flushComponent(componentName: string): Promise<void> {
        await this.flushComponentBatch(componentName);
    }

    // Get batch statistics
    getBatchStats(): Record<string, { logCount: number; lastFlushTime: number }> {
        const stats: Record<string, { logCount: number; lastFlushTime: number }> = {};

        this.componentBatches.forEach((batch, componentName) => {
            stats[componentName] = {
                logCount: batch.logs.length,
                lastFlushTime: batch.lastFlushTime
            };
        });

        return stats;
    }

    // Cleanup method
    cleanup(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        // Flush all remaining batches
        this.flushAllBatches().then(() => {
            this.componentBatches.clear();
            this.isInitialized = false;
        });
    }

    // Set flush interval
    setFlushInterval(interval: number): void {
        this.flushInterval = interval;
        this.startFlushTimer();
    }

    // Set max batch size
    setMaxBatchSize(size: number): void {
        this.maxBatchSize = size;
    }
}

// Export singleton instance
export const sentryBatchManager = SentryBatchManager.getInstance();

// Export convenience functions
export const addBatchedLog = (
    componentName: string,
    message: string,
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    context?: Record<string, any>
) => sentryBatchManager.addLog(componentName, message, level, context);

export const flushAllBatches = () => sentryBatchManager.flushAll();
export const flushComponentBatches = (componentName: string) => sentryBatchManager.flushComponent(componentName);
export const getBatchStats = () => sentryBatchManager.getBatchStats();
export const cleanupBatchManager = () => sentryBatchManager.cleanup();

export default SentryBatchManager; 