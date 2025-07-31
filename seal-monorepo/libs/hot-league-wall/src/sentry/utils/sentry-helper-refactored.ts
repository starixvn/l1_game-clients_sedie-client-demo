import { ILogger, IWorkflowTracker, IConfigStorage } from '../core/interfaces';
import { SentryLogger } from '../core/logger/sentry-logger';
import { WorkflowTracker } from '../core/workflow/workflow-tracker';
import { SentryConfigStorage } from '../core/storage/local-storage';
import {
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    GlobalSentryConfig,
    UseSentryHelperOptions
} from '../core/sentry-types';

/**
 * Refactored SentryHelper that follows SOLID principles
 * - Single Responsibility: Manages component-specific Sentry operations
 * - Open/Closed: Extensible through dependency injection
 * - Liskov Substitution: Uses interfaces
 * - Interface Segregation: Uses specific interfaces
 * - Dependency Inversion: Depends on abstractions
 */
export class SentryHelperRefactored {
    private static instance: SentryHelperRefactored;
    private globalConfig: GlobalSentryConfig;
    private componentLoggers: Map<string, ILogger>;
    private workflowTrackers: Map<string, IWorkflowTracker>;
    private configStorage: IConfigStorage;
    private isInitialized = false;

    private constructor(configStorage: IConfigStorage) {
        this.configStorage = configStorage;
        this.componentLoggers = new Map();
        this.workflowTrackers = new Map();
        this.globalConfig = {
            enabled: true,
            defaultLogLevel: SentryLogLevel.ERROR,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: false,
            componentConfigs: new Map(),
            workflowConfigs: new Map()
        };
    }

    static getInstance(): SentryHelperRefactored {
        if (!SentryHelperRefactored.instance) {
            const configStorage = new SentryConfigStorage();
            SentryHelperRefactored.instance = new SentryHelperRefactored(configStorage);
        }
        return SentryHelperRefactored.instance;
    }

    initialize(config?: Partial<GlobalSentryConfig>): void {
        if (this.isInitialized) {
            console.warn('SentryHelper already initialized');
            return;
        }

        this.globalConfig = { ...this.globalConfig, ...config };
        this.isInitialized = true;
    }

    setGlobalEnabled(enabled: boolean): void {
        this.globalConfig.enabled = enabled;
        this.configStorage.setEnabled(enabled);
    }

    setDefaultLogLevel(level: SentryLogLevel): void {
        this.globalConfig.defaultLogLevel = level;
        this.configStorage.setLogLevel(level);
    }

    configureComponent(componentName: string, config: Partial<ComponentConfig>): void {
        const componentConfig: ComponentConfig = {
            name: componentName,
            logLevel: config.logLevel || this.globalConfig.defaultLogLevel,
            enableWorkflowTracking: config.enableWorkflowTracking ?? this.globalConfig.enableWorkflowTracking,
            enablePerformanceTracking: config.enablePerformanceTracking ?? this.globalConfig.enablePerformanceTracking
        };

        this.globalConfig.componentConfigs.set(componentName, componentConfig);

        // Create or update component logger
        const logger = this.getOrCreateComponentLogger(componentName);
        (logger as SentryLogger).setLogLevel(componentConfig.logLevel);

        // Create or update workflow tracker
        if (componentConfig.enableWorkflowTracking) {
            this.getOrCreateWorkflowTracker(componentName);
        }
    }

    refreshComponentConfig(componentName: string): void {
        const componentConfig = this.globalConfig.componentConfigs.get(componentName);
        if (componentConfig) {
            this.configureComponent(componentName, componentConfig);
        }
    }

    refreshAllComponentConfigs(): void {
        this.globalConfig.componentConfigs.forEach((config, componentName) => {
            this.configureComponent(componentName, config);
        });
    }

    getComponentConfig(componentName: string): ComponentConfig | undefined {
        return this.globalConfig.componentConfigs.get(componentName);
    }

    isLoggingEnabled(componentName: string, level: SentryLogLevel): boolean {
        const logger = this.componentLoggers.get(componentName);
        return logger ? logger.isLoggingEnabled(level) : false;
    }

    // Logging methods
    logError(componentName: string, error: Error | string, context?: Record<string, any>): void {
        const logger = this.getOrCreateComponentLogger(componentName);
        logger.logError(error, context);
    }

    logWarning(componentName: string, warning: string, context?: Record<string, any>): void {
        const logger = this.getOrCreateComponentLogger(componentName);
        logger.logWarning(warning, context);
    }

    logInfo(componentName: string, info: string, context?: Record<string, any>): void {
        const logger = this.getOrCreateComponentLogger(componentName);
        logger.logInfo(info, context);
    }

    logDebug(componentName: string, debug: string, context?: Record<string, any>): void {
        const logger = this.getOrCreateComponentLogger(componentName);
        logger.logDebug(debug, context);
    }

    logTrace(componentName: string, trace: string, context?: Record<string, any>): void {
        const logger = this.getOrCreateComponentLogger(componentName);
        logger.logTrace(trace, context);
    }

    // Workflow methods
    startWorkflow(workflowId: string, workflowName: string, componentName: string, metadata?: Record<string, any>): void {
        const tracker = this.getOrCreateWorkflowTracker(componentName);
        tracker.startWorkflow(workflowId, workflowName, metadata);
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        // Find the workflow tracker that has this workflow
        for (const [componentName, tracker] of this.workflowTrackers) {
            const workflows = (tracker as any).getActiveWorkflows?.();
            if (workflows && workflows.has(workflowId)) {
                tracker.updateWorkflow(workflowId, state, metadata);
                return;
            }
        }
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        // Find the workflow tracker that has this workflow
        for (const [componentName, tracker] of this.workflowTrackers) {
            const workflows = (tracker as any).getActiveWorkflows?.();
            if (workflows && workflows.has(workflowId)) {
                tracker.completeWorkflow(workflowId, success, metadata);
                return;
            }
        }
    }

    trackPerformance(componentName: string, operationName: string, operation: () => Promise<any> | any): Promise<any> {
        const tracker = this.getOrCreateWorkflowTracker(componentName);
        return tracker.trackPerformance(operationName, operation);
    }

    // Configuration methods
    getConfig(): GlobalSentryConfig {
        return { ...this.globalConfig };
    }

    updateSentryConfiguration(dsn?: string, environment?: string): void {
        // This would typically update the global Sentry configuration
        // For now, we'll just log the update
        console.info('Sentry configuration updated', { dsn, environment });
    }

    // Storage methods
    setLocalStorageConfig(config: { logLevel?: string; enabled?: boolean; debugMode?: boolean }): void {
        if (config.logLevel) this.configStorage.setLogLevel(config.logLevel);
        if (config.enabled !== undefined) this.configStorage.setEnabled(config.enabled);
        if (config.debugMode !== undefined) this.configStorage.setDebugMode(config.debugMode);
    }

    clearLocalStorageConfig(): void {
        this.configStorage.clear();
    }

    setComponentLocalStorageConfig(componentName: string, config: { logLevel?: string; enabled?: boolean }): void {
        if (config.logLevel) this.configStorage.setComponentLogLevel(componentName, config.logLevel);
        if (config.enabled !== undefined) this.configStorage.setComponentEnabled(componentName, config.enabled);
    }

    clearComponentLocalStorageConfig(componentName: string): void {
        this.configStorage.clearComponent(componentName);
    }

    getAllComponentConfigs(): Record<string, { logLevel: string; enabled: boolean }> {
        const configs: Record<string, { logLevel: string; enabled: boolean }> = {};

        this.globalConfig.componentConfigs.forEach((config, componentName) => {
            configs[componentName] = {
                logLevel: config.logLevel,
                enabled: config.enableWorkflowTracking ?? true
            };
        });

        return configs;
    }

    // Private helper methods
    private getOrCreateComponentLogger(componentName: string): ILogger {
        let logger = this.componentLoggers.get(componentName);
        if (!logger) {
            const componentConfig = this.globalConfig.componentConfigs.get(componentName);
            logger = new SentryLogger(
                componentName,
                componentConfig?.logLevel || this.globalConfig.defaultLogLevel
            );
            this.componentLoggers.set(componentName, logger);
        }
        return logger;
    }

    private getOrCreateWorkflowTracker(componentName: string): IWorkflowTracker {
        let tracker = this.workflowTrackers.get(componentName);
        if (!tracker) {
            tracker = new WorkflowTracker(componentName);
            this.workflowTrackers.set(componentName, tracker);
        }
        return tracker;
    }

    cleanup(): void {
        this.componentLoggers.clear();
        this.workflowTrackers.clear();
        this.isInitialized = false;
    }
} 