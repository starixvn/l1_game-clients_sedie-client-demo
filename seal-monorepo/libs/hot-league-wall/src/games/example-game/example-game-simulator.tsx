import React from 'react';
import GatewayGameSimulator from '../game-base/gateway/gateway-game-simulator';
import { IGatewayGameBaseState } from '../game-base/interfaces/gateway-types';
import { GameBaseProps } from '../game-base/type';

/**
 * Example Game Component with Simulator Support
 * 
 * This component demonstrates how to create a game that works with both
 * real services and the simulator for offline prototyping.
 * 
 * Features:
 * - Automatic simulator detection
 * - Real-time data display
 * - Simulator mode indicator
 * - Fallback to real services
 */
interface ExampleGameProps extends GameBaseProps {
    customTitle?: string;
    gameId?: number;
}

interface ExampleGameState extends IGatewayGameBaseState {
    customData: string;
    lastUpdate: Date;
}

class ExampleGame extends GatewayGameSimulator<ExampleGameProps, ExampleGameState> {
    private updateInterval: NodeJS.Timeout | null = null;

    constructor(props: ExampleGameProps) {
        super(props);

        this.state = {
            ...this.state,
            customData: 'Initial data',
            lastUpdate: new Date()
        };
    }

    componentDidMount(): void {
        super.componentDidMount();

        // Log simulator status
        if (this.isSimulatorModeActive()) {
            console.log('🎮 [EXAMPLE_GAME] Running in simulator mode');
            console.log('🎮 [EXAMPLE_GAME] Simulator data:', this.getSimulatorData());
            console.log('🎮 [EXAMPLE_GAME] Simulator state:', this.getSimulatorState());
        } else {
            console.log('🎮 [EXAMPLE_GAME] Running with real services');
        }

        // Start update interval for demo purposes
        this.startUpdateInterval();
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        this.stopUpdateInterval();
    }

    private startUpdateInterval(): void {
        this.updateInterval = setInterval(() => {
            this.setState({ lastUpdate: new Date() });
        }, 1000);
    }

    private stopUpdateInterval(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Override abstract methods
    override renderGameLayout(): JSX.Element {
        return (
            <div className="example-game-container">
                {/* Simulator Mode Indicator */}
                {this.isSimulatorModeActive() && (
                    <div className="simulator-indicator">
                        🎮 Simulator Mode Active
                        <button
                            onClick={() => this.toggleErrorSimulation()}
                            className="simulator-control"
                        >
                            Toggle Errors
                        </button>
                        <button
                            onClick={() => this.resetSimulatorFailures()}
                            className="simulator-control"
                        >
                            Reset Failures
                        </button>
                    </div>
                )}

                {/* Game Header */}
                <div className="game-header">
                    <h1>{this.props.customTitle || 'Example Game'}</h1>
                    <div className="game-info">
                        <span>Namespace: {this.props.namespace}</span>
                        {this.props.gameId && <span>Game ID: {this.props.gameId}</span>}
                        <span>Last Update: {this.state.lastUpdate.toLocaleTimeString()}</span>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="connection-status">
                    <div className={`status-item ${this.state.isConnected ? 'connected' : 'disconnected'}`}>
                        Connection: {this.state.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </div>
                    <div className={`status-item ${this.state.isAuthorized ? 'authorized' : 'unauthorized'}`}>
                        Authorization: {this.state.isAuthorized ? '🟢 Authorized' : '🔴 Unauthorized'}
                    </div>
                    <div className={`status-item ${this.state.isSignedIn ? 'signed-in' : 'signed-out'}`}>
                        Sign In: {this.state.isSignedIn ? '🟢 Signed In' : '🔴 Signed Out'}
                    </div>
                </div>

                {/* Game State Display */}
                <div className="game-state">
                    <h2>Game State</h2>
                    <div className="state-grid">
                        <div className="state-item">
                            <label>Round ID:</label>
                            <span>{this.state.roundId}</span>
                        </div>
                        <div className="state-item">
                            <label>Round State:</label>
                            <span className={`state-${this.state.roundState}`}>
                                {this.state.roundState}
                            </span>
                        </div>
                        <div className="state-item">
                            <label>Allowed Bet:</label>
                            <span>{this.state.isAllowedBet ? '✅ Yes' : '❌ No'}</span>
                        </div>
                        <div className="state-item">
                            <label>Show Bet Panel:</label>
                            <span>{this.state.showBetPanel ? '✅ Yes' : '❌ No'}</span>
                        </div>
                    </div>
                </div>

                {/* Simulator Data Display (only in simulator mode) */}
                {this.isSimulatorModeActive() && (
                    <div className="simulator-data">
                        <h2>Simulator Data</h2>
                        <div className="data-preview">
                            <h3>Current Round</h3>
                            <pre>
                                {JSON.stringify(this.getSimulatorData()?.currentRound, null, 2)}
                            </pre>

                            <h3>Team Data</h3>
                            <pre>
                                {JSON.stringify(this.getSimulatorData()?.teamData, null, 2)}
                            </pre>

                            <h3>Round Odds</h3>
                            <pre>
                                {JSON.stringify(this.getSimulatorData()?.roundOdds, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Game Controls */}
                <div className="game-controls">
                    <h2>Game Controls</h2>
                    <div className="control-buttons">
                        <button
                            onClick={() => this.toggleStatistic()}
                            className="control-button"
                        >
                            {this.state.isOpenStatistic ? 'Hide' : 'Show'} Statistics
                        </button>

                        <button
                            onClick={() => this.setState({ showBetPanel: !this.state.showBetPanel })}
                            className="control-button"
                        >
                            {this.state.showBetPanel ? 'Hide' : 'Show'} Bet Panel
                        </button>

                        {this.isSimulatorModeActive() && (
                            <button
                                onClick={() => {
                                    const data = this.getSimulatorData();
                                    console.log('🎮 [EXAMPLE_GAME] Current simulator data:', data);
                                }}
                                className="control-button"
                            >
                                Log Simulator Data
                            </button>
                        )}
                    </div>
                </div>

                {/* Statistics Panel */}
                {this.state.isOpenStatistic && (
                    <div className="statistics-panel">
                        <h3>Game Statistics</h3>
                        <div className="stats-content">
                            <p>This is where your game statistics would be displayed.</p>
                            <p>In simulator mode, you can see fake data here.</p>
                            <button
                                onClick={() => this.toggleStatistic()}
                                className="close-button"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Bet Panel */}
                {this.state.showBetPanel && (
                    <div className="bet-panel">
                        <h3>Betting Panel</h3>
                        <div className="bet-content">
                            <p>This is where your betting interface would be displayed.</p>
                            <p>In simulator mode, you can interact with fake betting options.</p>
                            <button
                                onClick={() => this.setState({ showBetPanel: false })}
                                className="close-button"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    override renderNotice(): JSX.Element {
        return (
            <div className="game-notice">
                <h2>Game Notice</h2>
                <p>This is a notice that would be displayed when the game is disabled or in maintenance mode.</p>
                {this.isSimulatorModeActive() && (
                    <p><strong>Note:</strong> Running in simulator mode - this is fake data.</p>
                )}
            </div>
        );
    }

    // Override connection methods to add logging
    override connectLiveGateway(): void {
        console.log('🎮 [EXAMPLE_GAME] Connecting to live gateway...');
        super.connectLiveGateway();
    }

    override joinGame(): void {
        console.log('🎮 [EXAMPLE_GAME] Joining game...');
        super.joinGame();
    }

    override signIn(): void {
        console.log('🎮 [EXAMPLE_GAME] Signing in...');
        super.signIn();
    }
}

export default ExampleGame; 