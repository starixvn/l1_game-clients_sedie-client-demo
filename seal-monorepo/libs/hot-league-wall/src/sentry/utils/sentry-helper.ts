import SentryManager from '../core/sentry-manager';
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
        const logLevel = localStorage.getItem(SENTRY_LOG_LEVEL_KEY) || 'error';
        const enabled = localStorage.getItem(SENTRY_ENABLED_KEY) !== 'false';
        const debugMode = localStorage.getItem(SENTRY_DEBUG_MODE_KEY) === 'true';

        return { logLevel, enabled, debugMode };
    } catch (error) {
        console.warn('Failed to read localStorage config:', error);
        return { logLevel: 'error', enabled: true, debugMode: false };
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

class SentryHelper {
    private static instance: SentryHelper;
    private globalConfig: GlobalSentryConfig;
    private activeWorkflows: Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }>;
    private componentLoggers: Map<string, SentryManager>;
    private isInitialized = false;

    private constructor() {
        this.globalConfig = {
            enabled: true,
            defaultLogLevel: SentryLogLevel.ERROR,
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

        if (config) {
            this.globalConfig = { ...this.globalConfig, ...config };
        }

        this.isInitialized = true;
        console.log('SentryHelper initialized with config:', this.globalConfig);
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

        this.globalConfig.componentConfigs.set(componentName, finalConfig);
    }

    // Refresh component configuration from localStorage
    refreshComponentConfig(componentName: string): void {
        const componentConfig = this.globalConfig.componentConfigs.get(componentName);
        if (componentConfig) {
            this.configureComponent(componentName, componentConfig);
        }
    }

    // Refresh all component configurations from localStorage
    refreshAllComponentConfigs(): void {
        const componentNames = Array.from(this.globalConfig.componentConfigs.keys());
        componentNames.forEach(componentName => {
            this.refreshComponentConfig(componentName);
        });
    }

    // Get component configuration
    getComponentConfig(componentName: string): ComponentConfig | undefined {
        return this.globalConfig.componentConfigs.get(componentName);
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

    logDebug(componentName: string, debug: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'debug')) return;

        const sentryManager = this.getOrCreateComponentLogger(componentName);
        sentryManager.logDebug(debug, context);
    }

    logTrace(componentName: string, trace: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(componentName, 'trace')) return;

        const sentryManager = this.getOrCreateComponentLogger(componentName);
        sentryManager.logTrace(trace, context);
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

        // Send workflow start event to Sentry (only console logging now)
        try {
            const sentryManager = this.getOrCreateComponentLogger(componentName);
            console.log(`[Sentry] About to call sentryManager.startWorkflow for ${componentName}`);
            sentryManager.startWorkflow(workflowId, workflowName, metadata);
            console.log(`[Sentry] Successfully called sentryManager.startWorkflow for ${componentName}`);
        } catch (error) {
            console.error(`[Sentry] Failed to send workflow start event to Sentry:`, error);
        }

        console.log(`[Sentry] Workflow started: ${workflowName} (${workflowId}) in component: ${componentName}`);
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            console.warn(`[Sentry] Workflow not found: ${workflowId}`);
            return;
        }

        workflow.metadata = { ...workflow.metadata, ...metadata };

        // Send workflow update event to Sentry (only console logging now)
        try {
            const sentryManager = this.getOrCreateComponentLogger(workflow.config.component);
            console.log(`[Sentry] About to call sentryManager.updateWorkflow for ${workflow.config.component}`);
            sentryManager.updateWorkflow(workflowId, state, metadata);
            console.log(`[Sentry] Successfully called sentryManager.updateWorkflow for ${workflow.config.component}`);
        } catch (error) {
            console.error(`[Sentry] Failed to send workflow update event to Sentry:`, error);
        }

        console.log(`[Sentry] Workflow updated: ${workflow.config.name} (${workflowId}) - State: ${state}`);
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            console.warn(`[Sentry] Workflow not found: ${workflowId}`);
            return;
        }

        const duration = Date.now() - workflow.startTime;
        workflow.metadata = { ...workflow.metadata, ...metadata };

        // Send workflow completion event to Sentry (only console logging now)
        try {
            const sentryManager = this.getOrCreateComponentLogger(workflow.config.component);
            console.log(`[Sentry] About to call sentryManager.completeWorkflow for ${workflow.config.component}`);
            sentryManager.completeWorkflow(workflowId, success, { ...metadata, duration });
            console.log(`[Sentry] Successfully called sentryManager.completeWorkflow for ${workflow.config.component}`);
        } catch (error) {
            console.error(`[Sentry] Failed to send workflow completion event to Sentry:`, error);
        }

        console.log(`[Sentry] Workflow completed: ${workflow.config.name} (${workflowId}) - Success: ${success}, Duration: ${duration}ms`);

        this.activeWorkflows.delete(workflowId);
        this.globalConfig.workflowConfigs.delete(workflowId);
    }

    // Performance tracking
    trackPerformance(componentName: string, operationName: string, operation: () => Promise<any> | any): Promise<any> {
        if (!this.globalConfig.enablePerformanceTracking) {
            return Promise.resolve(operation());
        }

        const startTime = Date.now();
        const executeOperation = async () => {
            try {
                const result = await operation();
                const duration = Date.now() - startTime;

                // Send performance event to Sentry (only console logging now)
                const sentryManager = this.getOrCreateComponentLogger(componentName);
                await sentryManager.trackPerformance(operationName, () => Promise.resolve(result));

                console.log(`[Sentry] Performance: ${componentName}.${operationName} - ${duration}ms`);
                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`[Sentry] Performance Error: ${componentName}.${operationName} - ${duration}ms`, error);
                throw error;
            }
        };

        return executeOperation();
    }

    // Get or create component logger
    private getOrCreateComponentLogger(componentName: string): SentryManager {
        if (!this.componentLoggers.has(componentName)) {
            console.log(`[Sentry] Creating new SentryManager for component: ${componentName}`);
            const componentConfig = this.getComponentConfig(componentName);
            const sentryManager = SentryManager.getInstance();

            // Use fallback values to avoid circular dependency with appSettings
            const dsn = 'https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056';
            const environment = 'LOCAL1';

            console.log(`Initializing SentryManager for component ${componentName} with DSN: ${dsn}, environment: ${environment}`);

            sentryManager.initialize({
                dsn: dsn,
                environment: environment,
                componentName,
                logLevel: componentConfig?.logLevel || this.globalConfig.defaultLogLevel,
                debug: true // Enable debug mode to see initialization logs
            });
            this.componentLoggers.set(componentName, sentryManager);
            console.log(`[Sentry] SentryManager created and initialized for component: ${componentName}`);
        } else {
            console.log(`[Sentry] Using existing SentryManager for component: ${componentName}`);
        }

        const sentryManager = this.componentLoggers.get(componentName);
        console.log(`[Sentry] Returning SentryManager for component: ${componentName}, initialized: ${sentryManager?.isManagerInitialized()}`);
        return sentryManager!;
    }

    // Get current configuration
    getConfig(): GlobalSentryConfig {
        return this.globalConfig;
    }

    // Get active workflows
    getActiveWorkflows(): Map<string, { config: WorkflowConfig; startTime: number; metadata: Record<string, any> }> {
        return this.activeWorkflows;
    }

    // Update Sentry configuration with appSettings (to be called after appSettings is initialized)
    updateSentryConfiguration(dsn?: string, environment?: string): void {
        if (dsn && environment) {
            // Update all existing component loggers with new configuration
            this.componentLoggers.forEach((sentryManager, componentName) => {
                try {
                    console.log(`[Sentry] Updating configuration for component: ${componentName}`);
                    sentryManager.initialize({
                        dsn: dsn,
                        environment: environment,
                        componentName,
                        logLevel: this.getComponentConfig(componentName)?.logLevel || this.globalConfig.defaultLogLevel,
                        debug: true
                    });
                } catch (error) {
                    console.error(`[Sentry] Failed to update configuration for component ${componentName}:`, error);
                }
            });
        }
    }

    // Cleanup resources
    cleanup(): void {
        this.activeWorkflows.clear();
        this.componentLoggers.clear();
        this.globalConfig.componentConfigs.clear();
        this.globalConfig.workflowConfigs.clear();
        this.isInitialized = false;
    }
}

// Singleton instance
const sentryHelper = SentryHelper.getInstance();

// Export the singleton instance
export { sentryHelper };

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
            return SentryLogLevel.ERROR;
    }
};

// Export the SentryHelper class for testing
export { SentryHelper };

// Export functions
export const configureSentry = (config?: Partial<GlobalSentryConfig>) => sentryHelper.initialize(config);
export const enableSentry = () => sentryHelper.setGlobalEnabled(true);
export const disableSentry = () => sentryHelper.setGlobalEnabled(false);
export const setLogLevel = (level: SentryLogLevel) => sentryHelper.setDefaultLogLevel(level);
export const configureComponent = (name: string, config: Partial<ComponentConfig>) => sentryHelper.configureComponent(name, config);
export const refreshComponentConfig = (name: string) => sentryHelper.refreshComponentConfig(name);
export const refreshAllComponentConfigs = () => sentryHelper.refreshAllComponentConfigs();
export const updateSentryConfiguration = (dsn?: string, environment?: string) => sentryHelper.updateSentryConfiguration(dsn, environment);

// Workflow tracking exports
export const startWorkflow = (id: string, name: string, component: string, metadata?: Record<string, any>) =>
    sentryHelper.startWorkflow(id, name, component, metadata);
export const updateWorkflow = (id: string, state: WorkflowState, metadata?: Record<string, any>) =>
    sentryHelper.updateWorkflow(id, state, metadata);
export const completeWorkflow = (id: string, success?: boolean, metadata?: Record<string, any>) =>
    sentryHelper.completeWorkflow(id, success, metadata);

// Performance tracking export
export const trackPerformance = (component: string, operation: string, fn: () => Promise<any> | any) =>
    sentryHelper.trackPerformance(component, operation, fn);

// Logging exports
export const logError = (component: string, error: Error | string, context?: Record<string, any>) =>
    sentryHelper.logError(component, error, context);
export const logWarning = (component: string, warning: string, context?: Record<string, any>) =>
    sentryHelper.logWarning(component, warning, context);
export const logInfo = (component: string, info: string, context?: Record<string, any>) =>
    sentryHelper.logInfo(component, info, context);
export const logDebug = (component: string, debug: string, context?: Record<string, any>) =>
    sentryHelper.logDebug(component, debug, context);
export const logTrace = (component: string, trace: string, context?: Record<string, any>) =>
    sentryHelper.logTrace(component, trace, context); 