import React, { useCallback, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Core imports
import App from './app';
import { PreviewProvider } from './previewProvider';

// Component imports
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import RngSoccerDemo from './games/saba-club/rng-soccer/prototype/rng-soccer-demo';
import { SSOControlSimulator } from './_shared/components/sso-control-simulator';
import { SSOControlSimulatorWrapper } from './_shared/components/sso-control-simulator/sso-control-simulator-wrapper';

// Utility imports
import { TokenRequestManager } from './_shared/utils/callback-singleton/token-request-manager';
import { useSSOSimulator } from './_shared/components/sso-control-simulator';
import { SSOScenario } from './_shared/components/sso-control-simulator/types';

// Simulator imports
import {
    usePrototypeState,
    useTokenRequest,
    useAppConfiguration,
    ScenarioResetWrapper,
    SSOFailureModeLogic,
    DEFAULT_SCENARIO_KEY,
    DEFAULT_SSO_CONFIG,
    PreviewContextProps
} from './simulator';

// Main Components
const PreviewContext: React.FC<PreviewContextProps> = ({
    onRequestSSOToken,
    playButtonClickCount,
    setPlayButtonClickCount,
    currentScenarioKey,
    setCurrentScenarioKey,
    ssoSimulator
}) => {
    const {
        language,
        showSSOControls,
        appEnv,
        siteId,
        platform
    } = useAppConfiguration();

    const handleSelectScenario = useCallback((scenario: SSOScenario) => {
        console.log('🎯 [PREVIEW] Scenario selected:', scenario.name);

        setPlayButtonClickCount(0);
        console.log('🔄 [PREVIEW] Reset play button click count to 0 for new scenario');

        setCurrentScenarioKey(scenario.id);
        console.log('🔄 [PREVIEW] Updated scenario key to:', scenario.id);

        ssoSimulator.selectScenario(scenario);
    }, [ssoSimulator, setPlayButtonClickCount, setCurrentScenarioKey]);

    return (
        <div
            data-platform={platform}
            data-version={process.env.TAG_VERSION}
            className="seal-vg-sg-index"
            style={{
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                paddingLeft: '100px'
            }}
        >
            <ProviderSetDropDown />

            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route
                    path="/sso-control"
                    element={
                        <div style={{
                            display: 'flex',
                            width: '800px',
                            height: '100vh',
                            overflow: 'hidden',
                            gap: '50px'
                        }}>
                            {/* Left side - App */}
                            <div style={{
                                flex: '1',
                                minWidth: '0',
                                position: 'relative'
                            }}>
                                <SSOFailureModeLogic
                                    showSSOControls={showSSOControls}
                                    ssoSimulator={ssoSimulator}
                                    playButtonClickCount={playButtonClickCount}
                                />

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
                            </div>

                            {/* Right side - SSO Controls */}
                            {showSSOControls && (
                                <div style={{
                                    width: '320px',
                                    minWidth: '320px',
                                    height: '500px',
                                    background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)',
                                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                                    overflowY: 'auto',
                                    padding: '20px',
                                    boxSizing: 'border-box'
                                }}>
                                    <SSOControlSimulator
                                        onToggleFailure={ssoSimulator.toggleFailure}
                                        onToggleFirstClickInvalidToken={ssoSimulator.toggleFirstClickInvalidToken}
                                        onSelectScenario={handleSelectScenario}
                                        isFailureMode={ssoSimulator.isFailureMode}
                                        isFirstClickInvalidTokenMode={ssoSimulator.isFirstClickInvalidTokenMode}
                                        failCount={ssoSimulator.failCount}
                                        setFailCount={ssoSimulator.setFailCount}
                                    />
                                </div>
                            )}
                        </div>
                    }
                />
                <Route
                    path="*"
                    element={
                        <div style={{
                            display: 'flex',
                            width: '100%',
                            height: '100vh',
                            overflow: 'hidden',
                            gap: '50px'
                        }}>
                            {/* Left side - App */}
                            <div style={{
                                flex: '1',
                                minWidth: '0',
                                position: 'relative'
                            }}>
                                <App
                                    appEnv={appEnv}
                                    language={language}
                                    siteId={siteId}
                                    onRequestSSOToken={onRequestSSOToken}
                                />
                            </div>

                            {/* Right side - SSO Controls */}
                            {showSSOControls && (
                                <div style={{
                                    width: '320px',
                                    minWidth: '320px',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)',
                                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                                    overflowY: 'auto',
                                    padding: '20px',
                                    boxSizing: 'border-box'
                                }}>
                                    <SSOControlSimulator
                                        onToggleFailure={ssoSimulator.toggleFailure}
                                        onToggleFirstClickInvalidToken={ssoSimulator.toggleFirstClickInvalidToken}
                                        onSelectScenario={handleSelectScenario}
                                        isFailureMode={ssoSimulator.isFailureMode}
                                        isFirstClickInvalidTokenMode={ssoSimulator.isFirstClickInvalidTokenMode}
                                        failCount={ssoSimulator.failCount}
                                        setFailCount={ssoSimulator.setFailCount}
                                    />
                                </div>
                            )}
                        </div>
                    }
                />
            </Routes>
        </div>
    );
};

// Main Preview Component
const Preview: React.FC = (): React.ReactElement => {
    const prototypeState = usePrototypeState();
    const [currentScenarioKey, setCurrentScenarioKey] = useState<string>(DEFAULT_SCENARIO_KEY);

    const ssoSimulator = useSSOSimulator(DEFAULT_SSO_CONFIG);

    const onRequestSSOToken = useTokenRequest({
        playButtonClickCount: prototypeState.playButtonClickCount,
        setPlayButtonClickCount: prototypeState.setPlayButtonClickCount,
        failCount: ssoSimulator.failCount,
        isFailureMode: ssoSimulator.isFailureMode
    });

    // Create a wrapper function that handles context internally
    const handleTokenRequest = useCallback(async (): Promise<string | null> => {
        return await onRequestSSOToken('FIRST_SSO');
    }, [onRequestSSOToken]);

    useEffect(() => {
        TokenRequestManager.getInstance().setTokenRequestCallback(
            () => onRequestSSOToken('FIRST_SSO')
        );
    }, [onRequestSSOToken]);

    return (
        <PreviewProvider>
            <Router>
                <PreviewContext
                    onRequestSSOToken={handleTokenRequest}
                    playButtonClickCount={prototypeState.playButtonClickCount}
                    setPlayButtonClickCount={prototypeState.setPlayButtonClickCount}
                    currentScenarioKey={currentScenarioKey}
                    setCurrentScenarioKey={setCurrentScenarioKey}
                    ssoSimulator={ssoSimulator}
                />
            </Router>
        </PreviewProvider>
    );
};

export default Preview;
