import { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DiceDemo from './_shared/components/color-game-dice/dice-demo';

declare global {
    interface Window {
        _heightUpdateTimeout?: NodeJS.Timeout;
        _isUpdatingHeight?: boolean;
        _lastHeightUpdate?: number;
    }
}

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
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lastHeightRef = useRef<number>(0);
    const updateCountRef = useRef<number>(0);
    const animationTimeoutRef = useRef<NodeJS.Timeout>();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    useSentryInit();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    // Send theme and language updates to iframe content
    useEffect(() => {
        const iframe = document.querySelector('iframe');
        // console.log('Iframe element:', iframe);
        // console.log('Iframe contentWindow:', iframe?.contentWindow);

        const sendSettings = () => {
            if (iframe?.contentWindow) {
                // console.log('Sending UPDATE_SETTINGS to iframe:', {
                //     theme,
                //     isDarkMode,
                //     language
                // });
                iframe.contentWindow.postMessage({
                    type: 'UPDATE_SETTINGS',
                    settings: {
                        theme,
                        isDarkMode,
                        language
                    }
                }, '*');
            } else {
                console.warn('Iframe or contentWindow not found');
            }
        };

        // Send settings when iframe loads
        iframe?.addEventListener('load', sendSettings);

        // Also try to send immediately in case iframe is already loaded
        sendSettings();

        return () => {
            iframe?.removeEventListener('load', sendSettings);
        };
    }, [theme, isDarkMode, language]);

    // Send height update to parent
    const sendHeightUpdate = useCallback(() => {
        if (!contentRef.current || window._isUpdatingHeight || isAnimating) return;

        // Prevent too many updates in a short time
        const now = Date.now();
        if (window._lastHeightUpdate && now - window._lastHeightUpdate < 500) {
            return;
        }

        const contentHeight = contentRef.current.scrollHeight;
        const newHeight = isExpanded ? Math.max(contentHeight, 400) : Math.max(contentHeight, 264);

        // Only send update if height actually changed significantly (more than 5px)
        if (Math.abs(newHeight - lastHeightRef.current) < 5) return;
        lastHeightRef.current = newHeight;

        // Prevent infinite updates
        updateCountRef.current++;
        if (updateCountRef.current > 10) {
            console.warn('Too many height updates, stopping');
            return;
        }

        // Debounce height updates
        if (window._heightUpdateTimeout) {
            clearTimeout(window._heightUpdateTimeout);
        }

        window._isUpdatingHeight = true;
        window._lastHeightUpdate = now;

        window._heightUpdateTimeout = setTimeout(() => {
            window.parent.postMessage({
                type: 'SET_HEIGHT',
                height: newHeight
            }, '*');
            window._isUpdatingHeight = false;
        }, 200);
    }, [isExpanded, isAnimating]);

    // Handle messages from parent window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'GET_HEIGHT') {
                sendHeightUpdate();
            } else if (event.data.type === 'TOGGLE_STATISTIC') {
                setIsAnimating(true);
                setIsExpanded(event.data.isOpen);

                // Clear any existing animation timeout
                if (animationTimeoutRef.current) {
                    clearTimeout(animationTimeoutRef.current);
                }

                // Wait for animation to complete before sending height update
                animationTimeoutRef.current = setTimeout(() => {
                    setIsAnimating(false);
                    sendHeightUpdate();
                }, 300); // Match the CSS transition duration
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [sendHeightUpdate]);

    // Send height updates when content changes
    useEffect(() => {
        if (isAnimating) return; // Don't observe during animation

        // Send initial height after a delay to ensure content is rendered
        const initialTimeout = setTimeout(sendHeightUpdate, 500);

        // Set up ResizeObserver to detect content changes
        let resizeTimeout: NodeJS.Timeout;
        const observer = new ResizeObserver(() => {
            if (isAnimating) return; // Don't update during animation
            // Debounce resize observer updates
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(sendHeightUpdate, 200);
        });

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(resizeTimeout);
            observer.disconnect();
        };
    }, [isExpanded, sendHeightUpdate, isAnimating]);

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
