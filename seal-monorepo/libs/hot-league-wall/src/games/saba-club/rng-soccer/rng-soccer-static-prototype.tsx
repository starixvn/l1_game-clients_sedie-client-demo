import React, { useState, useEffect } from 'react';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import { RNGSoccerChoices } from './type';
import styles from './rng-soccer.module.scss';
import rngSoccerStyles from './bet-option/rng-soccer-bet-options.module.scss';

// Static prototype component for RNG Soccer
export const RNGSoccerStaticPrototype: React.FC = () => {
    const [currentState, setCurrentState] = useState(FAKE_RNG_SOCCER_DATA);
    const [countdown, setCountdown] = useState(15);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [showBetPanel, setShowBetPanel] = useState(false);
    const [activePanelId, setActivePanelId] = useState<string | null>(null);

    // Simulate countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    console.log('🔄 Round completed, starting new round');
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Simulate round state changes
    useEffect(() => {
        let roundState = 'placingBets';
        if (countdown <= 10) roundState = 'lockingBet';
        if (countdown <= 5) roundState = 'showingResult';
        if (countdown <= 1) roundState = 'finished';

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

    const handleBet = (choice: string) => {
        console.log('🎯 Bet placed:', choice);
        setShowBetPanel(false);
        setActivePanelId(null);

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

    const getRoundStateText = () => {
        switch (currentState.currentRound.roundState) {
            case 'placingBets': return 'Place Your Bets';
            case 'lockingBet': return 'Betting Locked';
            case 'showingResult': return 'Showing Result';
            case 'finished': return 'Round Finished';
            default: return 'Waiting...';
        }
    };

    const getRoundStateClass = () => {
        switch (currentState.currentRound.roundState) {
            case 'placingBets': return styles['placing-bet'];
            case 'lockingBet': return styles['locking-bet'];
            case 'showingResult': return styles['showing-result'];
            case 'finished': return styles['finished'];
            default: return '';
        }
    };

    return (
        <div className={styles['sport-item']}>
            {/* Header Section */}
            <div className={styles['wrapper-sport-top']}>
                <div className={styles['game-name']}>
                    <div className={styles['game-name-text']}>
                        {currentState.gameSettings.gameName}
                        <span className={styles['live-icon']}>🔴</span>
                    </div>
                    <div className={styles['game-name-round']}>
                        Round #{currentState.currentRound.roundId}
                    </div>
                </div>
                <div className={styles['timer']}>
                    <div className={getRoundStateClass()}>
                        {getRoundStateText()}
                    </div>
                    <div className={styles['countdown']}>
                        {countdown}s
                    </div>
                </div>
                <div className={styles['score-board-img']} onClick={togglePopup}>
                    📊
                </div>
            </div>

            {/* Content Section */}
            <div className={styles['wrapper-sport-content']}>
                <div className={styles['settlement-result']}>
                    {currentState.currentRound.roundState === 'showingResult' && (
                        <div className={styles['result-display']}>
                            <div className={styles['team-scores']}>
                                <div className={styles['team']}>
                                    <span>Home</span>
                                    <span>{currentState.currentResult.homeScore}</span>
                                </div>
                                <div>VS</div>
                                <div className={styles['team']}>
                                    <span>Away</span>
                                    <span>{currentState.currentResult.awayScore}</span>
                                </div>
                            </div>
                            <div className={styles['winner']}>
                                Winner: {currentState.settlementResult.home ? 'Home' :
                                    currentState.settlementResult.away ? 'Away' : 'Draw'}
                            </div>
                        </div>
                    )}
                    {currentState.currentRound.roundState !== 'showingResult' && (
                        <div className={styles['waiting-for-result']}>
                            <div>Waiting for result...</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Section */}
            <div className={styles['wrapper-sport-bottom']}>
                <div className={rngSoccerStyles['bet-options-wrapper']}>
                    <div className={rngSoccerStyles['bet-options-container']}>
                        {Object.values(RNGSoccerChoices).map((choice) => (
                            <div className={rngSoccerStyles['bets-bg']} key={choice}>
                                <div className={`${styles['container-bets']} ${rngSoccerStyles['padding-bet']}`}>
                                    <span className={rngSoccerStyles['bet-choice-text']}>
                                        {choice.charAt(0).toUpperCase() + choice.slice(1)}
                                    </span>
                                    <div className={styles['odds']}>
                                        {currentState.roundOdds.odds[choice]}
                                    </div>
                                    <button
                                        onClick={() => handleBet(choice)}
                                        disabled={currentState.currentRound.roundState !== 'placingBets'}
                                    >
                                        Bet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Statistics Popup */}
            {isPopupVisible && (
                <div className={`${styles['wrapper-popup']} ${styles['active']}`}>
                    <div className={styles['close-popup']} onClick={togglePopup}>
                        <span>×</span>
                    </div>
                    <div className={styles['statistics-content']}>
                        <h3>Round History</h3>
                        <div className={styles['history-list']}>
                            {currentState.roundHistory.slice(0, 10).map((round) => (
                                <div key={round.roundId} className={styles['history-item']}>
                                    <span>Round #{round.roundId}</span>
                                    <span>
                                        {round.settlementResult.home ? 'Home' :
                                            round.settlementResult.away ? 'Away' : 'Draw'}
                                    </span>
                                    <span>{round.result.homeScore}-{round.result.awayScore}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Next Round Message */}
            {currentState.uiState.isShowNextRoundMessage && (
                <div className={styles['next-round-message']}>
                    Bet placed successfully! Next round starting soon...
                </div>
            )}
        </div>
    );
};

export default RNGSoccerStaticPrototype; 