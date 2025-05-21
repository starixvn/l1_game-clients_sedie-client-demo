import { useCallback, useRef } from 'react';
import { Auth, Connection, Rounds } from '@sg/sg-game-client';
import { sendBettingBlockState, sendHideAllBetPanels } from '../../../_shared/utils/window-message-util';

export const useBettingBlock = (
    betChoice: string,
    odd: number,
    isAuthorized: boolean,
    isSignedIn: boolean,
    isShowBetSlip: boolean,
    onBet: () => void,
    setPanelId: (id: string | null) => void,
    panelId: string | null,
    bettingBlockRef: React.RefObject<HTMLDivElement>
) => {
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const maxTimeoutDuration = 10000;

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            bettingBlockRef.current &&
            !bettingBlockRef.current.contains(event.target as Node) &&
            panelId === betChoice
        ) {
            setPanelId(null);
            notifyParentState();
        }
    }, [betChoice, panelId, setPanelId]);

    const notifyParentState = useCallback(() => {
        sendBettingBlockState({
            isShowBetSlip,
            betChoice,
            odd
        });
    }, [isShowBetSlip, betChoice, odd]);

    const handleOnClick = useCallback(() => {
        if (!isShowBetSlip) {
            onBet();
        }

        if (!isAuthorized) {
            autoCreateNickname();
        }

        if (panelId === betChoice) {
            setPanelId(null);
        } else {
            setPanelId(betChoice);
        }

        waitForAuthorization(betChoice, odd);
        notifyParentState();
    }, [isShowBetSlip, isAuthorized, panelId, betChoice, setPanelId, onBet, odd, notifyParentState]);

    const waitForAuthorization = useCallback((betChoice: string, odd: number) => {
        const interval = 100;
        const startTime = Date.now();
        clearTimeout();

        const checkAuthorization = () => {
            if (isAuthorized) {
                handleUserSignIn();
                updateBettingState(betChoice, odd);
                clearTimeout();
            } else if (Date.now() - startTime < maxTimeoutDuration) {
                timeoutId.current = setTimeout(checkAuthorization, interval);
            }
        };

        timeoutId.current = setTimeout(checkAuthorization, interval);
    }, [isAuthorized]);

    const handleUserSignIn = useCallback(() => {
        if (!isSignedIn) {
            signIn();
        }
    }, [isSignedIn]);

    const clearTimeout = useCallback(() => {
        if (timeoutId.current) {
            window.clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
    }, []);

    const autoCreateNickname = useCallback(() => {
        // Implement auto create nickname logic
    }, []);

    const signIn = useCallback(() => {
        // Implement sign in logic
    }, []);

    const updateBettingState = useCallback((betChoice: string, odd: number) => {
        // Implement update betting state logic
    }, []);

    return {
        handleClickOutside,
        handleOnClick,
        clearTimeout
    };
}; 