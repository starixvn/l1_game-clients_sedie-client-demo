import React, { useState } from 'react';
import { useSSOSimulator } from './use-sso-simulator';

/**
 * Failed Token Demo Component
 * 
 * Demonstrates how the failed token generation works and how it triggers rerenders
 */
export const FailedTokenDemo: React.FC = () => {
    const ssoSimulator = useSSOSimulator();
    const [demoToken, setDemoToken] = useState<string | null>(null);
    const [renderCount, setRenderCount] = useState(0);

    // Simulate how the app component would use the failed token
    React.useEffect(() => {
        setRenderCount(prev => prev + 1);
        if (ssoSimulator.isFailureMode) {
            const token = ssoSimulator.getFailedToken();
            setDemoToken(token);
            console.log(`🔄 [DEMO] Failed token changed: ${token}`);
        } else {
            setDemoToken(null);
            console.log('🔄 [DEMO] Failed token cleared');
        }
    }, [ssoSimulator.isFailureMode, ssoSimulator.getFailedToken()]);

    return (
        <div style={{
            border: '2px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3>Failed Token Demo</h3>

            <div style={{ marginBottom: '16px' }}>
                <strong>Current State:</strong>
                <div>Failure Mode: {ssoSimulator.isFailureMode ? '🟢 ENABLED' : '🔴 DISABLED'}</div>
                <div>Failed Token: {demoToken || 'null'}</div>
                <div>Render Count: {renderCount}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <button
                    onClick={ssoSimulator.toggleFailureMode}
                    style={{
                        padding: '8px 16px',
                        marginRight: '8px',
                        backgroundColor: ssoSimulator.isFailureMode ? '#ff4444' : '#44ff44',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {ssoSimulator.isFailureMode ? 'Disable' : 'Enable'} Failure Mode
                </button>

                <button
                    onClick={() => {
                        if (ssoSimulator.isFailureMode) {
                            // Force a new token generation
                            ssoSimulator.toggleFailureMode();
                            ssoSimulator.toggleFailureMode();
                        }
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4444ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    disabled={!ssoSimulator.isFailureMode}
                >
                    Generate New Token
                </button>
            </div>

            <div style={{
                fontSize: '12px',
                color: '#666',
                backgroundColor: '#fff',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
            }}>
                <strong>How it works:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                    <li>When "Enable Failure Mode" is clicked, a random failed token is generated</li>
                    <li>The token format is: INVALID_TOKEN_[timestamp]_[random]</li>
                    <li>Each time failure mode is toggled, a new token is generated</li>
                    <li>The app component receives this token and rerenders the Lobby</li>
                    <li>This simulates SSO failures for testing purposes</li>
                </ul>
            </div>
        </div>
    );
};

export default FailedTokenDemo; 