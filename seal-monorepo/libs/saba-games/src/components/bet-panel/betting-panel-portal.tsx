import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BetPanel } from '.';
import { BetPanelState } from '.';

interface BettingPanelPortalProps {
    betPanelState: BetPanelState;
    iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const BettingPanelPortal: React.FC<BettingPanelPortalProps> = ({
    betPanelState,
    iframeRef
}) => {
    const [isContainerReady, setIsContainerReady] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Create container immediately
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
        setIsContainerReady(true);

        const handleMessage = (event: MessageEvent) => {
            switch (event.data.type) {
                case 'HIDE_PANEL':
                case 'HIDE_BET_PANEL':
                case 'HIDE_ALL_BET_PANELS':
                    setIsVisible(false);
                    break;
                case 'SHOW_BET_PANEL':
                    setIsVisible(true);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
                setIsContainerReady(false);
            }
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Reset visibility when betPanelState changes
    useEffect(() => {
        if (betPanelState?.isShowBetSlip) {
            setIsVisible(true);
        }
    }, [betPanelState]);

    if (!isContainerReady || !betPanelState?.isShowBetSlip || !portalContainerRef.current || !isVisible) {
        return null;
    }

    return createPortal(
        <div style={{
            position: 'absolute',
            top: `${betPanelState.top}px`,
            left: `${betPanelState.left}px`,
            pointerEvents: 'auto',
            zIndex: 9999
        }}>
            <BetPanel
                betPanelState={betPanelState}
                isPanelVisible={betPanelState.isShowBetSlip}
                panelRef={panelRef}
                iframeRef={iframeRef}
            />
        </div>,
        portalContainerRef.current
    );
}; 