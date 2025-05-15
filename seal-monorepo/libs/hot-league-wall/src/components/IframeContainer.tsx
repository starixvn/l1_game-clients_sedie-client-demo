import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

interface IframeContainerProps {
    src: string;
    onMessage?: (data: any) => void;
}

interface BetPanelState {
    top: number;
    left: number;
    betChoice: string;
    odd: number;
    amount: number;
    currency: string;
    min: number;
    max: number;
    payout: string;
    gameName: string;
    namespace: string;
    clientRoundId: number;
    isSpecialChoice: boolean;
    warnMsg: string;
}

const CustomContainer: React.FC<{ fluid?: boolean | 'xl', className?: string, children: React.ReactNode }> = ({
    fluid = false,
    className = '',
    children
}) => {
    const containerClass = `container${fluid ? '-fluid' : ''} ${className}`.trim();
    return <div className={containerClass}>{children}</div>;
};

const IframeContainer: React.FC<IframeContainerProps> = ({ src, onMessage }) => {
    const [iframeHeight, setIframeHeight] = useState<number>(264);
    const [betPanelState, setBetPanelState] = useState<BetPanelState | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const portalContainerRef = useRef<HTMLDivElement | null>(null);

    // Function to request height from iframe
    const requestIframeHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            console.log('Parent: Requesting height from iframe');
            iframe.contentWindow.postMessage({ type: 'GET_HEIGHT' }, '*');
        }
    }, []);

    // Function to toggle statistic in iframe
    const toggleStatistic = useCallback((isOpen: boolean) => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            console.log('Parent: Sending toggle statistic message:', isOpen);
            iframe.contentWindow.postMessage({
                type: 'TOGGLE_STATISTIC',
                isOpen: isOpen
            }, '*');
            // Request height update after animation completes
            setTimeout(requestIframeHeight, 300);
        }
    }, [requestIframeHeight]);

    // Handle incoming messages from the iframe
    const handleMessage = useCallback((event: MessageEvent) => {
        console.log('Parent: Received message:', event.data, 'from origin:', event.origin);

        try {
            const data = event.data;

            // Handle height update message
            if (data.type === 'SET_HEIGHT' && typeof data.height === 'number') {
                console.log('Parent: Setting new height from message:', data.height);
                // Add small buffer for safety
                setIframeHeight(data.height + 5);
            }

            // Handle bet panel state updates
            if (data.type === 'BET_PANEL_STATE') {
                setBetPanelState(data.state);
            }

            onMessage?.(data);
        } catch (error) {
            console.error('Parent: Error processing message:', error);
        }
    }, [onMessage]);

    // Handle iframe load event
    const handleIframeLoad = useCallback(() => {
        console.log('Parent: Iframe loaded, requesting initial height');
        // Wait longer for content to fully render
        setTimeout(requestIframeHeight, 500);
    }, [requestIframeHeight]);

    useEffect(() => {
        console.log('Parent: Setting up message listener');
        window.addEventListener('message', handleMessage);

        return () => {
            console.log('Parent: Cleaning up message listener');
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);

    // Create portal container on mount
    useEffect(() => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
        portalContainerRef.current = container;

        return () => {
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
            }
        };
    }, []);

    // Expose toggleStatistic to window for external access
    useEffect(() => {
        (window as any).toggleIframeStatistic = toggleStatistic;
        return () => {
            delete (window as any).toggleIframeStatistic;
        };
    }, [toggleStatistic]);

    const handleBet = useCallback((amount: number, betChoice: string) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'HANDLE_BET',
                amount,
                betChoice
            }, '*');
        }
    }, []);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'HANDLE_INPUT_CHANGE',
                value: event.target.value
            }, '*');
        }
    }, []);

    const handleClear = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'HANDLE_CLEAR'
            }, '*');
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
                        height: `${iframeHeight + 20}px`,
                        border: 'none',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'block'
                    }}
                    scrolling="no"
                    title="External Content"
                    onLoad={handleIframeLoad}
                />
                {portalContainerRef.current && betPanelState && createPortal(
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 9999,
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        width: '90%',
                        maxWidth: '600px'
                    }}>
                        <div className="c-quick-bet c-quick-bet--bottom-left">
                            <div className="c-quick-bet__btn"></div>
                            <div className={classNames('c-quick-bet__panel', {
                                ['sg-bet-panel__left-dec-100']: betPanelState.isSpecialChoice,
                            })}>
                                <div className="c-betslip">
                                    <div className="c-betslip__content">
                                        <div className="c-betting-scroller">
                                            <div className="c-betting-group" data-status="default">
                                                <div className="c-betting" data-open="true">
                                                    <div className="c-ticket" data-status="default" data-open="true">
                                                        <div className="c-ticket__header">
                                                            <span className="c-text-bettype sg-bet-panel__header-flex">
                                                                <div className={`sg-bet-panel__game-icon ${betPanelState.namespace}-icon`}></div>
                                                                <div>
                                                                    <div className="game-name">{betPanelState.gameName}</div>
                                                                    <div className="bet-option">{betPanelState.betChoice}</div>
                                                                </div>
                                                            </span>
                                                        </div>
                                                        <div className="c-ticket__main">
                                                            <div className="c-ticket__choice">
                                                                <span className="c-text-betchoice">{betPanelState.betChoice}</span>
                                                            </div>
                                                            <div className="c-ticket__odds">
                                                                <span className="c-text-odds">
                                                                    @
                                                                    <span className="c-odds sg-bet-panel__text-bold" data-odds-status="default">
                                                                        {betPanelState.odd}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {betPanelState.warnMsg && (
                                                            <div className="c-ticket__status">
                                                                <div className="c-betting-msg sg-bet-panel__betting-msg">
                                                                    <i className="c-icon c-icon--warning" data-icon="warning" />
                                                                    <span className="c-text">{betPanelState.warnMsg}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="c-betting-stake-group">
                                                        <div className="c-betting-stake">
                                                            <div className="c-textfield c-textfield--stake" data-focus="true">
                                                                <input
                                                                    type="text"
                                                                    className="c-textfield__input"
                                                                    placeholder={`${betPanelState.min} - ${betPanelState.max}`}
                                                                    value={betPanelState.amount}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="c-textfield__currency">{betPanelState.currency}</span>
                                                                <span className="c-textfield__bg"></span>
                                                                <a className="c-btn c-btn--clear" aria-hidden="true" onClick={handleClear}>
                                                                    <i className="c-icon c-icon--clear-solid"></i>
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="c-betting-stake-info">
                                                            <span className="c-text-group">
                                                                <span className="c-text-label">Payout: </span>
                                                                <span className="c-text-value">{betPanelState.payout}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="c-betting-submit">
                                                    <button
                                                        className="c-btn c-btn--bet"
                                                        data-disabled={false}
                                                        aria-hidden="true"
                                                        onClick={() => handleBet(betPanelState.amount, betPanelState.betChoice)}
                                                    >
                                                        <span className="c-text">Bet</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    portalContainerRef.current
                )}
            </div>
        </CustomContainer>
    );
};

export default IframeContainer;