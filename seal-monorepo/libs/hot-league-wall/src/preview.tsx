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
import { SSOScenario } from './_shared/components/sso-control-simulator/types';

const Preview = (): React.ReactElement => {
    const [token, setToken] = useState('');
    const [playButtonClickCount, setPlayButtonClickCount] = useState(0);
    const [currentScenarioKey, setCurrentScenarioKey] = useState<string>('normal-flow');

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
                    setPlayButtonClickCount={setPlayButtonClickCount}
                    currentScenarioKey={currentScenarioKey}
                    setCurrentScenarioKey={setCurrentScenarioKey}
                />
            </Router>
        </PreviewProvider>
    );
};

// SSOTestingWrapper: Isolates SSO testing logic from production App
const SSOTestingWrapper: React.FC<{
    children: React.ReactNode;
    failedToken?: string | null;
    isSSOFailureMode?: boolean;
    onSSORetry?: () => void;
}> = ({ children, failedToken, isSSOFailureMode, onSSORetry }) => {
    // Override TokenRequestManager behavior for testing
    React.useEffect(() => {
        if (failedToken && isSSOFailureMode) {
            console.log('🔑 [SSO_TESTING] Injecting failed token into TokenRequestManager for testing');

            // Override the token request to return the failed token
            const originalExecuteTokenRequest = TokenRequestManager.getInstance().executeTokenRequest;
            TokenRequestManager.getInstance().executeTokenRequest = async () => {
                console.log('🔑 [SSO_TESTING] TokenRequestManager returning failed token for testing');
                return failedToken;
            };

            // Restore original behavior on cleanup
            return () => {
                TokenRequestManager.getInstance().executeTokenRequest = originalExecuteTokenRequest;
                console.log('🔑 [SSO_TESTING] Restored original TokenRequestManager behavior');
            };
        }
    }, [failedToken, isSSOFailureMode]);

    return <>{children}</>;
};

// ScenarioResetWrapper: Isolates scenarioKey logic from production App
const ScenarioResetWrapper: React.FC<{
    scenarioKey: string;
    children: (key: string) => React.ReactNode;
}> = ({ scenarioKey, children }) => {
    return <>{children(scenarioKey)}</>;
};

const PreviewContext = ({
    token,
    onPlayButtonTokenRequest,
    playButtonClickCount,
    setPlayButtonClickCount,
    currentScenarioKey,
    setCurrentScenarioKey
}: {
    token: string;
    onPlayButtonTokenRequest: () => Promise<string | null>;
    playButtonClickCount: number;
    setPlayButtonClickCount: React.Dispatch<React.SetStateAction<number>>;
    currentScenarioKey: string;
    setCurrentScenarioKey: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { theme, isDarkMode, language } = usePreviewContext();

    // Check if SSO controls should be shown
    const showSSOControls = shouldShowSSOControls();

    // Use the SSO simulator hook for state management (only when controls are enabled)
    const ssoSimulator = useSSOSimulator({
        isFailureMode: false,
        isFirstClickInvalidTokenMode: false
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

    // Handle scenario selection
    const handleSelectScenario = useCallback((scenario: SSOScenario) => {
        console.log('🎯 [PREVIEW] Scenario selected:', scenario.name);

        // Reset play button click count when scenario changes
        setPlayButtonClickCount(0);
        console.log('🔄 [PREVIEW] Reset play button click count to 0 for new scenario');

        // Update scenario key to trigger app reset
        setCurrentScenarioKey(scenario.id);
        console.log('🔄 [PREVIEW] Updated scenario key to:', scenario.id);

        // Apply scenario settings to simulator
        ssoSimulator.selectScenario(scenario);
    }, [ssoSimulator, setPlayButtonClickCount, setCurrentScenarioKey]);

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
                    onToggleFailure={ssoSimulator.toggleFailure}
                    onToggleFirstClickInvalidToken={ssoSimulator.toggleFirstClickInvalidToken}
                    onSelectScenario={handleSelectScenario}
                    isFailureMode={ssoSimulator.isFailureMode}
                    isFirstClickInvalidTokenMode={ssoSimulator.isFirstClickInvalidTokenMode}
                />
            )}

            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <SSOControlSimulatorWrapper>
                        <SSOTestingWrapper failedToken={getTokenForApp()} isSSOFailureMode={shouldShowSSOFailureMode()}>
                            <ScenarioResetWrapper scenarioKey={currentScenarioKey}>
                                {(key) => (
                                    <App
                                        key={key}
                                        appEnv={appEnv}
                                        language={language}
                                        siteId={siteId}
                                        onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                                        onSSORetry={onPlayButtonTokenRequest}
                                    />
                                )}
                            </ScenarioResetWrapper>
                        </SSOTestingWrapper>
                    </SSOControlSimulatorWrapper>
                } />
            </Routes>
        </div>
    );
};

export default Preview;
