import { useState, useCallback } from 'react';
import { BetPanelState } from '../components/BetPanel';

export const useBettingPanel = () => {
    const [betPanelState, setBetPanelState] = useState<BetPanelState | null>(null);

    const handleBettingMessage = useCallback((data: any) => {
        switch (data.type) {
            case 'BET_PANEL_STATE':
                console.log('Received BET_PANEL_STATE message:', data.state);
                const { isShowBetSlip, betChoice, odd, top, left, currency, min, max, gameName, namespace, clientRoundId, isSpecialChoice, clientSeed } = data.state;
                setBetPanelState({
                    isShowBetSlip,
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

            // case 'BET_PANEL_STATE':
            //     setBetPanelState({
            //         ...data.state,
            //         isShowBetSlip: true
            //     });
            //     break;

            // case 'HIDE_BET_PANEL':
            // case 'HIDE_ALL_BET_PANELS':
            //     setBetPanelState(null);
            //     break;
            default: return;
        }
    }, []);

    return {
        betPanelState,
        handleBettingMessage,
    };
}; 