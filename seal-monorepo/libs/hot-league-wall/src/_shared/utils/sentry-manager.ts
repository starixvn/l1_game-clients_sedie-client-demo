// Direct integration with sg-game-client SentryLogger
// This file provides a comprehensive Sentry management system for the HotLeagueWall project

// Import the enhanced SentryLogger directly from sg-game-client
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
} from '../../../../../../../sg-game-client/src/shared/utils/logger';

import { appSettings } from '../app-settings';

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

        this.componentName = config.componentName;

        // Initialize the global Sentry configuration
        try {
            // Configure global Sentry settings
            configureSentry({
                enabled: config.debug !== false,
                defaultLogLevel: config.logLevel || SentryLogLevel.INFO,
                enableWorkflowTracking: config.enableWorkflowTracking !== false,
                enablePerformanceTracking: config.enablePerformanceTracking !== false,
                enableConsoleOverride: config.enableConsoleOverride !== false
            });

            // Configure component-specific settings
            configureComponent(this.componentName, {
                name: this.componentName,
                logLevel: config.logLevel || SentryLogLevel.INFO,
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
        console.log(`Sentry initialized for component: ${this.componentName}`);
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

        if (!isLoggingEnabled(this.componentName, 'trace')) {
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

        if (!isLoggingEnabled(this.componentName, 'debug')) {
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

        if (!isLoggingEnabled(this.componentName, 'info')) {
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

        if (!isLoggingEnabled(this.componentName, 'warn')) {
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

        if (!isLoggingEnabled(this.componentName, 'error')) {
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

        if (!isLoggingEnabled(this.componentName, 'fatal')) {
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