import React, { useState, useEffect } from 'react';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import { RNGSoccerChoices } from './type';
import styles from './rng-soccer.module.scss';
import settlementStyles from './settlement-result/rng-soccer-animations.module.scss';
import betOptionStyles from './bet-option/rng-soccer-bet-options.module.scss';

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
                    <div className={styles['count-down']}>
                        {countdown}s
                    </div>
                </div>
                <div className={styles['score-board-img']} onClick={togglePopup}>
                    📊
                </div>
            </div>

            {/* Content Section - Using settlement-result styles */}
            <div className={styles['wrapper-sport-middle']}>
                <div className={styles['sport-result']}>
                    <div className={styles['container-result']}>
                        {currentState.currentRound.roundState === 'showingResult' && (
                            <div className={settlementStyles['rng-soccer-result']}>
                                <div className={settlementStyles['score-display']}>
                                    <div className={settlementStyles['team-name']}>Home</div>
                                    <div className={settlementStyles['score']}>
                                        {currentState.currentResult.homeScore}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>VS</div>
                                    <div className={settlementStyles['score']}>
                                        {currentState.currentResult.awayScore}
                                    </div>
                                    <div className={settlementStyles['team-name']}>Away</div>
                                </div>
                                <div className={settlementStyles['winning-symbols']}>
                                    Winner: {currentState.settlementResult.home ? 'Home' :
                                        currentState.settlementResult.away ? 'Away' : 'Draw'}
                                </div>
                            </div>
                        )}
                        {currentState.currentRound.roundState !== 'showingResult' && (
                            <div className={styles['result-section']}>
                                <div className={styles['dots']}></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Section - Using bet-option styles */}
            <div className={styles['wrapper-sport-bottom']}>
                <div className={betOptionStyles['bet-options-wrapper']}>
                    <div className={betOptionStyles['bet-options-container']}>
                        {Object.entries(currentState.roundOdds.odds).map(([choice, odd]) => (
                            <div
                                key={choice}
                                className={betOptionStyles['bets-bg']}
                                data-choice={choice}
                                onClick={() => handleBet(choice)}
                                style={{
                                    cursor: currentState.currentRound.roundState === 'placingBets' ? 'pointer' : 'not-allowed',
                                    opacity: currentState.currentRound.roundState === 'placingBets' ? 1 : 0.6
                                }}
                            >
                                <div className={betOptionStyles['padding-bet']}>
                                    <span className={betOptionStyles['bet-choice-text']}>
                                        {choice.charAt(0).toUpperCase() + choice.slice(1)}
                                    </span>
                                    <span className={betOptionStyles['bet-option']}>{odd}</span>
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
                    <div className={styles['block-wrapper']}>
                        <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>Round History</h3>
                        <div className={styles['info-block']}>
                            {currentState.roundHistory.slice(0, 10).map((round) => (
                                <div key={round.roundId} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}>
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
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    zIndex: 1000,
                    textAlign: 'center'
                }}>
                    Bet placed successfully! Next round starting soon...
                </div>
            )}
        </div>
    );
};

export default RNGSoccerStaticPrototype; 