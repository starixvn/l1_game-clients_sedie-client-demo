import { useCallback, useEffect, useRef } from 'react';
import {
    sentryGameCronBatchManager,
    addGameCronLog,
    registerGameCron,
    completeGameCron,
    flushGameCronBatches,
    getGameCronBatchStats,
    type GameCronConfig
} from '../utils/sentry/sentry-game-cron-batch-manager';

interface UseGameCronSentryOptions {
    gameCronId: string;
    gameName: string;
    systemType?: 'SG' | 'VG' | 'GN';
    environment?: string;
    maxBatchSize?: number;
    flushInterval?: number;
    onlySendOnIssues?: boolean;
    autoComplete?: boolean; // Auto-complete when component unmounts
}

interface GameCronSentryHook {
    // Logging methods
    logTrace: (message: string, context?: Record<string, any>, componentName?: string) => void;
    logDebug: (message: string, context?: Record<string, any>, componentName?: string) => void;
    logInfo: (message: string, context?: Record<string, any>, componentName?: string) => void;
    logWarning: (message: string, context?: Record<string, any>, componentName?: string) => void;
    logError: (message: string, context?: Record<string, any>, componentName?: string) => void;
    logFatal: (message: string, context?: Record<string, any>, componentName?: string) => void;

    // Game cron lifecycle methods
    startGameCron: (metadata?: Record<string, any>) => void;
    completeGameCron: (success?: boolean, metadata?: Record<string, any>) => void;

    // Batch management methods
    flushBatches: () => Promise<void>;
    getBatchStats: () => ReturnType<typeof getGameCronBatchStats>;

    // Utility methods
    getGameCronId: () => string;
    getGameName: () => string;
}

export const useGameCronSentry = (options: UseGameCronSentryOptions): GameCronSentryHook => {
    const {
        gameCronId,
        gameName,
        systemType = 'SG',
        environment = 'LOCAL1',
        maxBatchSize = 100,
        flushInterval = 10000,
        onlySendOnIssues = true,
        autoComplete = true
    } = options;

    const isStarted = useRef(false);
    const startTime = useRef<number>(0);

    // Initialize game cron on mount
    useEffect(() => {
        // Register the game cron
        registerGameCron(gameCronId, {
            gameId: gameCronId,
            gameName,
            systemType,
            environment,
            maxBatchSize,
            flushInterval,
            onlySendOnIssues
        });

        // Log initialization
        addGameCronLog(gameCronId, 'Game cron hook initialized', 'info', {
            gameName,
            systemType,
            environment,
            maxBatchSize,
            flushInterval,
            onlySendOnIssues
        });

        // Cleanup on unmount
        return () => {
            if (autoComplete && isStarted.current) {
                sentryGameCronBatchManager.completeGameCron(gameCronId, true);
            }
        };
    }, [gameCronId, gameName, systemType, environment, maxBatchSize, flushInterval, onlySendOnIssues, autoComplete]);

    // Logging methods
    const logTrace = useCallback((message: string, context?: Record<string, any>, componentName?: string) => {
        addGameCronLog(gameCronId, message, 'trace', context, componentName);
    }, [gameCronId]);

    const logDebug = useCallback((message: string, context?: Record<string, any>, componentName?: string) => {
        addGameCronLog(gameCronId, message, 'debug', context, componentName);
    }, [gameCronId]);

    const logInfo = useCallback((message: string, context?: Record<string, any>, componentName?: string) => {
        addGameCronLog(gameCronId, message, 'info', context, componentName);
    }, [gameCronId]);

    const logWarning = useCallback((message: string, context?: Record<string, any>, componentName?: string) => {
        addGameCronLog(gameCronId, message, 'warn', context, componentName);
    }, [gameCronId]);

    const logError = useCallback((message: string, context?: Record<string, any>, componentName?: string) => {
        addGameCronLog(gameCronId, message, 'error', context, componentName);
    }, [gameCronId]);

    const logFatal = useCallback((message: string, context?: Record<string, any>, componentName?: string) => {
        addGameCronLog(gameCronId, message, 'fatal', context, componentName);
    }, [gameCronId]);

    // Game cron lifecycle methods
    const startGameCron = useCallback((metadata?: Record<string, any>) => {
        if (!isStarted.current) {
            isStarted.current = true;
            startTime.current = Date.now();

            addGameCronLog(gameCronId, 'Game cron started', 'info', {
                startTime: startTime.current,
                ...metadata
            });
        }
    }, [gameCronId]);

    const completeGameCron = useCallback((success = true, metadata?: Record<string, any>) => {
        if (isStarted.current) {
            const duration = Date.now() - startTime.current;

            addGameCronLog(gameCronId, `Game cron ${success ? 'completed' : 'failed'}`,
                success ? 'info' : 'error', {
                duration,
                success,
                ...metadata
            });

            // Call the batch manager's complete method
            sentryGameCronBatchManager.completeGameCron(gameCronId, success, {
                duration,
                ...metadata
            });

            isStarted.current = false;
        }
    }, [gameCronId]);

    // Batch management methods
    const flushBatches = useCallback(async () => {
        await flushGameCronBatches(gameCronId);
    }, [gameCronId]);

    const getBatchStats = useCallback(() => {
        return getGameCronBatchStats();
    }, []);

    // Utility methods
    const getGameCronId = useCallback(() => gameCronId, [gameCronId]);
    const getGameName = useCallback(() => gameName, [gameName]);

    return {
        // Logging methods
        logTrace,
        logDebug,
        logInfo,
        logWarning,
        logError,
        logFatal,

        // Game cron lifecycle methods
        startGameCron,
        completeGameCron,

        // Batch management methods
        flushBatches,
        getBatchStats,

        // Utility methods
        getGameCronId,
        getGameName
    };
};

// Convenience hook for simple game cron logging
export const useSimpleGameCronSentry = (
    gameCronId: string,
    gameName: string,
    options?: Partial<UseGameCronSentryOptions>
) => {
    return useGameCronSentry({
        gameCronId,
        gameName,
        autoComplete: true,
        onlySendOnIssues: true,
        ...options
    });
};

// Hook for game cron with automatic start/complete
export const useAutoGameCronSentry = (
    gameCronId: string,
    gameName: string,
    options?: Partial<UseGameCronSentryOptions>
) => {
    const hook = useGameCronSentry({
        gameCronId,
        gameName,
        autoComplete: true,
        onlySendOnIssues: true,
        ...options
    });

    // Auto-start on mount
    useEffect(() => {
        hook.startGameCron();
    }, [hook]);

    return hook;
}; 