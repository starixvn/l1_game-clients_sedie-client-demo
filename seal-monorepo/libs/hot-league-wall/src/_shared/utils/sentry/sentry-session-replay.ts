import * as Sentry from '@sentry/react';
import { appSettingsWithSentry } from '../../app-settings';
import { LocalStorageConfig } from './sentry-types';

/**
 * Sentry Session Replay Configuration
 * This file configures Sentry with Session Replay functionality for the HotLeagueWall project
 */

// LocalStorage keys for logging control
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode';

/**
 * Get logging configuration from localStorage
 */
const getLocalStorageConfig = (): LocalStorageConfig => {
    try {
        const logLevel = localStorage.getItem(SENTRY_LOG_LEVEL_KEY) || 'info';
        const enabled = localStorage.getItem(SENTRY_ENABLED_KEY) !== 'false';
        const debugMode = localStorage.getItem(SENTRY_DEBUG_MODE_KEY) === 'true';

        return { logLevel, enabled, debugMode };
    } catch (error) {
        console.warn('Failed to read localStorage config:', error);
        return { logLevel: 'info', enabled: true, debugMode: false };
    }
};

/**
 * Set logging configuration in localStorage
 */
export const setLocalStorageConfig = (config: { logLevel?: string; enabled?: boolean; debugMode?: boolean }) => {
    try {
        if (config.logLevel !== undefined) {
            localStorage.setItem(SENTRY_LOG_LEVEL_KEY, config.logLevel);
        }
        if (config.enabled !== undefined) {
            localStorage.setItem(SENTRY_ENABLED_KEY, config.enabled.toString());
        }
        if (config.debugMode !== undefined) {
            localStorage.setItem(SENTRY_DEBUG_MODE_KEY, config.debugMode.toString());
        }
        console.log('Sentry localStorage config updated:', config);
    } catch (error) {
        console.error('Failed to update localStorage config:', error);
    }
};

/**
 * Clear localStorage logging configuration
 */
export const clearLocalStorageConfig = () => {
    try {
        localStorage.removeItem(SENTRY_LOG_LEVEL_KEY);
        localStorage.removeItem(SENTRY_ENABLED_KEY);
        localStorage.removeItem(SENTRY_DEBUG_MODE_KEY);
        console.log('Sentry localStorage config cleared');
    } catch (error) {
        console.error('Failed to clear localStorage config:', error);
    }
};

interface SentrySessionReplayConfig {
    dsn: string;
    environment: string;
    release?: string;
    debug?: boolean;
    // Session Replay specific options
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    // Privacy options
    maskAllText?: boolean;
    blockAllMedia?: boolean;
    // PII options
    sendDefaultPii?: boolean;
}

/**
 * Initialize Sentry with Session Replay
 * This function should be called once at the application startup
 */
export const initializeSentryWithSessionReplay = (config: SentrySessionReplayConfig): void => {
    const localStorageConfig = getLocalStorageConfig();

    const {
        dsn,
        environment,
        release,
        debug = false,
        replaysSessionSampleRate = 0.1, // 10% in production, can be set to 1.0 for development
        replaysOnErrorSampleRate = 1.0, // 100% for error sessions
        maskAllText = false, // Set to true for maximum privacy
        blockAllMedia = false, // Set to true to block all media
        sendDefaultPii = true // Set to false for maximum privacy
    } = config;

    // Override debug mode with localStorage setting
    const finalDebug = localStorageConfig.debugMode || debug;

    try {
        Sentry.init({
            dsn,
            environment,
            release,
            debug: finalDebug,

            // Session Replay Configuration
            integrations: [
                Sentry.replayIntegration({
                    // Privacy options
                    maskAllText,
                    blockAllMedia,
                    // Additional privacy settings
                    maskAllInputs: true, // Mask all input fields
                    // Network options
                    networkDetailAllowUrls: [
                        // Allow network details for specific URLs
                        window.location.origin,
                        // Add your API endpoints here
                        /\/api\//,
                        /\/auth\//,
                        /\/game\//
                    ],
                    networkDetailDenyUrls: [
                        // Deny network details for sensitive URLs
                        /\/admin\//,
                        /\/internal\//,
                        /\/sensitive\//
                    ]
                })
            ],

            // Session Replay Sampling
            replaysSessionSampleRate, // Percentage of sessions to record (0.0 to 1.0)
            replaysOnErrorSampleRate, // Percentage of error sessions to record (0.0 to 1.0)

            // PII and Privacy Settings
            sendDefaultPii, // Send default PII data (IP address, etc.)

            // Performance Monitoring
            tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

            // Error Sampling
            sampleRate: 1.0, // 100% of errors

            // Before Send Hook for additional filtering
            beforeSend(event, hint) {
                // Filter out sensitive information
                if (event.request?.headers) {
                    // Remove sensitive headers
                    delete event.request.headers.authorization;
                    delete event.request.headers.cookie;
                    delete event.request.headers['x-api-key'];
                }

                // Filter out sensitive URL parameters
                if (event.request?.url) {
                    const url = new URL(event.request.url);
                    const sensitiveParams = ['token', 'password', 'secret', 'key'];
                    sensitiveParams.forEach(param => {
                        url.searchParams.delete(param);
                    });
                    event.request.url = url.toString();
                }

                // Add component context
                event.tags = {
                    ...event.tags,
                    component: 'HotLeagueWall',
                    version: release || 'unknown',
                    localStorageLogLevel: localStorageConfig.logLevel,
                    localStorageEnabled: localStorageConfig.enabled
                };

                return event;
            },

            // Before Send Transaction Hook
            beforeSendTransaction(event) {
                // Add component context to transactions
                event.tags = {
                    ...event.tags,
                    component: 'HotLeagueWall',
                    version: release || 'unknown',
                    localStorageLogLevel: localStorageConfig.logLevel,
                    localStorageEnabled: localStorageConfig.enabled
                };

                return event;
            },

            // Ignore specific errors
            ignoreErrors: [
                // Ignore common browser errors
                'ResizeObserver loop limit exceeded',
                'Non-Error promise rejection captured',
                'Script error.',
                // Ignore specific game-related errors that are not critical
                /Game connection timeout/,
                /Network request failed/,
                // Add more patterns as needed
            ],

            // Note: ignoreUrls is not available in the current Sentry version
            // Use beforeSend hook to filter URLs instead
        });

        console.log('Sentry with Session Replay initialized successfully', {
            environment,
            release,
            replaysSessionSampleRate,
            replaysOnErrorSampleRate,
            maskAllText,
            blockAllMedia,
            sendDefaultPii,
            localStorageConfig
        });

    } catch (error) {
        console.error('Failed to initialize Sentry with Session Replay:', error);
    }
};

/**
 * Configure Session Replay for different environments
 */
export const configureSessionReplayForEnvironment = (environment: string): SentrySessionReplayConfig => {
    const localStorageConfig = getLocalStorageConfig();
    const isDevelopment = environment === 'development';
    const isProduction = environment === 'production';
    const isTest = environment === 'test';

    // Session Replay should only be enabled for error/fatal levels
    // Check if the current log level allows error/fatal logging
    const shouldEnableSessionReplay = localStorageConfig.enabled &&
        (localStorageConfig.logLevel === 'error' ||
            localStorageConfig.logLevel === 'fatal'
            // localStorageConfig.logLevel === 'warn' ||
            //localStorageConfig.logLevel === 'all'
        );

    if (isDevelopment) {
        // Development: Session Replay only for error/fatal levels
        return {
            dsn: appSettingsWithSentry.sentryDsn || 'YOUR_DSN_HERE',
            environment: 'development',
            release: `hot-league-wall@${process.env.npm_package_version || 'dev'}`,
            debug: localStorageConfig.debugMode || true,
            replaysSessionSampleRate: shouldEnableSessionReplay ? 1.0 : 0.0, // Only enable if localStorage allows error/fatal logging
            replaysOnErrorSampleRate: shouldEnableSessionReplay ? 1.0 : 0.0, // Only enable if localStorage allows error/fatal logging
            maskAllText: false, // Show text for debugging
            blockAllMedia: false, // Show media for debugging
            sendDefaultPii: true // Send PII for debugging
        };
    } else if (isProduction) {
        // Production: Session Replay only for error/fatal levels
        return {
            dsn: appSettingsWithSentry.sentryDsn || 'YOUR_DSN_HERE',
            environment: 'production',
            release: `hot-league-wall@${process.env.npm_package_version || 'prod'}`,
            debug: localStorageConfig.debugMode || false,
            replaysSessionSampleRate: shouldEnableSessionReplay ? 0.1 : 0.0, // Only enable if localStorage allows error/fatal logging
            replaysOnErrorSampleRate: shouldEnableSessionReplay ? 1.0 : 0.0, // Only enable if localStorage allows error/fatal logging
            maskAllText: !localStorageConfig.debugMode, // Mask text unless debug mode is enabled
            blockAllMedia: !localStorageConfig.debugMode, // Block media unless debug mode is enabled
            sendDefaultPii: localStorageConfig.debugMode // Send PII only in debug mode
        };
    } else if (isTest) {
        // Test: Session Replay disabled to avoid noise
        return {
            dsn: appSettingsWithSentry.sentryDsn || 'YOUR_DSN_HERE',
            environment: 'test',
            release: `hot-league-wall@${process.env.npm_package_version || 'test'}`,
            debug: false,
            replaysSessionSampleRate: 0.0, // Always 0% for test
            replaysOnErrorSampleRate: 0.0, // Always 0% for test
            maskAllText: true,
            blockAllMedia: true,
            sendDefaultPii: false
        };
    } else {
        // Default: Session Replay only for error/fatal levels
        return {
            dsn: appSettingsWithSentry.sentryDsn || 'YOUR_DSN_HERE',
            environment: 'unknown',
            release: `hot-league-wall@${process.env.npm_package_version || 'unknown'}`,
            debug: localStorageConfig.debugMode || false,
            replaysSessionSampleRate: shouldEnableSessionReplay ? 0.05 : 0.0, // Only enable if localStorage allows error/fatal logging
            replaysOnErrorSampleRate: shouldEnableSessionReplay ? 1.0 : 0.0, // Only enable if localStorage allows error/fatal logging
            maskAllText: !localStorageConfig.debugMode,
            blockAllMedia: !localStorageConfig.debugMode,
            sendDefaultPii: localStorageConfig.debugMode
        };
    }
};

/**
 * Utility functions for Session Replay
 */

/**
 * Start a custom session replay
 * Note: Session Replay is automatically started when Sentry.init() is called
 * This function is for custom session management
 */
export const startCustomSessionReplay = (name: string, context?: Record<string, any>): void => {
    try {
        // Session Replay is automatically managed by Sentry
        // We can add custom context using setTags and setExtra
        if (context) {
            Sentry.setTags({ sessionName: name, ...context });
        }
        console.log(`Custom session replay context set: ${name}`);
    } catch (error) {
        console.error('Failed to set custom session replay context:', error);
    }
};

/**
 * Stop the current session replay
 * Note: Session Replay is automatically managed by Sentry
 */
export const stopSessionReplay = (): void => {
    try {
        // Session Replay is automatically managed by Sentry
        // We can clear custom context
        Sentry.setTags({ sessionName: undefined });
        console.log('Session replay context cleared');
    } catch (error) {
        console.error('Failed to clear session replay context:', error);
    }
};

/**
 * Add custom data to the current session replay
 */
export const addSessionReplayData = (data: Record<string, any>): void => {
    try {
        // Use setExtra to add custom data to the current session
        Object.entries(data).forEach(([key, value]) => {
            Sentry.setExtra(key, value);
        });
        console.log('Session replay data added:', data);
    } catch (error) {
        console.error('Failed to add session replay data:', error);
    }
};

/**
 * Set user context for session replay
 */
export const setUserContext = (user: {
    id?: string;
    email?: string;
    username?: string;
    [key: string]: any;
}): void => {
    try {
        Sentry.setUser(user);
        console.log('User context set for session replay:', user);
    } catch (error) {
        console.error('Failed to set user context:', error);
    }
};

/**
 * Set tags for session replay
 */
export const setTags = (tags: Record<string, string>): void => {
    try {
        Sentry.setTags(tags);
        console.log('Tags set for session replay:', tags);
    } catch (error) {
        console.error('Failed to set tags:', error);
    }
};

/**
 * Set extra context for session replay
 */
export const setExtra = (extra: Record<string, any>): void => {
    try {
        // setExtra requires key-value pairs, not an object
        Object.entries(extra).forEach(([key, value]) => {
            Sentry.setExtra(key, value);
        });
        console.log('Extra context set for session replay:', extra);
    } catch (error) {
        console.error('Failed to set extra context:', error);
    }
};

/**
 * Privacy utilities for Session Replay
 */

/**
 * Block an element from being recorded in session replay
 */
export const blockElement = (element: HTMLElement): void => {
    element.classList.add('sentry-block');
    element.setAttribute('data-sentry-block', 'true');
};

/**
 * Ignore an element from being recorded in session replay
 */
export const ignoreElement = (element: HTMLElement): void => {
    element.classList.add('sentry-ignore');
    element.setAttribute('data-sentry-ignore', 'true');
};

/**
 * Unblock an element from session replay
 */
export const unblockElement = (element: HTMLElement): void => {
    element.classList.remove('sentry-block');
    element.removeAttribute('data-sentry-block');
};

/**
 * Unignore an element from session replay
 */
export const unignoreElement = (element: HTMLElement): void => {
    element.classList.remove('sentry-ignore');
    element.removeAttribute('data-sentry-ignore');
};

/**
 * Export Sentry instance for direct access
 */
export { Sentry };

export default {
    initializeSentryWithSessionReplay,
    configureSessionReplayForEnvironment,
    startCustomSessionReplay,
    stopSessionReplay,
    addSessionReplayData,
    setUserContext,
    setTags,
    setExtra,
    blockElement,
    ignoreElement,
    unblockElement,
    unignoreElement,
    Sentry
}; 