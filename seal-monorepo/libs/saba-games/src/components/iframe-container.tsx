import React, { useCallback, useRef, useEffect } from 'react';
import { useIframeHeight } from '../hooks/use-iframe-height';
import { BettingPanelPortal } from './bet-panel/betting-panel-portal';
import { ConfirmBetPortal } from './confirm-bet/confirm-bet-portal';
import { MessageEncryption } from '../utils/encryption';
import { useStatisticData } from '../hooks/use-message-data';

interface IframeContainerProps {
    src: string;
    token: string;
    language: string;
    // renewToken?: Function;
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


const IframeContainer: React.FC<IframeContainerProps> = ({
    src,
    token,
    language,
    // renewToken,
    encryptionKey
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const statisticData = useStatisticData();
    const { iframeHeight, requestIframeHeight } = useIframeHeight();

    const messageEncryption = new MessageEncryption(encryptionKey);

    const sendEncryptedMessage = useCallback((data: any) => {
        if (!iframeRef.current?.contentWindow) return;

        const encryptedMessage = messageEncryption.encrypt(data);
        iframeRef.current.contentWindow.postMessage(encryptedMessage, '*');
    }, [messageEncryption]);

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