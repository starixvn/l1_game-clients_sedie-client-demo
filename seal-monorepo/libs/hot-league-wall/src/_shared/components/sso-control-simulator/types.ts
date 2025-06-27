/**
 * Interface Segregation Principle: Separate interfaces for different concerns
 */

/**
 * Predefined SSO scenarios for easy demonstration
 */
export interface SSOScenario {
    id: string;
    name: string;
    description: string;
    icon: string;
    settings: {
        isFailureMode: boolean;
        isFirstClickInvalidTokenMode: boolean;
    };
}

/**
 * Core props interface for SSO Control Simulator component
 */
export interface SSOControlSimulatorProps {
    /** Callback function when failure mode is toggled */
    onToggleFailure: () => void;
    /** Callback function when first click invalid token mode is toggled */
    onToggleFirstClickInvalidToken?: () => void;
    /** Callback function when a scenario is selected */
    onSelectScenario?: (scenario: SSOScenario) => void;
    /** Whether failure mode is currently active */
    isFailureMode?: boolean;
    /** Whether first click invalid token mode is currently active */
    isFirstClickInvalidTokenMode?: boolean;
    /** Optional service instance for logging and side effects */
    service?: ISSOSimulatorService;
}

/**
 * State interface for SSO control state
 */
export interface SSOControlState {
    /** Whether controls are currently visible */
    showControls: boolean;
    /** Whether failure mode is active */
    isFailureMode: boolean;
    /** Whether first click invalid token mode is active */
    isFirstClickInvalidTokenMode: boolean;
    /** Generated failed token for simulation */
    failedToken?: string | null;
    /** Generated first click invalid token for simulation */
    firstClickInvalidToken?: string | null;
}

/**
 * Service interface for SSO simulator operations
 * Dependency Inversion Principle: Component depends on abstraction
 */
export interface ISSOSimulatorService {
    /** Log when controls are toggled */
    logControlToggle(isVisible: boolean): void;
    /** Log when failure mode is toggled */
    logFailureToggle(isEnabled: boolean): void;
    /** Log when first click invalid token mode is toggled */
    logFirstClickInvalidTokenToggle(isEnabled: boolean): void;
    /** Log when scenario is toggled */
    logScenarioToggle(isVisible: boolean): void;
    /** Log when scenario is selected */
    logScenarioSelection(scenarioId: string): void;
}

/**
 * Style interface for component styling
 */
export interface ISSOSimulatorStyles {
    /** Container styles */
    container: React.CSSProperties;
    /** Header styles */
    header: React.CSSProperties;
    /** Content styles */
    content: React.CSSProperties;
    /** Status grid styles */
    statusGrid: React.CSSProperties;
    /** Status card styles */
    statusCard: React.CSSProperties;
    /** Button container styles */
    buttonContainer: React.CSSProperties;
    /** Instructions styles */
    instructions: React.CSSProperties;
    /** CSS animations string */
    animations: string;
} 