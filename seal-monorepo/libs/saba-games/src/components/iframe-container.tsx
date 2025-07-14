import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useIframeHeight } from '../hooks/use-iframe-height';
import { BettingPanelPortal } from './bet-panel/betting-panel-portal';
import { ConfirmBetPortal } from './confirm-bet/confirm-bet-portal';
import { ConfirmBetState } from './confirm-bet';
import { MessageEncryption, EncryptedMessage } from '../utils/encryption';
import { useBetPanelData, useStatisticData } from '../hooks/use-message-data';
import { BetPanelState } from './bet-panel';

interface IframeContainerProps {
    src: string;
    token: string;
    language: string;
    renewToken?: Function;
    encryptionKey: string;
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
    encryptionKey
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const statisticData = useStatisticData();
    const betPanelData = useBetPanelData();
    const { iframeHeight, requestIframeHeight } = useIframeHeight();
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

    const messageEncryption = new MessageEncryption(encryptionKey);

    const sendEncryptedMessage = useCallback((data: any) => {
        if (!iframeRef.current?.contentWindow) return;

        const encryptedMessage = messageEncryption.encrypt(data);
        iframeRef.current.contentWindow.postMessage(encryptedMessage, '*');
    }, [messageEncryption]);

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
        try {
            // Validate and decrypt the message
            const encryptedMessage = event.data as EncryptedMessage;
            if (!messageEncryption.validateMessage(encryptedMessage)) {
                console.warn('Received invalid encrypted message');
                return;
            }

            const data = messageEncryption.decrypt(encryptedMessage);

            // Handle confirm bet messages
            handleConfirmBetMessage(data);
        } catch (error) {
            console.error('Parent: Error processing message:', error);
        }
    }, [handleConfirmBetMessage, messageEncryption]);

    // Handle iframe load event
    const handleIframeLoad = useCallback(() => {
        console.log('Iframe loaded from src:', src);

        sendEncryptedMessage({
            type: 'INIT_CONFIG',
            payload: {
                token,
                language
            }
        });

        setTimeout(() => requestIframeHeight(iframeRef.current), 300);
    }, [src, token, language, sendEncryptedMessage, requestIframeHeight]);

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

    // Request height when scoreboard state changes
    useEffect(() => {
        setTimeout(() => requestIframeHeight(iframeRef.current), 300);
    }, [statisticData, requestIframeHeight]);

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