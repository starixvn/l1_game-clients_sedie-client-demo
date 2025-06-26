import { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryInit } from './saba-games-index';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../constant/app';
import App from './app';
import { PreviewProvider, usePreviewContext } from './previewProvider';
import ProviderSetDropDown from './_shared/components/provider-set-dropdown';
import { requestSSO } from './_shared/utils/sso-helper';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appSettings } from './_shared/app-settings/vgaming-index';
import { MessageType } from './_shared/types/message-types';

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
    const animationTimeoutRef = useRef<NodeJS.Timeout>();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];
    const encryptionKey = appSettings.encryptionKey || 'development-key';
    useSentryInit();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    //Send theme and language updates to iframe content
    useEffect(() => {
        const iframe = document.querySelector('iframe');

        const sendSettings = () => {
            if (iframe?.contentWindow) {
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

    // Handle messages from parent window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === MessageType.TOGGLE_STATISTIC) {
                setIsAnimating(true);
                setIsExpanded(event.data.isOpen);

                // Clear any existing animation timeout
                if (animationTimeoutRef.current) {
                    clearTimeout(animationTimeoutRef.current);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    // Send height updates when content changes
    useEffect(() => {
        if (isAnimating) return; // Don't observe during animation

        const observer = new ResizeObserver(() => {
            if (isAnimating) return; // Don't update during animation
            // Debounce resize observer updates
        });

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [isExpanded, isAnimating]);

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
                    <Route path="*" element={
                        <App
                            appEnv={appEnv}
                            token={token}
                            language={language}
                            siteId={siteId}
                            renewToken={renewToken}
                            updateBalanceCallback={updateBalanceCallback}
                            encryptionKey={encryptionKey}
                        />
                    } />
                </Routes>
            </div>
        </div>
    );
};

export default Preview;
