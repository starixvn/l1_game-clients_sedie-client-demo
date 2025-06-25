import React, { useState } from 'react';
import { SSOControlSimulatorProps, SSOControlState } from './types';
import { SSOControlSimulatorStyles } from './sso-control-simulator.styles';
import { SSOControlSimulatorService } from './sso-control-simulator.service';

/**
 * SSO Control Simulator Component
 * 
 * Single Responsibility: Manages SSO failure simulation UI and state
 * Open/Closed: Extensible through props and service injection
 * Liskov Substitution: Implements SSOControlSimulatorProps interface
 * Interface Segregation: Uses specific interfaces for different concerns
 * Dependency Inversion: Depends on abstractions (service) not concrete implementations
 */
export const SSOControlSimulator: React.FC<SSOControlSimulatorProps> = ({
    onToggleFailure,
    onResetCount,
    failureCount = 0,
    isFailureMode = false,
    service = new SSOControlSimulatorService()
}) => {
    const [showControls, setShowControls] = useState(false);
    const styles = new SSOControlSimulatorStyles();

    const handleToggleControls = () => {
        setShowControls(!showControls);
        service.logControlToggle(!showControls);
    };

    const handleToggleFailure = () => {
        onToggleFailure();
        service.logFailureToggle(!isFailureMode);
    };

    const handleResetCount = () => {
        onResetCount();
        service.logCountReset();
    };

    return (
        <div style={styles.container}>
            {/* CSS Animations */}
            <style>{styles.animations}</style>

            {/* Header with Toggle */}
            <div style={styles.header}>
                <div style={styles.titleContainer}>
                    <span style={styles.statusIcon(isFailureMode)}>
                        {isFailureMode ? '⚠️' : '🔒'}
                    </span>
                    SSO Controls
                </div>
                <button
                    onClick={handleToggleControls}
                    style={styles.toggleButton}
                    onMouseEnter={(e) => styles.handleButtonHover(e.currentTarget, true)}
                    onMouseLeave={(e) => styles.handleButtonHover(e.currentTarget, false)}
                >
                    {showControls ? 'Hide' : 'Show'}
                    <span style={styles.toggleIcon}>
                        {showControls ? '▲' : '▼'}
                    </span>
                </button>
            </div>

            {/* Expandable Content */}
            {showControls && (
                <div style={styles.content}>
                    {/* Status Indicators */}
                    <div style={styles.statusGrid}>
                        <div style={styles.statusCard}>
                            <div style={styles.statusLabel}>Status</div>
                            <div style={styles.statusValue(isFailureMode)}>
                                {isFailureMode ? '🔴 FAILURE MODE' : '🟢 NORMAL'}
                            </div>
                        </div>
                        <div style={styles.statusCard}>
                            <div style={styles.statusLabel}>Failures</div>
                            <div style={styles.failureCount(failureCount)}>
                                {failureCount}
                            </div>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div style={styles.buttonContainer}>
                        <button
                            onClick={handleToggleFailure}
                            style={styles.primaryButton(isFailureMode)}
                            onMouseEnter={(e) => styles.handlePrimaryButtonHover(e.currentTarget, isFailureMode, true)}
                            onMouseLeave={(e) => styles.handlePrimaryButtonHover(e.currentTarget, isFailureMode, false)}
                        >
                            <span style={styles.buttonIcon}>
                                {isFailureMode ? '🚫' : '✅'}
                            </span>
                            {isFailureMode ? 'Disable' : 'Enable'} SSO Failures
                        </button>

                        <button
                            onClick={handleResetCount}
                            style={styles.secondaryButton(failureCount)}
                            onMouseEnter={(e) => styles.handleSecondaryButtonHover(e.currentTarget, failureCount, true)}
                            onMouseLeave={(e) => styles.handleSecondaryButtonHover(e.currentTarget, failureCount, false)}
                            disabled={failureCount === 0}
                        >
                            <span style={styles.buttonIcon}>🔄</span>
                            Reset Count
                        </button>
                    </div>

                    {/* Instructions */}
                    <div style={styles.instructions}>
                        <div style={styles.instructionsHeader}>
                            <span style={styles.instructionsIcon}>💡</span>
                            How to Test
                        </div>
                        <div style={styles.instructionsText}>
                            Click <strong>"Play Now"</strong> in the game to test SSO behavior.
                            {isFailureMode && (
                                <span style={styles.warningText}>
                                    {' '}Failures will be simulated!
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SSOControlSimulator; 