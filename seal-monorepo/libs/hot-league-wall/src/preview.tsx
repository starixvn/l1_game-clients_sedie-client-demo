import React, { useCallback, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RngSoccerDemo from './games/saba-club/rng-soccer/prototype/rng-soccer-demo';
import { TokenRequestManager } from './_shared/utils/token-request-manager';

// Global flag to simulate SSO failures (for testing purposes)
let simulateSSOFailure = false;
let failureCount = 0;

// Function to toggle SSO failure simulation
export const toggleSSOFailure = () => {
    simulateSSOFailure = !simulateSSOFailure;
    failureCount = 0;
    console.log(`🔄 [SSO_SIMULATION] SSO failure simulation ${simulateSSOFailure ? 'ENABLED' : 'DISABLED'}`);
};

// Function to reset failure count
export const resetSSOFailureCount = () => {
    failureCount = 0;
    console.log(`🔄 [SSO_SIMULATION] SSO failure count reset to 0`);
};

const Preview = (): React.ReactElement => {
    const [token, setToken] = useState('');

    // Callback function to get token when Play button is clicked
    const handlePlayButtonTokenRequest = useCallback(async () => {
        const startTime = performance.now();
        console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());

        try {
            // Simulate SSO failure if enabled
            if (simulateSSOFailure) {
                failureCount++;
                console.log(`💥 [SSO_SIMULATION] Simulating SSO failure #${failureCount}`);

                // Simulate different failure scenarios
                if (failureCount === 1) {
                    throw new Error('Network timeout - Please check your connection');
                } else if (failureCount === 2) {
                    throw new Error('Authentication failed - Invalid credentials');
                } else {
                    throw new Error('Server error - Please try again later');
                }
            }

            console.log('🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...');
            const result = await requestSSO();
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            return result.token;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.error('[TOKEN_TIMING] Error details:', error);
            return null;
        }
    }, []);

    // Set up the token request callback
    React.useEffect(() => {
        TokenRequestManager.getInstance().setTokenRequestCallback(handlePlayButtonTokenRequest);
    }, [handlePlayButtonTokenRequest]);

    return (
        <PreviewProvider>
            <Router>
                <PreviewContext
                    token={token}
                    onPlayButtonTokenRequest={handlePlayButtonTokenRequest}
                />
            </Router>
        </PreviewProvider>
    );
};

const PreviewContext = ({
    token,
    onPlayButtonTokenRequest
}: {
    token: string;
    onPlayButtonTokenRequest: () => Promise<string | null>;
}) => {
    const { theme, isDarkMode, language } = usePreviewContext();
    const [showControls, setShowControls] = useState(false);

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            {/* SSO Simulation Controls */}
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                zIndex: 9999,
                background: 'rgba(0,0,0,0.8)',
                padding: '10px',
                borderRadius: '5px',
                color: 'white',
                fontSize: '12px'
            }}>
                <button
                    onClick={() => setShowControls(!showControls)}
                    style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginBottom: showControls ? '10px' : '0'
                    }}
                >
                    {showControls ? 'Hide' : 'Show'} SSO Controls
                </button>

                {showControls && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div>
                            <strong>SSO Failure Simulation:</strong> {simulateSSOFailure ? '🟢 ON' : '🔴 OFF'}
                        </div>
                        <div>
                            <strong>Failure Count:</strong> {failureCount}
                        </div>
                        <button
                            onClick={toggleSSOFailure}
                            style={{
                                background: simulateSSOFailure ? '#dc3545' : '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            {simulateSSOFailure ? 'Disable' : 'Enable'} SSO Failures
                        </button>
                        <button
                            onClick={resetSSOFailureCount}
                            style={{
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Reset Count
                        </button>
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>
                            Click "Play Now" to test
                        </div>
                    </div>
                )}
            </div>

            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <App
                        appEnv={appEnv}
                        language={language}
                        siteId={siteId}
                        onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                    />
                } />
            </Routes>
        </div>
    );
};

export default Preview;
