import SentryManager from './sentry-manager';
import { appSettings } from '../app-settings';

// Logging levels for different granularity
export enum SentryLogLevel {
    DISABLED = 'disabled',
    ERROR_ONLY = 'error_only',
    WARNING_AND_ERROR = 'warning_and_error',
    ALL = 'all'
}

// Workflow tracking states
export enum WorkflowState {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

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

class SentryHelper {
    private static instance: SentryHelper;
    private globalConfig: GlobalSentryConfig;
    private activeWorkflows: Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }>;
    private componentLoggers: Map<string, SentryManager>;
    private isInitialized = false;

    private constructor() {
        this.globalConfig = {
            enabled: true,
            defaultLogLevel: SentryLogLevel.ALL,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true,
            componentConfigs: new Map(),
            workflowConfigs: new Map()
        };
        this.activeWorkflows = new Map();
        this.componentLoggers = new Map();
    }

    static getInstance(): SentryHelper {
        if (!SentryHelper.instance) {
            SentryHelper.instance = new SentryHelper();
        }
        return SentryHelper.instance;
    }

    // Initialize the SentryHelper with global configuration
    initialize(config?: Partial<GlobalSentryConfig>): void {
        if (this.isInitialized) {
            console.warn('SentryHelper already initialized');
            return;
        }

        // Merge provided config with defaults
        if (config) {
            this.globalConfig = { ...this.globalConfig, ...config };
        }

        // Initialize SentryManager if enabled
        if (this.globalConfig.enabled) {
            const sentryManager = SentryManager.getInstance();
            sentryManager.initialize({
                dsn: appSettings.sentry.dsn,
                environment: appSettings.sentry.environment,
                componentName: 'HotLeagueWall',
                release: process.env.TAG_VERSION,
                debug: process.env.NODE_ENV === 'development'
            });
        }

        this.isInitialized = true;
        console.log('SentryHelper initialized with config:', this.globalConfig);
    }

    // Global enable/disable
    setGlobalEnabled(enabled: boolean): void {
        this.globalConfig.enabled = enabled;
        console.log(`SentryHelper global logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Set default log level for all components
    setDefaultLogLevel(level: SentryLogLevel): void {
        this.globalConfig.defaultLogLevel = level;
        console.log(`SentryHelper default log level set to: ${level}`);
    }

    // Component-specific configuration
    configureComponent(componentName: string, config: Partial<ComponentConfig>): void {
        const defaultConfig: ComponentConfig = {
            name: componentName,
            logLevel: this.globalConfig.defaultLogLevel,
            enableWorkflowTracking: this.globalConfig.enableWorkflowTracking,
            enablePerformanceTracking: this.globalConfig.enablePerformanceTracking
        };

        const finalConfig = { ...defaultConfig, ...config };
        this.globalConfig.componentConfigs.set(componentName, finalConfig);
        console.log(`Component '${componentName}' configured:`, finalConfig);
    }

    // Get component configuration
    getComponentConfig(componentName: string): ComponentConfig | undefined {
        return this.globalConfig.componentConfigs.get(componentName);
    }

    // Check if logging is enabled for a component and level
    isLoggingEnabled(componentName: string, level: 'error' | 'warning' | 'info'): boolean {
        if (!this.globalConfig.enabled) return false;

        const componentConfig = this.getComponentConfig(componentName);
        const logLevel = componentConfig?.logLevel || this.globalConfig.defaultLogLevel;

        switch (logLevel) {
            case SentryLogLevel.DISABLED:
                return false;
            case SentryLogLevel.ERROR_ONLY:
                return level === 'error';
            case SentryLogLevel.WARNING_AND_ERROR:
                return level === 'error' || level === 'warning';
            case SentryLogLevel.ALL:
                return true;
            default:
                return false;
        }
    }

    // Component-specific logging methods
    logError(componentName: string, error: Error | string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'error')) return;

        const sentryManager = this.getOrCreateComponentLogger(componentName);
        sentryManager.logError(error, context);
    }

    logWarning(componentName: string, warning: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'warning')) return;

        const sentryManager = this.getOrCreateComponentLogger(componentName);
        sentryManager.logWarning(warning, context);
    }

    logInfo(componentName: string, info: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'info')) return;

        const sentryManager = this.getOrCreateComponentLogger(componentName);
        sentryManager.logInfo(info, context);
    }

    // Workflow tracking methods
    startWorkflow(workflowId: string, workflowName: string, componentName: string, metadata?: Record<string, any>): void {
        if (!this.globalConfig.enableWorkflowTracking) return;

        const workflowConfig: WorkflowConfig = {
            id: workflowId,
            name: workflowName,
            component: componentName,
            logLevel: this.getComponentConfig(componentName)?.logLevel || this.globalConfig.defaultLogLevel,
            enablePerformanceTracking: this.globalConfig.enablePerformanceTracking,
            metadata
        };

        this.globalConfig.workflowConfigs.set(workflowId, workflowConfig);
        this.activeWorkflows.set(workflowId, {
            config: workflowConfig,
            startTime: performance.now(),
            metadata: metadata || {}
        });

        this.logInfo(componentName, `Workflow started: ${workflowName}`, {
            workflowId,
            workflowName,
            state: WorkflowState.STARTED,
            metadata
        });
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) return;

        const { config } = workflow;
        const componentName = config.component;

        // Update metadata
        if (metadata) {
            workflow.metadata = { ...workflow.metadata, ...metadata };
        }

        // Log workflow update
        this.logInfo(componentName, `Workflow updated: ${config.name}`, {
            workflowId,
            workflowName: config.name,
            state,
            metadata: workflow.metadata
        });
    }

    completeWorkflow(workflowId: string, success: boolean = true, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) return;

        const { config, startTime } = workflow;
        const componentName = config.component;
        const endTime = performance.now();
        const duration = endTime - startTime;

        const state = success ? WorkflowState.COMPLETED : WorkflowState.FAILED;

        // Log workflow completion
        const logMethod = success ? 'logInfo' : 'logError';
        const message = success ? `Workflow completed: ${config.name}` : `Workflow failed: ${config.name}`;

        this[logMethod](componentName, message, {
            workflowId,
            workflowName: config.name,
            state,
            duration: `${duration.toFixed(2)}ms`,
            metadata: { ...workflow.metadata, ...metadata }
        });

        // Clean up
        this.activeWorkflows.delete(workflowId);
        this.globalConfig.workflowConfigs.delete(workflowId);
    }

    // Performance tracking
    trackPerformance(componentName: string, operationName: string, operation: () => Promise<any> | any): Promise<any> {
        if (!this.globalConfig.enablePerformanceTracking) {
            return Promise.resolve(operation());
        }

        const startTime = performance.now();
        const workflowId = `perf_${componentName}_${operationName}_${Date.now()}`;

        this.startWorkflow(workflowId, `Performance: ${operationName}`, componentName);

        const executeOperation = async () => {
            try {
                const result = await operation();
                this.completeWorkflow(workflowId, true, { result: 'success' });
                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.completeWorkflow(workflowId, false, { error: errorMessage });
                throw error;
            }
        };

        return executeOperation();
    }

    // Utility methods
    private getOrCreateComponentLogger(componentName: string): SentryManager {
        if (!this.componentLoggers.has(componentName)) {
            const sentryManager = SentryManager.getInstance();
            this.componentLoggers.set(componentName, sentryManager);
        }
        return this.componentLoggers.get(componentName)!;
    }

    // Get current configuration
    getConfig(): GlobalSentryConfig {
        return { ...this.globalConfig };
    }

    // Get active workflows
    getActiveWorkflows(): Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }> {
        return new Map(this.activeWorkflows);
    }

    // Cleanup
    cleanup(): void {
        this.activeWorkflows.clear();
        this.componentLoggers.clear();
        this.globalConfig.componentConfigs.clear();
        this.globalConfig.workflowConfigs.clear();
        this.isInitialized = false;
        console.log('SentryHelper cleaned up');
    }
}

// Export singleton instance
export const sentryHelper = SentryHelper.getInstance();

// Export convenience functions for easy usage
export const configureSentry = (config?: Partial<GlobalSentryConfig>) => sentryHelper.initialize(config);
export const enableSentry = () => sentryHelper.setGlobalEnabled(true);
export const disableSentry = () => sentryHelper.setGlobalEnabled(false);
export const setLogLevel = (level: SentryLogLevel) => sentryHelper.setDefaultLogLevel(level);
export const configureComponent = (name: string, config: Partial<ComponentConfig>) => sentryHelper.configureComponent(name, config);

// Export workflow convenience functions
export const startWorkflow = (id: string, name: string, component: string, metadata?: Record<string, any>) =>
    sentryHelper.startWorkflow(id, name, component, metadata);
export const updateWorkflow = (id: string, state: WorkflowState, metadata?: Record<string, any>) =>
    sentryHelper.updateWorkflow(id, state, metadata);
export const completeWorkflow = (id: string, success?: boolean, metadata?: Record<string, any>) =>
    sentryHelper.completeWorkflow(id, success, metadata);
export const trackPerformance = (component: string, operation: string, fn: () => Promise<any> | any) =>
    sentryHelper.trackPerformance(component, operation, fn);

export default SentryHelper; 