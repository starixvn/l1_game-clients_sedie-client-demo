import { useState, useCallback, useRef, useEffect } from 'react';
import { IBetPanelState, IBetPanelConfig, IBetPanelPosition } from '../types/bet-panel.types';
import { calculateBetPanelState } from '../utils/bet-panel.utils';

export const useBetPanel = (
    config: IBetPanelConfig,
    betChoice: string,
    odd: number,
    gameName: string,
    namespace: string
) => {
    const [isShowBetSlip, setIsShowBetSlip] = useState(false);
    const bettingBlockRef = useRef<HTMLDivElement>(null);

    const getBetPanelPosition = useCallback((): IBetPanelPosition => {
        if (bettingBlockRef.current) {
            const rect = bettingBlockRef.current.getBoundingClientRect();
            return {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            };
        }
        return { top: 0, left: 0 };
    }, []);

    const sendBetPanelState = useCallback(() => {
        const position = getBetPanelPosition();
        const panelState = calculateBetPanelState(
            config,
            betChoice,
            odd,
            gameName,
            namespace,
            position,
            !isShowBetSlip
        );

        window.parent.postMessage({
            type: 'BET_PANEL_STATE',
            state: panelState
        }, '*');
    }, [config, betChoice, odd, gameName, namespace, isShowBetSlip, getBetPanelPosition]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (bettingBlockRef.current && !bettingBlockRef.current.contains(event.target as Node)) {
            setIsShowBetSlip(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    return {
        isShowBetSlip,
        setIsShowBetSlip,
        bettingBlockRef,
        sendBetPanelState
    };
}; 