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
        console.log(`${this.logPrefix} Controls ${showControls ? 'SHOWN' : 'HIDDEN'} at:`, new Date().toISOString());
    }

    /**
     * Log when failure mode is toggled
     */
    logFailureToggle(isFailureMode: boolean): void {
        console.log(`${this.logPrefix} Failure mode ${isFailureMode ? 'ENABLED' : 'DISABLED'} at:`, new Date().toISOString());

        if (isFailureMode) {
            console.log(`${this.logPrefix} ⚠️  SSO failures will now be simulated!`);
        } else {
            console.log(`${this.logPrefix} ✅ SSO failures simulation disabled`);
        }
    }

    /**
     * Log when failure count is reset
     */
    logCountReset(): void {
        console.log(`${this.logPrefix} Failure count RESET to 0 at:`, new Date().toISOString());
    }

    /**
     * Log when first click invalid token mode is toggled
     */
    logFirstClickInvalidTokenToggle(isEnabled: boolean): void {
        console.log(`[SSO Simulator] First Click Invalid Token Mode ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log when scenario section is toggled
     */
    logScenarioToggle(isVisible: boolean): void {
        console.log(`[SSO Simulator] Scenario section ${isVisible ? 'shown' : 'hidden'}`);
    }

    /**
     * Log when a scenario is selected
     */
    logScenarioSelection(scenarioId: string): void {
        console.log(`[SSO Simulator] Scenario selected: ${scenarioId}`);
    }

    /**
     * Log when a failure is simulated
     */
    logFailureSimulation(failureNumber: number, errorMessage: string): void {
        console.log(`${this.logPrefix} 💥 Simulating SSO failure #${failureNumber}: ${errorMessage}`);
    }

    /**
     * Log successful SSO request
     */
    logSuccessfulSSO(duration: number): void {
        console.log(`${this.logPrefix} ✅ SSO request SUCCESS - Duration: ${duration.toFixed(2)}ms`);
    }

    /**
     * Log failed SSO request
     */
    logFailedSSO(duration: number, error: Error): void {
        console.log(`${this.logPrefix} 💥 SSO request FAILED - Duration: ${duration.toFixed(2)}ms`);
        console.error(`${this.logPrefix} Error details:`, error);
    }

    /**
     * Log invalid token simulation
     */
    logInvalidTokenSimulation(token: string): void {
        console.log(`${this.logPrefix} 🔑 Simulating invalid token: ${token.substring(0, 50)}...`);
        console.log(`${this.logPrefix} 🔑 Token length: ${token.length} characters`);
        console.log(`${this.logPrefix} 🔑 Token will be passed to Lobby for internal testing`);
    }
} 