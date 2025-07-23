/**
 * SSO Controls Configuration Utility
 * 
 * Determines whether SSO controls should be shown based on environment variables
 * for testing and development purposes.
 */

interface SimulatorConfig {
    simulationMode: {
        enabled: boolean;
    };
    simulatorConfigs: {
        enabled: boolean;
        defaultGameType: string;
    };
}

/**
 * Parse SIMULATOR_CONFIG environment variable
 * @returns parsed simulator configuration or null if invalid
 */
const parseSimulatorConfig = (): SimulatorConfig | null => {
    const configString = process.env.SIMULATOR_CONFIG;

    if (!configString) {
        return null;
    }

    try {
        const parsed = JSON.parse(configString) as SimulatorConfig;
        return parsed;
    } catch (error) {
        return null;
    }
};

/**
 * Check if SSO controls should be displayed
 * @returns boolean indicating whether SSO controls should be shown
 */
export const shouldShowSSOControls = (): boolean => {
    const nodeEnv = process.env.NODE_ENV;

    // In production, never show SSO controls
    if (nodeEnv === 'production') {
        return false;
    }

    // In development, check the SIMULATOR_CONFIG
    if (nodeEnv === 'development') {
        const config = parseSimulatorConfig();

        // If no config or invalid config, default to false
        if (!config) {
            return false;
        }

        // Show controls if both simulation mode and simulator configs are enabled
        const shouldShow = config.simulationMode.enabled && config.simulatorConfigs.enabled;
        return shouldShow;
    }

    // For other environments (test, etc.), default to false
    return false;
};

/**
 * Get SSO controls configuration for debugging
 * @returns object with configuration details
 */
export const getSSOControlsConfig = () => {
    const config = parseSimulatorConfig();

    return {
        showControls: shouldShowSSOControls(),
        simulatorConfig: config,
        environmentVariable: process.env.SIMULATOR_CONFIG,
        nodeEnv: process.env.NODE_ENV,
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTest: process.env.NODE_ENV === 'test'
    };
};

/**
 * Log SSO controls configuration for debugging
 */
export const logSSOControlsConfig = () => {
    const config = getSSOControlsConfig();
};

/**
 * Force enable SSO controls for testing (development only)
 * This is a fallback mechanism in case environment variables don't work
 * Only use this if no SIMULATOR_CONFIG is provided
 */
export const forceEnableSSOControls = (): boolean => {
    if (process.env.NODE_ENV === 'development') {
        // Only force enable if no SIMULATOR_CONFIG is provided
        if (!process.env.SIMULATOR_CONFIG) {
            return true;
        }
        return false;
    }
    return false;
}; 