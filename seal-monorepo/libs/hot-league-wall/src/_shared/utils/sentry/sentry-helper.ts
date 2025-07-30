import SentryManager from './sentry-manager';
import { appSettings } from '../../app-settings';
import {
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    UseSentryHelperOptions,
    WorkflowTracker,
    LocalStorageConfig
} from './sentry-types';

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

class SentryHelper {
    private static instance: SentryHelper;
    private globalConfig: GlobalSentryConfig;
    private activeWorkflows: Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }>;
    private componentLoggers: Map<string, SentryManager>;
    private isInitialized = false;

    private constructor() {
        this.globalConfig = {
            enabled: true,
            defaultLogLevel: SentryLogLevel.INFO,
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

        const localStorageConfig = getLocalStorageConfig();

        // Merge provided config with defaults and localStorage settings
        if (config) {
            this.globalConfig = { ...this.globalConfig, ...config };
        }

        // Override with localStorage settings
        this.globalConfig.enabled = localStorageConfig.enabled && this.globalConfig.enabled;
        this.globalConfig.defaultLogLevel = getLogLevelFromString(localStorageConfig.logLevel);

        // Initialize SentryManager if enabled
        if (this.globalConfig.enabled) {
            const sentryManager = SentryManager.getInstance();
            sentryManager.initialize({
                dsn: appSettings.sentry.dsn,
                environment: appSettings.sentry.environment,
                componentName: 'HotLeagueWall',
                release: process.env.TAG_VERSION,
                debug: localStorageConfig.debugMode || process.env.NODE_ENV === 'development'
            });
        }

        this.isInitialized = true;
    }

    // Global enable/disable
    setGlobalEnabled(enabled: boolean): void {
        this.globalConfig.enabled = enabled;
    }

    // Set default log level for all components
    setDefaultLogLevel(level: SentryLogLevel): void {
        this.globalConfig.defaultLogLevel = level;
    }

    // Component-specific configuration
    configureComponent(componentName: string, config: Partial<ComponentConfig>): void {
        const localStorageConfig = getLocalStorageConfig();

        const defaultConfig: ComponentConfig = {
            name: componentName,
            logLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: this.globalConfig.enableWorkflowTracking,
            enablePerformanceTracking: this.globalConfig.enablePerformanceTracking
        };

        const finalConfig = { ...defaultConfig, ...config };
        this.globalConfig.componentConfigs.set(componentName, finalConfig);
    }

    // Get component configuration
    getComponentConfig(componentName: string): ComponentConfig | undefined {
        return this.globalConfig.componentConfigs.get(componentName);
    }

    // Check if logging is enabled for a component and level
    isLoggingEnabled(componentName: string, level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): boolean {
        const localStorageConfig = getLocalStorageConfig();

        // Warning, Error, and Fatal should always be sent regardless of localStorage
        if (level === 'warn' || level === 'error' || level === 'fatal') {
            return this.globalConfig.enabled;
        }

        // For trace, debug, and info levels, check localStorage enabled flag
        if (!this.globalConfig.enabled || !localStorageConfig.enabled) {
            return false;
        }

        const componentConfig = this.getComponentConfig(componentName);
        const logLevel = componentConfig?.logLevel || this.globalConfig.defaultLogLevel;

        // Define level hierarchy (higher number = more important)
        const levelHierarchy = {
            'trace': 0,
            'debug': 1,
            'info': 2,
            'warn': 3,
            'error': 4,
            'fatal': 5
        };

        // At this point, level can only be 'trace', 'debug', or 'info'
        const currentLevel = level as 'trace' | 'debug' | 'info';

        switch (logLevel) {
            case SentryLogLevel.DISABLED:
                return false;
            case SentryLogLevel.TRACE:
                return levelHierarchy[currentLevel] >= levelHierarchy['trace'];
            case SentryLogLevel.DEBUG:
                return levelHierarchy[currentLevel] >= levelHierarchy['debug'];
            case SentryLogLevel.INFO:
                return levelHierarchy[currentLevel] >= levelHierarchy['info'];
            case SentryLogLevel.WARN:
                return levelHierarchy[currentLevel] >= levelHierarchy['warn'];
            case SentryLogLevel.ERROR:
                return levelHierarchy[currentLevel] >= levelHierarchy['error'];
            case SentryLogLevel.FATAL:
                return levelHierarchy[currentLevel] >= levelHierarchy['fatal'];
            // Legacy levels for backward compatibility
            case SentryLogLevel.ERROR_ONLY:
                return false; // trace, debug, info are not error levels
            case SentryLogLevel.WARNING_AND_ERROR:
                return false; // trace, debug, info are not warning or error levels
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
        if (!this.isLoggingEnabled(componentName, 'warn')) return;

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

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
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