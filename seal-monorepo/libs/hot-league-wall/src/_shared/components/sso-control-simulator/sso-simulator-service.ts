import { ISSOSimulatorService } from './types';

/**
 * SSO Simulator Service Implementation
 *
 * Single Responsibility: Handles logging and side effects for SSO simulator
 * Dependency Inversion: Implements ISSOSimulatorService interface
 * Open/Closed: Extensible through interface implementation
 */
export class SSOSimulatorService implements ISSOSimulatorService {
    /**
     * Log when controls are toggled
     */
    logControlToggle(showControls: boolean): void {
        console.log(`🔧 [SSO_SIMULATOR] Controls ${showControls ? 'shown' : 'hidden'}`);
    }

    /**
     * Log when failure mode is toggled
     */
    logFailureToggle(isFailureMode: boolean): void {
        console.log(`🔧 [SSO_SIMULATOR] Failure mode ${isFailureMode ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log when failure count is reset
     */
    logCountReset(): void {
        console.log('🔧 [SSO_SIMULATOR] Failure count reset to 0');
    }

    /**
     * Log when invalid token mode is toggled
     */
    logInvalidTokenToggle(isInvalidTokenMode: boolean): void {
        console.log(`🔧 [SSO_SIMULATOR] Invalid token mode ${isInvalidTokenMode ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log when first click invalid token mode is toggled
     */
    logFirstClickInvalidTokenToggle(isFirstClickInvalidTokenMode: boolean): void {
        console.log(`🔧 [SSO_SIMULATOR] First click invalid token mode ${isFirstClickInvalidTokenMode ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log when scenario is toggled
     */
    logScenarioToggle(isVisible: boolean): void {
        console.log(`🔧 [SSO_SIMULATOR] Scenario ${isVisible ? 'shown' : 'hidden'}`);
    }

    /**
     * Log when scenario is selected
     */
    logScenarioSelection(scenarioId: string): void {
        console.log(`🔧 [SSO_SIMULATOR] Scenario selected: ${scenarioId}`);
    }
}
