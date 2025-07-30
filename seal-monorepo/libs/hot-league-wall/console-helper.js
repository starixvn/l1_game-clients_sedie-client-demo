// Sentry Component Logging Console Helper
// Copy and paste this entire script into your browser console

(function () {
    'use strict';

    // LocalStorage keys
    const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
    const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
    const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode';
    const COMPONENT_LOG_LEVEL_PREFIX = 'sentry_component_log_level_';
    const COMPONENT_ENABLED_PREFIX = 'sentry_component_enabled_';

    // Helper functions
    function getLocalStorageConfig() {
        try {
            const logLevel = localStorage.getItem(SENTRY_LOG_LEVEL_KEY) || 'info';
            const enabled = localStorage.getItem(SENTRY_ENABLED_KEY) !== 'false';
            const debugMode = localStorage.getItem(SENTRY_DEBUG_MODE_KEY) === 'true';
            return { logLevel, enabled, debugMode };
        } catch (error) {
            console.warn('Failed to read localStorage config:', error);
            return { logLevel: 'info', enabled: true, debugMode: false };
        }
    }

    function getComponentLocalStorageConfig(componentName) {
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
    }

    // Main functions
    function setComponentLocalStorageConfig(componentName, config) {
        try {
            if (config.logLevel !== undefined) {
                const logLevelKey = `${COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
                localStorage.setItem(logLevelKey, config.logLevel);
                console.log(`✅ Set ${componentName} log level to: ${config.logLevel}`);
            }
            if (config.enabled !== undefined) {
                const enabledKey = `${COMPONENT_ENABLED_PREFIX}${componentName}`;
                localStorage.setItem(enabledKey, config.enabled.toString());
                console.log(`✅ Set ${componentName} enabled to: ${config.enabled}`);
            }
        } catch (error) {
            console.error(`❌ Failed to set localStorage config for component ${componentName}:`, error);
        }
    }

    function setLocalStorageConfig(config) {
        try {
            if (config.logLevel !== undefined) {
                localStorage.setItem(SENTRY_LOG_LEVEL_KEY, config.logLevel);
                console.log(`✅ Set global log level to: ${config.logLevel}`);
            }
            if (config.enabled !== undefined) {
                localStorage.setItem(SENTRY_ENABLED_KEY, config.enabled.toString());
                console.log(`✅ Set global enabled to: ${config.enabled}`);
            }
            if (config.debugMode !== undefined) {
                localStorage.setItem(SENTRY_DEBUG_MODE_KEY, config.debugMode.toString());
                console.log(`✅ Set global debug mode to: ${config.debugMode}`);
            }
        } catch (error) {
            console.error('❌ Failed to set global localStorage config:', error);
        }
    }

    function clearComponentLocalStorageConfig(componentName) {
        try {
            const logLevelKey = `${COMPONENT_LOG_LEVEL_PREFIX}${componentName}`;
            const enabledKey = `${COMPONENT_ENABLED_PREFIX}${componentName}`;

            localStorage.removeItem(logLevelKey);
            localStorage.removeItem(enabledKey);
            console.log(`✅ Cleared configuration for component: ${componentName}`);
        } catch (error) {
            console.error(`❌ Failed to clear localStorage config for component ${componentName}:`, error);
        }
    }

    function clearLocalStorageConfig() {
        try {
            localStorage.removeItem(SENTRY_LOG_LEVEL_KEY);
            localStorage.removeItem(SENTRY_ENABLED_KEY);
            localStorage.removeItem(SENTRY_DEBUG_MODE_KEY);

            // Clear all component-specific keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith(COMPONENT_LOG_LEVEL_PREFIX) || key.startsWith(COMPONENT_ENABLED_PREFIX))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key));
            console.log('✅ Cleared all Sentry configurations');
        } catch (error) {
            console.error('❌ Failed to clear localStorage config:', error);
        }
    }

    function getAllComponentConfigs() {
        const configs = {};
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
            console.error('❌ Failed to read component configs from localStorage:', error);
        }
        return configs;
    }

    function getCurrentConfiguration() {
        const localStorageConfig = getLocalStorageConfig();
        const componentConfigs = getAllComponentConfigs();

        return {
            global: localStorageConfig,
            components: componentConfigs,
            localStorageKeys: {
                global: {
                    logLevel: SENTRY_LOG_LEVEL_KEY,
                    enabled: SENTRY_ENABLED_KEY,
                    debugMode: SENTRY_DEBUG_MODE_KEY,
                },
                component: {
                    logLevelPrefix: COMPONENT_LOG_LEVEL_PREFIX,
                    enabledPrefix: COMPONENT_ENABLED_PREFIX,
                },
            },
        };
    }

    function showConfiguration() {
        const config = getCurrentConfiguration();
        console.group('🔧 Current Sentry Configuration');
        console.log('Global Configuration:', config.global);
        console.log('Component Configurations:', config.components);
        console.log('LocalStorage Keys:', config.localStorageKeys);
        console.groupEnd();
        return config;
    }

    function setAllComponentsToLevel(level) {
        const components = [
            'HotLeagueWall',
            'App',
            'AppContent',
            'Lobby',
            'LobbyComponent',
            'RNGSoccerStaticPrototype',
            'RNGSoccerBase',
            'RNGSoccerPage',
            'Loading',
            'GameDisconnectView',
            'BetOption',
            'BetPanel',
            'BettingChips',
            'Scoreboard',
            'RoundHistory',
            'CountDownTimer',
            'AnimBalance',
            'WinnerDisplay',
            'SSOControlSimulator',
            'Preview',
            'GatewayConnectionManager',
            'ConnectionManager',
            'TokenRequestManager',
            'SyncMemberSiteBalance',
            'LobbyStore',
            'GameStore',
            'StringHelper',
            'ComponentUtil',
            'I18n',
        ];

        components.forEach((component) => {
            setComponentLocalStorageConfig(component, { logLevel: level });
        });
        console.log(`✅ Set all components to ${level} level`);
    }

    function enableAllComponents() {
        const components = [
            'HotLeagueWall',
            'App',
            'AppContent',
            'Lobby',
            'LobbyComponent',
            'RNGSoccerStaticPrototype',
            'RNGSoccerBase',
            'RNGSoccerPage',
            'Loading',
            'GameDisconnectView',
            'BetOption',
            'BetPanel',
            'BettingChips',
            'Scoreboard',
            'RoundHistory',
            'CountDownTimer',
            'AnimBalance',
            'WinnerDisplay',
            'SSOControlSimulator',
            'Preview',
            'GatewayConnectionManager',
            'ConnectionManager',
            'TokenRequestManager',
            'SyncMemberSiteBalance',
            'LobbyStore',
            'GameStore',
            'StringHelper',
            'ComponentUtil',
            'I18n',
        ];

        components.forEach((component) => {
            setComponentLocalStorageConfig(component, { enabled: true });
        });
        console.log('✅ Enabled all components');
    }

    function disableAllComponents() {
        const components = [
            'HotLeagueWall',
            'App',
            'AppContent',
            'Lobby',
            'LobbyComponent',
            'RNGSoccerStaticPrototype',
            'RNGSoccerBase',
            'RNGSoccerPage',
            'Loading',
            'GameDisconnectView',
            'BetOption',
            'BetPanel',
            'BettingChips',
            'Scoreboard',
            'RoundHistory',
            'CountDownTimer',
            'AnimBalance',
            'WinnerDisplay',
            'SSOControlSimulator',
            'Preview',
            'GatewayConnectionManager',
            'ConnectionManager',
            'TokenRequestManager',
            'SyncMemberSiteBalance',
            'LobbyStore',
            'GameStore',
            'StringHelper',
            'ComponentUtil',
            'I18n',
        ];

        components.forEach((component) => {
            setComponentLocalStorageConfig(component, { enabled: false });
        });
        console.log('✅ Disabled all components');
    }

    // Expose functions globally
    window.SentryConsole = {
        setComponentLocalStorageConfig,
        setLocalStorageConfig,
        clearComponentLocalStorageConfig,
        clearLocalStorageConfig,
        getAllComponentConfigs,
        getCurrentConfiguration,
        showConfiguration,
        setAllComponentsToLevel,
        enableAllComponents,
        disableAllComponents,
    };

    // Also expose individual functions for easier access
    window.setComponentLocalStorageConfig = setComponentLocalStorageConfig;
    window.setLocalStorageConfig = setLocalStorageConfig;
    window.clearComponentLocalStorageConfig = clearComponentLocalStorageConfig;
    window.clearLocalStorageConfig = clearLocalStorageConfig;
    window.getAllComponentConfigs = getAllComponentConfigs;
    window.getCurrentConfiguration = getCurrentConfiguration;
    window.showConfiguration = showConfiguration;
    window.setAllComponentsToLevel = setAllComponentsToLevel;
    window.enableAllComponents = enableAllComponents;
    window.disableAllComponents = disableAllComponents;

    // Show available functions
    console.log('🔧 Sentry Component Logging Console Helper Loaded!');
    console.log('');
    console.log('Available Functions:');
    console.log('- setComponentLocalStorageConfig(componentName, config)');
    console.log('- setLocalStorageConfig(config)');
    console.log('- clearComponentLocalStorageConfig(componentName)');
    console.log('- clearLocalStorageConfig()');
    console.log('- getAllComponentConfigs()');
    console.log('- getCurrentConfiguration()');
    console.log('- showConfiguration()');
    console.log('- setAllComponentsToLevel(level)');
    console.log('- enableAllComponents()');
    console.log('- disableAllComponents()');
    console.log('');
    console.log('Quick Examples:');
    console.log('- setComponentLocalStorageConfig("BetPanel", { logLevel: "debug" })');
    console.log('- setLocalStorageConfig({ logLevel: "info", enabled: true })');
    console.log('- setAllComponentsToLevel("warn")');
    console.log('- showConfiguration()');
    console.log('');
    console.log('Or use SentryConsole object for all functions');
})();
