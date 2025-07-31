import { useCallback } from 'react';
import { useSentryHelper } from '../index';
import { SentryLogLevel } from '../core/sentry-types';

/**
 * Simple useGameCronSentry hook for backward compatibility
 * This is a simplified version that delegates to the main useSentryHelper
 */
export const useGameCronSentry = (options: {
    gameCronId: string;
    gameName: string;
    systemType: string;
    environment: string;
    onlySendOnIssues?: boolean;
} | string) => {
    const componentName = typeof options === 'string' ? options : options.gameCronId;
    const { logInfo, logError, logWarning, logDebug } = useSentryHelper({
        componentName,
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    const addGameCronLog = useCallback((message: string, context?: Record<string, any>) => {
        logInfo(message, context);
    }, [logInfo]);

    const flushGameCronBatches = useCallback(() => {
        // No-op for backward compatibility
        logDebug('Game cron batches flushed', { componentName });
    }, [logDebug, componentName]);

    const getGameCronBatchStats = useCallback(() => {
        // Return empty stats for backward compatibility
        return {
            totalLogs: 0,
            pendingLogs: 0,
            lastFlush: Date.now()
        };
    }, []);

    const startGameCron = useCallback((props: any) => {
        logInfo('Game cron started', { props, componentName });
    }, [logInfo, componentName]);

    const completeGameCron = useCallback((success: boolean, metadata?: Record<string, any>) => {
        logInfo('Game cron completed', { success, metadata, componentName });
    }, [logInfo, componentName]);

    return {
        addGameCronLog,
        flushGameCronBatches,
        getGameCronBatchStats,
        startGameCron,
        completeGameCron,
        logInfo,
        logError,
        logWarning,
        logDebug
    };
}; 