import React from 'react';
import { SSOControlSimulatorProps, SSOControlState } from './types';
import { SSOControlSimulatorStyles } from './sso-control-simulator.styles';
import { SSOControlSimulatorService } from './sso-control-simulator.service';
import { SSO_SCENARIOS, getCurrentScenario } from './sso-scenarios';

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
    onToggleFirstClickInvalidToken,
    onSelectScenario,
    isFailureMode = false,
    isFirstClickInvalidTokenMode = false,
    failCount = 1,
    setFailCount,
    service = new SSOControlSimulatorService()
}) => {
    const styles = new SSOControlSimulatorStyles();

    // Get current scenario based on state
    const currentScenario = getCurrentScenario(isFailureMode, isFirstClickInvalidTokenMode);

    const handleSelectScenario = (scenario: typeof SSO_SCENARIOS[0]) => {
        if (onSelectScenario) {
            onSelectScenario(scenario);
            service.logScenarioSelection(scenario.id);
        }
    };

    return (
        <div style={styles.container}>
            {/* CSS Animations */}
            <style>{styles.animations}</style>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleContainer}>
                    <span style={styles.statusIcon(isFailureMode || isFirstClickInvalidTokenMode)}>
                        {isFailureMode ? '⚠️' : isFirstClickInvalidTokenMode ? '🚫' : '🔒'}
                    </span>
                    SSO Controls
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {/* Current Scenario Indicator */}
                <div style={styles.currentScenarioIndicator}>
                    <span style={styles.currentScenarioIcon}>{currentScenario.icon}</span>
                    <div style={styles.currentScenarioText}>
                        <strong>Current:</strong> {currentScenario.name}
                    </div>
                </div>

                {/* Scenario Selection Section */}
                <div style={styles.scenarioSection}>
                    <div style={styles.scenarioSectionHeader}>
                        <span>🎯</span>
                        Test Scenarios
                    </div>

                    <div style={styles.scenarioGrid}>
                        {SSO_SCENARIOS.map((scenario) => {
                            const isSelected = scenario.id === currentScenario.id;
                            const isActive = true; // All scenarios are active

                            return (
                                <button
                                    key={scenario.id}
                                    onClick={() => handleSelectScenario(scenario)}
                                    style={styles.scenarioButton(isActive, isSelected)}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        }
                                    }}
                                    title={scenario.description}
                                >
                                    <span style={styles.scenarioIcon}>{scenario.icon}</span>
                                    <span style={styles.scenarioName}>{scenario.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Fail count input */}
                    {isFailureMode && setFailCount && (
                        <div style={{ marginTop: 12 }}>
                            <label htmlFor="fail-count-input" style={{ fontSize: 12, marginRight: 8 }}>
                                Fail first
                            </label>
                            <input
                                id="fail-count-input"
                                type="number"
                                min={1}
                                value={failCount}
                                onChange={e => setFailCount(Number(e.target.value))}
                                style={{ width: 48, fontSize: 12, padding: 2, marginRight: 4 }}
                            />
                            <span style={{ fontSize: 12 }}>Play(s) before success</span>
                        </div>
                    )}
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
                        {isFirstClickInvalidTokenMode && (
                            <span style={styles.warningText}>
                                {' '}First click will return invalid token, then use real tokens!
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SSOControlSimulator; 