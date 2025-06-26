import { SSOScenario } from './types';

/**
 * Predefined SSO scenarios for easy demonstration
 * Each scenario represents a common SSO failure situation
 */
export const SSO_SCENARIOS: SSOScenario[] = [
    {
        id: 'normal-flow',
        name: 'Normal Flow',
        description: 'Standard SSO authentication without any failures',
        icon: '🟢',
        settings: {
            isFailureMode: false,
            isFirstClickInvalidTokenMode: false,
            failureCount: 0
        }
    },
    {
        id: 'first-click-invalid',
        name: 'First Click Invalid Token',
        description: 'First play button click returns invalid token, subsequent clicks work normally',
        icon: '🚫',
        settings: {
            isFailureMode: false,
            isFirstClickInvalidTokenMode: true,
            failureCount: 0
        }
    },
    {
        id: 'persistent-failure',
        name: 'Persistent SSO Failure',
        description: 'All SSO requests fail with different error messages',
        icon: '🔴',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: false,
            failureCount: 0
        }
    },
    {
        id: 'network-timeout',
        name: 'Network Timeout',
        description: 'Simulates network timeout on first SSO request',
        icon: '⏰',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: false,
            failureCount: 1
        }
    },
    {
        id: 'auth-failed',
        name: 'Authentication Failed',
        description: 'Simulates authentication failure with invalid credentials',
        icon: '🔐',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: false,
            failureCount: 2
        }
    },
    {
        id: 'server-error',
        name: 'Server Error',
        description: 'Simulates server error after multiple failed attempts',
        icon: '💥',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: false,
            failureCount: 3
        }
    },
    {
        id: 'mixed-scenario',
        name: 'Mixed Scenario',
        description: 'Combines first click invalid token with persistent failures',
        icon: '🎭',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: true,
            failureCount: 1
        }
    }
];

/**
 * Get scenario by ID
 */
export const getScenarioById = (id: string): SSOScenario | undefined => {
    return SSO_SCENARIOS.find(scenario => scenario.id === id);
};

/**
 * Get current scenario based on current state
 */
export const getCurrentScenario = (
    isFailureMode: boolean,
    isFirstClickInvalidTokenMode: boolean,
    failureCount: number
): SSOScenario => {
    return SSO_SCENARIOS.find(scenario =>
        scenario.settings.isFailureMode === isFailureMode &&
        scenario.settings.isFirstClickInvalidTokenMode === isFirstClickInvalidTokenMode &&
        scenario.settings.failureCount === failureCount
    ) || SSO_SCENARIOS[0]; // Default to normal flow
}; 