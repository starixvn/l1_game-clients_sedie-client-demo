import React, { useRef, useEffect } from 'react';
import { useIframeHeight } from '../hooks/use-iframe-height';
import { BettingPanelPortal } from './bet-panel/betting-panel-portal';
import { ConfirmBetPortal } from './confirm-bet/confirm-bet-portal';
import { useMessageContext } from '../_shared/contexts/message-context';
import { MessageType } from '../_shared/types/message-types';

interface IframeContainerProps {
    src: string;
    token: string;
    language: string;
    theme: string;
    isDarkMode: boolean;
    siteId?: string;
    appEnv?: string;
}

const CustomContainer: React.FC<{ fluid?: boolean | 'xl', className?: string, children: React.ReactNode }> = ({
    fluid = false,
    className = '',
    children
}) => {
    const containerClass = `container${fluid ? '-fluid' : ''} ${className}`.trim();
    return <div className={containerClass}>{children}</div>;
};

// Helper function to check if iframe is from same origin
const isSameOriginFrame = (iframe: HTMLIFrameElement | null): boolean => {
    if (!iframe) return false;
    try {
        return typeof iframe.contentWindow?.location.href === 'string';
    } catch (err) {
        return false;
    }
};

const IframeContainer: React.FC<IframeContainerProps> = ({
    src,
    token,
    language,
    theme,
    isDarkMode,
    siteId,
    appEnv
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { sendMessageToSpecificIframe } = useMessageContext();
    const { iframeHeight } = useIframeHeight();


    useEffect(() => {
        if (token) {
            sendMessageToSpecificIframe({
                type: MessageType.SET_TOKEN,
                data: {
                    token
                }
            }, iframeRef.current);
        }
    }, [token]);

    // Add effect to check iframe origin on mount and src change
    useEffect(() => {
        const checkIframeOrigin = () => {
            const isSameOrigin = isSameOriginFrame(iframeRef.current);
            console.log('Iframe origin check:', {
                src,
                isSameOrigin,
                currentOrigin: window.location.origin,
                siteId,
                appEnv
            });
        };

        // Check immediately and after a short delay to ensure iframe is loaded
        checkIframeOrigin();
        const timeoutId = setTimeout(checkIframeOrigin, 1000);

        return () => clearTimeout(timeoutId);
    }, [src, siteId, appEnv]);


    useEffect(() => {
        sendMessageToSpecificIframe({
            type: MessageType.UPDATE_SETTINGS,
            data: {
                theme,
                isDarkMode,
                language
            }
        }, iframeRef.current);
    }, [language, theme, isDarkMode]);

    return (
        <CustomContainer className="mt-3" fluid="xl">
            <div style={{
                width: '100%',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <iframe
                    ref={iframeRef}
                    src={src}
                    style={{
                        width: '100%',
                        height: `${iframeHeight}px`,
                        border: 'none',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'block'
                    }}
                    scrolling="no"
                    title="External Content"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
                <BettingPanelPortal
                    iframeRef={iframeRef}
                />

                <ConfirmBetPortal
                    iframeRef={iframeRef}
                />
            </div>
        </CustomContainer>
    );
};

export default IframeContainer;