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
import LivePageDemo from './_shared/components/live-page-demo';

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

// Tab types
type TabType = 'today' | 'live-page';

// Tab Component
interface TabProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabProps> = ({ activeTab, onTabChange }) => {
    return (
        <div
            style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.8)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 20px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}
        >
            <button
                onClick={() => onTabChange('today')}
                style={{
                    background: activeTab === 'today' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'white',
                    border: 'none',
                    padding: '15px 25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: activeTab === 'today' ? 'bold' : 'normal',
                    borderBottom: activeTab === 'today' ? '3px solid #007bff' : '3px solid transparent',
                    transition: 'all 0.3s ease',
                    minWidth: '120px'
                }}
            >
                Today
            </button>
            <button
                onClick={() => onTabChange('live-page')}
                style={{
                    background: activeTab === 'live-page' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'white',
                    border: 'none',
                    padding: '15px 25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: activeTab === 'live-page' ? 'bold' : 'normal',
                    borderBottom: activeTab === 'live-page' ? '3px solid #007bff' : '3px solid transparent',
                    transition: 'all 0.3s ease',
                    minWidth: '120px'
                }}
            >
                Live Page
            </button>
        </div>
    );
};

// Tab Content Component that destroys and recreates components
interface TabContentProps {
    activeTab: TabType;
    appEnv: string;
    language: string;
    siteId: string;
    onRequestSSOToken: () => Promise<string | null>;
    showSSOControls: boolean;
    ssoSimulator: any;
    playButtonClickCount: number;
    currentScenarioKey: string;
    onSelectScenario: (scenario: SSOScenario) => void;
}

const TabContent: React.FC<TabContentProps> = ({
    activeTab,
    appEnv,
    language,
    siteId,
    onRequestSSOToken,
    showSSOControls,
    ssoSimulator,
    playButtonClickCount,
    currentScenarioKey,
    onSelectScenario
}) => {
    // Use key prop to force component destruction and recreation
    const renderContent = () => {
        switch (activeTab) {
            case 'today':
                return (
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            height: 'calc(100vh - 60px)', // Subtract tab height
                            overflow: 'hidden',
                            gap: '50px'
                        }}
                    >
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
                                    onSelectScenario={onSelectScenario}
                                    isFailureMode={ssoSimulator.isFailureMode}
                                    isFirstClickInvalidTokenMode={ssoSimulator.isFirstClickInvalidTokenMode}
                                    failCount={ssoSimulator.failCount}
                                    setFailCount={ssoSimulator.setFailCount}
                                />
                            </div>
                        )}
                    </div>
                );

            case 'live-page':
                return (
                    <LivePageDemo
                        appEnv={appEnv}
                        language={language}
                        siteId={siteId}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div key={activeTab} style={{ height: 'calc(100vh - 60px)' }}>
            {renderContent()}
        </div>
    );
};

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

    const [activeTab, setActiveTab] = useState<TabType>('today');

    const handleSelectScenario = useCallback((scenario: SSOScenario) => {
        setPlayButtonClickCount(0);
        setCurrentScenarioKey(scenario.id);
        ssoSimulator.selectScenario(scenario);
    }, [ssoSimulator, setPlayButtonClickCount, setCurrentScenarioKey]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

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
                            width: '100%',
                            height: '100vh',
                            overflow: 'hidden'
                        }}>
                            <TabNavigation
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                            />
                            <TabContent
                                activeTab={activeTab}
                                appEnv={appEnv}
                                language={language}
                                siteId={siteId}
                                onRequestSSOToken={onRequestSSOToken}
                                showSSOControls={showSSOControls}
                                ssoSimulator={ssoSimulator}
                                playButtonClickCount={playButtonClickCount}
                                currentScenarioKey={currentScenarioKey}
                                onSelectScenario={handleSelectScenario}
                            />
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
