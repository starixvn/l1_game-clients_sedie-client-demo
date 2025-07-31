import * as Sentry from '@sentry/react';
import { ILogger, IWorkflowTracker, IConsoleOverride, IConfigStorage } from './interfaces';
import { SentryLogger } from './logger/sentry-logger';
import { WorkflowTracker } from './workflow/workflow-tracker';
import { ConsoleOverride } from './console/console-override';
import { SentryConfigStorage } from './storage/local-storage';
import {
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    SentryManagerConfig
} from './sentry-types';

/**
 * Refactored SentryManager that follows SOLID principles
 * - Single Responsibility: Orchestrates different services
 * - Open/Closed: Extensible through dependency injection
 * - Liskov Substitution: Uses interfaces
 * - Interface Segregation: Uses specific interfaces
 * - Dependency Inversion: Depends on abstractions
 */
export class SentryManagerRefactored {
    private static instance: SentryManagerRefactored;
    private isInitialized = false;
    private componentName = '';
    private logger: ILogger;
    private workflowTracker: IWorkflowTracker;
    private consoleOverride: IConsoleOverride;
    private configStorage: IConfigStorage;
    private componentConfig?: ComponentConfig;

    private constructor(
        logger: ILogger,
        workflowTracker: IWorkflowTracker,
        consoleOverride: IConsoleOverride,
        configStorage: IConfigStorage
    ) {
        this.logger = logger;
        this.workflowTracker = workflowTracker;
        this.consoleOverride = consoleOverride;
        this.configStorage = configStorage;
    }

    static getInstance(): SentryManagerRefactored {
        if (!SentryManagerRefactored.instance) {
            const configStorage = new SentryConfigStorage();
            const logger = new SentryLogger('default');
            const workflowTracker = new WorkflowTracker('default');
            const consoleOverride = new ConsoleOverride(logger);

            SentryManagerRefactored.instance = new SentryManagerRefactored(
                logger,
                workflowTracker,
                consoleOverride,
                configStorage
            );
        }
        return SentryManagerRefactored.instance;
    }

    initialize(config: SentryManagerConfig): void {
        if (this.isInitialized) {
            this.logger.logWarning('SentryManager already initialized');
            return;
        }

        try {
            // Initialize Sentry with proper error capturing
            Sentry.init({
                dsn: config.dsn,
                environment: config.environment,
                release: config.release,
                debug: config.debug || false,
                // Enable beforeSend to filter events
                beforeSend(event, hint) {
                    // Log the event for debugging
                    console.log('Sentry event captured:', event);
                    return event;
                },
                // Enable beforeBreadcrumb to filter breadcrumbs
                beforeBreadcrumb(breadcrumb, hint) {
                    return breadcrumb;
                }
            });

            this.componentName = config.componentName;

            // Update logger with component name
            (this.logger as SentryLogger).setLogLevel(config.logLevel || SentryLogLevel.ERROR);

            // Configure component
            this.componentConfig = {
                name: config.componentName,
                logLevel: config.logLevel || SentryLogLevel.ERROR,
                enableWorkflowTracking: config.enableWorkflowTracking ?? true,
                enablePerformanceTracking: config.enablePerformanceTracking ?? true
            };

            // Override console if enabled
            if (config.enableConsoleOverride) {
                this.consoleOverride.override();
            }

            this.isInitialized = true;

            this.logger.logInfo('SentryManager initialized successfully', {
                componentName: this.componentName,
                config: this.componentConfig
            });
        } catch (error) {
            this.logger.logError(error instanceof Error ? error : new Error('Failed to initialize SentryManager'));
            throw error;
        }
    }

    // Logging methods - delegate to logger
    logTrace(message: string, context?: Record<string, any>): void {
        this.logger.logTrace(message, context);
    }

    logDebug(message: string, context?: Record<string, any>): void {
        this.logger.logDebug(message, context);
    }

    logInfo(message: string, context?: Record<string, any>): void {
        this.logger.logInfo(message, context);
    }

    logWarning(message: string, context?: Record<string, any>): void {
        this.logger.logWarning(message, context);
    }

    logError(error: Error | string, context?: Record<string, any>): void {
        this.logger.logError(error, context);
    }

    logFatal(error: Error | string, context?: Record<string, any>): void {
        this.logger.logFatal(error, context);
    }

    // Manual error capture for specific error types
    captureError(error: Error | string, context?: Record<string, any>): void {
        console.log('Manually capturing error:', error);
        Sentry.captureException(error, {
            tags: {
                source: 'manual_capture',
                component: this.componentName
            },
            extra: context
        });
    }

    // Workflow methods - delegate to workflow tracker
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void {
        this.workflowTracker.startWorkflow(workflowId, workflowName, metadata);
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        this.workflowTracker.updateWorkflow(workflowId, state, metadata);
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        this.workflowTracker.completeWorkflow(workflowId, success, metadata);
    }

    async trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
        return this.workflowTracker.trackPerformance(operationName, operation);
    }

    // Configuration methods - delegate to config storage
    configureComponent(config: Partial<ComponentConfig>): void {
        if (config.logLevel) {
            this.configStorage.setLogLevel(config.logLevel);
            (this.logger as SentryLogger).setLogLevel(config.logLevel);
        }

        if (config.name) {
            this.componentName = config.name;
        }

        this.componentConfig = { ...this.componentConfig, ...config } as ComponentConfig;

        this.logger.logInfo('Component configuration updated', { config: this.componentConfig });
    }

    getComponentConfig(): ComponentConfig | undefined {
        return this.componentConfig;
    }

    isLoggingEnabled(level: SentryLogLevel): boolean {
        return this.logger.isLoggingEnabled(level);
    }

    // Storage methods - delegate to config storage
    setLocalStorageConfig(config: { logLevel?: string; enabled?: boolean; debugMode?: boolean }): void {
        if (config.logLevel) this.configStorage.setLogLevel(config.logLevel);
        if (config.enabled !== undefined) this.configStorage.setEnabled(config.enabled);
        if (config.debugMode !== undefined) this.configStorage.setDebugMode(config.debugMode);
    }

    clearLocalStorageConfig(): void {
        this.configStorage.clear();
    }

    // Utility methods
    getComponentName(): string {
        return this.componentName;
    }

    isManagerInitialized(): boolean {
        return this.isInitialized;
    }

    cleanup(): void {
        try {
            this.consoleOverride.restore();
            this.isInitialized = false;
            this.logger.logInfo('SentryManager cleanup completed');
        } catch (error) {
            this.logger.logError(error instanceof Error ? error : new Error('Failed to cleanup SentryManager'));
        }
    }

    close(): void {
        this.cleanup();
        Sentry.close();
    }


} 