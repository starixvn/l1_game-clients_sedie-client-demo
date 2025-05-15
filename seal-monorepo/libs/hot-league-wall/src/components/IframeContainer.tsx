import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import BetPanel, { BetPanelState } from './BetPanel';

interface IframeContainerProps {
    src: string;
    onMessage?: (data: any) => void;
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
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const lastRequestTimeRef = useRef<number>(0);
    const lastHeightRef = useRef<number>(264);
    const updateCountRef = useRef<number>(0);
    const panelRef = useRef<HTMLDivElement>(null);

    // Function to request height from iframe
    const requestIframeHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;

        // Prevent requesting height too frequently
        const now = Date.now();
        if (now - lastRequestTimeRef.current < 500) return;
        lastRequestTimeRef.current = now;

        // Prevent too many requests
        updateCountRef.current++;
        if (updateCountRef.current > 10) {
            console.warn('Too many height requests, stopping');
            return;
        }

        iframe.contentWindow.postMessage({ type: 'GET_HEIGHT' }, '*');
    }, []);

    // Reset update count periodically
    useEffect(() => {
        const resetInterval = setInterval(() => {
            updateCountRef.current = 0;
        }, 5000);

        return () => clearInterval(resetInterval);
    }, []);

    // Function to toggle statistic in iframe
    const toggleStatistic = useCallback((isOpen: boolean) => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
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
        // Only process messages from expected origins
        if (!event.origin.includes('localhost:4200') && !event.origin.includes('localhost:4201')) {
            return;
        }

        try {
            const data = event.data;

            // Handle height update message
            if (data.type === 'SET_HEIGHT' && typeof data.height === 'number') {
                // Only update if height changed significantly
                if (Math.abs(data.height - lastHeightRef.current) >= 5) {
                    lastHeightRef.current = data.height;
                    setIframeHeight(data.height);
                }
            }

            // Handle bet panel state updates
            if (data.type === 'BET_PANEL_STATE') {
                setBetPanelState(data.state);
                setIsPanelVisible(true);
            }

            // Handle bet panel hide
            if (data.type === 'HIDE_BET_PANEL') {
                console.log('Parent: Received HIDE_BET_PANEL message');
                setIsPanelVisible(false);
                setBetPanelState(null);
            }

            // Handle betting block state updates
            if (data.type === 'BETTING_BLOCK_STATE') {
                const { isShowBetSlip, betChoice, odd } = data.state;
                if (!isShowBetSlip) {
                    setIsPanelVisible(false);
                    setBetPanelState(null);
                }
            }

            onMessage?.(data);
        } catch (error) {
            console.error('Parent: Error processing message:', error);
        }
    }, [onMessage]);

    // Handle iframe load event
    const handleIframeLoad = useCallback(() => {
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

    // Handle click outside to close panel
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                console.log('Parent: Click outside detected');
                setIsPanelVisible(false);
                setBetPanelState(null);
                if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'HIDE_BET_PANEL'
                    }, '*');
                }
            }
        };

        if (isPanelVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPanelVisible]);

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
                {portalContainerRef.current && betPanelState && isPanelVisible && createPortal(
                    <BetPanel
                        betPanelState={betPanelState}
                        isPanelVisible={isPanelVisible}
                        panelRef={panelRef}
                        onClose={() => setIsPanelVisible(false)}
                        onBet={handleBet}
                        onInputChange={handleInputChange}
                        onClear={handleClear}
                        onHidePanel={() => {
                            setIsPanelVisible(false);
                            if (iframeRef.current?.contentWindow) {
                                iframeRef.current.contentWindow.postMessage({
                                    type: 'HIDE_BET_PANEL'
                                }, '*');
                            }
                        }}
                    />,
                    portalContainerRef.current
                )}
            </div>
        </CustomContainer>
    );
};

export default IframeContainer;