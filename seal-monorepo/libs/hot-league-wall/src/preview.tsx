import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RngSoccerDemo from './games/saba-club/rng-soccer/prototype/rng-soccer-demo';

const Preview = (): React.ReactElement | null => {
    const [token, setToken] = useState('');

    const isInitialMount = useRef(true);

    const handleGetToken = useCallback(async () => {
        const result = await requestSSO();
        if (result?.token) {
            setToken(result.token);
        }
    }, []);

    // Callback function to get token when Play button is clicked
    const handlePlayButtonTokenRequest = useCallback(async () => {
        const result = await requestSSO();
        if (result?.token) {
            setToken(result.token);
            return result.token;
        }
        return null;
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            handleGetToken();
        }
    }, [handleGetToken]);

    if (!token) {
        return null;
    }

    return (
        <PreviewProvider>
            <Router>
                <PreviewContext token={token} renewToken={handleGetToken} onPlayButtonTokenRequest={handlePlayButtonTokenRequest} />
            </Router>
        </PreviewProvider>
    );
};

const PreviewContext = ({
    token,
    renewToken,
    onPlayButtonTokenRequest
}: {
    token: string;
    renewToken: () => void;
    onPlayButtonTokenRequest: () => Promise<string | null>;
}) => {
    const { theme, isDarkMode, language } = usePreviewContext();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    useEffect(() => {
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
                        renewToken={renewToken}
                        onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                    />
                } />
            </Routes>
        </div>
    );
};

export default Preview;
