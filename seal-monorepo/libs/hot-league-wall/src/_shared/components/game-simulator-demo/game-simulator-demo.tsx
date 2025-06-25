import React, { useState, useEffect } from 'react';
import GameSimulatorService from '../../services/game-simulator.service';
import demoStyles from './game-simulator-demo.module.scss';

/**
 * Game Simulator Demo Component
 * 
 * This component demonstrates how to use the GameSimulatorService
 * for offline prototyping without real service connections.
 * 
 * Features:
 * - Real-time simulation display
 * - Game type switching
 * - Error simulation controls
 * - Live data monitoring
 * - Configuration management
 */
export const GameSimulatorDemo: React.FC = () => {
    const [simulatorService] = useState(() => GameSimulatorService.getInstance());
    const [isActive, setIsActive] = useState(false);
    const [currentGameType, setCurrentGameType] = useState('rng-soccer');
    const [simulationState, setSimulationState] = useState<any>(null);
    const [fakeData, setFakeData] = useState<any>(null);
    const [errorSimulation, setErrorSimulation] = useState(false);
    const [updateInterval, setUpdateInterval] = useState(1000);
    const [showConsole, setShowConsole] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

    // Available game types
    const gameTypes = [
        { id: 'rng-soccer', name: 'RNG Soccer', description: 'Football betting simulation' },
        { id: 'baccarat', name: 'Baccarat', description: 'Card game simulation' },
        { id: 'fish-prawn-crab', name: 'Fish Prawn Crab', description: 'Dice game simulation' }
    ];

    // Intercept console logs for display
    useEffect(() => {
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

    // Update simulation data
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setSimulationState(simulatorService.getSimulationState());
            setFakeData(simulatorService.getFakeData());
        }, 500);

        return () => clearInterval(interval);
    }, [isActive, simulatorService]);

    /**
     * Start the simulator
     */
    const startSimulator = () => {
        simulatorService.initialize({
            gameType: currentGameType,
            enableErrorSimulation: errorSimulation,
            updateInterval: updateInterval
        });
        setIsActive(true);
        console.log('🎮 [DEMO] Simulator started');
    };

    /**
     * Stop the simulator
     */
    const stopSimulator = () => {
        simulatorService.stop();
        setIsActive(false);
        console.log('🎮 [DEMO] Simulator stopped');
    };

    /**
     * Toggle error simulation
     */
    const toggleErrorSimulation = () => {
        const newErrorSimulation = !errorSimulation;
        setErrorSimulation(newErrorSimulation);
        simulatorService.toggleErrorSimulation();
        console.log(`🎮 [DEMO] Error simulation ${newErrorSimulation ? 'enabled' : 'disabled'}`);
    };

    /**
     * Reset failure count
     */
    const resetFailures = () => {
        simulatorService.resetFailureCount();
        console.log('🎮 [DEMO] Failure count reset');
    };

    /**
     * Clear console logs
     */
    const clearLogs = () => {
        setConsoleLogs([]);
    };

    /**
     * Get round state color
     */
    const getRoundStateColor = (state: string) => {
        switch (state) {
            case 'placingBets': return '#4CAF50';
            case 'lockingBet': return '#FF9800';
            case 'showingResult': return '#2196F3';
            case 'finished': return '#9C27B0';
            default: return '#666';
        }
    };

    return (
        <div className={demoStyles['simulator-demo']}>
            <div className={demoStyles['demo-header']}>
                <h1>🎮 Game Simulator Demo</h1>
                <p>Offline prototyping without real service connections</p>
            </div>

            <div className={demoStyles['demo-controls']}>
                <div className={demoStyles['control-section']}>
                    <h3>🚀 Simulator Controls</h3>
                    <div className={demoStyles['control-buttons']}>
                        {!isActive ? (
                            <button
                                onClick={startSimulator}
                                className={demoStyles['start-button']}
                            >
                                ▶️ Start Simulator
                            </button>
                        ) : (
                            <button
                                onClick={stopSimulator}
                                className={demoStyles['stop-button']}
                            >
                                ⏹️ Stop Simulator
                            </button>
                        )}
                    </div>
                </div>

                <div className={demoStyles['control-section']}>
                    <h3>🎯 Game Configuration</h3>
                    <div className={demoStyles['config-grid']}>
                        <div className={demoStyles['config-item']}>
                            <label>Game Type:</label>
                            <select
                                value={currentGameType}
                                onChange={(e) => setCurrentGameType(e.target.value)}
                                disabled={isActive}
                            >
                                {gameTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={demoStyles['config-item']}>
                            <label>Update Interval (ms):</label>
                            <input
                                type="number"
                                value={updateInterval}
                                onChange={(e) => setUpdateInterval(Number(e.target.value))}
                                min="500"
                                max="5000"
                                step="100"
                                disabled={isActive}
                            />
                        </div>

                        <div className={demoStyles['config-item']}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={errorSimulation}
                                    onChange={toggleErrorSimulation}
                                    disabled={isActive}
                                />
                                Enable Error Simulation
                            </label>
                        </div>
                    </div>
                </div>

                <div className={demoStyles['control-section']}>
                    <h3>🔧 Simulator Actions</h3>
                    <div className={demoStyles['action-buttons']}>
                        <button
                            onClick={toggleErrorSimulation}
                            className={demoStyles['action-button']}
                        >
                            {errorSimulation ? '✅' : '❌'} Toggle Errors
                        </button>
                        <button
                            onClick={resetFailures}
                            className={demoStyles['action-button']}
                        >
                            🔄 Reset Failures
                        </button>
                        <button
                            onClick={() => setShowConsole(!showConsole)}
                            className={demoStyles['action-button']}
                        >
                            📊 {showConsole ? 'Hide' : 'Show'} Console
                        </button>
                        <button
                            onClick={clearLogs}
                            className={demoStyles['action-button']}
                        >
                            🗑️ Clear Logs
                        </button>
                    </div>
                </div>
            </div>

            {isActive && (
                <div className={demoStyles['simulation-display']}>
                    <div className={demoStyles['display-section']}>
                        <h3>📊 Simulation State</h3>
                        <div className={demoStyles['state-grid']}>
                            <div className={demoStyles['state-item']}>
                                <span className={demoStyles['state-label']}>Status:</span>
                                <span className={demoStyles['state-value']}>
                                    {simulationState?.isSimulationMode ? '🟢 Active' : '🔴 Inactive'}
                                </span>
                            </div>
                            <div className={demoStyles['state-item']}>
                                <span className={demoStyles['state-label']}>Round ID:</span>
                                <span className={demoStyles['state-value']}>
                                    {simulationState?.currentRoundId || 'N/A'}
                                </span>
                            </div>
                            <div className={demoStyles['state-item']}>
                                <span className={demoStyles['state-label']}>Round State:</span>
                                <span
                                    className={demoStyles['state-value']}
                                    style={{ color: getRoundStateColor(simulationState?.roundState) }}
                                >
                                    {simulationState?.roundState || 'N/A'}
                                </span>
                            </div>
                            <div className={demoStyles['state-item']}>
                                <span className={demoStyles['state-label']}>Countdown:</span>
                                <span className={demoStyles['state-value']}>
                                    {simulationState?.countdownTimer || 'N/A'}s
                                </span>
                            </div>
                            <div className={demoStyles['state-item']}>
                                <span className={demoStyles['state-label']}>Connection:</span>
                                <span className={demoStyles['state-value']}>
                                    {simulationState?.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                                </span>
                            </div>
                            <div className={demoStyles['state-item']}>
                                <span className={demoStyles['state-label']}>Authorization:</span>
                                <span className={demoStyles['state-value']}>
                                    {simulationState?.isAuthorized ? '🟢 Authorized' : '🔴 Unauthorized'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={demoStyles['display-section']}>
                        <h3>🎲 Game Data</h3>
                        <div className={demoStyles['data-preview']}>
                            <pre>{JSON.stringify(fakeData, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}

            {showConsole && (
                <div className={demoStyles['console-section']}>
                    <h3>📋 Console Logs</h3>
                    <div className={demoStyles['console-output']}>
                        {consoleLogs.map((log, index) => (
                            <div key={index} className={demoStyles['log-entry']}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={demoStyles['demo-instructions']}>
                <h3>📋 How to Use the Simulator</h3>
                <div className={demoStyles['instructions-grid']}>
                    <div className={demoStyles['instruction-item']}>
                        <h4>🚀 Getting Started</h4>
                        <ol>
                            <li>Select a game type from the dropdown</li>
                            <li>Configure the update interval (default: 1000ms)</li>
                            <li>Optionally enable error simulation</li>
                            <li>Click "Start Simulator" to begin</li>
                        </ol>
                    </div>

                    <div className={demoStyles['instruction-item']}>
                        <h4>🎯 Features</h4>
                        <ul>
                            <li><strong>Real-time Updates:</strong> Watch data change in real-time</li>
                            <li><strong>Game State Simulation:</strong> Automatic round progression</li>
                            <li><strong>Error Testing:</strong> Simulate connection failures</li>
                            <li><strong>Multiple Games:</strong> Switch between different game types</li>
                            <li><strong>Console Logging:</strong> Monitor all simulator activities</li>
                        </ul>
                    </div>

                    <div className={demoStyles['instruction-item']}>
                        <h4>🔧 Integration</h4>
                        <ul>
                            <li>Use <code>GatewayGameSimulator</code> instead of <code>GatewayGameBase</code></li>
                            <li>Set <code>NODE_ENV=development</code> to enable simulator mode</li>
                            <li>Configure simulator settings in your config files</li>
                            <li>Use the simulator service for testing without internet</li>
                        </ul>
                    </div>

                    <div className={demoStyles['instruction-item']}>
                        <h4>⚙️ Configuration</h4>
                        <p>Add to your config file:</p>
                        <pre className={demoStyles['config-example']}>
                            {`{
  "simulationMode": {
    "enabled": true,
    "autoConnect": true,
    "autoAuthorize": true,
    "realTimeUpdates": true
  }
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameSimulatorDemo; 