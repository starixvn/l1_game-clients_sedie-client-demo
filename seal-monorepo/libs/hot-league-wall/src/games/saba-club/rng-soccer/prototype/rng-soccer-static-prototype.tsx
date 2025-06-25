import React, { useState, useEffect } from 'react';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import RNGSoccerBase, { RNGSoccerGameData } from './rng-soccer-base';

// Static prototype component for RNG Soccer
export const RNGSoccerStaticPrototype: React.FC<{
    onPlayButtonClick?: () => Promise<void>;
    isLoading?: boolean;
}> = ({ onPlayButtonClick, isLoading = false }) => {
    const [currentState, setCurrentState] = useState<RNGSoccerGameData>(FAKE_RNG_SOCCER_DATA);
    const [countdown, setCountdown] = useState(15);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPlayButtonVisible, setIsPlayButtonVisible] = useState(true);

    // Simulate countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    console.log('🔄 Round completed, starting new round');
                    return 20;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulate round state changes
    useEffect(() => {
        let roundState = 'placingBets';
        if (countdown <= 19) roundState = 'showingResult';
        if (countdown <= 16) roundState = 'finished';
        if (countdown <= 3) roundState = 'lockingBet';

        setCurrentState(prev => ({
            ...prev,
            currentRound: {
                ...prev.currentRound,
                roundState,
                countdownTimer: countdown,
                isLocking: roundState === 'lockingBet'
            }
        }));
    }, [countdown]);

    const handlePlayClick = async () => {
        const prototypeStartTime = performance.now();
        console.log('🎯 [PROTOTYPE_TIMING] Play button clicked in RNG SOCCER PROTOTYPE at:', new Date().toISOString());

        console.log('👁️ [PROTOTYPE_TIMING] Hiding play button overlay in PROTOTYPE...');
        setIsPlayButtonVisible(false);

        if (onPlayButtonClick) {
            console.log('🔄 [PROTOTYPE_TIMING] Calling onPlayButtonClick callback to transition to REAL APP...');
            const callbackStartTime = performance.now();

            try {
                await onPlayButtonClick();
                const callbackEndTime = performance.now();
                const callbackDuration = callbackEndTime - callbackStartTime;
                console.log(`✅ [PROTOTYPE_TIMING] onPlayButtonClick callback completed - PROTOTYPE to REAL APP transition - Duration: ${callbackDuration.toFixed(2)}ms`);
            } catch (error) {
                const callbackEndTime = performance.now();
                const callbackDuration = callbackEndTime - callbackStartTime;
                console.log(`💥 [PROTOTYPE_TIMING] onPlayButtonClick callback failed - PROTOTYPE transition error - Duration: ${callbackDuration.toFixed(2)}ms`);
                console.error('[PROTOTYPE_TIMING] Error during play button click:', error);
                // Re-show the play button if there was an error
                console.log('🔄 [PROTOTYPE_TIMING] Re-showing play button due to error - Staying in PROTOTYPE...');
                setIsPlayButtonVisible(true);
            }
        } else {
            console.log('⚠️ [PROTOTYPE_TIMING] No onPlayButtonClick callback provided - Cannot transition to REAL APP');
        }

        const prototypeEndTime = performance.now();
        const prototypeDuration = prototypeEndTime - prototypeStartTime;
        console.log(`🏁 [PROTOTYPE_TIMING] RNG SOCCER PROTOTYPE handling completed - Total duration: ${prototypeDuration.toFixed(2)}ms`);
    };

    const handleBet = (choice: string) => {
        console.log('🎯 Bet placed:', choice);

        setTimeout(() => {
            setCurrentState(prev => ({
                ...prev,
                uiState: {
                    ...prev.uiState,
                    isShowNextRoundMessage: true
                }
            }));

            setTimeout(() => {
                setCurrentState(prev => ({
                    ...prev,
                    uiState: {
                        ...prev.uiState,
                        isShowNextRoundMessage: false
                    }
                }));
            }, 3000);
        }, 1000);
    };

    const togglePopup = () => {
        console.log('📊 Toggle popup');
        setIsPopupVisible(!isPopupVisible);
    };

    return (
        <RNGSoccerBase
            gameData={currentState}
            onBetClick={handleBet}
            onStatisticsClick={togglePopup}
            showPlayOverlay={isPlayButtonVisible}
            onPlayClick={handlePlayClick}
            isInteractive={true}
            showStatisticsPopup={isPopupVisible}
            onCloseStatistics={togglePopup}
            isLoading={isLoading}
        />
    );
};

export default RNGSoccerStaticPrototype; 