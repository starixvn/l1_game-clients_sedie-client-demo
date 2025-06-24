import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RngSoccerDemo from './games/saba-club/rng-soccer/rng-soccer-demo';
import RNGSoccerStaticPrototype from './games/saba-club/rng-soccer/rng-soccer-static-prototype';

const Preview = (): React.ReactElement | null => {
    const [token, setToken] = useState('');
    const [hasClickedPlay, setHasClickedPlay] = useState(false);

    const isInitialMount = useRef(true);

    const handleGetToken = useCallback(async () => {
        const result = await requestSSO();
        if (result?.token) {
            setToken(result.token);
        }
    }, []);

    const handlePlayButtonClick = useCallback(() => {
        setHasClickedPlay(true);
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
                <PreviewContext
                    token={token}
                    renewToken={handleGetToken}
                    hasClickedPlay={hasClickedPlay}
                    onPlayButtonClick={handlePlayButtonClick}
                />
            </Router>
        </PreviewProvider>
    );
};

const PreviewContext = ({
    token,
    renewToken,
    hasClickedPlay,
    onPlayButtonClick
}: {
    token: string;
    renewToken: () => void;
    hasClickedPlay: boolean;
    onPlayButtonClick: () => void;
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
                <Route path="/rng-soccer-prototype" element={<RNGSoccerStaticPrototype />} />
                <Route path="*" element={
                    hasClickedPlay ? (
                        <App
                            appEnv={appEnv}
                            token={token}
                            language={language}
                            siteId={siteId}
                            renewToken={renewToken}
                        />
                    ) : (
                        <RNGSoccerStaticPrototype onPlayButtonClick={onPlayButtonClick} />
                    )
                } />
            </Routes>
        </div>
    );
};

export default Preview;
