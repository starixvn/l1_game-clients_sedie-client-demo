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
    const [showHomeScore, setShowHomeScore] = useState(false);
    const [showAwayScore, setShowAwayScore] = useState(false);

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

        // Reset score display when starting new round
        if (roundState === 'placingBets') {
            setShowHomeScore(false);
            setShowAwayScore(false);
        }

        // Simulate card flip animations
        if (roundState === 'showingResult') {
            setTimeout(() => setShowHomeScore(true), 500);
            setTimeout(() => setShowAwayScore(true), 1500);
        }
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

    const shouldHideCards = currentState.currentRound.roundState !== 'showingResult';
    const showHighLight = currentState.currentRound.roundState === 'showingResult';
    const isHomeHigher = currentState.currentResult.homeScore > currentState.currentResult.awayScore;
    const isAwayHigher = currentState.currentResult.awayScore > currentState.currentResult.homeScore;

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

            {/* Content Section - Mimicking settlement-result structure */}
            <div className={styles['wrapper-sport-middle']}>
                {/* Home Team Card */}
                <div className={`${styles['sport-team']} ${styles['home-team']}`}>
                    <div className={styles['sport-team-img']}>
                        <img src={`/assets/rng-soccer/teams/${currentState.teamData.home.name.toLowerCase().replace(/\s+/g, '-')}.png`} alt="home-team" />
                    </div>
                </div>

                {/* Result Section with Cards */}
                <div className={styles['sport-result']}>
                    <div className={styles['container-result']}>
                        {/* Home Card */}
                        <div className={`${styles['card-section']} ${showHighLight && isHomeHigher ? styles['winning-card'] : ''}`}>
                            <div className={styles['card']}>
                                {shouldHideCards ? (
                                    <div className={styles['card-back']}>🂠</div>
                                ) : (
                                    <div className={styles['card-front']}>
                                        {`${currentState.currentResult.home.rank}${['♠', '♥', '♦', '♣'][currentState.currentResult.home.suit - 1]}`}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score Display */}
                        <div className={styles['result-section']}>
                            <div className={`${styles['result']} ${isHomeHigher && showHighLight ? styles['higher-score'] : ''}`}>
                                <span>{showHomeScore ? currentState.currentResult.homeScore : ''}</span>
                            </div>
                            <div className={`${styles['result']} ${isAwayHigher && showHighLight ? styles['higher-score'] : ''}`}>
                                <span>{showAwayScore ? currentState.currentResult.awayScore : ''}</span>
                            </div>
                        </div>

                        {/* Away Card */}
                        <div className={`${styles['card-section']} ${showHighLight && isAwayHigher ? styles['winning-card'] : ''}`}>
                            <div className={styles['card']}>
                                {shouldHideCards ? (
                                    <div className={styles['card-back']}>🂠</div>
                                ) : (
                                    <div className={styles['card-front']}>
                                        {`${currentState.currentResult.away.rank}${['♠', '♥', '♦', '♣'][currentState.currentResult.away.suit - 1]}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Away Team Card */}
                <div className={`${styles['sport-team']} ${styles['away-team']}`}>
                    <div className={styles['sport-team-img']}>
                        <img src={`/assets/rng-soccer/teams/${currentState.teamData.away.name.toLowerCase().replace(/\s+/g, '-')}.png`} alt="away-team" />
                    </div>
                </div>
            </div>

            {/* Team Names */}
            <div className={styles['wrapper-team-name']}>
                <div className={styles['name']}>
                    {currentState.teamData.home.name}
                </div>
                <div className={styles['name']}>
                    {currentState.teamData.away.name}
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