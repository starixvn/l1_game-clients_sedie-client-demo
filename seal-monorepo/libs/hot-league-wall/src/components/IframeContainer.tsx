import React, { useCallback, useRef } from 'react';
import { useIframeHeight } from '../hooks/useIframeHeight';
import { useBettingPanel } from '../hooks/useBettingPanel';
import { useIframeMessageHandler } from '../hooks/useIframeMessageHandler';
import { BettingPanelPortal } from './BettingPanelPortal';

interface IframeContainerProps {
    src: string;
    token: string;
    language: string;
    renewToken?: Function;
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
    renewToken
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { iframeHeight, requestIframeHeight, handleHeightMessage } = useIframeHeight();
    const { betPanelState, handleBettingMessage, handlePanelClose } = useBettingPanel();

    const { handleMessage } = useIframeMessageHandler({
        onHeightMessage: handleHeightMessage,
        onBettingMessage: handleBettingMessage
    });

    // Handle iframe load event
    const handleIframeLoad = useCallback(() => {
        // Wait longer for content to fully render
        setTimeout(() => requestIframeHeight(iframeRef.current), 500);
    }, [requestIframeHeight]);

    const handleBet = useCallback((amount: number, betChoice: string) => {
        if (iframeRef.current?.contentWindow) {
            // iframeRef.current.contentWindow.postMessage({
            //     type: 'HANDLE_BET',
            //     amount,
            //     betChoice
            // }, '*');
        }
    }, []);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (iframeRef.current?.contentWindow) {
            // iframeRef.current.contentWindow.postMessage({
            //     type: 'HANDLE_INPUT_CHANGE',
            //     value: event.target.value
            // }, '*');
        }
    }, []);

    const handleClear = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            // iframeRef.current.contentWindow.postMessage({
            //     type: 'HANDLE_CLEAR'
            // }, '*');
        }
    }, []);

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
                />
                {betPanelState && (
                    <BettingPanelPortal
                        betPanelState={betPanelState}
                        onClose={handlePanelClose}
                        onBet={handleBet}
                        onInputChange={handleInputChange}
                        onClear={handleClear}
                    />
                )}
            </div>
        </CustomContainer>
    );
};

export default IframeContainer;