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

const Preview = (): React.ReactElement => {
    const [token, setToken] = useState('');
    return (
        <PreviewProvider>
            <Router>
                <PreviewContext
                    token={token}
                />
            </Router>
        </PreviewProvider>
    );
};

const PreviewContext = ({
    token
}: {
    token: string;
}) => {
    const { theme, isDarkMode, language } = usePreviewContext();
    const ssoSimulator = useSSOSimulator();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    // Play button handler uses ssoSimulator state
    const handlePlayButtonTokenRequest = useCallback(async () => {
        const startTime = performance.now();
        try {
            if (ssoSimulator.isFailureMode) {
                ssoSimulator.incrementFailureCount();
                const count = ssoSimulator.failureCount + 1; // increment is async, so +1
                if (count === 1) throw new Error('Network timeout - Please check your connection');
                if (count === 2) throw new Error('Authentication failed - Invalid credentials');
                throw new Error('Server error - Please try again later');
            }
            const result = await requestSSO();
            return result.token;
        } catch (error) {
            return null;
        }
    }, [ssoSimulator]);

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            {/* SSO Control Simulator */}
            <SSOControlSimulator
                onToggleFailure={ssoSimulator.toggleFailureMode}
                onResetCount={ssoSimulator.resetFailureCount}
                failureCount={ssoSimulator.failureCount}
                isFailureMode={ssoSimulator.isFailureMode}
            />

            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <App
                        appEnv={appEnv}
                        language={language}
                        siteId={siteId}
                        onPlayButtonTokenRequest={handlePlayButtonTokenRequest}
                    />
                } />
            </Routes>
        </div>
    );
};

export default Preview;
