import React, { useState, useEffect } from 'react';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import RNGSoccerBase, { RNGSoccerGameData } from './rng-soccer-base';

// Static prototype component for RNG Soccer
export const RNGSoccerStaticPrototype: React.FC<{ onPlayButtonClick?: () => void }> = ({ onPlayButtonClick }) => {
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

    const handlePlayClick = () => {
        setIsPlayButtonVisible(false);
        if (onPlayButtonClick) {
            onPlayButtonClick();
        }
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
        />
    );
};

export default RNGSoccerStaticPrototype; 