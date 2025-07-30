import { ISSOSimulatorService } from './types';

/**
 * SSO Control Simulator Service
 * 
 * Single Responsibility: Handles logging and side effects for SSO simulator
 * Open/Closed: Extensible through inheritance or composition
 * Dependency Inversion: Implements ISSOSimulatorService interface
 */
export class SSOControlSimulatorService implements ISSOSimulatorService {
    private readonly logPrefix = '[SSO_SIMULATOR]';

    /**
     * Log when controls are toggled
     */
    logControlToggle(showControls: boolean): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log when failure mode is toggled
     */
    logFailureToggle(isFailureMode: boolean): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log when first click invalid token mode is toggled
     */
    logFirstClickInvalidTokenToggle(isEnabled: boolean): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log when scenario section is toggled
     */
    logScenarioToggle(isVisible: boolean): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log when a scenario is selected
     */
    logScenarioSelection(scenarioId: string): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log when a failure is simulated
     */
    logFailureSimulation(failureNumber: number, errorMessage: string): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log successful SSO request
     */
    logSuccessfulSSO(duration: number): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log failed SSO request
     */
    logFailedSSO(duration: number, error: Error): void {
        // Logging handled by Sentry manager
    }

    /**
     * Log invalid token simulation
     */
    logInvalidTokenSimulation(token: string): void {
        // Logging handled by Sentry manager
    }
} 