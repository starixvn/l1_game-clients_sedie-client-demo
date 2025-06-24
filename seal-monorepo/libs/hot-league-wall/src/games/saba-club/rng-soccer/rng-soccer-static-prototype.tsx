import React, { useState, useEffect } from 'react';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import { RNGSoccerChoices } from './type';
import styles from './rng-soccer.module.scss';
import gameBaseStyles from '../../game-base/game-base.module.scss';
import countDownTimerStyles from '../../../_shared/components/count-down-timer/count-down-timer.module.scss';
import settlementStyles from './settlement-result/rng-soccer-animations.module.scss';
import betOptionStyles from './bet-option/rng-soccer-bet-options.module.scss';
import cardStyles from '../../../_shared/components/card/card.module.scss';
import flipCardStyles from '../../../_shared/components/card/flip-card/flip-card.module.scss';
import Card from '../../../_shared/components/card';
import CardBack from '../../../_shared/components/card/card-back';
import { CardResult } from '../../../_shared/components/card/type';
import TeamCard, { TeamCardAnimation } from './settlement-result/components/team-card';
import { TeamUtils } from './settlement-result/utils/team-utils';
import { RoundId } from '../../../_shared/components/round-id';

// Function to get team logo using TeamUtils
const getTeamLogo = (teamName: string): string => {
    // Try to find the team abbreviation by matching the full name
    const teamEntry = Object.entries(TeamUtils.TEAM_INFO).find(
        ([_, info]) => info.fullName === teamName
    );

    if (teamEntry) {
        return TeamUtils.getTeamLogo(teamEntry[0]);
    }

    // Fallback to default icons
    return teamName.toLowerCase().includes('home')
        ? TeamUtils.getTeamLogo('DEFAULT_HOME')
        : TeamUtils.getTeamLogo('DEFAULT_AWAY');
};

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

    // Create card data for the Card component
    const homeCardData: CardResult = {
        rank: currentState.currentResult.home.rank,
        suit: currentState.currentResult.home.suit
    };

    const awayCardData: CardResult = {
        rank: currentState.currentResult.away.rank,
        suit: currentState.currentResult.away.suit
    };

    // Get team logo URLs using TeamUtils
    const homeTeamLogo = getTeamLogo(currentState.teamData.home.name);
    const awayTeamLogo = getTeamLogo(currentState.teamData.away.name);

    // Determine countdown state classes
    const getCountdownStateClass = () => {
        switch (currentState.currentRound.roundState) {
            case 'placingBets': return countDownTimerStyles['placing-bet-state'];
            case 'lockingBet': return countDownTimerStyles['no-more-bet-state'];
            case 'showingResult':
            case 'finished': return countDownTimerStyles['show-result-state'];
            default: return '';
        }
    };

    return (
        <div className={styles['sport-item']}>
            {/* Header Section - Using game-base styling structure */}
            <div className={gameBaseStyles['game-header']}>
                <div className={gameBaseStyles['game-name']}>
                    <div className={gameBaseStyles['game-name-text']}>
                        {currentState.gameSettings.gameName}
                        <span className={styles['live-icon']}>🔴</span>
                    </div>
                    <RoundId
                        clientRoundId={currentState.currentRound.roundId}
                        roundState={currentState.currentRound.roundState}
                        className={gameBaseStyles['game-name-round']}
                    />
                </div>
                <div className={gameBaseStyles['timer']}>
                    <div className={countDownTimerStyles['count-down']}>
                        <div className={`${countDownTimerStyles['timer-wrapper']} ${getCountdownStateClass()}`}>
                            <div className={countDownTimerStyles['counting-text']}>
                                {countdown}s
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles['score-board-img']} onClick={togglePopup}>
                    📊
                </div>
            </div>

            {/* Content Section - Using actual card components and CSS */}
            <div className={styles['wrapper-sport-middle']}>
                {/* Home Team Card */}
                <TeamCard
                    logo={homeTeamLogo}
                    isHomeTeam={true}
                    animation={TeamCardAnimation.NONE}
                />

                {/* Result Section with Cards */}
                <div className={styles['sport-result']}>
                    <div className={styles['container-result']}>
                        {/* Home Card */}
                        <div className={`${styles['card-section']} ${showHighLight && isHomeHigher ? styles['winning-card'] : ''}`}>
                            <div className={flipCardStyles['card']}>
                                {shouldHideCards ? (
                                    <CardBack />
                                ) : (
                                    <Card result={homeCardData} customClassName="card-baccarat" />
                                )}
                            </div>
                        </div>

                        {/* Score Display */}
                        <div className={styles['result-section']}>
                            <div className={`${styles['result']} ${isHomeHigher && showHighLight ? styles['higher-score'] : ''}`}>
                                <span>{showHighLight ? currentState.currentResult.homeScore : ''}</span>
                            </div>
                            <div className={`${styles['result']} ${isAwayHigher && showHighLight ? styles['higher-score'] : ''}`}>
                                <span>{showHighLight ? currentState.currentResult.awayScore : ''}</span>
                            </div>
                        </div>

                        {/* Away Card */}
                        <div className={`${styles['card-section']} ${showHighLight && isAwayHigher ? styles['winning-card'] : ''}`}>
                            <div className={flipCardStyles['card']}>
                                {shouldHideCards ? (
                                    <CardBack />
                                ) : (
                                    <Card result={awayCardData} customClassName="card-baccarat" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Away Team Card */}
                <TeamCard
                    logo={awayTeamLogo}
                    isHomeTeam={false}
                    animation={TeamCardAnimation.NONE}
                />

                {/* Team Names - Inside the middle section to match game-display.tsx */}
                <div className={styles['wrapper-team-name']}>
                    <div className={styles['name']}>
                        {currentState.teamData.home.name}
                    </div>
                    <div className={styles['name']}>
                        {currentState.teamData.away.name}
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