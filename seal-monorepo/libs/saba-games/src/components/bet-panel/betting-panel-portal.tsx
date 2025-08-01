import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BetPanel } from '.';
import { BetPanelState } from '.';
import { useBetPanelData, useBettingBlockData } from '../../hooks/use-message-data';

interface BettingPanelPortalProps {
    iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const BettingPanelPortal = ({ iframeRef }: BettingPanelPortalProps): JSX.Element => {
    const betPanelData = useBetPanelData();
    const bettingBlockData = useBettingBlockData();
    const [isContainerReady, setIsContainerReady] = useState(false);
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
    }, []);

    if (!isContainerReady || !portalContainerRef.current || !betPanelData) {
        return <></>;
    }

    return createPortal(
        <div style={{
            position: 'absolute',
            top: `${betPanelData?.top}px`,
            left: `${betPanelData?.left}px`,
            pointerEvents: 'auto',
            zIndex: 9999
        }}>
            {bettingBlockData?.isShowBetSlip && betPanelData && <BetPanel
                betPanelState={betPanelData as BetPanelState}
                panelRef={panelRef}
                iframeRef={iframeRef}
            />}
        </div>,
        portalContainerRef.current
    );
}; 