import { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DiceDemo from './_shared/components/color-game-dice/dice-demo';
import TodayDayDemo from './_shared/components/today-day-demo';

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
    token: string;
    renewToken: () => Promise<void>;
    updateBalanceCallback: void | null;
}

const TabContent: React.FC<TabContentProps> = ({
    activeTab,
    appEnv,
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
                return (
                    <App
                        appEnv={appEnv}
                        token={token}
                        language={language}
                        siteId={siteId}
                        renewToken={renewToken}
                        updateBalanceCallback={updateBalanceCallback}
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
                    <PreviewContext token={token} renewToken={handleGetToken} updateBalanceCallback={null} />
                </Router>
            </PreviewProvider>
        )
    );
};

const PreviewContext = ({ token, renewToken, updateBalanceCallback }) => {
    const { theme, isDarkMode, language } = usePreviewContext();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    const [activeTab, setActiveTab] = useState<TabType>('today');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            <ProviderSetDropDown />
            <Routes>
                <Route path="/color-games-demo" element={<DiceDemo />} />
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
                            language={language}
                            siteId={siteId}
                            token={token}
                            renewToken={renewToken}
                            updateBalanceCallback={updateBalanceCallback}
                        />
                    </div>
                } />
            </Routes>
        </div>
    );
};

export default Preview;
