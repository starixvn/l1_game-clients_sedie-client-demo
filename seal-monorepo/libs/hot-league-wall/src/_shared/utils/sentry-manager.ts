// Direct integration with sg-game-client SentryLogger
// This file provides a comprehensive Sentry management system for the HotLeagueWall project

// Import the enhanced SentryLogger from sg-game-client package
import {
    SentryLogLevel,
    WorkflowState,
    configureSentry,
    enableSentry,
    disableSentry,
    setLogLevel,
    configureComponent,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance,
    logTrace,
    logDebug,
    logInfo,
    logWarning,
    logError,
    logFatal,
    isLoggingEnabled,
    getComponentConfig,
    getConfig,
    getActiveWorkflows,
    cleanup,
    close,
    resetLogger
} from '@sg/sg-game-client';

import { appSettings } from '../app-settings';

// LocalStorage keys for logging control
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'sentry_enabled';
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

// Standard Sentry log levels as per Sentry documentation
export { SentryLogLevel, WorkflowState };

// Component tracking configuration
export interface ComponentConfig {
    name: string;
    logLevel: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
}

// Workflow tracking configuration
export interface WorkflowConfig {
    id: string;
    name: string;
    component: string;
    logLevel: SentryLogLevel;
    enablePerformanceTracking?: boolean;
    metadata?: Record<string, any>;
}

// Global Sentry configuration
export interface GlobalSentryConfig {
    enabled: boolean;
    defaultLogLevel: SentryLogLevel;
    enableWorkflowTracking: boolean;
    enablePerformanceTracking: boolean;
    enableConsoleOverride: boolean;
    componentConfigs: Map<string, ComponentConfig>;
    workflowConfigs: Map<string, WorkflowConfig>;
}

interface SentryManagerConfig {
    dsn: string;
    environment: string;
    componentName: string;
    release?: string;
    debug?: boolean;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    enableConsoleOverride?: boolean;
}

class SentryManager {
    private static instance: SentryManager;
    private isInitialized = false;
    private componentName = '';
    private originalConsoleError: typeof console.error;
    private originalConsoleWarn: typeof console.warn;
    private originalConsoleInfo: typeof console.info;
    private originalConsoleDebug: typeof console.debug;
    private originalConsoleTrace: typeof console.trace;
    private errorFilter!: (error: any) => boolean;
    private globalConfig: GlobalSentryConfig;

    private constructor() {
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
        this.originalConsoleInfo = console.info;
        this.originalConsoleDebug = console.debug;
        this.originalConsoleTrace = console.trace;

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
            configureSentry({
                enabled: localStorageConfig.enabled && config.debug !== false,
                defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
                enableWorkflowTracking: config.enableWorkflowTracking !== false,
                enablePerformanceTracking: config.enablePerformanceTracking !== false,
                enableConsoleOverride: config.enableConsoleOverride !== false
            });

            // Configure component-specific settings
            configureComponent(this.componentName, {
                name: this.componentName,
                logLevel: getLogLevelFromString(localStorageConfig.logLevel),
                enableWorkflowTracking: config.enableWorkflowTracking !== false,
                enablePerformanceTracking: config.enablePerformanceTracking !== false
            });

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
            // Always log to original console for debugging
            this.originalConsoleError(...args);

            // Check if any of the arguments contain component-specific errors
            const hasComponentError = args.some(arg => this.errorFilter(arg));

            if (hasComponentError) {
                // Use the enhanced Sentry logger for component-specific errors
                try {
                    const errorMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    logError(this.componentName, `[${this.componentName}] ${errorMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log to Sentry:', sentryError);
                }
            }
        };

        // Override console.warn to filter component-specific warnings
        console.warn = (...args: any[]) => {
            // Always log to original console for debugging
            this.originalConsoleWarn(...args);

            // Check if any of the arguments contain component-specific warnings
            const hasComponentWarning = args.some(arg => this.errorFilter(arg));

            if (hasComponentWarning) {
                // Use the enhanced Sentry logger for component-specific warnings
                try {
                    const warningMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    logWarning(this.componentName, `[${this.componentName}] ${warningMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log warning to Sentry:', sentryError);
                }
            }
        };

        // Override console.info to filter component-specific info
        console.info = (...args: any[]) => {
            // Always log to original console for debugging
            this.originalConsoleInfo(...args);

            // Check if any of the arguments contain component-specific info
            const hasComponentInfo = args.some(arg => this.errorFilter(arg));

            if (hasComponentInfo) {
                // Use the enhanced Sentry logger for component-specific info
                try {
                    const infoMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    logInfo(this.componentName, `[${this.componentName}] ${infoMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log info to Sentry:', sentryError);
                }
            }
        };

        // Override console.debug to filter component-specific debug
        console.debug = (...args: any[]) => {
            // Always log to original console for debugging
            this.originalConsoleDebug(...args);

            // Check if any of the arguments contain component-specific debug
            const hasComponentDebug = args.some(arg => this.errorFilter(arg));

            if (hasComponentDebug) {
                // Use the enhanced Sentry logger for component-specific debug
                try {
                    const debugMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    logDebug(this.componentName, `[${this.componentName}] ${debugMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log debug to Sentry:', sentryError);
                }
            }
        };

        // Override console.trace to filter component-specific trace
        console.trace = (...args: any[]) => {
            // Always log to original console for debugging
            this.originalConsoleTrace(...args);

            // Check if any of the arguments contain component-specific trace
            const hasComponentTrace = args.some(arg => this.errorFilter(arg));

            if (hasComponentTrace) {
                // Use the enhanced Sentry logger for component-specific trace
                try {
                    const traceMessage = args.map(arg =>
                        typeof arg === 'string' ? arg : arg?.message || String(arg)
                    ).join(' ');

                    logTrace(this.componentName, `[${this.componentName}] ${traceMessage}`);
                } catch (sentryError) {
                    this.originalConsoleError('Failed to log trace to Sentry:', sentryError);
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

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled || !isLoggingEnabled(this.componentName, 'trace')) {
            return;
        }

        try {
            logTrace(this.componentName, message, context);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log trace to Sentry:', sentryError);
        }
    }

    logDebug(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled || !isLoggingEnabled(this.componentName, 'debug')) {
            return;
        }

        try {
            logDebug(this.componentName, message, context);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log debug to Sentry:', sentryError);
        }
    }

    logInfo(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled || !isLoggingEnabled(this.componentName, 'info')) {
            return;
        }

        try {
            logInfo(this.componentName, message, context);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log info to Sentry:', sentryError);
        }
    }

    logWarning(message: string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled || !isLoggingEnabled(this.componentName, 'warn')) {
            return;
        }

        try {
            logWarning(this.componentName, message, context);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log warning to Sentry:', sentryError);
        }
    }

    logError(error: Error | string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled || !isLoggingEnabled(this.componentName, 'error')) {
            return;
        }

        try {
            logError(this.componentName, error, context);
        } catch (sentryError) {
            this.originalConsoleError('Failed to log error to Sentry:', sentryError);
        }
    }

    logFatal(error: Error | string, context?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled || !isLoggingEnabled(this.componentName, 'fatal')) {
            return;
        }

        try {
            logFatal(this.componentName, error, context);
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

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled) {
            return;
        }

        try {
            startWorkflow(workflowId, workflowName, this.componentName, metadata);
        } catch (sentryError) {
            this.originalConsoleError('Failed to start workflow in Sentry:', sentryError);
        }
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled) {
            return;
        }

        try {
            updateWorkflow(workflowId, state, metadata);
        } catch (sentryError) {
            this.originalConsoleError('Failed to update workflow in Sentry:', sentryError);
        }
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled) {
            return;
        }

        try {
            completeWorkflow(workflowId, success, metadata);
        } catch (sentryError) {
            this.originalConsoleError('Failed to complete workflow in Sentry:', sentryError);
        }
    }

    // Performance tracking
    trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return Promise.resolve(operation());
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled) {
            return Promise.resolve(operation());
        }

        try {
            return trackPerformance(this.componentName, operationName, operation);
        } catch (sentryError) {
            this.originalConsoleError('Failed to track performance in Sentry:', sentryError);
            return Promise.resolve(operation());
        }
    }

    // Configuration methods
    configureComponent(config: Partial<ComponentConfig>): void {
        if (!this.isInitialized) {
            console.warn('SentryManager not initialized');
            return;
        }

        try {
            configureComponent(this.componentName, config);
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
            return getComponentConfig(this.componentName);
        } catch (sentryError) {
            this.originalConsoleError('Failed to get component config from Sentry:', sentryError);
            return undefined;
        }
    }

    isLoggingEnabled(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): boolean {
        if (!this.isInitialized) {
            return false;
        }

        const localStorageConfig = getLocalStorageConfig();
        if (!localStorageConfig.enabled) {
            return false;
        }

        try {
            return isLoggingEnabled(this.componentName, level);
        } catch (sentryError) {
            this.originalConsoleError('Failed to check logging enabled in Sentry:', sentryError);
            return false;
        }
    }

    // Utility methods
    getConfig(): GlobalSentryConfig {
        try {
            return getConfig();
        } catch (sentryError) {
            this.originalConsoleError('Failed to get config from Sentry:', sentryError);
            return this.globalConfig;
        }
    }

    getActiveWorkflows(): Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }> {
        try {
            return getActiveWorkflows();
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
            cleanup();
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
export const enableSentryManager = () => enableSentry();
export const disableSentryManager = () => disableSentry();
export const setSentryLogLevel = (level: SentryLogLevel) => setLogLevel(level);

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