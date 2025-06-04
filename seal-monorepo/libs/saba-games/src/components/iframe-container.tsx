import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useIframeHeight } from '../hooks/use-iframe-height';
import { useBettingPanel } from '../hooks/use-betting-panel';
import { BettingPanelPortal } from './bet-panel/betting-panel-portal';
import { ConfirmBetPortal } from './confirm-bet/confirm-bet-portal';
import { ConfirmBetState } from './confirm-bet';

interface IframeContainerProps {
    src: string;
    token: string;
    language: string;
    renewToken?: Function;
    allowedOrigins?: string[];
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
    renewToken,
    allowedOrigins = [
        'http://localhost:4200',
        'http://localhost:4551',
        'https://l1-standalone-live-page-local1.lumigame.com',
        'https://l1-seal-live-page-client-demo1.lumigame.com'
    ]
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { iframeHeight, requestIframeHeight, handleHeightMessage } = useIframeHeight();
    const { betPanelState, handleBettingMessage } = useBettingPanel();
    const [confirmBetState, setConfirmBetState] = useState<ConfirmBetState>({
        isVisible: false,
        totalStake: 0,
        betChoice: '',
        namespace: '',
        position: {
            top: 0,
            left: 0
        }
    });

    const handleConfirmBetMessage = useCallback((data: any) => {
        console.log('%c[IFRAME_CONTAINER] Received confirm bet message:', 'color: red; font-weight: bold;', data);

        switch (data.type) {
            case 'SHOW_CONFIRM_BET':
                console.log('%c[IFRAME_CONTAINER] Showing confirm bet', 'color: red; font-weight: bold;', data.payload);
                setConfirmBetState({
                    ...data.payload,
                    isVisible: true
                });
                break;
            case 'HIDE_CONFIRM_BET':
                console.log('%c[IFRAME_CONTAINER] Hiding confirm bet', 'color: red; font-weight: bold;');
                setConfirmBetState(prev => ({
                    ...prev,
                    isVisible: false
                }));
                break;
        }
    }, []);

    const handleMessage = useCallback((event: MessageEvent) => {
        // Log the actual origin for debugging
        console.log('%c[IFRAME_CONTAINER] Received message from origin:', 'color: red; font-weight: bold;', event.origin);
        console.log('%c[IFRAME_CONTAINER] Allowed origins:', 'color: red; font-weight: bold;', allowedOrigins);

        // Remove trailing slashes and normalize the origin
        const normalizedOrigin = event.origin.replace(/\/$/, '');

        // Strict origin validation
        if (!allowedOrigins.includes(normalizedOrigin)) {
            console.warn(`Blocked message from unauthorized origin: ${event.origin}`);
            console.warn(`Normalized origin: ${normalizedOrigin}`);
            return;
        }

        try {
            const data = event.data;
            // Handle height update message
            handleHeightMessage(data);

            // Handle betting related messages
            handleBettingMessage(data);

            // Handle confirm bet messages
            handleConfirmBetMessage(data);

            // Handle bet response
            if (data.type === 'BET_RESPONSE') {
                console.log('Parent: Received bet response:', data);
                // Handle bet response if needed
            }
        } catch (error) {
            console.error('Parent: Error processing message:', error);
        }
    }, [handleHeightMessage, handleBettingMessage, handleConfirmBetMessage, allowedOrigins]);

    // Handle iframe load event
    const handleIframeLoad = useCallback(() => {
        console.log('Iframe loaded from src:', src);

        // Check if iframe is from same origin
        const isSameOrigin = isSameOriginFrame(iframeRef.current);
        console.log('Is same origin iframe:', isSameOrigin);

        if (isSameOrigin) {
            // Only request height if same origin
            setTimeout(() => requestIframeHeight(iframeRef.current), 500);
        } else {
            console.warn('Cross-origin iframe detected. Height adjustment may be limited.');
        }
    }, [requestIframeHeight, src]);

    // Add effect to check iframe origin on mount and src change
    useEffect(() => {
        const checkIframeOrigin = () => {
            const isSameOrigin = isSameOriginFrame(iframeRef.current);
            console.log('Iframe origin check:', {
                src,
                isSameOrigin,
                currentOrigin: window.location.origin
            });
        };

        // Check immediately and after a short delay to ensure iframe is loaded
        checkIframeOrigin();
        const timeoutId = setTimeout(checkIframeOrigin, 1000);

        return () => clearTimeout(timeoutId);
    }, [src]);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);

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
                    onLoad={handleIframeLoad}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
                {betPanelState && (
                    <BettingPanelPortal
                        betPanelState={betPanelState}
                        iframeRef={iframeRef}
                    />
                )}
                <ConfirmBetPortal
                    iframeRef={iframeRef}
                />
            </div>
        </CustomContainer>
    );
};

export default IframeContainer;