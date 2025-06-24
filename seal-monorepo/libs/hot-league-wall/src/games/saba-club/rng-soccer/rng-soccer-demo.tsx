import React, { useState } from 'react';
import RNGSoccerStaticPrototype from './rng-soccer-static-prototype';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import styles from './rng-soccer.module.scss';
import gameBaseStyles from '../../game-base/game-base.module.scss';
import countDownTimerStyles from '../../../_shared/components/count-down-timer/count-down-timer.module.scss';
import demoStyles from './rng-soccer-demo.module.scss';
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

// Demo page for RNG Soccer static prototype
export const RNGSoccerDemo: React.FC = () => {
    const [showConsole, setShowConsole] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

    // Intercept console.log to capture logs
    React.useEffect(() => {
        const originalLog = console.log;
        console.log = (...args) => {
            const logMessage = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            setConsoleLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${logMessage}`]);
            originalLog(...args);
        };

        return () => {
            console.log = originalLog;
        };
    }, []);

    const clearLogs = () => {
        setConsoleLogs([]);
    };

    const shouldHideCards = FAKE_RNG_SOCCER_DATA.currentRound.roundState !== 'showingResult';
    const showHighLight = FAKE_RNG_SOCCER_DATA.currentRound.roundState === 'showingResult';
    const isHomeHigher = FAKE_RNG_SOCCER_DATA.currentResult.homeScore > FAKE_RNG_SOCCER_DATA.currentResult.awayScore;
    const isAwayHigher = FAKE_RNG_SOCCER_DATA.currentResult.awayScore > FAKE_RNG_SOCCER_DATA.currentResult.homeScore;

    // Create card data for the Card component
    const homeCardData: CardResult = {
        rank: FAKE_RNG_SOCCER_DATA.currentResult.home.rank,
        suit: FAKE_RNG_SOCCER_DATA.currentResult.home.suit
    };

    const awayCardData: CardResult = {
        rank: FAKE_RNG_SOCCER_DATA.currentResult.away.rank,
        suit: FAKE_RNG_SOCCER_DATA.currentResult.away.suit
    };

    // Get team logo URLs using TeamUtils
    const homeTeamLogo = getTeamLogo(FAKE_RNG_SOCCER_DATA.teamData.home.name);
    const awayTeamLogo = getTeamLogo(FAKE_RNG_SOCCER_DATA.teamData.away.name);

    // Determine countdown state classes
    const getCountdownStateClass = () => {
        switch (FAKE_RNG_SOCCER_DATA.currentRound.roundState) {
            case 'placingBets': return countDownTimerStyles['placing-bet-state'];
            case 'lockingBet': return countDownTimerStyles['no-more-bet-state'];
            case 'showingResult':
            case 'finished': return countDownTimerStyles['show-result-state'];
            default: return '';
        }
    };

    return (
        <div className={demoStyles['demo-container']}>
            {/* Header */}
            <div className={demoStyles['demo-header']}>
                <h1>🎮 RNG Soccer Static Prototype</h1>
                <p>This is a static prototype demonstrating the RNG Soccer game interface with fake data</p>

                <div className={demoStyles['demo-controls']}>
                    <button
                        onClick={() => setShowConsole(!showConsole)}
                        className={demoStyles['demo-button']}
                    >
                        {showConsole ? 'Hide' : 'Show'} Console Logs
                    </button>
                    <button
                        onClick={clearLogs}
                        className={demoStyles['demo-button']}
                    >
                        Clear Logs
                    </button>
                </div>
            </div>

            {/* Game Container - Using actual RNG Soccer styles */}
            <div className={demoStyles['game-demo-container']}>
                <div className={styles['sport-item']}>
                    {/* Header Section - Using game-base styling structure */}
                    <div className={gameBaseStyles['game-header']}>
                        <div className={gameBaseStyles['game-name']}>
                            <div className={gameBaseStyles['game-name-text']}>
                                {FAKE_RNG_SOCCER_DATA.gameSettings.gameName}
                                <span className={styles['live-icon']}>🔴</span>
                            </div>
                            <RoundId
                                clientRoundId={FAKE_RNG_SOCCER_DATA.currentRound.roundId}
                                roundState={FAKE_RNG_SOCCER_DATA.currentRound.roundState}
                                className={gameBaseStyles['game-name-round']}
                            />
                        </div>
                        <div className={gameBaseStyles['timer']}>
                            <div className={countDownTimerStyles['count-down']}>
                                <div className={`${countDownTimerStyles['timer-wrapper']} ${getCountdownStateClass()}`}>
                                    <div className={countDownTimerStyles['counting-text']}>
                                        {FAKE_RNG_SOCCER_DATA.currentRound.countdownTimer}s
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles['score-board-img']}>
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
                                        <span>{showHighLight ? FAKE_RNG_SOCCER_DATA.currentResult.homeScore : ''}</span>
                                    </div>
                                    <div className={`${styles['result']} ${isAwayHigher && showHighLight ? styles['higher-score'] : ''}`}>
                                        <span>{showHighLight ? FAKE_RNG_SOCCER_DATA.currentResult.awayScore : ''}</span>
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
                                {FAKE_RNG_SOCCER_DATA.teamData.home.name}
                            </div>
                            <div className={styles['name']}>
                                {FAKE_RNG_SOCCER_DATA.teamData.away.name}
                            </div>
                        </div>
                    </div>

                    {/* Footer Section - Using bet-option styles */}
                    <div className={styles['wrapper-sport-bottom']}>
                        <div className={betOptionStyles['bet-options-wrapper']}>
                            <div className={betOptionStyles['bet-options-container']}>
                                {Object.entries(FAKE_RNG_SOCCER_DATA.roundOdds.odds).map(([choice, odd]) => (
                                    <div key={choice} className={betOptionStyles['bets-bg']} data-choice={choice}>
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
                </div>
            </div>

            {/* Console Logs */}
            {showConsole && (
                <div className={demoStyles['console-container']}>
                    <h3>Console Logs (Real-time)</h3>
                    <div className={demoStyles['console-logs']}>
                        {consoleLogs.map((log, index) => (
                            <div key={index} className={demoStyles['log-entry']}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className={demoStyles['demo-instructions']}>
                <h3>📋 How to Use This Prototype</h3>
                <ul>
                    <li><strong>Countdown Timer:</strong> Watch the countdown timer simulate different game phases</li>
                    <li><strong>Betting:</strong> Click on bet options during the "Place Your Bets" phase</li>
                    <li><strong>Round States:</strong> Observe how the interface changes during different round states</li>
                    <li><strong>Statistics:</strong> Click the 📊 icon to view round history</li>
                    <li><strong>Console Logs:</strong> Toggle console logs to see component interactions</li>
                </ul>

                <h3>🎯 Game Phases</h3>
                <ul>
                    <li><strong>Placing Bets (30s):</strong> Users can place bets on Home, Draw, or Away</li>
                    <li><strong>Locking Bet (10s):</strong> Betting is disabled, round is being processed</li>
                    <li><strong>Showing Result (5s):</strong> Game result is displayed with animations</li>
                    <li><strong>Finished:</strong> Round completes and new round begins</li>
                </ul>

                <h3>📊 Fake Data Structure</h3>
                <pre className={demoStyles['data-preview']}>
                    {JSON.stringify(FAKE_RNG_SOCCER_DATA, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default RNGSoccerDemo; 