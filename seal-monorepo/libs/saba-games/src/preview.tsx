import { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodayDayDemo from './_shared/components/today-day-demo';

declare global {
    interface Window {
        _heightUpdateTimeout?: NodeJS.Timeout;
        _isUpdatingHeight?: boolean;
        _lastHeightUpdate?: number;
    }
}

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
    platform: string;
    theme: string;
    isDarkMode: boolean;
    language: string;
    siteId: string;
    token: string;
    renewToken: () => Promise<void>;
    updateBalanceCallback: ((totalStake?: number, winBet?: number) => void) | null;
}

const TabContent: React.FC<TabContentProps> = ({
    activeTab,
    appEnv,
    platform,
    theme,
    isDarkMode,
    language,
    siteId,
    token,
    renewToken,
    updateBalanceCallback
}) => {
    // Use key prop to force component destruction and recreation
    const renderContent = () => {
        switch (activeTab) {
            case 'today':
                return (
                    <TodayDayDemo
                        appEnv={appEnv}
                        language={language}
                        siteId={siteId}
                    />
                );

            case 'live-page':
                const containerRef = useRef<HTMLDivElement>(null);
                const contentRef = useRef<HTMLDivElement>(null);
                return (
                    <div
                        ref={containerRef}
                        data-platform={platform}
                        data-version={process.env.TAG_VERSION}
                        className={'seal-vg-sg-index'}
                        style={{
                            transition: 'min-height 0.3s ease-in-out',
                            overflow: 'hidden'
                        }}
                    >
                        <div ref={contentRef}>
                            <Routes>
                                <Route path="*" element={
                                    <App
                                        appEnv={appEnv}
                                        token={token}
                                        language={language}
                                        theme={theme}
                                        isDarkMode={isDarkMode}
                                        siteId={siteId}
                                        renewToken={renewToken}
                                        updateBalanceCallback={updateBalanceCallback}
                                    />
                                } />
                            </Routes>
                        </div>
                    </div>
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

const Preview = () => {
    const [token, setToken] = useState('');

    const isInitialMount = useRef(true);

    const handleGetToken = useCallback(async () => {
        const result = await requestSSO();
        if (result?.token) {
            setToken(result.token);
        }
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            handleGetToken();
        }
    }, [handleGetToken]);

    return (
        token && (
            <PreviewProvider>
                <Router>
                    <PreviewContext
                        token={token}
                        renewToken={handleGetToken}
                        updateBalanceCallback={(totalStake?: number, winBet?: number) => {
                            console.log('updateBalanceCallback', { totalStake, winBet });
                        }}
                    />
                </Router>
            </PreviewProvider>
        )
    );
};

const PreviewContext = ({ token, renewToken, updateBalanceCallback }) => {
    const { language, theme, isDarkMode } = usePreviewContext();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];

    useSentryInit();

    const [activeTab, setActiveTab] = useState<TabType>('today');

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            <ProviderSetDropDown />
            <Routes>
                {/* <Route path="/color-games-demo" element={<DiceDemo />} /> */}
                <Route path="*" element={
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
                            platform={platform}
                            theme={theme}
                            isDarkMode={isDarkMode}
                            language={language}
                            siteId={siteId}
                            token={token}
                            renewToken={renewToken}
                            updateBalanceCallback={updateBalanceCallback}
                        />
                    </div>
                } />
            </Routes>
        </div >
    );
};

export default Preview;
