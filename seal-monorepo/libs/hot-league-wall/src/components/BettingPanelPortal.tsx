import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import BetPanel from './BetPanel';
import { BetPanelState } from '../types/betting';

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

        return () => {
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
                setIsContainerReady(false);
            }
        };
    }, []);

    // Debug log to check state
    useEffect(() => {
        console.log('BettingPanelPortal state:', {
            isContainerReady,
            isShowBetSlip: betPanelState.isShowBetSlip,
            betPanelState
        });
    }, [isContainerReady, betPanelState]);

    if (!isContainerReady || !betPanelState.isShowBetSlip || !portalContainerRef.current) {
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
                onClose={onClose}
                onBet={onBet}
                onInputChange={onInputChange}
                onClear={onClear}
                onHidePanel={onClose}
            />
        </div>,
        portalContainerRef.current
    );
}; 