import { configureSentry, configureComponent, SentryLogLevel } from './sentry-helper';

/**
 * Comprehensive SentryHelper configuration for the HotLeagueWall project
 * This file sets up different log levels and tracking options for all components
 */

export const initializeSentryForProject = () => {
    // Initialize global Sentry configuration
    configureSentry({
        enabled: true,
        defaultLogLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        enableConsoleOverride: true
    });

    // Configure main application components
    configureComponent('HotLeagueWall', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('App', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('AppContent', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure lobby and navigation components
    configureComponent('Lobby', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('LobbyComponent', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure game components
    configureComponent('RNGSoccerStaticPrototype', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('RNGSoccerBase', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    configureComponent('RNGSoccerPage', {
        logLevel: SentryLogLevel.WARN,
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
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('Preview', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure connection and gateway components
    configureComponent('GatewayConnectionManager', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('ConnectionManager', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Configure authentication components
    configureComponent('TokenRequestManager', {
        logLevel: SentryLogLevel.INFO,
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

    console.log('SentryHelper configured for HotLeagueWall project');
};

/**
 * Environment-specific Sentry configuration
 */
export const configureSentryForEnvironment = (environment: string) => {
    const isDevelopment = environment === 'development';
    const isProduction = environment === 'production';
    const isTest = environment === 'test';

    if (isDevelopment) {
        // Development: Info logging for normal operations, error logging for exceptions
        configureSentry({
            enabled: true,
            defaultLogLevel: SentryLogLevel.INFO,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
        console.log('SentryHelper configured for DEVELOPMENT environment');
    } else if (isProduction) {
        // Production: Info logging for normal operations, error logging for exceptions
        configureSentry({
            enabled: true,
            defaultLogLevel: SentryLogLevel.INFO,
            enableWorkflowTracking: false,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
        console.log('SentryHelper configured for PRODUCTION environment');
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
            enabled: true,
            defaultLogLevel: SentryLogLevel.INFO,
            enableWorkflowTracking: false,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });
        console.log('SentryHelper configured for UNKNOWN environment (conservative)');
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
    configureComponentsBatch
}; 