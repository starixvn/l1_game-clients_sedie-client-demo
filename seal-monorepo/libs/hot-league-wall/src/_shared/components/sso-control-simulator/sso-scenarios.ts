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
            isFirstClickInvalidTokenMode: false
        }
    },
    {
        id: 'persistent-failure',
        name: 'Invalid Token',
        description: 'First click will return invalid token, then use real tokens!',
        icon: '🔴',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: false
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
    isFirstClickInvalidTokenMode: boolean
): SSOScenario => {
    return SSO_SCENARIOS.find(scenario =>
        scenario.settings.isFailureMode === isFailureMode &&
        scenario.settings.isFirstClickInvalidTokenMode === isFirstClickInvalidTokenMode
    ) || SSO_SCENARIOS[0]; // Default to normal flow
}; 