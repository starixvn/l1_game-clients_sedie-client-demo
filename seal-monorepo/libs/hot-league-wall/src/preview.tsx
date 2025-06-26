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
import { SSOControlSimulator } from './_shared/components/sso-control-simulator';
import { SSOControlSimulatorWrapper } from './_shared/components/sso-control-simulator/sso-control-simulator-wrapper';
import { shouldShowSSOControls, logSSOControlsConfig } from './_shared/utils/sso-controls-config';
import { useSSOSimulator } from './_shared/components/sso-control-simulator';

const Preview = (): React.ReactElement => {
    const [token, setToken] = useState('');
    const [playButtonClickCount, setPlayButtonClickCount] = useState(0);

    // Callback function to get token when Play button is clicked
    const handlePlayButtonTokenRequest = useCallback(async () => {
        const startTime = performance.now();
        console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());

        // Increment click count for simulation
        setPlayButtonClickCount(prev => prev + 1);
        const currentClickCount = playButtonClickCount + 1;

        try {
            console.log('🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...');

            // Check if we should simulate invalid token on first click
            if (currentClickCount === 1) {
                console.log('🔑 [TOKEN_TIMING] First click detected - checking for invalid token simulation');

                // Check if invalid token mode is enabled (this will be checked in the App component)
                // For now, we'll let the App component handle the simulation
                console.log('🔑 [TOKEN_TIMING] Proceeding with normal token request flow');
            }

            const result = await requestSSO();
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);
            return result.token;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);
            console.error('[TOKEN_TIMING] Error details:', error);
            return null;
        }
    }, [playButtonClickCount]);

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
                    playButtonClickCount={playButtonClickCount}
                />
            </Router>
        </PreviewProvider>
    );
};

const PreviewContext = ({
    token,
    onPlayButtonTokenRequest,
    playButtonClickCount
}: {
    token: string;
    onPlayButtonTokenRequest: () => Promise<string | null>;
    playButtonClickCount: number;
}) => {
    const { theme, isDarkMode, language } = usePreviewContext();

    // Check if SSO controls should be shown
    const showSSOControls = shouldShowSSOControls();

    // Use the SSO simulator hook for state management (only when controls are enabled)
    const ssoSimulator = useSSOSimulator({
        isFailureMode: false,
        isFirstClickInvalidTokenMode: false,
        failureCount: 0
    });

    console.log('🔍 [PREVIEW_DEBUG] SSO Controls Status:', {
        showSSOControls
    });

    // Log SSO controls configuration for debugging
    React.useEffect(() => {
        logSSOControlsConfig();
    }, [showSSOControls]);

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    // Determine if SSO failure mode should be active (when any invalid token mode is enabled)
    const shouldShowSSOFailureMode = () => {
        if (!showSSOControls) return false;

        // If manual failure mode is enabled, always show failure mode
        if (ssoSimulator.isFailureMode) {
            return true;
        }

        // For first click invalid token mode, only show failure mode if we've already clicked play
        // This allows users to still click the play button on the prototype
        if (ssoSimulator.isFirstClickInvalidTokenMode) {
            return playButtonClickCount > 0; // Only show failure mode after first click
        }

        return false;
    };

    // Handle successful SSO retry - disable failure mode when token request succeeds
    const handleSuccessfulSSORetry = useCallback(() => {
        console.log('🔄 [PREVIEW] SSO retry successful - checking which modes to disable');

        // Only disable manual failure mode, preserve first click invalid token mode
        if (ssoSimulator.isFailureMode) {
            console.log('🔄 [PREVIEW] Disabling manual failure mode in SSO simulator');
            ssoSimulator.toggleFailureMode(); // This will disable manual failure mode
        } else {
            console.log('🔄 [PREVIEW] Manual failure mode already disabled');
        }

        // Note: We don't disable first click invalid token mode here
        // as it should persist for subsequent testing
    }, [ssoSimulator]);

    // Determine which token to use based on simulation mode
    const getTokenForApp = () => {
        if (showSSOControls) {
            if (ssoSimulator.isFirstClickInvalidTokenMode) {
                // Simulate invalid token on first click only
                if (playButtonClickCount === 0) {
                    const firstClickInvalidToken = ssoSimulator.getFirstClickInvalidToken();
                    console.log('🔑 [PREVIEW_DEBUG] First click - Using first click invalid token for testing:', firstClickInvalidToken?.substring(0, 50) + '...');
                    console.log('🔑 [PREVIEW_DEBUG] This simulates a real-world scenario where the first SSO request returns an invalid token');
                    return firstClickInvalidToken;
                } else {
                    console.log('🔑 [PREVIEW_DEBUG] Subsequent clicks - Using real token from TokenRequestManager');
                    return null; // Use real token for subsequent clicks
                }
            } else if (ssoSimulator.isFailureMode) {
                const failedToken = ssoSimulator.getFailedToken();
                console.log('🔑 [PREVIEW_DEBUG] Using failed token for testing:', failedToken?.substring(0, 50) + '...');
                return failedToken;
            }
        }
        return null; // Use real token from TokenRequestManager
    };

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            {/* SSO Control Simulator - Only show when enabled */}
            {showSSOControls && (
                <SSOControlSimulator
                    onToggleFailure={ssoSimulator.toggleFailureMode}
                    onToggleFirstClickInvalidToken={ssoSimulator.toggleFirstClickInvalidTokenMode}
                    onResetCount={ssoSimulator.resetFailureCount}
                    failureCount={ssoSimulator.failureCount}
                    isFailureMode={ssoSimulator.isFailureMode}
                    isFirstClickInvalidTokenMode={ssoSimulator.isFirstClickInvalidTokenMode}
                />
            )}

            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <SSOControlSimulatorWrapper>
                        <App
                            appEnv={appEnv}
                            language={language}
                            siteId={siteId}
                            onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                            isSSOFailureMode={shouldShowSSOFailureMode()}
                            onSSORetry={handleSuccessfulSSORetry}
                            FailedToken={getTokenForApp()}
                        />
                    </SSOControlSimulatorWrapper>
                } />
            </Routes>
        </div>
    );
};

export default Preview;
