
import { appSettings } from '../../_shared/app-settings';
import { sentryBatchManager, addBatchedLog, flushComponentBatches } from '../utils/sentry-batch-manager';
import {
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    UseSentryHelperOptions,
    WorkflowTracker,
    LocalStorageConfig
} from '../core/sentry-types';

// LocalStorage keys for logging control
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode';

// Component-specific localStorage keys
const COMPONENT_LOG_LEVEL_PREFIX = 'sentry_component_log_level_';
const COMPONENT_ENABLED_PREFIX = 'sentry_component_enabled_';

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
 * Get component-specific logging configuration from localStorage
 */
const getComponentLocalStorageConfig = (componentName: string) => {
    try {
        const logLevelKey = `${COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
        const enabledKey = `${COMPONENT_ENABLED_PREFIX}${componentName}`;

        const logLevel = localStorage.getItem(logLevelKey);
        const enabled = localStorage.getItem(enabledKey) !== 'false';

        return { logLevel, enabled };
    } catch (error) {
        console.warn(`Failed to read localStorage config for component ${componentName}:`, error);
        return { logLevel: null, enabled: true };
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
 * Set component-specific logging configuration in localStorage
 */
export const setComponentLocalStorageConfig = (
    componentName: string,
    config: { logLevel?: string; enabled?: boolean }
) => {
    try {
        if (config.logLevel !== undefined) {
            const logLevelKey = `${COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
            localStorage.setItem(logLevelKey, config.logLevel);
        }
        if (config.enabled !== undefined) {
            const enabledKey = `${COMPONENT_ENABLED_PREFIX}${componentName}`;
            localStorage.setItem(enabledKey, config.enabled.toString());
        }
    } catch (error) {
        console.warn(`Failed to set localStorage config for component ${componentName}:`, error);
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

        // Clear all component-specific keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith(COMPONENT_LOG_LEVEL_PREFIX) || key.startsWith(COMPONENT_ENABLED_PREFIX))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
        // Silent fail
    }
};

/**
 * Clear component-specific localStorage configuration
 */
export const clearComponentLocalStorageConfig = (componentName: string) => {
    try {
        const logLevelKey = `${COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
        const enabledKey = `${COMPONENT_ENABLED_PREFIX}${componentName}`;

        localStorage.removeItem(logLevelKey);
        localStorage.removeItem(enabledKey);
    } catch (error) {
        console.warn(`Failed to clear localStorage config for component ${componentName}:`, error);
    }
};

/**
 * Get all component configurations from localStorage
 */
export const getAllComponentConfigs = () => {
    const configs: Record<string, { logLevel: string; enabled: boolean }> = {};

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(COMPONENT_LOG_LEVEL_PREFIX)) {
                const componentName = key.replace(COMPONENT_LOG_LEVEL_PREFIX, '');
                const logLevel = localStorage.getItem(key) || 'info';
                const enabledKey = `${COMPONENT_ENABLED_PREFIX}${componentName}`;
                const enabled = localStorage.getItem(enabledKey) !== 'false';

                configs[componentName] = { logLevel, enabled };
            }
        }
    } catch (error) {
        console.warn('Failed to read component configs from localStorage:', error);
    }

    return configs;
};

class SentryHelperBatched {
    private static instance: SentryHelperBatched;
    private globalConfig: GlobalSentryConfig;
    private activeWorkflows: Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }>;
    private componentConfigs: Map<string, ComponentConfig>;
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
        this.componentConfigs = new Map();
    }

    static getInstance(): SentryHelperBatched {
        if (!SentryHelperBatched.instance) {
            SentryHelperBatched.instance = new SentryHelperBatched();
        }
        return SentryHelperBatched.instance;
    }

    // Initialize the SentryHelper with global configuration
    initialize(config?: Partial<GlobalSentryConfig>): void {
        if (this.isInitialized) {
            console.warn('SentryHelperBatched already initialized');
            return;
        }

        if (config) {
            this.globalConfig = { ...this.globalConfig, ...config };
        }

        // Initialize the batch manager
        sentryBatchManager.initialize();

        this.isInitialized = true;
        console.log('SentryHelperBatched initialized with config:', this.globalConfig);
    }

    // Set global enabled state
    setGlobalEnabled(enabled: boolean): void {
        this.globalConfig.enabled = enabled;
    }

    // Set default log level
    setDefaultLogLevel(level: SentryLogLevel): void {
        this.globalConfig.defaultLogLevel = level;
    }

    // Configure a specific component
    configureComponent(componentName: string, config: Partial<ComponentConfig>): void {
        const localStorageConfig = getLocalStorageConfig();
        const componentLocalStorage = getComponentLocalStorageConfig(componentName);

        const defaultConfig: ComponentConfig = {
            name: componentName,
            logLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: this.globalConfig.enableWorkflowTracking,
            enablePerformanceTracking: this.globalConfig.enablePerformanceTracking
        };

        // Priority: component localStorage > global localStorage > default config
        const finalLogLevel = componentLocalStorage.logLevel ||
            localStorageConfig.logLevel ||
            defaultConfig.logLevel;

        const finalConfig = {
            ...defaultConfig,
            ...config,
            logLevel: getLogLevelFromString(finalLogLevel)
        };

        this.componentConfigs.set(componentName, finalConfig);
        this.globalConfig.componentConfigs.set(componentName, finalConfig);
    }

    // Refresh component configuration from localStorage
    refreshComponentConfig(componentName: string): void {
        const componentConfig = this.componentConfigs.get(componentName);
        if (componentConfig) {
            this.configureComponent(componentName, componentConfig);
        }
    }

    // Refresh all component configurations from localStorage
    refreshAllComponentConfigs(): void {
        const componentNames = Array.from(this.componentConfigs.keys());
        componentNames.forEach(componentName => {
            this.refreshComponentConfig(componentName);
        });
    }

    // Get component configuration
    getComponentConfig(componentName: string): ComponentConfig | undefined {
        return this.componentConfigs.get(componentName);
    }

    // Check if logging is enabled for a component and level
    isLoggingEnabled(componentName: string, level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): boolean {
        const localStorageConfig = getLocalStorageConfig();
        const componentLocalStorage = getComponentLocalStorageConfig(componentName);

        // Check global enabled state
        if (!this.globalConfig.enabled || !localStorageConfig.enabled) {
            return false;
        }

        // Check component-specific enabled state
        if (componentLocalStorage.enabled === false) {
            return false;
        }

        // Get component configuration
        const componentConfig = this.getComponentConfig(componentName);

        // Priority: component localStorage > component config > global localStorage > default
        const logLevel = componentLocalStorage.logLevel ||
            componentConfig?.logLevel ||
            getLogLevelFromString(localStorageConfig.logLevel) ||
            this.globalConfig.defaultLogLevel;

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

        switch (logLevel) {
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

    // Component-specific logging methods using batch manager
    logError(componentName: string, error: Error | string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'error')) return;

        const errorMessage = error instanceof Error ? error.message : error;
        addBatchedLog(componentName, errorMessage, 'error', context);
    }

    logWarning(componentName: string, warning: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'warn')) return;

        addBatchedLog(componentName, warning, 'warn', context);
    }

    logInfo(componentName: string, info: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'info')) return;

        addBatchedLog(componentName, info, 'info', context);
    }

    logDebug(componentName: string, debug: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'debug')) return;

        addBatchedLog(componentName, debug, 'debug', context);
    }

    logTrace(componentName: string, trace: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'trace')) return;

        addBatchedLog(componentName, trace, 'trace', context);
    }

    // Workflow tracking methods
    startWorkflow(workflowId: string, workflowName: string, componentName: string, metadata?: Record<string, any>): void {
        if (!this.globalConfig.enableWorkflowTracking) {
            return;
        }

        const workflowConfig: WorkflowConfig = {
            id: workflowId,
            name: workflowName,
            component: componentName,
            logLevel: this.globalConfig.defaultLogLevel,
            enablePerformanceTracking: this.globalConfig.enablePerformanceTracking,
            metadata
        };

        this.globalConfig.workflowConfigs.set(workflowId, workflowConfig);
        this.activeWorkflows.set(workflowId, {
            config: workflowConfig,
            startTime: Date.now(),
            metadata: metadata || {}
        });

        // Log workflow start using batch manager
        addBatchedLog(componentName, `Workflow started: ${workflowName} (ID: ${workflowId})`, 'info', {
            workflowId,
            workflowName,
            ...metadata
        });
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            console.warn(`[Sentry] Workflow not found: ${workflowId}`);
            return;
        }

        workflow.metadata = { ...workflow.metadata, ...metadata };

        // Log workflow update using batch manager
        addBatchedLog(workflow.config.component, `Workflow updated: ${state} (ID: ${workflowId})`, 'info', {
            workflowId,
            workflowState: state,
            ...metadata
        });
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            console.warn(`[Sentry] Workflow not found: ${workflowId}`);
            return;
        }

        const duration = Date.now() - workflow.startTime;
        workflow.metadata = { ...workflow.metadata, ...metadata };

        // Log workflow completion using batch manager
        const level = success ? 'info' : 'error';
        addBatchedLog(workflow.config.component, `Workflow completed: ${success ? 'Success' : 'Failure'} (ID: ${workflowId})`, level, {
            workflowId,
            workflowSuccess: success,
            duration,
            ...metadata
        });

        this.activeWorkflows.delete(workflowId);
        this.globalConfig.workflowConfigs.delete(workflowId);
    }

    // Performance tracking
    async trackPerformance(componentName: string, operationName: string, operation: () => Promise<any> | any): Promise<any> {
        if (!this.globalConfig.enablePerformanceTracking) {
            return Promise.resolve(operation());
        }

        const startTime = Date.now();
        const executeOperation = async () => {
            try {
                const result = await operation();
                const duration = Date.now() - startTime;

                // Log performance using batch manager
                addBatchedLog(componentName, `Performance: ${operationName} took ${duration.toFixed(2)}ms`, 'info', {
                    operationName,
                    duration: duration.toFixed(2)
                });

                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                addBatchedLog(componentName, `Performance Error: ${operationName} failed after ${duration.toFixed(2)}ms`, 'error', {
                    operationName,
                    duration: duration.toFixed(2),
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        };

        return executeOperation();
    }

    // Get current configuration
    getConfig(): GlobalSentryConfig {
        return this.globalConfig;
    }

    // Get active workflows
    getActiveWorkflows(): Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }> {
        return this.activeWorkflows;
    }

    // Force flush all batches
    async flushAllBatches(): Promise<void> {
        await sentryBatchManager.flushAll();
    }

    // Force flush component batches
    async flushComponentBatches(componentName: string): Promise<void> {
        await sentryBatchManager.flushComponent(componentName);
    }

    // Get batch statistics
    getBatchStats(): Record<string, { logCount: number; lastFlushTime: number }> {
        return sentryBatchManager.getBatchStats();
    }

    // Cleanup resources
    cleanup(): void {
        this.activeWorkflows.clear();
        this.componentConfigs.clear();
        this.globalConfig.componentConfigs.clear();
        this.globalConfig.workflowConfigs.clear();
        this.isInitialized = false;

        // Cleanup batch manager
        sentryBatchManager.cleanup();
    }
}

// Singleton instance
const sentryHelperBatched = SentryHelperBatched.getInstance();

// Export the singleton instance
export { sentryHelperBatched };

// Convert string log level to SentryLogLevel enum
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

// Export functions
export const configureSentryBatched = (config?: Partial<GlobalSentryConfig>) => sentryHelperBatched.initialize(config);
export const enableSentryBatched = () => sentryHelperBatched.setGlobalEnabled(true);
export const disableSentryBatched = () => sentryHelperBatched.setGlobalEnabled(false);
export const setLogLevelBatched = (level: SentryLogLevel) => sentryHelperBatched.setDefaultLogLevel(level);
export const configureComponentBatched = (name: string, config: Partial<ComponentConfig>) => sentryHelperBatched.configureComponent(name, config);
export const refreshComponentConfigBatched = (name: string) => sentryHelperBatched.refreshComponentConfig(name);
export const refreshAllComponentConfigsBatched = () => sentryHelperBatched.refreshAllComponentConfigs();

// Workflow tracking exports
export const startWorkflowBatched = (id: string, name: string, component: string, metadata?: Record<string, any>) =>
    sentryHelperBatched.startWorkflow(id, name, component, metadata);
export const updateWorkflowBatched = (id: string, state: WorkflowState, metadata?: Record<string, any>) =>
    sentryHelperBatched.updateWorkflow(id, state, metadata);
export const completeWorkflowBatched = (id: string, success?: boolean, metadata?: Record<string, any>) =>
    sentryHelperBatched.completeWorkflow(id, success, metadata);

// Performance tracking export
export const trackPerformanceBatched = (component: string, operation: string, fn: () => Promise<any> | any) =>
    sentryHelperBatched.trackPerformance(component, operation, fn);

// Logging exports
export const logErrorBatched = (component: string, error: Error | string, context?: Record<string, any>) =>
    sentryHelperBatched.logError(component, error, context);
export const logWarningBatched = (component: string, warning: string, context?: Record<string, any>) =>
    sentryHelperBatched.logWarning(component, warning, context);
export const logInfoBatched = (component: string, info: string, context?: Record<string, any>) =>
    sentryHelperBatched.logInfo(component, info, context);
export const logDebugBatched = (component: string, debug: string, context?: Record<string, any>) =>
    sentryHelperBatched.logDebug(component, debug, context);
export const logTraceBatched = (component: string, trace: string, context?: Record<string, any>) =>
    sentryHelperBatched.logTrace(component, trace, context);

// Batch management exports
export const flushAllBatchesBatched = () => sentryHelperBatched.flushAllBatches();
export const flushComponentBatchesBatched = (componentName: string) => sentryHelperBatched.flushComponentBatches(componentName);
export const getBatchStatsBatched = () => sentryHelperBatched.getBatchStats(); 