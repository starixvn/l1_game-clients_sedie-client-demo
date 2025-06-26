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
import { SSOControlSimulator, useSSOSimulator } from './_shared/components/sso-control-simulator';
import { shouldShowSSOControls, getSSOControlsConfig, logSSOControlsConfig, forceEnableSSOControls } from './_shared/utils/sso-controls-config';

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

    // Check if SSO controls should be shown
    const showSSOControls = shouldShowSSOControls();

    // Fallback: Force enable in development if environment variables don't work
    // Only use fallback if no SIMULATOR_CONFIG is explicitly provided
    const fallbackShowSSOControls = !process.env.SIMULATOR_CONFIG ? forceEnableSSOControls() : false;

    // Use the primary method, fallback to force enable if needed
    const finalShowSSOControls = showSSOControls || fallbackShowSSOControls;

    console.log('🔍 [PREVIEW_DEBUG] SSO Controls Status:', {
        primary: showSSOControls,
        fallback: fallbackShowSSOControls,
        final: finalShowSSOControls,
        hasSimulatorConfig: !!process.env.SIMULATOR_CONFIG
    });

    // Log SSO controls configuration for debugging
    React.useEffect(() => {
        logSSOControlsConfig();
    }, [finalShowSSOControls]);

    // Use the SSO simulator hook for state management (only when controls are enabled)
    const ssoSimulator = useSSOSimulator({
        isFailureMode: finalShowSSOControls ? simulateSSOFailure : false,
        failureCount: finalShowSSOControls ? failureCount : 0
    });

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    // Update global variables when state changes (only when controls are enabled)
    React.useEffect(() => {
        if (finalShowSSOControls) {
            simulateSSOFailure = ssoSimulator.isFailureMode;
            failureCount = ssoSimulator.failureCount;
        }
    }, [ssoSimulator.isFailureMode, ssoSimulator.failureCount, finalShowSSOControls]);

    // Get failed token from SSO simulator when in failure mode (only when controls are enabled)
    const failedToken = finalShowSSOControls ? ssoSimulator.getFailedToken() : null;

    // Log the token status for debugging
    React.useEffect(() => {
        if (finalShowSSOControls && failedToken) {
            console.log(`🟢 [PREVIEW_DEBUG] SSO controls enabled, FailedToken will be used: ${failedToken}`);
        } else if (!finalShowSSOControls) {
            console.log(`🔴 [PREVIEW_DEBUG] SSO controls disabled, FailedToken will be ignored (set to null)`);
        }
    }, [finalShowSSOControls, failedToken]);

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            {/* SSO Control Simulator - Only show when enabled */}
            {finalShowSSOControls && (
                <SSOControlSimulator
                    onToggleFailure={ssoSimulator.toggleFailureMode}
                    onResetCount={ssoSimulator.resetFailureCount}
                    failureCount={ssoSimulator.failureCount}
                    isFailureMode={ssoSimulator.isFailureMode}
                />
            )}

            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <App
                        appEnv={appEnv}
                        language={language}
                        siteId={siteId}
                        onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                        FailedToken={failedToken}
                        isSSOFailureMode={finalShowSSOControls ? ssoSimulator.isFailureMode : false}
                    />
                } />
            </Routes>
        </div>
    );
};

export default Preview;
