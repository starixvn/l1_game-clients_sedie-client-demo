import React, { useState } from 'react';
import RNGSoccerStaticPrototype from './rng-soccer-static-prototype';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import styles from './rng-soccer.module.scss';
import demoStyles from './rng-soccer-demo.module.scss';

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
                    {/* Header Section */}
                    <div className={styles['wrapper-sport-top']}>
                        <div className={styles['game-name']}>
                            <div className={styles['game-name-text']}>
                                {FAKE_RNG_SOCCER_DATA.gameSettings.gameName}
                                <span className={styles['live-icon']}>🔴</span>
                            </div>
                            <div className={styles['game-name-round']}>
                                Round #{FAKE_RNG_SOCCER_DATA.currentRound.roundId}
                            </div>
                        </div>
                        <div className={styles['timer']}>
                            <div className={styles['count-down']}>
                                {FAKE_RNG_SOCCER_DATA.currentRound.countdownTimer}s
                            </div>
                        </div>
                        <div className={styles['score-board-img']}>
                            📊
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className={styles['wrapper-sport-content']}>
                        <div className={styles['settlement-result']}>
                            {FAKE_RNG_SOCCER_DATA.currentRound.roundState === 'showingResult' && (
                                <div className={styles['result-display']}>
                                    <div className={styles['team-scores']}>
                                        <div className={styles['team']}>
                                            <span>Home</span>
                                            <span>{FAKE_RNG_SOCCER_DATA.currentResult.homeScore}</span>
                                        </div>
                                        <div>VS</div>
                                        <div className={styles['team']}>
                                            <span>Away</span>
                                            <span>{FAKE_RNG_SOCCER_DATA.currentResult.awayScore}</span>
                                        </div>
                                    </div>
                                    <div className={styles['winner']}>
                                        Winner: {FAKE_RNG_SOCCER_DATA.settlementResult.home ? 'Home' :
                                            FAKE_RNG_SOCCER_DATA.settlementResult.away ? 'Away' : 'Draw'}
                                    </div>
                                </div>
                            )}
                            {FAKE_RNG_SOCCER_DATA.currentRound.roundState !== 'showingResult' && (
                                <div className={styles['waiting-for-result']}>
                                    <div>Waiting for result...</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className={styles['wrapper-sport-bottom']}>
                        <div className={styles['bet-option']}>
                            {Object.entries(FAKE_RNG_SOCCER_DATA.roundOdds.odds).map(([choice, odd]) => (
                                <div key={choice} className={styles['bet-option-item']}>
                                    <span>{choice.charAt(0).toUpperCase() + choice.slice(1)}</span>
                                    <span>{odd}</span>
                                </div>
                            ))}
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