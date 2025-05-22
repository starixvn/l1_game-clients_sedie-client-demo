import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BetPanel, { BetPanelState } from './BetPanel';

interface BettingPanelPortalProps {
    betPanelState: BetPanelState;
    onClose: () => void;
    onBet: (amount: number, betChoice: string) => void;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}

export const BettingPanelPortal: React.FC<BettingPanelPortalProps> = ({
    betPanelState,
    onClose,
    onBet,
    onInputChange,
    onClear
}) => {
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

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

    if (!portalContainerRef.current || !betPanelState.isShowBetSlip) {
        return null;
    }

    return createPortal(
        <BetPanel
            betPanelState={betPanelState}
            isPanelVisible={betPanelState.isShowBetSlip}
            panelRef={panelRef}
            onClose={onClose}
            onBet={onBet}
            onInputChange={onInputChange}
            onClear={onClear}
            onHidePanel={onClose}
        />,
        portalContainerRef.current
    );
}; 