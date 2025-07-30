import { configureSentry, configureComponent } from './sentry-helper';
import { SentryLogLevel } from './sentry-types';

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

/**
 * Comprehensive SentryHelper configuration for the HotLeagueWall project
 * This file sets up different log levels and tracking options for all components
 */

export const initializeSentryForProject = () => {
    const localStorageConfig = getLocalStorageConfig();

    // Initialize global Sentry configuration
    configureSentry({
        enabled: localStorageConfig.enabled,
        defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        enableConsoleOverride: true
    });

    // Configure main application components
    configureComponent('HotLeagueWall', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('App', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('AppContent', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure lobby and navigation components
    configureComponent('Lobby', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('LobbyComponent', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure game components
    configureComponent('RNGSoccerStaticPrototype', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('RNGSoccerBase', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    configureComponent('RNGSoccerPage', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Configure shared components with different log levels
    configureComponent('Loading', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    configureComponent('GameDisconnectView', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Configure UI components with minimal logging
    configureComponent('BetOption', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    configureComponent('BetPanel', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    configureComponent('BettingChips', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    configureComponent('Scoreboard', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    configureComponent('RoundHistory', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Configure utility components
    configureComponent('CountDownTimer', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    configureComponent('AnimBalance', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    configureComponent('WinnerDisplay', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Configure simulator components
    configureComponent('SSOControlSimulator', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('Preview', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure connection and gateway components
    configureComponent('GatewayConnectionManager', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('ConnectionManager', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure authentication components
    configureComponent('TokenRequestManager', {
        logLevel: getLogLevelFromString(localStorageConfig.logLevel),
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('SyncMemberSiteBalance', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Configure state management components
    configureComponent('LobbyStore', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    configureComponent('GameStore', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Configure utility components
    configureComponent('StringHelper', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    configureComponent('ComponentUtil', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Configure internationalization
    configureComponent('I18n', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    console.log('SentryHelper configured for HotLeagueWall project with localStorage config:', localStorageConfig);
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
        console.log('SentryHelper configured for DEVELOPMENT environment with localStorage config:', localStorageConfig);
    } else if (isProduction) {
        // Production: Info logging for normal operations, error logging for exceptions
        configureSentry({
            enabled: localStorageConfig.enabled,
            defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: false,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
        console.log('SentryHelper configured for PRODUCTION environment with localStorage config:', localStorageConfig);
    } else if (isTest) {
        // Test: Disabled to avoid noise during testing
        configureSentry({
            enabled: false,
            defaultLogLevel: SentryLogLevel.DISABLED,
            enableWorkflowTracking: false,
            enablePerformanceTracking: false,
            enableConsoleOverride: false
        });
        console.log('SentryHelper configured for TEST environment (disabled)');
    } else {
        // Default: Conservative logging
        configureSentry({
            enabled: localStorageConfig.enabled,
            defaultLogLevel: getLogLevelFromString(localStorageConfig.logLevel),
            enableWorkflowTracking: false,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
        console.log('SentryHelper configured for UNKNOWN environment (conservative) with localStorage config:', localStorageConfig);
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

export default {
    initializeSentryForProject,
    configureSentryForEnvironment,
    SENTRY_PRESETS,
    configureComponentByType,
    configureComponentsBatch,
    setLocalStorageConfig,
    clearLocalStorageConfig
}; 