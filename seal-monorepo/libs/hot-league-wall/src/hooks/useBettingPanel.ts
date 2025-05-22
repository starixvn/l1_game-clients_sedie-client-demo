import { useState, useCallback } from 'react';
import { BetPanelState } from '../components/BetPanel';

export const useBettingPanel = () => {
    const [betPanelState, setBetPanelState] = useState<BetPanelState | null>(null);

    const handleBettingMessage = useCallback((data: any) => {
        switch (data.type) {
            case 'BETTING_BLOCK_STATE':
                const { isShowBetSlip, betChoice, odd, position } = data.state;
                if (isShowBetSlip) {
                    setBetPanelState({
                        isShowBetSlip,
                        betChoice,
                        odd,
                        top: position?.top || 0,
                        left: position?.left || 0,
                        amount: 0,
                        currency: '',
                        min: 0,
                        max: 0,
                        payout: '0.00',
                        gameName: '',
                        namespace: '',
                        clientRoundId: 0,
                        isSpecialChoice: false,
                        warnMsg: ''
                    });
                } else {
                    setBetPanelState(null);
                }
                break;

            case 'BET_PANEL_STATE':
                setBetPanelState({
                    ...data.state,
                    isShowBetSlip: true
                });
                break;

            case 'HIDE_BET_PANEL':
            case 'HIDE_ALL_BET_PANELS':
                setBetPanelState(null);
                break;
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