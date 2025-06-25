/**
 * Interface Segregation Principle: Separate interfaces for different concerns
 */

/**
 * Core props interface for SSO Control Simulator component
 */
export interface SSOControlSimulatorProps {
    /** Callback function when failure mode is toggled */
    onToggleFailure: () => void;
    /** Callback function when failure count is reset */
    onResetCount: () => void;
    /** Current failure count */
    failureCount?: number;
    /** Whether failure mode is currently active */
    isFailureMode?: boolean;
    /** Optional service instance for logging and side effects */
    service?: ISSOSimulatorService;
}

/**
 * State interface for SSO control state
 */
export interface SSOControlState {
    /** Whether controls are currently visible */
    showControls: boolean;
    /** Current failure count */
    failureCount: number;
    /** Whether failure mode is active */
    isFailureMode: boolean;
}

/**
 * Service interface for SSO simulator operations
 * Dependency Inversion Principle: Component depends on abstraction
 */
export interface ISSOSimulatorService {
    /** Log when controls are toggled */
    logControlToggle(showControls: boolean): void;
    /** Log when failure mode is toggled */
    logFailureToggle(isFailureMode: boolean): void;
    /** Log when failure count is reset */
    logCountReset(): void;
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