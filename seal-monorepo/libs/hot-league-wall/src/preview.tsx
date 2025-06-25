import React, { useCallback, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RngSoccerDemo from './games/saba-club/rng-soccer/prototype/rng-soccer-demo';

const Preview = (): React.ReactElement => {
    const [token, setToken] = useState('');

    // Callback function to get token when Play button is clicked
    const handlePlayButtonTokenRequest = useCallback(async () => {
        const startTime = performance.now();
        console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());

        try {
            const result = await requestSSO();
            const endTime = performance.now();
            const duration = endTime - startTime;

            if (result?.token) {
                console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
                console.log(`📊 [TOKEN_TIMING] Token received for REAL APP at: ${new Date().toISOString()}`);
                console.log(`🔑 [TOKEN_TIMING] Token length: ${result.token.length} characters`);
                console.log(`🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...`);
                setToken(result.token);
                return result.token;
            } else {
                console.log(`❌ [TOKEN_TIMING] Token request FAILED for REAL APP - Duration: ${duration.toFixed(2)}ms - No token in response`);
                return null;
            }
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.error('[TOKEN_TIMING] Error details:', error);
            return null;
        }
    }, []);

    return (
        <PreviewProvider>
            <Router>
                <PreviewContext token={token} onPlayButtonTokenRequest={handlePlayButtonTokenRequest} />
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
            <ProviderSetDropDown />
            <Routes>
                <Route path="/rng-soccer-demo" element={<RngSoccerDemo />} />
                <Route path="*" element={
                    <App
                        appEnv={appEnv}
                        token={token}
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
