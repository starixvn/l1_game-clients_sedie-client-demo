import { useState, useCallback } from 'react';
import { BetPanelState } from '../types/betting';

export const useBettingPanel = () => {
    const [betPanelState, setBetPanelState] = useState<BetPanelState | null>(null);

    const handleBettingMessage = useCallback((data: any) => {
        switch (data.type) {
            case 'BET_PANEL_STATE':
                console.log('Received BET_PANEL_STATE message:', data.state);
                const { isShowBetSlip, betChoice, odd, top, left, currency, min, max, gameName, namespace, clientRoundId, isSpecialChoice } = data.state;
                if (isShowBetSlip) {
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
                        warnMsg: ''
                    });
                } else {
                    setBetPanelState(null);
                }
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

    const handlePanelClose = useCallback(() => {
        setBetPanelState(null);
    }, []);

    return {
        betPanelState,
        handleBettingMessage,
        handlePanelClose
    };
}; 