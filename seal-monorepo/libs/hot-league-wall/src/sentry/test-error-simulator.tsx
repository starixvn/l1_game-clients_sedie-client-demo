import React, { useState, useEffect } from 'react';
import { useSentryHelper, SentryLogLevel } from './index';

interface ErrorSimulatorProps {
    componentName?: string;
    enableAutoErrors?: boolean;
}

/**
 * Test component to simulate various error scenarios and send error-level logs to Sentry
 * with session replay breadcrumbs for testing purposes.
 */
export const ErrorSimulator: React.FC<ErrorSimulatorProps> = ({
    componentName = 'ErrorSimulator',
    enableAutoErrors = false
}) => {
    const [errorCount, setErrorCount] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);

    // Initialize SentryHelper with error-level logging
    const {
        logError,
        logWarning,
        logInfo,
        logDebug,
        workflowTracker,
        trackPerformance
    } = useSentryHelper({
        componentName,
        logLevel: SentryLogLevel.ERROR, // Set to ERROR level to ensure session replay
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Auto-simulate errors for testing
    useEffect(() => {
        if (!enableAutoErrors) return;

        const interval = setInterval(() => {
            simulateRandomError();
        }, 10000); // Simulate error every 10 seconds

        return () => clearInterval(interval);
    }, [enableAutoErrors]);

    const simulateRandomError = () => {
        const errors = [
            () => simulateNullReferenceError(),
            () => simulateNetworkError(),
            () => simulateStateError(),
            () => simulateWorkflowError(),
            () => simulatePerformanceError(),
            () => simulateUserInteractionError(),
            () => simulateMainPlayerStoreError()
        ];

        const randomError = errors[Math.floor(Math.random() * errors.length)];
        randomError();
    };

    const simulateNullReferenceError = async () => {
        const workflowId = workflowTracker.start('Null Reference Error Simulation', {
            errorType: 'null_reference',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting null reference error simulation', {
                errorType: 'null_reference',
                timestamp: Date.now()
            });

            // Simulate accessing null property
            const nullObject: any = null;

            // This will throw an error
            const result = nullObject.someProperty.length;

            workflowTracker.complete(workflowId, true, {
                result,
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: Null reference error occurred', {
                error: errorMessage,
                errorType: 'null_reference',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: Date.now(),
                operation: 'null_reference_simulation'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'null_reference',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const simulateNetworkError = async () => {
        const workflowId = workflowTracker.start('Network Error Simulation', {
            errorType: 'network_error',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting network error simulation', {
                errorType: 'network_error',
                timestamp: Date.now()
            });

            // Simulate network request
            const response = await fetch('https://invalid-url-that-will-fail.com/api/test');
            const data = await response.json();

            workflowTracker.complete(workflowId, true, {
                data,
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: Network error occurred', {
                error: errorMessage,
                errorType: 'network_error',
                url: 'https://invalid-url-that-will-fail.com/api/test',
                timestamp: Date.now(),
                operation: 'network_request_simulation'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'network_error',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const simulateStateError = async () => {
        const workflowId = workflowTracker.start('State Error Simulation', {
            errorType: 'state_error',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting state error simulation', {
                errorType: 'state_error',
                timestamp: Date.now()
            });

            // Simulate the exact MainPlayerStore.handleOfferGames error
            // This replicates the original issue where offerGames was null
            const mainPlayerStore = {
                offerGames: null as any[] | null
            };

            // Simulate the lobby component trying to access offerGames.length
            // This will throw: "TypeError: Cannot read properties of null (reading 'length')"
            // Using type assertion to bypass TypeScript check since we want to simulate the error
            const offerGamesCount = (mainPlayerStore.offerGames as any[]).length;

            workflowTracker.complete(workflowId, true, {
                offerGamesCount,
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: State error occurred', {
                error: errorMessage,
                errorType: 'state_error',
                mainPlayerStore: { offerGames: null },
                timestamp: Date.now(),
                operation: 'main_player_store_simulation',
                originalError: 'TypeError: Cannot read properties of null (reading \'length\')'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'state_error',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const simulateWorkflowError = async () => {
        const workflowId = workflowTracker.start('Workflow Error Simulation', {
            errorType: 'workflow_error',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting workflow error simulation', {
                errorType: 'workflow_error',
                timestamp: Date.now()
            });

            // Simulate workflow step failure
            await workflowTracker.track('Failing Step', async () => {
                throw new Error('Workflow step intentionally failed for testing');
            });

            workflowTracker.complete(workflowId, true, {
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: Workflow error occurred', {
                error: errorMessage,
                errorType: 'workflow_error',
                workflowId,
                timestamp: Date.now(),
                operation: 'workflow_simulation'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'workflow_error',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const simulatePerformanceError = async () => {
        const workflowId = workflowTracker.start('Performance Error Simulation', {
            errorType: 'performance_error',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting performance error simulation', {
                errorType: 'performance_error',
                timestamp: Date.now()
            });

            // Simulate slow operation
            await trackPerformance('Slow Operation', async () => {
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
                throw new Error('Performance threshold exceeded');
            });

            workflowTracker.complete(workflowId, true, {
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: Performance error occurred', {
                error: errorMessage,
                errorType: 'performance_error',
                duration: 5000,
                timestamp: Date.now(),
                operation: 'performance_simulation'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'performance_error',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const simulateUserInteractionError = async () => {
        const workflowId = workflowTracker.start('User Interaction Error Simulation', {
            errorType: 'user_interaction_error',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting user interaction error simulation', {
                errorType: 'user_interaction_error',
                timestamp: Date.now()
            });

            // Simulate user interaction that fails
            const userAction = 'button_click';
            const element = document.querySelector('.non-existent-element');

            if (!element) {
                throw new Error(`Element not found for user action: ${userAction}`);
            }

            workflowTracker.complete(workflowId, true, {
                userAction,
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: User interaction error occurred', {
                error: errorMessage,
                errorType: 'user_interaction_error',
                userAction: 'button_click',
                elementSelector: '.non-existent-element',
                timestamp: Date.now(),
                operation: 'user_interaction_simulation'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'user_interaction_error',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const simulateMainPlayerStoreError = async () => {
        const workflowId = workflowTracker.start('MainPlayerStore Error Simulation', {
            errorType: 'main_player_store_error',
            timestamp: Date.now()
        });

        try {
            logInfo('Session replay: Starting MainPlayerStore error simulation', {
                errorType: 'main_player_store_error',
                timestamp: Date.now()
            });

            // Simulate the exact MainPlayerStore.handleOfferGames error scenario
            // This replicates the original issue from the Sentry error logs
            const mainPlayerStore = {
                offerGames: null as any[] | null
            };

            // Simulate the lobby component's handleOfferGames method
            // This will throw the exact error: "TypeError: Cannot read properties of null (reading 'length')"
            const handleOfferGames = (offerGames: any[] | null) => {
                // Simulate the original problematic code without null checking
                // Using type assertion to bypass TypeScript check since we want to simulate the error
                const offerGamesCount = (offerGames as any[]).length;
                return offerGamesCount;
            };

            // Call the problematic function with null
            const result = handleOfferGames(mainPlayerStore.offerGames);

            workflowTracker.complete(workflowId, true, {
                result,
                timestamp: Date.now()
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            logError('Session replay: MainPlayerStore error occurred', {
                error: errorMessage,
                errorType: 'main_player_store_error',
                mainPlayerStore: { offerGames: null },
                timestamp: Date.now(),
                operation: 'main_player_store_handle_offer_games',
                originalError: 'TypeError: Cannot read properties of null (reading \'length\')',
                mobxReaction: 'Reaction[MainPlayerStore.handleOfferGames]'
            });

            workflowTracker.complete(workflowId, false, {
                error: errorMessage,
                errorType: 'main_player_store_error',
                timestamp: Date.now()
            });

            setErrorCount(prev => prev + 1);
        }
    };

    const startErrorSimulation = () => {
        setIsSimulating(true);
        logInfo('Session replay: Error simulation started', {
            timestamp: Date.now(),
            autoErrors: enableAutoErrors
        });
    };

    const stopErrorSimulation = () => {
        setIsSimulating(false);
        logInfo('Session replay: Error simulation stopped', {
            totalErrors: errorCount,
            timestamp: Date.now()
        });
    };

    const resetErrorCount = () => {
        setErrorCount(0);
        logInfo('Session replay: Error count reset', {
            timestamp: Date.now()
        });
    };

    return (
        <div style={{
            padding: '20px',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
            margin: '20px'
        }}>
            <h3 style={{ color: '#d63031', marginBottom: '15px' }}>
                🧪 Error Simulator - {componentName}
            </h3>

            <div style={{ marginBottom: '15px' }}>
                <p><strong>Error Count:</strong> {errorCount}</p>
                <p><strong>Status:</strong> {isSimulating ? '🟢 Simulating' : '🔴 Stopped'}</p>
                <p><strong>Auto Errors:</strong> {enableAutoErrors ? '🟢 Enabled' : '🔴 Disabled'}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                <button
                    onClick={simulateNullReferenceError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#e17055',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Null Reference Error
                </button>

                <button
                    onClick={simulateNetworkError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#6c5ce7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Network Error
                </button>

                <button
                    onClick={simulateStateError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#00b894',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    State Error
                </button>

                <button
                    onClick={simulateWorkflowError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#fdcb6e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Workflow Error
                </button>

                <button
                    onClick={simulatePerformanceError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#e84393',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Performance Error
                </button>

                <button
                    onClick={simulateUserInteractionError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#0984e3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    User Interaction Error
                </button>

                <button
                    onClick={simulateMainPlayerStoreError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#2d3436',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    MainPlayerStore Error
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={simulateRandomError}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#d63031',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🎲 Random Error
                </button>

                <button
                    onClick={startErrorSimulation}
                    disabled={isSimulating}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: isSimulating ? '#b2bec3' : '#00b894',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSimulating ? 'not-allowed' : 'pointer'
                    }}
                >
                    ▶️ Start Auto Simulation
                </button>

                <button
                    onClick={stopErrorSimulation}
                    disabled={!isSimulating}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: !isSimulating ? '#b2bec3' : '#e17055',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isSimulating ? 'not-allowed' : 'pointer'
                    }}
                >
                    ⏹️ Stop Auto Simulation
                </button>

                <button
                    onClick={resetErrorCount}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#74b9ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Reset Count
                </button>
            </div>

            <div style={{ marginTop: '15px', fontSize: '12px', color: '#636e72' }}>
                <p><strong>Note:</strong> This component simulates errors for testing Sentry session replay functionality.</p>
                <p>All errors are logged with ERROR level to ensure session replay breadcrumbs are captured.</p>
            </div>
        </div>
    );
};

export default ErrorSimulator; 