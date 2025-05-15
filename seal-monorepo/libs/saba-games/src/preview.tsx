import { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DiceDemo from './_shared/components/color-game-dice/dice-demo';

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
                    <PreviewContext token={token} renewToken={handleGetToken} updateBalanceCallback={() => {
                        console.log('updateBalanceCallback');
                    }} />
                </Router>
            </PreviewProvider>
        )
    );
};

const PreviewContext = ({ token, renewToken, updateBalanceCallback }) => {
    const { theme, isDarkMode, language } = usePreviewContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    // Send height update to parent
    const sendHeightUpdate = useCallback(() => {
        if (!contentRef.current) return;

        const contentHeight = contentRef.current.scrollHeight;
        const newHeight = isExpanded ? Math.max(contentHeight, 400) : Math.max(contentHeight, 264);
        console.log('Iframe: Content height:', contentHeight, 'New height:', newHeight);

        window.parent.postMessage({
            type: 'SET_HEIGHT',
            height: newHeight
        }, '*');
    }, [isExpanded]);

    // Handle messages from parent window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('Iframe: Received message:', event.data, 'from origin:', event.origin);

            if (event.data.type === 'GET_HEIGHT') {
                sendHeightUpdate();
            } else if (event.data.type === 'TOGGLE_STATISTIC') {
                console.log('Iframe: Toggling statistic:', event.data.isOpen);
                setIsExpanded(event.data.isOpen);
                // Send height update after state change and animation
                setTimeout(sendHeightUpdate, 300);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [sendHeightUpdate]);

    // Send height updates when content changes
    useEffect(() => {
        console.log('Iframe: Setting up height update observer');

        // Send initial height after a delay to ensure content is rendered
        setTimeout(sendHeightUpdate, 500);

        // Set up ResizeObserver to detect content changes
        const observer = new ResizeObserver(() => {
            console.log('Iframe: Content size changed, sending update');
            sendHeightUpdate();
        });

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => {
            console.log('Iframe: Cleaning up height update observer');
            observer.disconnect();
        };
    }, [isExpanded, sendHeightUpdate]);

    return (
        <div
            ref={containerRef}
            data-platform={platform}
            data-version={process.env.TAG_VERSION}
            className={'seal-vg-sg-index'}
            style={{
                minHeight: isExpanded ? '400px' : '264px',
                transition: 'min-height 0.3s ease-in-out',
                overflow: 'hidden'
            }}
        >
            <div ref={contentRef}>
                <ProviderSetDropDown />
                <Routes>
                    <Route path="/color-games-demo" element={<DiceDemo />} />
                    <Route path="*" element={
                        <App
                            appEnv={appEnv}
                            token={token}
                            language={language}
                            siteId={siteId}
                            renewToken={renewToken}
                            updateBalanceCallback={updateBalanceCallback}
                        />
                    } />
                </Routes>
            </div>
        </div>
    );
};

export default Preview;
