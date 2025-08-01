import React, { useState } from 'react';
import { useSentryHelper, SentryLogLevel } from 'sg-sentry';
import { HotLeagueWallErrorBoundary } from 'sg-sentry';
import { SentryLogProvider } from 'sg-sentry';
import { appSettingsWithSentry } from './_shared/app-settings';

// Simple local ErrorSimulator component
const ErrorSimulator: React.FC<{ componentName: string; enableAutoErrors?: boolean }> = ({ componentName, enableAutoErrors }) => {
    return (
        <div style={{ padding: '10px', border: '1px solid #ddd', margin: '10px 0' }}>
            <h4>Error Simulator for {componentName}</h4>
            <p>This is a placeholder for the ErrorSimulator component.</p>
            <p>Auto errors: {enableAutoErrors ? 'Enabled' : 'Disabled'}</p>
        </div>
    );
};

interface TestErrorPageProps {
    appEnv?: string;
    siteId?: string;
    language?: string;
}

/**
 * Test page for simulating errors and testing Sentry session replay functionality
 */
const TestErrorPage: React.FC<TestErrorPageProps> = ({
    appEnv = 'test',
    siteId = 'test-site',
    language = 'en'
}) => {
    const [showErrorSimulator, setShowErrorSimulator] = useState(false);
    const [enableAutoErrors, setEnableAutoErrors] = useState(false);

    // Initialize SentryHelper for the test page
    const { logError, logWarning, logInfo } = useSentryHelper({
        componentName: 'TestErrorPage',
        logLevel: SentryLogLevel.ERROR, // Set to ERROR level to ensure session replay
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    const handleShowErrorSimulator = () => {
        logInfo('Session replay: Error simulator requested', {
            timestamp: Date.now(),
            enableAutoErrors
        });
        setShowErrorSimulator(true);
    };

    const handleHideErrorSimulator = () => {
        logInfo('Session replay: Error simulator hidden', {
            timestamp: Date.now()
        });
        setShowErrorSimulator(false);
    };

    const handleToggleAutoErrors = () => {
        const newValue = !enableAutoErrors;
        setEnableAutoErrors(newValue);
        logInfo('Session replay: Auto errors toggled', {
            enabled: newValue,
            timestamp: Date.now()
        });
    };

    const simulateImmediateError = () => {
        logError('Session replay: Immediate error simulation triggered', {
            errorType: 'immediate_error',
            timestamp: Date.now(),
            operation: 'immediate_error_simulation'
        });
    };

    const simulateWarning = () => {
        logWarning('Session replay: Warning simulation triggered', {
            warningType: 'test_warning',
            timestamp: Date.now(),
            operation: 'warning_simulation'
        });
    };

    const simulateInfo = () => {
        logInfo('Session replay: Info message simulation', {
            infoType: 'test_info',
            timestamp: Date.now(),
            operation: 'info_simulation'
        });
    };

    return (
        <HotLeagueWallErrorBoundary componentName="TestErrorPage">
            <SentryLogProvider
                sessionId={`test-error-page-${Date.now()}`}
                gameId="test-error-page"
                enabled={true}
                autoSendOnUnmount={true}
                sentryConfig={{
                    dsn: appSettingsWithSentry.sentryDsn,
                    environment: appSettingsWithSentry.sentryEnvironment || process.env.NODE_ENV || 'development',
                    componentName: 'TestErrorPage',
                    release: process.env.REACT_APP_VERSION || '1.0.0',
                    debug: process.env.NODE_ENV === 'development',
                    logLevel: SentryLogLevel.ERROR
                }}
            >
                <div style={{
                    padding: '20px',
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: '#f8f9fa',
                    minHeight: '100vh'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        <h1 style={{
                            color: '#2d3436',
                            textAlign: 'center',
                            marginBottom: '30px',
                            borderBottom: '3px solid #e17055',
                            paddingBottom: '10px'
                        }}>
                            🧪 Hot League Wall - Error Testing Page
                        </h1>

                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ color: '#636e72', marginBottom: '15px' }}>
                                Session Replay Testing
                            </h2>
                            <p style={{ color: '#636e72', lineHeight: '1.6' }}>
                                This page is designed to test Sentry session replay functionality by simulating various error scenarios.
                                All errors are logged with ERROR level to ensure session replay breadcrumbs are captured in Sentry.
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                padding: '20px',
                                border: '2px solid #74b9ff',
                                borderRadius: '8px',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <h3 style={{ color: '#0984e3', marginBottom: '15px' }}>
                                    📊 Quick Error Tests
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button
                                        onClick={simulateImmediateError}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: '#e17055',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        🚨 Simulate Error
                                    </button>

                                    <button
                                        onClick={simulateWarning}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: '#fdcb6e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ⚠️ Simulate Warning
                                    </button>

                                    <button
                                        onClick={simulateInfo}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: '#00b894',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ℹ️ Simulate Info
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                padding: '20px',
                                border: '2px solid #00b894',
                                borderRadius: '8px',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <h3 style={{ color: '#00b894', marginBottom: '15px' }}>
                                    ⚙️ Error Simulator Controls
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button
                                        onClick={handleShowErrorSimulator}
                                        disabled={showErrorSimulator}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: showErrorSimulator ? '#b2bec3' : '#00b894',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: showErrorSimulator ? 'not-allowed' : 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        🧪 Show Error Simulator
                                    </button>

                                    <button
                                        onClick={handleHideErrorSimulator}
                                        disabled={!showErrorSimulator}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: !showErrorSimulator ? '#b2bec3' : '#e17055',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: !showErrorSimulator ? 'not-allowed' : 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        🚫 Hide Error Simulator
                                    </button>

                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={enableAutoErrors}
                                            onChange={handleToggleAutoErrors}
                                            style={{ transform: 'scale(1.2)' }}
                                        />
                                        <span style={{ fontSize: '14px' }}>
                                            Enable Auto Error Simulation
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {showErrorSimulator && (
                            <ErrorSimulator
                                componentName="HotLeagueWallErrorSimulator"
                                enableAutoErrors={enableAutoErrors}
                            />
                        )}

                        <div style={{
                            marginTop: '30px',
                            padding: '20px',
                            border: '2px solid #fdcb6e',
                            borderRadius: '8px',
                            backgroundColor: '#fffbf0'
                        }}>
                            <h3 style={{ color: '#e17055', marginBottom: '15px' }}>
                                📋 Testing Instructions
                            </h3>
                            <ol style={{ color: '#636e72', lineHeight: '1.6' }}>
                                <li><strong>Quick Tests:</strong> Use the buttons above to simulate immediate errors, warnings, and info messages.</li>
                                <li><strong>Error Simulator:</strong> Click "Show Error Simulator" to access the comprehensive error testing tool.</li>
                                <li><strong>Session Replay:</strong> All errors are logged with ERROR level to ensure session replay breadcrumbs are captured.</li>
                                <li><strong>Auto Simulation:</strong> Enable auto error simulation to automatically trigger errors every 10 seconds.</li>
                                <li><strong>Sentry Dashboard:</strong> Check your Sentry dashboard to see the session replay breadcrumbs and error reports.</li>
                            </ol>
                        </div>

                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f1f2f6',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#636e72'
                        }}>
                            <p><strong>Environment:</strong> {appEnv} | <strong>Site ID:</strong> {siteId} | <strong>Language:</strong> {language}</p>
                            <p><strong>Sentry DSN:</strong> {appSettingsWithSentry.sentryDsn ? 'Configured' : 'Not Configured'}</p>
                            <p><strong>Session ID:</strong> test-error-page-{Date.now()}</p>
                        </div>
                    </div>
                </div>
            </SentryLogProvider>
        </HotLeagueWallErrorBoundary>
    );
};

export default TestErrorPage; 