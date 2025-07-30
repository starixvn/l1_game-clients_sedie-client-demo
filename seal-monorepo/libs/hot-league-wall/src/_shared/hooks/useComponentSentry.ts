import React, { useEffect, useCallback } from 'react';
import SentryManager from '../utils/sentry/sentry-manager';
import { appSettings } from '../app-settings';

interface UseComponentSentryOptions {
    componentName?: string;
    enableConsoleOverride?: boolean;
}

export const useComponentSentry = (options: UseComponentSentryOptions = {}) => {
    const {
        componentName = 'HotLeagueWall',
        enableConsoleOverride = true
    } = options;

    // Initialize Sentry for this component
    useEffect(() => {
        const sentryManager = SentryManager.getInstance();

        // Initialize with component-specific configuration
        sentryManager.initialize({
            dsn: appSettings.sentry.dsn,
            environment: appSettings.sentry.environment,
            componentName,
            release: process.env.TAG_VERSION,
            debug: process.env.NODE_ENV === 'development'
        });

        // Cleanup on unmount
        return () => {
            if (enableConsoleOverride) {
                sentryManager.close();
            }
        };
    }, [componentName, enableConsoleOverride]);

    // Component-specific error logging
    const logError = useCallback((error: Error | string, context?: Record<string, any>) => {
        const sentryManager = SentryManager.getInstance();
        sentryManager.logError(error, context);
    }, []);

    // Component-specific warning logging
    const logWarning = useCallback((warning: string, context?: Record<string, any>) => {
        const sentryManager = SentryManager.getInstance();
        sentryManager.logWarning(warning, context);
    }, []);

    // Component-specific info logging
    const logInfo = useCallback((info: string, context?: Record<string, any>) => {
        const sentryManager = SentryManager.getInstance();
        sentryManager.logInfo(info, context);
    }, []);

    return {
        logError,
        logWarning,
        logInfo,
        componentName: SentryManager.getInstance().getComponentName()
    };
}; 