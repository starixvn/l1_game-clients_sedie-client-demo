

import { SentryLogLevel } from './sentry-types';
import { configureSentry, configureComponent, refreshComponentConfig, refreshAllComponentConfigs } from '../utils/sentry-helper';

// LocalStorage keys for logging control
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode';

// Component-specific localStorage keys
const COMPONENT_LOG_LEVEL_PREFIX = 'sentry_component_log_level_';
const COMPONENT_ENABLED_PREFIX = 'sentry_component_enabled_';

/**
 * Component logging configuration interface
 */
interface ComponentLoggingConfig {
    logLevel: string;
    enableWorkflowTracking: boolean;
    enablePerformanceTracking: boolean;
}

/**
 * Component logging configuration from config files
 */
interface ComponentLoggingSettings {
    enabled: boolean;
    defaultLogLevel: string;
    components: Record<string, ComponentLoggingConfig>;
}

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

/**
 * Comprehensive SentryHelper configuration for the HotLeagueWall project
 * This file sets up different log levels and tracking options for all components
 */
export const initializeSentryForProject = () => {
    const localStorageConfig = getLocalStorageConfig();
    const componentConfigs = getAllComponentConfigs();

    // Initialize global Sentry configuration
    configureSentry({
        enabled: localStorageConfig.enabled,
        defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        enableConsoleOverride: true
    });

    // Get component logging settings from config (this would be loaded from your config files)
    const componentLoggingSettings: ComponentLoggingSettings = {
        enabled: true,
        defaultLogLevel: 'info',
        components: {
            // Default component configurations
            HotLeagueWall: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            App: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            AppContent: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            Lobby: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            LobbyComponent: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            RNGSoccerStaticPrototype: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            RNGSoccerBase: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            RNGSoccerPage: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            Loading: { logLevel: 'error', enableWorkflowTracking: true, enablePerformanceTracking: true },
            GameDisconnectView: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            BetOption: { logLevel: 'error', enableWorkflowTracking: true, enablePerformanceTracking: true },
            BetPanel: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            BettingChips: { logLevel: 'error', enableWorkflowTracking: true, enablePerformanceTracking: true },
            Scoreboard: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            RoundHistory: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            CountDownTimer: { logLevel: 'error', enableWorkflowTracking: true, enablePerformanceTracking: true },
            AnimBalance: { logLevel: 'error', enableWorkflowTracking: true, enablePerformanceTracking: true },
            WinnerDisplay: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            // SSOControlSimulator: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            // Preview: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            GatewayConnectionManager: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            ConnectionManager: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            TokenRequestManager: { logLevel: 'info', enableWorkflowTracking: true, enablePerformanceTracking: true },
            SyncMemberSiteBalance: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            LobbyStore: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            GameStore: { logLevel: 'warn', enableWorkflowTracking: true, enablePerformanceTracking: true },
            StringHelper: { logLevel: 'error', enableWorkflowTracking: false, enablePerformanceTracking: false },
            ComponentUtil: { logLevel: 'error', enableWorkflowTracking: false, enablePerformanceTracking: false },
            I18n: { logLevel: 'error', enableWorkflowTracking: false, enablePerformanceTracking: false }
        }
    };

    // Configure components with isolated logging
    Object.entries(componentLoggingSettings.components).forEach(([componentName, defaultConfig]) => {
        const componentLocalStorage = getComponentLocalStorageConfig(componentName);
        const componentConfig = componentConfigs[componentName];

        // Priority: localStorage component config > localStorage global config > default config
        const finalLogLevel = componentLocalStorage.logLevel ||
            componentConfig?.logLevel ||
            localStorageConfig.logLevel ||
            defaultConfig.logLevel;

        const finalEnabled = componentLocalStorage.enabled !== null ?
            componentLocalStorage.enabled :
            (componentConfig?.enabled ?? localStorageConfig.enabled);

        if (finalEnabled) {
            configureComponent(componentName, {
                logLevel: getLogLevelFromString(finalLogLevel),
                enableWorkflowTracking: defaultConfig.enableWorkflowTracking,
                enablePerformanceTracking: defaultConfig.enablePerformanceTracking
            });
        }
    });

    // Log configuration summary to console
    logConfigurationSummary(localStorageConfig, componentConfigs, componentLoggingSettings);
};

/**
 * Log configuration summary to console
 */
const logConfigurationSummary = (
    localStorageConfig: { logLevel: string; enabled: boolean; debugMode: boolean },
    componentConfigs: Record<string, { logLevel: string; enabled: boolean }>,
    componentLoggingSettings: ComponentLoggingSettings
) => {
    const summary = {
        global: {
            enabled: localStorageConfig.enabled,
            logLevel: localStorageConfig.logLevel,
            debugMode: localStorageConfig.debugMode
        },
        componentLogging: {
            enabled: componentLoggingSettings.enabled,
            defaultLogLevel: componentLoggingSettings.defaultLogLevel,
            components: Object.keys(componentLoggingSettings.components).map(componentName => {
                const defaultConfig = componentLoggingSettings.components[componentName];
                const componentConfig = componentConfigs[componentName];
                const componentLocalStorage = getComponentLocalStorageConfig(componentName);

                const finalLogLevel = componentLocalStorage.logLevel ||
                    componentConfig?.logLevel ||
                    localStorageConfig.logLevel ||
                    defaultConfig.logLevel;

                const finalEnabled = componentLocalStorage.enabled !== null ?
                    componentLocalStorage.enabled :
                    (componentConfig?.enabled ?? localStorageConfig.enabled);

                return {
                    name: componentName,
                    logLevel: finalLogLevel,
                    enabled: finalEnabled,
                    workflowTracking: defaultConfig.enableWorkflowTracking,
                    performanceTracking: defaultConfig.enablePerformanceTracking,
                    overridden: componentLocalStorage.logLevel !== null || componentConfig !== undefined
                };
            })
        },
        localStorageKeys: {
            global: {
                logLevel: SENTRY_LOG_LEVEL_KEY,
                enabled: SENTRY_ENABLED_KEY,
                debugMode: SENTRY_DEBUG_MODE_KEY
            },
            component: {
                logLevelPrefix: COMPONENT_LOG_LEVEL_PREFIX,
                enabledPrefix: COMPONENT_ENABLED_PREFIX
            }
        }
    };

    console.group('🔧 Sentry Configuration Summary');
    console.log('Global Configuration:', summary.global);
    console.log('Component Logging:', summary.componentLogging);
    console.log('LocalStorage Keys:', summary.localStorageKeys);
    console.log('Component Configurations:', summary.componentLogging.components);
    console.groupEnd();

    // Make configuration available globally for debugging
    (window as any).__SENTRY_CONFIG__ = summary;
};

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

/**
 * Environment-specific Sentry configuration
 */
export const configureSentryForEnvironment = (environment: string) => {
    const localStorageConfig = getLocalStorageConfig();
    const isDevelopment = environment === 'development';
    const isProduction = environment === 'production';
    const isTest = environment === 'test';

    if (isDevelopment) {
        // Development: Info logging for normal operations, error logging for exceptions
        configureSentry({
            enabled: localStorageConfig.enabled,
            defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
    } else if (isProduction) {
        // Production: Info logging for normal operations, error logging for exceptions
        configureSentry({
            enabled: localStorageConfig.enabled,
            defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: false,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
    } else if (isTest) {
        // Test: Disabled to avoid noise during testing
        configureSentry({
            enabled: false,
            defaultLogLevel: SentryLogLevel.DISABLED,
            enableWorkflowTracking: false,
            enablePerformanceTracking: false,
            enableConsoleOverride: false
        });
    } else {
        // Default: Conservative logging
        configureSentry({
            enabled: localStorageConfig.enabled,
            defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: false,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
    }
};

/**
 * Component-specific configuration presets
 */
export const SENTRY_PRESETS = {
    // Critical components that need info logging for normal operations, error logging for exceptions
    CRITICAL: {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    },

    // Important components that need info logging for normal operations, error logging for exceptions
    IMPORTANT: {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    },

    // UI components that need info logging for normal operations, error logging for exceptions
    UI: {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    },

    // Utility components that need info logging for normal operations, error logging for exceptions
    UTILITY: {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    },

    // Debug components that should be disabled in production
    DEBUG: {
        logLevel: process.env.NODE_ENV === 'development' ? SentryLogLevel.INFO : SentryLogLevel.DISABLED,
        enableWorkflowTracking: process.env.NODE_ENV === 'development',
        enablePerformanceTracking: process.env.NODE_ENV === 'development'
    }
};

/**
 * Quick configuration for common component types
 */
export const configureComponentByType = (componentName: string, type: keyof typeof SENTRY_PRESETS) => {
    const preset = SENTRY_PRESETS[type];
    configureComponent(componentName, preset);
};

/**
 * Batch configuration for multiple components
 */
export const configureComponentsBatch = (components: Array<{ name: string; type: keyof typeof SENTRY_PRESETS }>) => {
    components.forEach(({ name, type }) => {
        configureComponentByType(name, type);
    });
};

/**
 * Get current configuration object for debugging
 */
export const getCurrentConfiguration = () => {
    const localStorageConfig = getLocalStorageConfig();
    const componentConfigs = getAllComponentConfigs();

    return {
        global: localStorageConfig,
        components: componentConfigs,
        localStorageKeys: {
            global: {
                logLevel: SENTRY_LOG_LEVEL_KEY,
                enabled: SENTRY_ENABLED_KEY,
                debugMode: SENTRY_DEBUG_MODE_KEY
            },
            component: {
                logLevelPrefix: COMPONENT_LOG_LEVEL_PREFIX,
                enabledPrefix: COMPONENT_ENABLED_PREFIX
            }
        }
    };
};

// Expose functions globally for browser console access
if (typeof window !== 'undefined') {
    (window as any).SentryConfig = {
        setComponentLocalStorageConfig,
        setLocalStorageConfig,
        clearComponentLocalStorageConfig,
        clearLocalStorageConfig,
        getAllComponentConfigs,
        getCurrentConfiguration,
        initializeSentryForProject,
        configureSentryForEnvironment,
        SENTRY_PRESETS,
        configureComponentByType,
        configureComponentsBatch
    };

    // Also expose individual functions for easier access
    (window as any).setComponentLocalStorageConfig = setComponentLocalStorageConfig;
    (window as any).setLocalStorageConfig = setLocalStorageConfig;
    (window as any).clearComponentLocalStorageConfig = clearComponentLocalStorageConfig;
    (window as any).clearLocalStorageConfig = clearLocalStorageConfig;
    (window as any).getAllComponentConfigs = getAllComponentConfigs;
    (window as any).getCurrentConfiguration = getCurrentConfiguration;
    (window as any).initializeSentryForProject = initializeSentryForProject;
    (window as any).refreshComponentConfig = refreshComponentConfig;
    (window as any).refreshAllComponentConfigs = refreshAllComponentConfigs;

    // Log availability to console
    console.log('🔧 Sentry Component Logging Functions Available:');
    console.log('- setComponentLocalStorageConfig(componentName, config)');
    console.log('- setLocalStorageConfig(config)');
    console.log('- clearComponentLocalStorageConfig(componentName)');
    console.log('- clearLocalStorageConfig()');
    console.log('- getAllComponentConfigs()');
    console.log('- getCurrentConfiguration()');
    console.log('- initializeSentryForProject()');
    console.log('- Or use SentryConfig object for all functions');
}

export default {
    initializeSentryForProject,
    configureSentryForEnvironment,
    SENTRY_PRESETS,
    configureComponentByType,
    configureComponentsBatch,
    setLocalStorageConfig,
    setComponentLocalStorageConfig,
    clearLocalStorageConfig,
    clearComponentLocalStorageConfig,
    getAllComponentConfigs,
    getCurrentConfiguration
}; 