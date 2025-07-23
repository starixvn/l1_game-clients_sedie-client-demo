import React, { useEffect, useState } from 'react';
import styles from '../rng-soccer.module.scss';
import gameBaseStyles from '../../../game-base/game-base.module.scss';
import rngSoccerStyles from '../rng-soccer.module.scss';
import countDownTimerStyles from '../../../../_shared/components/count-down-timer/count-down-timer.module.scss';
import betOptionStyles from '../bet-option/rng-soccer-bet-options.module.scss';
import commonBetOptionStyles from '../../../../_shared/components/bet-option/bet-option.module.scss';
import flipCardStyles from '../../../../_shared/components/card/flip-card/flip-card.module.scss';
import demoAnimationStyles from './demo-animation.module.scss';
import roundHistoryStyles from '../round-history/rng-soccer-round-history.module.scss';
import Card from '../../../../_shared/components/card';
import CardBack from '../../../../_shared/components/card/card-back';
import { CardResult } from '../../../../_shared/components/card/type';
import TeamCard, { TeamCardAnimation } from '../settlement-result/components/team-card';
import { TeamUtils } from '../settlement-result/utils/team-utils';
import { RoundId } from '../../../../_shared/components/round-id';
import liveIcon from '../../../../assets/rng-soccer/live-icon.svg';
import historyBtnIcon from '../../../../assets/rng-soccer/history-btn.svg';
import Loading from '../../../../_shared/components/loading';
import classNames from 'classnames';
import blurBgGame from '../../../../assets/rng-soccer/blur-bg-game.png';
import { RNGSoccerRoundDot } from '../dot';
import { RNGSoccerChoices, RNGSoccerSettlementItemResult } from '../type';
import * as gc from '@sg/sg-game-client';

// Shared types for the base component
export interface RNGSoccerGameData {
    gameSettings: {
        gameName: string;
    };
    currentRound: {
        roundId: number;
        roundState: string;
        countdownTimer: number;
    };
    teamData: {
        home: { name: string; rank: number; suit: number; score: number };
        away: { name: string; rank: number; suit: number; score: number };
    };
    currentResult: {
        homeScore: number;
        awayScore: number;
        home: { rank: number; suit: number };
        away: { rank: number; suit: number };
    };
    roundOdds: {
        odds: Record<string, number>;
    };
    roundHistory?: Array<{
        roundId: number;
        settlementResult: { home: boolean; away: boolean; draw: boolean };
        result: { homeScore: number; awayScore: number };
    }>;
    uiState?: {
        isShowNextRoundMessage?: boolean;
    };
}

export interface RNGSoccerBaseProps {
    gameData: RNGSoccerGameData;
    onBetClick?: (choice: string) => void;
    onStatisticsClick?: () => void;
    showPlayOverlay?: boolean;
    onPlayClick?: () => Promise<void>;
    isInteractive?: boolean;
    showStatisticsPopup?: boolean;
    onCloseStatistics?: () => void;
    isLoading?: boolean;
}

// Function to get team logo using TeamUtils
const getTeamLogo = (teamName: string): string => {
    // Try to find the team abbreviation by matching the full name
    const teamEntry = Object.entries(TeamUtils.TEAM_INFO).find(([_, info]) => info.fullName === teamName);

    if (teamEntry) {
        return TeamUtils.getTeamLogo(teamEntry[0]);
    }

    // Fallback to default icons
    return teamName.toLowerCase().includes('home') ? TeamUtils.getTeamLogo('DEFAULT_HOME') : TeamUtils.getTeamLogo('DEFAULT_AWAY');
};

// Base component that contains all the shared UI logic
export const RNGSoccerBase: React.FC<RNGSoccerBaseProps> = ({
    gameData,
    onBetClick,
    onStatisticsClick,
    showPlayOverlay = false,
    onPlayClick,
    isInteractive = true,
    showStatisticsPopup = false,
    onCloseStatistics,
    isLoading = false,
}) => {
    // Separate highlight states for different elements
    const [isShowHomeCardHighlight, setIsShowHomeCardHighlight] = useState(false);
    const [isShowAwayCardHighlight, setIsShowAwayCardHighlight] = useState(false);
    const [isShowBetOptionHighlight, setIsShowBetOptionHighlight] = useState(false);
    // Score display states
    const [isShowHomeScore, setIsShowHomeScore] = useState(false);
    const [isShowAwayScore, setIsShowAwayScore] = useState(false);
    // Animation states for Play Now transition
    const [isSlidingLeft, setIsSlidingLeft] = useState(false);
    const [showBlurBg, setShowBlurBg] = useState(false);
    // Highlight animation state for Play Now button
    const [isHighlightedButton, setIsHighlightedButton] = useState(false);

    useEffect(() => {
        if (gameData.currentRound.roundState === 'showingResult') {
            // Home card highlight immediately
            setIsShowHomeCardHighlight(true);
            // Home score display after 0.2s from home card highlight
            setTimeout(() => {
                setIsShowHomeScore(true);
            }, 700);
            // Away card highlight after 1 second
            setTimeout(() => {
                setIsShowAwayCardHighlight(true);
            }, 1000);
            // Away score display after 0.2s from away card highlight
            setTimeout(() => {
                setIsShowAwayScore(true);
            }, 1700);
            // Bet option highlight after 0.5 seconds
            setTimeout(() => {
                setIsShowBetOptionHighlight(true);
            }, 1800);
        } else {
            setIsShowHomeCardHighlight(false);
            setIsShowAwayCardHighlight(false);
            setIsShowBetOptionHighlight(false);
            setIsShowHomeScore(false);
            setIsShowAwayScore(false);
        }
    }, [gameData.currentRound.roundState]);

    // Effect for Play Now button highlight animation every 2 seconds
    useEffect(() => {
        if (!showPlayOverlay || isSlidingLeft) return;

        const interval = setInterval(() => {
            setIsHighlightedButton(true);
            // Remove highlight after animation duration (0.3s)
            setTimeout(() => {
                setIsHighlightedButton(false);
            }, 2000);
        }, 3000);

        return () => clearInterval(interval);
    }, [showPlayOverlay, isSlidingLeft]);

    // Show loading component if isLoading is true
    if (isLoading) {
        return <Loading />;
    }

    const isHomeHigher = gameData.currentResult.homeScore > gameData.currentResult.awayScore;
    const isAwayHigher = gameData.currentResult.awayScore > gameData.currentResult.homeScore;

    // Function to determine which choice should be highlighted based on scores
    const getHighlightedChoice = (): string => {
        if (gameData.currentResult.homeScore === gameData.currentResult.awayScore) {
            return 'draw';
        } else if (gameData.currentResult.homeScore > gameData.currentResult.awayScore) {
            return 'home';
        } else {
            return 'away';
        }
    };

    // Create card data for the Card component
    const homeCardData: CardResult = {
        rank: gameData.currentResult.home.rank,
        suit: gameData.currentResult.home.suit,
    };

    const awayCardData: CardResult = {
        rank: gameData.currentResult.away.rank,
        suit: gameData.currentResult.away.suit,
    };

    // Get team logo URLs using TeamUtils
    const homeTeamLogo = getTeamLogo(gameData.teamData.home.name);
    const awayTeamLogo = getTeamLogo(gameData.teamData.away.name);

    // Helper function to get winner from settlement result
    const getWinnerFromSettlement = (settlementResult: RNGSoccerSettlementItemResult): RNGSoccerChoices => {
        if (settlementResult.home) return RNGSoccerChoices.home;
        if (settlementResult.away) return RNGSoccerChoices.away;
        if (settlementResult.draw) return RNGSoccerChoices.draw;
        return RNGSoccerChoices.home; // fallback
    };

    // Helper function to get display value for round history
    const getRoundHistoryValue = (choice: RNGSoccerChoices): string => {
        switch (choice) {
            case RNGSoccerChoices.home:
                return 'H';
            case RNGSoccerChoices.away:
                return 'A';
            case RNGSoccerChoices.draw:
                return 'D';
            default:
                return '';
        }
    };

    return (
        <div className={demoAnimationStyles['game-container']}>
            {/* Main content with slide animation */}
            <div
                className={classNames(styles['sport-item'], gameBaseStyles['game-container'], {
                    [rngSoccerStyles['slide-left']]: isSlidingLeft,
                })}
            >
                {/* Header Section */}
                <div className={gameBaseStyles['game-header']}>
                    <div className={gameBaseStyles['game-name']}>
                        <div className={gameBaseStyles['game-name-text']}>
                            {gameData.gameSettings.gameName}

                            <img src={liveIcon} alt="live" className={classNames(gameBaseStyles['live-icon'], styles['liveIcon'])} />
                        </div>
                        <RoundId
                            clientRoundId={gameData.currentRound.roundId}
                            roundState={gameData.currentRound.roundState}
                            className={gameBaseStyles['game-name-round']}
                        />
                    </div>
                    <div className={`${gameBaseStyles['timer']} ${rngSoccerStyles['timer']}`}>
                        <div className={countDownTimerStyles['count-down']}>
                            <div className={`${countDownTimerStyles['timer-wrapper']} ${countDownTimerStyles['show-result-state']} `}>
                                <div className={countDownTimerStyles['counting-text']}>
                                    <div className={countDownTimerStyles['waiting-container']}>
                                        <div className={countDownTimerStyles['dot-elastic']}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className={styles['wrapper-sport-middle']}>
                    {/* Home Team Card */}
                    <TeamCard logo={homeTeamLogo} isHomeTeam={true} animation={TeamCardAnimation.NONE} />

                    {/* Result Section with Cards */}
                    <div className={styles['sport-result']}>
                        <div className={styles['container-result']}>
                            {/* Home Card */}
                            <div
                                className={`${styles['card-section']} ${isShowBetOptionHighlight && isHomeHigher ? styles['winning-card'] : ''}`}
                            >
                                <div className={`${flipCardStyles['card']} ${isShowHomeCardHighlight ? flipCardStyles['flip'] : ''}`}>
                                    <div className={flipCardStyles['rotate-card']}>
                                        <div className={flipCardStyles.cardFace}>
                                            <div className={flipCardStyles['card-back']}>
                                                <CardBack />
                                            </div>
                                            <div className={flipCardStyles['card-front']}>
                                                <Card result={homeCardData} customClassName={'card-baccarat'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Display */}
                            <div className={styles['result-section']}>
                                <div
                                    className={`${styles['result']} ${isHomeHigher && isShowBetOptionHighlight ? styles['higher-score'] : ''}`}
                                >
                                    {isShowHomeScore && (
                                        <span className={demoAnimationStyles['score-slide-up']}>{gameData.currentResult.homeScore}</span>
                                    )}
                                </div>
                                <div
                                    className={`${styles['result']} ${isAwayHigher && isShowBetOptionHighlight ? styles['higher-score'] : ''}`}
                                >
                                    {isShowAwayScore && (
                                        <span className={demoAnimationStyles['score-slide-up']}>{gameData.currentResult.awayScore}</span>
                                    )}
                                </div>
                            </div>

                            {/* Away Card */}
                            <div
                                className={`${styles['card-section']} ${isShowBetOptionHighlight && isAwayHigher ? styles['winning-card'] : ''}`}
                            >
                                <div className={`${flipCardStyles['card']} ${isShowAwayCardHighlight ? flipCardStyles['flip'] : ''}`}>
                                    <div className={flipCardStyles['rotate-card']}>
                                        <div className={flipCardStyles.cardFace}>
                                            <div className={flipCardStyles['card-back']}>
                                                <CardBack />
                                            </div>
                                            <div className={flipCardStyles['card-front']}>
                                                <Card result={awayCardData} customClassName={'card-baccarat'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Away Team Card */}
                    <TeamCard logo={awayTeamLogo} isHomeTeam={false} animation={TeamCardAnimation.NONE} />

                    {/* Team Names */}
                    <div className={styles['wrapper-team-name']}>
                        <div className={styles['name']}>{gameData.teamData.home.name}</div>
                        <div className={styles['name']}>{gameData.teamData.away.name}</div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className={`${styles['wrapper-sport-bottom']} ${gameBaseStyles['game-footer']}`}>
                    <div className={betOptionStyles['bet-options-wrapper']}>
                        <div className={betOptionStyles['bet-options-container']}>
                            {Object.entries(gameData.roundOdds.odds).map(([choice, odd]) => (
                                <div
                                    key={choice}
                                    className={betOptionStyles['bets-bg']}
                                    data-choice={choice}
                                    onClick={() => onBetClick?.(choice)}
                                    style={{
                                        cursor:
                                            isInteractive && gameData.currentRound.roundState === 'placingBets' ? 'pointer' : 'not-allowed',
                                        opacity: isInteractive && gameData.currentRound.roundState === 'placingBets' ? 1 : 0.6,
                                    }}
                                >
                                    <div
                                        className={`${commonBetOptionStyles['betting-block']} ${isShowBetOptionHighlight && choice === getHighlightedChoice() ? commonBetOptionStyles['highlight-static-bet-choice'] : ''}`}
                                    >
                                        <div className={betOptionStyles['padding-bet']}>
                                            <span className={betOptionStyles['bet-choice-text']}>
                                                {gc.Translator.translate(`RNGSoccer.glossary_${choice}`, {
                                                    languageId: gc.Translator.getCurrentLanguageId(),
                                                })}
                                            </span>
                                            <span className={commonBetOptionStyles['odd']}>{odd}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Round History Section */}
                {gameData.roundHistory && gameData.roundHistory.length > 0 && (
                    <div className={roundHistoryStyles['round-history']}>
                        <div className={roundHistoryStyles['hstack-round']}>
                            {gameData.roundHistory
                                .slice(0, 16)
                                .reverse()
                                .map((round) => {
                                    const winner = getWinnerFromSettlement(round.settlementResult);
                                    const value = getRoundHistoryValue(winner);
                                    return (
                                        <div key={round.roundId} className={styles['history-item']}>
                                            <RNGSoccerRoundDot choice={winner} value={value} highlight={false} />
                                        </div>
                                    );
                                })}
                            <div className={roundHistoryStyles['history-item']}>
                                <RNGSoccerRoundDot choice="next" value="?" highlight={true} />
                            </div>

                            <div className={roundHistoryStyles['btn-stats']} onClick={onStatisticsClick}>
                                <img src={historyBtnIcon} alt="statistics" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Play Overlay */}
                {showPlayOverlay && !isSlidingLeft && (
                    <div className={demoAnimationStyles['overlay-container']}>
                        <button
                            className={classNames(demoAnimationStyles['btn-play-now'], {
                                [demoAnimationStyles['highlight']]: isHighlightedButton,
                            })}
                            onClick={async () => {
                                const baseStartTime = performance.now();

                                // Start slide animation
                                setIsSlidingLeft(true);
                                // After slide animation, show blur background
                                setShowBlurBg(true); // match slideLeft animation duration

                                setTimeout(async () => {
                                    if (onPlayClick) {
                                        try {
                                            await onPlayClick();
                                        } catch (error) {
                                            console.error('[BASE_TIMING] Error during play button click:', error);
                                        }
                                    }

                                    const baseEndTime = performance.now();
                                    const baseDuration = baseEndTime - baseStartTime;
                                }, 700);
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'none';
                            }}
                        >
                            {gc.Translator.translate('RNGSoccer.button_play_now', {
                                languageId: gc.Translator.getCurrentLanguageId(),
                            })}
                        </button>
                    </div>
                )}
            </div>

            {/* Blur background overlay with animation */}
            {showBlurBg && (
                <div className={rngSoccerStyles['blur-bg-animated']}>
                    <img src={blurBgGame} alt="Blurred background" />
                </div>
            )}
        </div>
    );
};

export default RNGSoccerBase;
