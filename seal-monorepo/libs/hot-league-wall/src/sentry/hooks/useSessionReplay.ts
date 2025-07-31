import { useCallback } from 'react';
import { useSentryHelper } from '../index';
import { SentryLogLevel } from '../core/sentry-types';

/**
 * Simple useSessionReplay hook for backward compatibility
 * This is a simplified version that delegates to the main useSentryHelper
 */
export const useSessionReplay = (componentName: string) => {
    const { logInfo, logError, logWarning } = useSentryHelper({
        componentName,
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    const startReplay = useCallback((sessionName?: string, metadata?: Record<string, any>) => {
        logInfo(`Session replay started: ${sessionName || 'default'}`, metadata);
    }, [logInfo]);

    const trackInteraction = useCallback((action: string, context?: Record<string, any>) => {
        logInfo(`Session replay interaction: ${action}`, context);
    }, [logInfo]);

    const trackError = useCallback((error: string | Error, context?: Record<string, any>) => {
        logError(error, context);
    }, [logError]);

    const trackPerformance = useCallback((operation: string, duration: number, context?: Record<string, any>) => {
        logInfo(`Session replay performance: ${operation}`, { duration, ...context });
    }, [logInfo]);

    const setUser = useCallback((user: any) => {
        logInfo('Session replay user set', { user });
    }, [logInfo]);

    const setTags = useCallback((tags: Record<string, any>) => {
        logInfo('Session replay tags set', { tags });
    }, [logInfo]);

    const stopReplay = useCallback(() => {
        logInfo('Session replay stopped');
    }, [logInfo]);

    const addData = useCallback((data: Record<string, any>) => {
        logInfo('Session replay data added', { data });
    }, [logInfo]);

    const trackLifecycle = useCallback((lifecycle: 'mount' | 'unmount' | 'update', data?: Record<string, any>) => {
        logInfo(`Session replay lifecycle: ${lifecycle}`, data);
    }, [logInfo]);

    return {
        startReplay,
        stopReplay,
        trackInteraction,
        trackError,
        trackPerformance,
        trackLifecycle,
        setUser,
        setTags,
        addData,
        isRecording: false, // Backward compatibility
        sessionId: componentName // Backward compatibility
    };
}; 