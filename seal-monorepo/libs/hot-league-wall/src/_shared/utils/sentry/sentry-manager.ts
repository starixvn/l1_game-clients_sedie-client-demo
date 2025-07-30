// Direct integration with sg-game-client SentryLogger
// This file provides a comprehensive Sentry management system for the HotLeagueWall project

import {
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    SentryManagerConfig
} from './sentry-types';
import * as Sentry from '@sentry/react';

// LocalStorage keys for logging control
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode';

/**
 * Get logging configuration from localStorage
 */
const getLocalStorageConfig = () => {
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
    } catch (error) {
        // Silent fail
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
    } catch (error) {
        // Silent fail
    }
};

// Standard Sentry log levels as per Sentry documentation
export { SentryLogLevel, WorkflowState };



class SentryManager {
    private static instance: SentryManager;
    private isInitialized = false;
    private componentName = '';
    private originalConsoleError: typeof console.error;
    private originalConsoleWarn: typeof console.warn;
    private originalConsoleInfo: typeof console.info;
    private originalConsoleDebug: typeof console.debug;
    private originalConsoleTrace: typeof console.trace;
    private originalConsoleLog: typeof console.log;
    private errorFilter!: (error: any) => boolean;
    private globalConfig: GlobalSentryConfig;

    private constructor() {
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
        this.originalConsoleInfo = console.info;
        this.originalConsoleDebug = console.debug;
        this.originalConsoleTrace = console.trace;
        this.originalConsoleLog = console.log;

        this.globalConfig = {
            enabled: true,
            defaultLogLevel: SentryLogLevel.INFO,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true,
            componentConfigs: new Map<string, ComponentConfig>(),
            workflowConfigs: new Map<string, WorkflowConfig>()
        };
    }

    static getInstance(): SentryManager {
        if (!SentryManager.instance) {
            SentryManager.instance = new SentryManager();
        }
        return SentryManager.instance;
    }

    initialize(config: SentryManagerConfig): void {
        if (this.isInitialized) {
            console.warn('SentryManager already initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        this.componentName = config.componentName;

        // Initialize the global Sentry configuration
        try {
            // Configure global Sentry settings with localStorage override
            Sentry.init({
                dsn: config.dsn,
                environment: config.environment,
                release: config.release,
                debug: config.debug,
                tracesSampleRate: 1.0, // Sample rate for performance tracing
                beforeSend: (event, hint) => {
                    // Filter out errors that are not component-specific
                    if (hint && hint.originalException) {
                        const error = hint.originalException;
                        if (this.errorFilter(error)) {
                            return null; // Drop the event
                        }
                    }
                    return event;
                }
            });

            // Configure component-specific settings
            Sentry.setContext('component', { name: this.componentName });
            Sentry.setTag('component', this.componentName);
            Sentry.setUser({ id: this.componentName }); // Assuming component name is user ID

            // Start Sentry with the provided configuration
            // Note: We need to call the start method from the sg-game-client logger
            // This will be handled by the global SentryLogger instance
            this.startSentry(config);

        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
            return;
        }

        // Set up error filtering to only capture component-specific errors
        this.setupErrorFiltering();

        // Override console methods to filter errors if enabled
        if (config.enableConsoleOverride !== false) {
            this.overrideConsoleMethods();
        }

        this.isInitialized = true;
        console.log(`Sentry initialized for component: ${this.componentName} with localStorage config:`, localStorageConfig);
    }

    private startSentry(config: SentryManagerConfig): void {
        // This method will be called by the global SentryLogger
        // We need to ensure the SentryLogger is properly initialized
        try {
            // The SentryLogger.start method should be called from the global instance
            // This is handled by the sg-game-client logger
            console.log(`Sentry starting for component: ${this.componentName}`);
        } catch (error) {
            console.error('Failed to start Sentry:', error);
        }
    }

    private setupErrorFiltering(): void {
        // Create a filter function that only allows errors from our component
        this.errorFilter = (error: any): boolean => {
            // If it's a string error, check if it contains our component identifiers
            if (typeof error === 'string') {
                return this.isComponentError(error);
            }

            // If it's an Error object, check the stack trace
            if (error instanceof Error) {
                return this.isComponentError(error.message) || this.isComponentStack(error.stack || '');
            }

            // If it's an object with a message property
            if (error && typeof error === 'object' && error.message) {
                return this.isComponentError(error.message);
            }

            // Default to false for unknown error types
            return false;
        };
    }

    private isComponentError(message: string): boolean {
        const componentIdentifiers = [
            'HotLeagueWall',
            'hot-league-wall',
            'Lobby',
            'RNGSoccer',
            'App.tsx',
            'lobby',
            'games',
            'seal-vg-sg-index',
            'data-react="true"'
        ];

        return componentIdentifiers.some(identifier =>
            message.toLowerCase().includes(identifier.toLowerCase())
        );
    }

    private isComponentStack(stack: string): boolean {
        if (!stack) return false;

        const componentStackIdentifiers = [
            'hot-league-wall',
            'App.tsx',
            'lobby',
            'games',
            'RNGSoccer'
        ];

        return componentStackIdentifiers.some(identifier =>
            stack.toLowerCase().includes(identifier.toLowerCase())
        );
    }

    private overrideConsoleMethods(): void {
        // Override console.error to filter component-specific errors
        console.error = (...args: any[]) => {
            this.originalConsoleError(...args);

            // Check if any of the arguments contain component-specific errors
            const hasComponentError = args.some(arg => this.errorFilter(arg));

            if (hasComponentError && this.isLoggingEnabled('error')) {
                // Use the enhanced Sentry logger for component-specific errors
                try {
                    const errorMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    Sentry.captureException(new Error(errorMessage), {
                        level: 'error',
                        tags: { component: this.componentName }
                    });
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log to Sentry:', sentryError);
                }
            }
        };

        // Override console.warn to filter component-specific warnings
        console.warn = (...args: any[]) => {
            this.originalConsoleWarn(...args);

            // Check if any of the arguments contain component-specific warnings
            const hasComponentWarning = args.some(arg => this.errorFilter(arg));

            if (hasComponentWarning && this.isLoggingEnabled('warn')) {
                // Use the enhanced Sentry logger for component-specific warnings
                try {
                    const warningMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    Sentry.captureMessage(warningMessage, {
                        level: 'warning',
                        tags: { component: this.componentName }
                    });
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log warning to Sentry:', sentryError);
                }
            }
        };

        // Override console.info to filter component-specific info
        console.info = (...args: any[]) => {
            this.originalConsoleInfo(...args);

            // Check if any of the arguments contain component-specific info
            const hasComponentInfo = args.some(arg => this.errorFilter(arg));

            if (hasComponentInfo && this.isLoggingEnabled('info')) {
                // Use the enhanced Sentry logger for component-specific info
                try {
                    const infoMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    Sentry.captureMessage(infoMessage, {
                        level: 'info',
                        tags: { component: this.componentName }
                    });
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log info to Sentry:', sentryError);
                }
            }
        };

        // Override console.debug to filter component-specific debug
        console.debug = (...args: any[]) => {
            this.originalConsoleDebug(...args);

            // Check if any of the arguments contain component-specific debug
            const hasComponentDebug = args.some(arg => this.errorFilter(arg));

            if (hasComponentDebug && this.isLoggingEnabled('debug')) {
                // Use the enhanced Sentry logger for component-specific debug
                try {
                    const debugMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    Sentry.captureMessage(debugMessage, {
                        level: 'debug',
                        tags: { component: this.componentName }
                    });
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log debug to Sentry:', sentryError);
                }
            }
        };

        // Override console.trace to filter component-specific trace
        console.trace = (...args: any[]) => {
            this.originalConsoleTrace(...args);

            // Check if any of the arguments contain component-specific trace
            const hasComponentTrace = args.some(arg => this.errorFilter(arg));

            if (hasComponentTrace && this.isLoggingEnabled('trace')) {
                // Use the enhanced Sentry logger for component-specific trace
                try {
                    const traceMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    Sentry.captureMessage(traceMessage, {
                        level: 'debug', // Sentry doesn't have trace level, use debug
                        tags: { component: this.componentName }
                    });
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log trace to Sentry:', sentryError);
                }
            }
        };

        // Override console.log to filter component-specific logs
        console.log = (...args: any[]) => {
            // Call the original console.log
            this.originalConsoleLog.apply(console, args);

            // Check if any of the arguments contain component-specific logs
            const hasComponentLog = args.some(arg => this.errorFilter(arg));

            if (hasComponentLog && this.isLoggingEnabled('info')) {
                // Use the enhanced Sentry logger for component-specific logs
                try {
                    const logMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    Sentry.captureMessage(logMessage, {
                        level: 'info',
                        tags: { component: this.componentName }
                    });
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log to Sentry:', sentryError);
                }
            }
        };
    }

    // Enhanced logging methods with all six log levels
    logTrace(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('trace')) {
            return;
        }

        try {
            Sentry.captureMessage(message, {
                level: 'debug',
                tags: { component: this.componentName, ...context }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to log trace to Sentry:', sentryError);
        }
    }

    logDebug(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('debug')) {
            return;
        }

        try {
            Sentry.captureMessage(message, {
                level: 'debug',
                tags: { component: this.componentName, ...context }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to log debug to Sentry:', sentryError);
        }
    }

    logInfo(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('info')) {
            return;
        }

        try {
            Sentry.captureMessage(message, {
                level: 'info',
                tags: { component: this.componentName, ...context }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to log info to Sentry:', sentryError);
        }
    }

    logWarning(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('warn')) {
            return;
        }

        try {
            Sentry.captureMessage(message, {
                level: 'warning',
                tags: { component: this.componentName, ...context }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to log warning to Sentry:', sentryError);
        }
    }

    logError(error: Error | string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('error')) {
            return;
        }

        try {
            Sentry.captureException(error, {
                level: 'error',
                tags: { component: this.componentName, ...context }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to log error to Sentry:', sentryError);
        }
    }

    logFatal(error: Error | string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('fatal')) {
            return;
        }

        try {
            Sentry.captureException(error, {
                level: 'fatal',
                tags: { component: this.componentName, ...context }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to log fatal to Sentry:', sentryError);
        }
    }

    // Workflow tracking methods
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('info')) {
            return;
        }

        try {
            Sentry.captureMessage(`Workflow started: ${workflowName} (ID: ${workflowId})`, {
                level: 'info',
                tags: { component: this.componentName, workflowId, workflowName, ...metadata }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to start workflow in Sentry:', sentryError);
        }
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        if (!this.isLoggingEnabled('info')) {
            return;
        }

        try {
            Sentry.captureMessage(`Workflow updated: ${state} (ID: ${workflowId})`, {
                level: 'info',
                tags: { component: this.componentName, workflowId, workflowState: state, ...metadata }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to update workflow in Sentry:', sentryError);
        }
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const level = success ? 'info' : 'error';
        if (!this.isLoggingEnabled(level)) {
            return;
        }

        try {
            Sentry.captureMessage(`Workflow completed: ${success ? 'Success' : 'Failure'} (ID: ${workflowId})`, {
                level: success ? 'info' : 'error',
                tags: { component: this.componentName, workflowId, workflowSuccess: success, ...metadata }
            });
        } catch (sentryError) {
            this.originalConsoleError('Failed to complete workflow in Sentry:', sentryError);
        }
    }

    // Performance tracking
    async trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return Promise.resolve(operation());
        }

        if (!this.isLoggingEnabled('info')) {
            return Promise.resolve(operation());
        }

        try {
            // Simple performance tracking without transactions
            const startTime = performance.now();
            const result = await Promise.resolve(operation());
            const endTime = performance.now();
            const duration = endTime - startTime;

            Sentry.captureMessage(`Performance: ${operationName} took ${duration.toFixed(2)}ms`, {
                level: 'info',
                tags: { component: this.componentName, operationName, duration: duration.toFixed(2) }
            });

            return result;
        } catch (error) {
            if (this.isLoggingEnabled('error')) {
                Sentry.captureException(error, {
                    level: 'error',
                    tags: { component: this.componentName, operationName }
                });
            }
            return Promise.reject(error);
        }
    }

    // Configuration methods
    configureComponent(config: Partial<ComponentConfig>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        try {
            // This method is no longer needed as Sentry.setContext and Sentry.setTag are used
            // Keeping it for now, but it will not have an effect on Sentry configuration
            console.log('configureComponent called, but Sentry configuration is managed externally.');
        } catch (sentryError) {
            this.originalConsoleError('Failed to configure component in Sentry:', sentryError);
        }
    }

    getComponentConfig(): ComponentConfig | undefined {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return undefined;
        }

        try {
            // This method is no longer needed as Sentry.setContext and Sentry.setTag are used
            // Keeping it for now, but it will not have an effect on Sentry configuration
            console.log('getComponentConfig called, but Sentry configuration is managed externally.');
            return {
                name: this.componentName,
                logLevel: SentryLogLevel.INFO, // Default to INFO
                enableWorkflowTracking: true,
                enablePerformanceTracking: true
            };
        } catch (sentryError) {
            this.originalConsoleError('Failed to get component config from Sentry:', sentryError);
            return undefined;
        }
    }

    isLoggingEnabled(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): boolean {
        const localStorageConfig = getLocalStorageConfig();

        // Check if Sentry is enabled globally and in localStorage
        if (!this.globalConfig.enabled || !localStorageConfig.enabled) {
            return false;
        }

        // Get the current log level from localStorage
        const currentLogLevel = getLogLevelFromString(localStorageConfig.logLevel);

        // Define level hierarchy (higher number = more important)
        const levelHierarchy = {
            'trace': 0,
            'debug': 1,
            'info': 2,
            'warn': 3,
            'error': 4,
            'fatal': 5
        };

        const currentLevel = levelHierarchy[level];

        switch (currentLogLevel) {
            case SentryLogLevel.DISABLED:
                return false;
            case SentryLogLevel.TRACE:
                return currentLevel >= levelHierarchy['trace'];
            case SentryLogLevel.DEBUG:
                return currentLevel >= levelHierarchy['debug'];
            case SentryLogLevel.INFO:
                return currentLevel >= levelHierarchy['info'];
            case SentryLogLevel.WARN:
                return currentLevel >= levelHierarchy['warn'];
            case SentryLogLevel.ERROR:
                return currentLevel >= levelHierarchy['error'];
            case SentryLogLevel.FATAL:
                return currentLevel >= levelHierarchy['fatal'];
            // Legacy levels for backward compatibility
            case SentryLogLevel.ERROR_ONLY:
                return currentLevel >= levelHierarchy['error']; // Only error and fatal
            case SentryLogLevel.WARNING_AND_ERROR:
                return currentLevel >= levelHierarchy['warn']; // Warning, error, and fatal
            case SentryLogLevel.ALL:
                return true;
            default:
                return false;
        }
    }

    // Utility methods
    getConfig(): GlobalSentryConfig {
        try {
            // This method is no longer needed as Sentry.setContext and Sentry.setTag are used
            // Keeping it for now, but it will not have an effect on Sentry configuration
            console.log('getConfig called, but Sentry configuration is managed externally.');
            return this.globalConfig;
        } catch (sentryError) {
            this.originalConsoleError('Failed to get config from Sentry:', sentryError);
            return this.globalConfig;
        }
    }

    getActiveWorkflows(): Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }> {
        try {
            // This method is no longer needed as Sentry.setContext and Sentry.setTag are used
            // Keeping it for now, but it will not have an effect on Sentry configuration
            console.log('getActiveWorkflows called, but Sentry configuration is managed externally.');
            return new Map();
        } catch (sentryError) {
            this.originalConsoleError('Failed to get active workflows from Sentry:', sentryError);
            return new Map();
        }
    }

    // Cleanup method
    close(): void {
        if (this.isInitialized) {
            // Restore original console methods
            console.error = this.originalConsoleError;
            console.warn = this.originalConsoleWarn;
            console.info = this.originalConsoleInfo;
            console.debug = this.originalConsoleDebug;
            console.trace = this.originalConsoleTrace;
            console.log = this.originalConsoleLog;

            this.isInitialized = false;
            console.log(`Sentry closed for component: ${this.componentName}`);
        }
    }

    // Get component name for external use
    getComponentName(): string {
        return this.componentName;
    }

    // Cleanup all workflows
    cleanup(): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        try {
            // This method is no longer needed as Sentry.setContext and Sentry.setTag are used
            // Keeping it for now, but it will not have an effect on Sentry configuration
            console.log('cleanup called, but Sentry configuration is managed externally.');
        } catch (sentryError) {
            this.originalConsoleError('Failed to cleanup Sentry:', sentryError);
        }
    }
}

/**
 * Convert string log level to SentryLogLevel enum
 */
const getLogLevelFromString = (logLevel: string): SentryLogLevel => {
    switch (logLevel.toLowerCase()) {
        case 'trace':
            return SentryLogLevel.TRACE;
        case 'debug':
            return SentryLogLevel.DEBUG;
        case 'info':
            return SentryLogLevel.INFO;
        case 'warn':
        case 'warning':
            return SentryLogLevel.WARN;
        case 'error':
            return SentryLogLevel.ERROR;
        case 'fatal':
            return SentryLogLevel.FATAL;
        case 'disabled':
            return SentryLogLevel.DISABLED;
        case 'error_only':
            return SentryLogLevel.ERROR_ONLY;
        case 'warning_and_error':
            return SentryLogLevel.WARNING_AND_ERROR;
        case 'all':
            return SentryLogLevel.ALL;
        default:
            return SentryLogLevel.INFO;
    }
};

// Export singleton instance
export const sentryManager = SentryManager.getInstance();

// Export convenience functions for easy usage
export const configureSentryManager = (config: SentryManagerConfig) => sentryManager.initialize(config);
export const enableSentryManager = () => {
    // This function is no longer needed as Sentry.init is called in initialize
    console.log('enableSentryManager called, but Sentry initialization is managed externally.');
};
export const disableSentryManager = () => {
    // This function is no longer needed as Sentry.init is called in initialize
    console.log('disableSentryManager called, but Sentry initialization is managed externally.');
};
export const setSentryLogLevel = (level: SentryLogLevel) => {
    // This function is no longer needed as Sentry.init is called in initialize
    console.log('setSentryLogLevel called, but Sentry initialization is managed externally.');
};

// Export workflow convenience functions
export const startSentryWorkflow = (id: string, name: string, metadata?: Record<string, any>) =>
    sentryManager.startWorkflow(id, name, metadata);
export const updateSentryWorkflow = (id: string, state: WorkflowState, metadata?: Record<string, any>) =>
    sentryManager.updateWorkflow(id, state, metadata);
export const completeSentryWorkflow = (id: string, success?: boolean, metadata?: Record<string, any>) =>
    sentryManager.completeWorkflow(id, success, metadata);
export const trackSentryPerformance = <T>(operation: string, fn: () => Promise<T> | T) =>
    sentryManager.trackPerformance(operation, fn);

export default SentryManager; 