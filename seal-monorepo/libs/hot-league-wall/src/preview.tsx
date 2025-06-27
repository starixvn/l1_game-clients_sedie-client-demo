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

// --- Custom Hooks ---
function usePrototypeState() {
    const [playButtonClickCount, setPlayButtonClickCount] = useState(0);
    const [onPrototypePage, setOnPrototypePage] = useState(true);
    const handleEnterLobby = useCallback(() => setOnPrototypePage(false), []);
    const resetPrototype = useCallback(() => {
        setPlayButtonClickCount(0);
        setOnPrototypePage(true);
    }, []);
    return {
        playButtonClickCount,
        setPlayButtonClickCount,
        onPrototypePage,
        handleEnterLobby,
        resetPrototype
    };
}

function useTokenRequest(playButtonClickCount, setPlayButtonClickCount, failCount, isFailureMode) {
    return useCallback(async (context: 'FIRST_SSO' | 'SSO_RETRY'): Promise<string | null> => {
        const startTime = performance.now();
        setPlayButtonClickCount(prev => prev + 1);
        const currentClickCount = playButtonClickCount + 1;

        // Simulate failure for the first N clicks if failure mode is enabled and context is 'FIRST_SSO'
        if (context === 'FIRST_SSO' && isFailureMode && currentClickCount <= failCount) {
            const fakeToken = `INVALID_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            console.log(`🧪 [SIMULATION] Returning fake token for click #${currentClickCount}:`, fakeToken);
            return fakeToken;
        }

        try {
            console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());
            console.log('🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...');
            if (currentClickCount === 1) {
                console.log('🔑 [TOKEN_TIMING] First click detected - checking for invalid token simulation');
                console.log('🔑 [TOKEN_TIMING] Proceeding with normal token request flow');
            }
            const result = await requestSSO();
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);
            return result.token as string | null;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);
            console.error('[TOKEN_TIMING] Error details:', error);
            return null;
        }
    }, [playButtonClickCount, setPlayButtonClickCount, failCount, isFailureMode]);
}

// --- Main Preview Component ---
const Preview = (): React.ReactElement => {
    const prototypeState = usePrototypeState();
    const [token, setToken] = useState('');
    const [currentScenarioKey, setCurrentScenarioKey] = useState<string>('normal-flow');
    // Use SSO simulator for failCount and isFailureMode
    const ssoSimulator = useSSOSimulator({
        isFailureMode: false,
        isFirstClickInvalidTokenMode: false
    });
    const onRequestSSOToken = useTokenRequest(
        prototypeState.playButtonClickCount,
        prototypeState.setPlayButtonClickCount,
        ssoSimulator.failCount,
        ssoSimulator.isFailureMode
    );

    // Set up the token request callback
    React.useEffect(() => {
        TokenRequestManager.getInstance().setTokenRequestCallback(() => onRequestSSOToken('FIRST_SSO'));
    }, [onRequestSSOToken]);

    return (
        <PreviewProvider>
            <Router>
                <PreviewContext
                    token={token}
                    onRequestSSOToken={onRequestSSOToken}
                    playButtonClickCount={prototypeState.playButtonClickCount}
                    setPlayButtonClickCount={prototypeState.setPlayButtonClickCount}
                    currentScenarioKey={currentScenarioKey}
                    setCurrentScenarioKey={setCurrentScenarioKey}
                    onPrototypePage={prototypeState.onPrototypePage}
                    handleEnterLobby={prototypeState.handleEnterLobby}
                    ssoSimulator={ssoSimulator}
                />
            </Router>
        </PreviewProvider>
    );
};

// SSOTestingWrapper: Isolates SSO testing logic from production App
const SSOTestingWrapper: React.FC<{
    children: React.ReactNode;
    isSSOFailureMode?: boolean;
    onSSORetry?: () => void;
}> = ({ children, isSSOFailureMode, onSSORetry }) => {
    // Override TokenRequestManager behavior for testing
    React.useEffect(() => {
        if (isSSOFailureMode) {
            console.log('🔑 [SSO_TESTING] Injecting failed token into TokenRequestManager for testing');

            // Override the token request to return the failed token
            const originalExecuteTokenRequest = TokenRequestManager.getInstance().executeTokenRequest;
            TokenRequestManager.getInstance().executeTokenRequest = async () => {
                console.log('🔑 [SSO_TESTING] TokenRequestManager returning failed token for testing');
                return null;
            };

            // Restore original behavior on cleanup
            return () => {
                TokenRequestManager.getInstance().executeTokenRequest = originalExecuteTokenRequest;
                console.log('🔑 [SSO_TESTING] Restored original TokenRequestManager behavior');
            };
        }
    }, [isSSOFailureMode]);

    return <>{children}</>;
};

// ScenarioResetWrapper: Isolates scenarioKey logic from production App
const ScenarioResetWrapper: React.FC<{
    scenarioKey: string;
    children: (key: string) => React.ReactNode;
}> = ({ scenarioKey, children }) => {
    return <>{children(scenarioKey)}</>;
};

// --- PreviewContext Component ---
interface PreviewContextProps {
    token: string;
    onRequestSSOToken: (context: 'FIRST_SSO' | 'SSO_RETRY') => Promise<string | null>;
    playButtonClickCount: number;
    setPlayButtonClickCount: React.Dispatch<React.SetStateAction<number>>;
    currentScenarioKey: string;
    setCurrentScenarioKey: React.Dispatch<React.SetStateAction<string>>;
    onPrototypePage: boolean;
    handleEnterLobby: () => void;
    ssoSimulator: ReturnType<typeof useSSOSimulator>;
}

const PreviewContext = ({
    token,
    onRequestSSOToken,
    playButtonClickCount,
    setPlayButtonClickCount,
    currentScenarioKey,
    setCurrentScenarioKey,
    onPrototypePage,
    handleEnterLobby,
    ssoSimulator
}: PreviewContextProps) => {
    const { theme, isDarkMode, language } = usePreviewContext();
    const showSSOControls = shouldShowSSOControls();

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
                    failCount={ssoSimulator.failCount}
                    setFailCount={ssoSimulator.setFailCount}
                />
            )}

            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <SSOControlSimulatorWrapper>
                        <ScenarioResetWrapper scenarioKey={currentScenarioKey}>
                            {(key) => (
                                <App
                                    key={key}
                                    appEnv={appEnv}
                                    language={language}
                                    siteId={siteId}
                                    onRequestSSOToken={onRequestSSOToken}
                                />
                            )}
                        </ScenarioResetWrapper>
                    </SSOControlSimulatorWrapper>
                } />
            </Routes>
        </div>
    );
};

export default Preview;
