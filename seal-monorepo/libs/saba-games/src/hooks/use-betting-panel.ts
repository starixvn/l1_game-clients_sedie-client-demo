import { useState, useCallback } from 'react';
import { BetPanelState } from '../components/bet-panel';

export const useBettingPanel = () => {
    const [betPanelState, setBetPanelState] = useState<BetPanelState | null>(null);

    const handleBettingMessage = useCallback((data: any) => {
        switch (data.type) {
            case 'BET_PANEL_STATE':
                console.log('Received BET_PANEL_STATE message:', data.state);
                const { isShowBetSlip, betChoice, odd, top, left, currency, min, max, gameName, namespace, clientRoundId, isSpecialChoice, clientSeed } = data.state;

                // If we're hiding the panel, clear the state
                if (!isShowBetSlip) {
                    setBetPanelState(null);
                    return;
                }

                // Otherwise, update the state with the new panel data
                setBetPanelState({
                    isShowBetSlip: true, // Force to true when receiving state
                    betChoice,
                    odd,
                    top,
                    left,
                    amount: 0,
                    currency: currency || '',
                    min: min || 0,
                    max: max || 0,
                    payout: '0.00',
                    gameName: gameName || '',
                    namespace: namespace || '',
                    clientRoundId: clientRoundId || 0,
                    isSpecialChoice: isSpecialChoice || false,
                    warnMsg: '',
                    clientSeed: clientSeed || ''
                });
                break;

            case 'HIDE_BET_PANEL':
                setBetPanelState(null);
                break;

            case 'HIDE_ALL_BET_PANELS':
                setBetPanelState(null);
                break;

            default:
                return;
        }
    }, []);

    return {
        betPanelState,
        handleBettingMessage,
    };
}; 