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

    function refreshComponentConfig(componentName) {
        // This function would need to be implemented in the actual Sentry helper
        // For now, we'll just log that it should be called
        console.log(`🔄 Refreshing configuration for component: ${componentName}`);
        console.log('Note: This requires the Sentry helper to be loaded. Call initializeSentryForProject() to apply changes.');
    }

    function refreshAllComponentConfigs() {
        // This function would need to be implemented in the actual Sentry helper
        // For now, we'll just log that it should be called
        console.log('🔄 Refreshing all component configurations');
        console.log('Note: This requires the Sentry helper to be loaded. Call initializeSentryForProject() to apply changes.');
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

    function testSentryLogging() {
        console.log('🧪 Testing Sentry logging...');

        // Test error logging
        try {
            throw new Error('Test error from console helper');
        } catch (error) {
            console.error('Test error caught:', error);

            // Try to log to Sentry if available
            if (window.Sentry) {
                window.Sentry.captureException(error);
                console.log('✅ Sentry error logged via window.Sentry');
            } else {
                console.log('❌ window.Sentry not available');
            }

            // Try to log via SentryManager if available
            if (window.SentryManager) {
                window.SentryManager.logError(error);
                console.log('✅ Sentry error logged via SentryManager');
            } else {
                console.log('❌ SentryManager not available');
            }
        }

        // Test info logging
        console.log('📝 Testing info logging...');
        if (window.Sentry) {
            window.Sentry.captureMessage('Test info message from console helper', 'info');
            console.log('✅ Sentry info logged');
        }

        console.log('🧪 Sentry test completed. Check your Sentry dashboard for events.');
    }

    function debugSentryStatus() {
        console.log('🔍 Debugging Sentry status...');

        // Check if Sentry is available
        if (window.Sentry) {
            console.log('✅ window.Sentry is available');
            console.log('Sentry version:', window.Sentry.VERSION || 'unknown');

            // Check if Sentry is initialized
            try {
                const client = window.Sentry.getCurrentHub().getClient();
                if (client) {
                    console.log('✅ Sentry client is initialized');
                    console.log('Sentry DSN:', client.getDsn()?.host || 'unknown');
                    console.log('Sentry environment:', client.getOptions().environment || 'unknown');
                } else {
                    console.log('❌ Sentry client is not initialized');
                }
            } catch (error) {
                console.log('❌ Error checking Sentry client:', error);
            }
        } else {
            console.log('❌ window.Sentry is not available');
        }

        // Check localStorage configuration
        const localStorageConfig = {
            logLevel: localStorage.getItem('sentry_log_level'),
            enabled: localStorage.getItem('hot-league-wall-debug-enabled'),
            debugMode: localStorage.getItem('sentry_debug_mode'),
        };
        console.log('localStorage config:', localStorageConfig);

        // Test sending a simple message
        console.log('🧪 Testing simple Sentry message...');
        if (window.Sentry) {
            try {
                window.Sentry.captureMessage('Debug test message from console helper', 'info');
                console.log('✅ Test message sent to Sentry');
            } catch (error) {
                console.log('❌ Failed to send test message:', error);
            }
        }

        // Check for any Sentry-related errors in console
        console.log('📋 Check the console above for any Sentry-related error messages');
    }

    function testBetPanelWorkflow() {
        console.log('🧪 Testing BetPanel workflow tracking...');

        // Test workflow tracking if available
        if (window.SentryConsole) {
            console.log('✅ SentryConsole available, testing workflow...');

            // Enable global Sentry first
            setLocalStorageConfig({
                enabled: true,
                logLevel: 'info',
            });

            // Enable BetPanel component specifically
            setComponentLocalStorageConfig('BetPanel', {
                enabled: true,
                logLevel: 'info',
            });

            // Check current configuration
            const configs = getAllComponentConfigs();
            console.log('Current BetPanel config:', configs.BetPanel);

            // Check localStorage directly
            const betPanelLocalStorage = {
                logLevel: localStorage.getItem('sentry_log_level_BetPanel'),
                enabled: localStorage.getItem('hot-league-wall-debug-enabled_BetPanel'),
            };
            console.log('BetPanel localStorage:', betPanelLocalStorage);

            // Test workflow tracking
            if (window.startWorkflow && window.completeWorkflow) {
                console.log('Testing workflow tracking...');
                const workflowId = window.startWorkflow('BetPanel', 'Test Bet Placement', { test: true });
                console.log('Workflow started with ID:', workflowId);

                setTimeout(() => {
                    console.log('Completing workflow...');
                    window.completeWorkflow(workflowId, true, { result: 'success' });
                    console.log('Workflow completed');
                }, 1000);
            } else {
                console.log('❌ Workflow functions not available');
            }
        } else {
            console.log('❌ SentryConsole not available');
        }

        // Test direct Sentry logging
        if (window.Sentry) {
            console.log('✅ Direct Sentry test...');
            try {
                window.Sentry.captureMessage('Test BetPanel message from console helper', 'info');
                console.log('✅ Direct Sentry message sent');
            } catch (error) {
                console.log('❌ Failed to send direct Sentry message:', error);
            }
        } else {
            console.log('❌ Direct Sentry not available');
        }

        // Test SentryManager directly
        if (window.SentryManager) {
            console.log('✅ Testing SentryManager directly...');
            try {
                window.SentryManager.startWorkflow('direct-test', 'Direct Test', { direct: true });
                console.log('✅ Direct SentryManager workflow started');
            } catch (error) {
                console.log('❌ Failed to start direct SentryManager workflow:', error);
            }
        } else {
            console.log('❌ SentryManager not available');
        }
    }

    function checkLoggingStatus() {
        console.log('🔍 Checking logging status...');

        // Check localStorage configuration
        const localStorageConfig = {
            logLevel: localStorage.getItem('sentry_log_level'),
            enabled: localStorage.getItem('hot-league-wall-debug-enabled'),
            debugMode: localStorage.getItem('sentry_debug_mode'),
        };
        console.log('localStorage config:', localStorageConfig);

        // Check if Sentry is available
        if (window.Sentry) {
            console.log('✅ window.Sentry is available');

            // Test sending a simple message without triggering the override
            try {
                // Use the original console.log to avoid recursion
                const originalConsoleLog = console.log;
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                console.log = function () {};

                window.Sentry.captureMessage('Logging status test message', 'info');

                // Restore console.log
                console.log = originalConsoleLog;
                console.log('✅ Test message sent to Sentry successfully');
            } catch (error) {
                console.log('❌ Failed to send test message:', error);
            }
        } else {
            console.log('❌ window.Sentry is not available');
        }

        // Check component configurations
        if (window.SentryConsole) {
            console.log('✅ SentryConsole is available');
            const configs = getAllComponentConfigs();
            console.log('Component configurations:', configs);
        } else {
            console.log('❌ SentryConsole is not available');
        }
    }

    function testSentryManagerDirectly() {
        console.log('🧪 Testing SentryManager directly...');

        // Check if SentryManager is available
        if (window.SentryManager) {
            console.log('✅ window.SentryManager is available');

            try {
                // Test direct SentryManager workflow
                console.log('Testing SentryManager workflow methods...');
                window.SentryManager.startWorkflow('test-workflow-1', 'Test Workflow', { test: true });
                window.SentryManager.updateWorkflow('test-workflow-1', 'processing', { step: 1 });
                window.SentryManager.completeWorkflow('test-workflow-1', true, { result: 'success' });
                console.log('✅ SentryManager workflow methods called successfully');
            } catch (error) {
                console.log('❌ Error calling SentryManager workflow methods:', error);
            }
        } else {
            console.log('❌ window.SentryManager is not available');
        }

        // Check if Sentry is available
        if (window.Sentry) {
            console.log('✅ window.Sentry is available');

            try {
                // Test direct Sentry message
                console.log('Testing direct Sentry.captureMessage...');
                window.Sentry.captureMessage('Direct test message from console helper', 'info');
                console.log('✅ Direct Sentry.captureMessage called successfully');
            } catch (error) {
                console.log('❌ Error calling Sentry.captureMessage:', error);
            }
        } else {
            console.log('❌ window.Sentry is not available');
        }

        // Check component configurations
        if (window.SentryConsole) {
            console.log('✅ SentryConsole is available');
            const configs = getAllComponentConfigs();
            console.log('Component configurations:', configs);

            // Check BetPanel specifically
            if (configs.BetPanel) {
                console.log('BetPanel config:', configs.BetPanel);
                console.log('BetPanel enabled:', configs.BetPanel.enabled);
                console.log('BetPanel logLevel:', configs.BetPanel.logLevel);
            }
        } else {
            console.log('❌ SentryConsole is not available');
        }
    }

    function checkSentryManagerComponent() {
        console.log('🔍 Checking SentryManager component...');

        if (window.SentryManager) {
            console.log('✅ window.SentryManager is available');
            console.log('Current component name:', window.SentryManager.getComponentName());
            console.log('Is initialized:', window.SentryManager.isManagerInitialized());
        } else {
            console.log('❌ window.SentryManager is not available');
        }

        // Check if Sentry is available
        if (window.Sentry) {
            console.log('✅ window.Sentry is available');

            try {
                // Get current Sentry context
                const hub = window.Sentry.getCurrentHub();
                const scope = hub.getScope();
                const context = scope.getContext('component');
                const tags = scope.getTags();

                console.log('Sentry component context:', context);
                console.log('Sentry component tag:', tags.component);
            } catch (error) {
                console.log('❌ Error getting Sentry context:', error);
            }
        } else {
            console.log('❌ window.Sentry is not available');
        }
    }

    function checkBetPanelConfig() {
        console.log('🔍 Checking BetPanel configuration...');

        // Check localStorage configuration
        const localStorageConfig = {
            logLevel: localStorage.getItem('sentry_log_level'),
            enabled: localStorage.getItem('hot-league-wall-debug-enabled'),
            debugMode: localStorage.getItem('sentry_debug_mode'),
        };
        console.log('Global localStorage config:', localStorageConfig);

        // Check BetPanel specific configuration
        const betPanelConfig = {
            logLevel: localStorage.getItem('sentry_log_level_BetPanel'),
            enabled: localStorage.getItem('hot-league-wall-debug-enabled_BetPanel'),
        };
        console.log('BetPanel localStorage config:', betPanelConfig);

        // Check component configurations
        if (window.SentryConsole) {
            const configs = getAllComponentConfigs();
            console.log('All component configs:', configs);

            if (configs.BetPanel) {
                console.log('BetPanel config from SentryConsole:', configs.BetPanel);
            } else {
                console.log('❌ BetPanel config not found in SentryConsole');
            }
        } else {
            console.log('❌ SentryConsole not available');
        }

        // Test setting BetPanel configuration
        console.log('Setting BetPanel configuration...');
        setComponentLocalStorageConfig('BetPanel', {
            enabled: true,
            logLevel: 'info',
        });

        // Check again after setting
        const newBetPanelConfig = {
            logLevel: localStorage.getItem('sentry_log_level_BetPanel'),
            enabled: localStorage.getItem('hot-league-wall-debug-enabled_BetPanel'),
        };
        console.log('BetPanel localStorage config after setting:', newBetPanelConfig);
    }

    function testBetPanelWorkflowSafe() {
        // Use original console methods to avoid infinite recursion
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;

        try {
            originalConsoleLog('🧪 Testing BetPanel workflow tracking (safe mode)...');

            // Enable global Sentry first
            setLocalStorageConfig({
                enabled: true,
                logLevel: 'info',
            });

            // Enable BetPanel component specifically
            setComponentLocalStorageConfig('BetPanel', {
                enabled: true,
                logLevel: 'info',
            });

            // Check localStorage directly
            const betPanelLocalStorage = {
                logLevel: localStorage.getItem('sentry_log_level_BetPanel'),
                enabled: localStorage.getItem('hot-league-wall-debug-enabled_BetPanel'),
            };
            originalConsoleLog('BetPanel localStorage:', betPanelLocalStorage);

            // Check global localStorage
            const globalLocalStorage = {
                logLevel: localStorage.getItem('sentry_log_level'),
                enabled: localStorage.getItem('hot-league-wall-debug-enabled'),
            };
            originalConsoleLog('Global localStorage:', globalLocalStorage);

            // Test direct Sentry logging
            if (window.Sentry) {
                originalConsoleLog('✅ Testing direct Sentry.captureMessage...');
                try {
                    window.Sentry.captureMessage('Test BetPanel message from safe test', 'info');
                    originalConsoleLog('✅ Direct Sentry.captureMessage successful');
                } catch (error) {
                    originalConsoleError('❌ Failed to send direct Sentry message:', error);
                }
            } else {
                originalConsoleLog('❌ Direct Sentry not available');
            }

            // Test workflow tracking
            if (window.startWorkflow && window.completeWorkflow) {
                originalConsoleLog('Testing workflow tracking...');
                const workflowId = window.startWorkflow('BetPanel', 'Test Bet Placement', { test: true });
                originalConsoleLog('Workflow started with ID:', workflowId);

                setTimeout(() => {
                    originalConsoleLog('Completing workflow...');
                    window.completeWorkflow(workflowId, true, { result: 'success' });
                    originalConsoleLog('Workflow completed');
                }, 1000);
            } else {
                originalConsoleLog('❌ Workflow functions not available');
            }
        } catch (error) {
            originalConsoleError('❌ Error in safe test:', error);
        } finally {
            // Restore console methods
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
        }
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
        refreshComponentConfig,
        refreshAllComponentConfigs,
        testSentryLogging,
        debugSentryStatus,
        testBetPanelWorkflow,
        checkLoggingStatus,
        testSentryManagerDirectly,
        checkSentryManagerComponent,
        checkBetPanelConfig,
        testBetPanelWorkflowSafe,
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
    window.refreshComponentConfig = refreshComponentConfig;
    window.refreshAllComponentConfigs = refreshAllComponentConfigs;
    window.testSentryLogging = testSentryLogging;
    window.debugSentryStatus = debugSentryStatus;
    window.testBetPanelWorkflow = testBetPanelWorkflow;
    window.checkLoggingStatus = checkLoggingStatus;
    window.testSentryManagerDirectly = testSentryManagerDirectly;
    window.checkSentryManagerComponent = checkSentryManagerComponent;
    window.checkBetPanelConfig = checkBetPanelConfig;
    window.testBetPanelWorkflowSafe = testBetPanelWorkflowSafe;

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
    console.log('- refreshComponentConfig(componentName)');
    console.log('- refreshAllComponentConfigs()');
    console.log('- testSentryLogging()');
    console.log('- debugSentryStatus()');
    console.log('- testBetPanelWorkflow()');
    console.log('- checkLoggingStatus()');
    console.log('- testSentryManagerDirectly()');
    console.log('- checkSentryManagerComponent()');
    console.log('- checkBetPanelConfig()');
    console.log('- testBetPanelWorkflowSafe()');
    console.log('');
    console.log('Quick Examples:');
    console.log('- setComponentLocalStorageConfig("BetPanel", { logLevel: "debug" })');
    console.log('- setLocalStorageConfig({ logLevel: "info", enabled: true })');
    console.log('- setAllComponentsToLevel("warn")');
    console.log('- showConfiguration()');
    console.log('- testSentryLogging()');
    console.log('- debugSentryStatus()');
    console.log('- testBetPanelWorkflow()');
    console.log('- checkLoggingStatus()');
    console.log('- testSentryManagerDirectly()');
    console.log('- checkSentryManagerComponent()');
    console.log('- checkBetPanelConfig()');
    console.log('- testBetPanelWorkflowSafe()');
    console.log('');
    console.log('Or use SentryConsole object for all functions');
})();
