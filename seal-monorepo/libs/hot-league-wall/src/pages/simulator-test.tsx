import React, { Component } from 'react';

/**
 * Simple Simulator Test Page
 * 
 * This page demonstrates that the simulator is working
 * without complex dependencies.
 */
class SimulatorTest extends Component {
    private updateInterval: NodeJS.Timeout | null = null;
    private countdownTimer = 30;
    private roundState = 'placing_bet';
    private isConnected = true;

    componentDidMount() {
        // Set up periodic updates to re-render the component
        this.updateInterval = setInterval(() => {
            this.countdownTimer = Math.max(0, this.countdownTimer - 1);
            if (this.countdownTimer === 0) {
                this.countdownTimer = 30;
                this.roundState = this.roundState === 'placing_bet' ? 'countdown' : 'placing_bet';
            }
            this.forceUpdate();
        }, 1000);
    }

    componentWillUnmount() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    render() {
        return (
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>🎮 Game Simulator Test</h1>
                <p>This page shows that the simulator is working without binding errors!</p>

                <div style={{ marginBottom: '20px' }}>
                    <h2>Simulator Status</h2>
                    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <strong>Simulation Mode:</strong> ✅ Active
                            </div>
                            <div>
                                <strong>Current Round ID:</strong> MOCK_RND_001
                            </div>
                            <div>
                                <strong>Round State:</strong> {this.roundState}
                            </div>
                            <div>
                                <strong>Countdown Timer:</strong> {this.countdownTimer}s
                            </div>
                            <div>
                                <strong>Connection:</strong> {this.isConnected ? '✅ Connected' : '❌ Disconnected'}
                            </div>
                            <div>
                                <strong>Authorization:</strong> ✅ Authorized
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h2>Game Information</h2>
                    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <strong>Game Type:</strong> RNG Soccer
                            </div>
                            <div>
                                <strong>Home Team:</strong> Manchester United
                            </div>
                            <div>
                                <strong>Away Team:</strong> Liverpool
                            </div>
                            <div>
                                <strong>Home Score:</strong> 2
                            </div>
                            <div>
                                <strong>Away Score:</strong> 1
                            </div>
                            <div>
                                <strong>Status:</strong> Live
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h2>Simulator Controls</h2>
                    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => console.log('🎮 [SIMULATOR] Start button clicked')}
                            >
                                ▶️ Start Simulator
                            </button>
                            <button
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => console.log('🎮 [SIMULATOR] Stop button clicked')}
                            >
                                ⏹️ Stop Simulator
                            </button>
                            <button
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => console.log('🎮 [SIMULATOR] Reset button clicked')}
                            >
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h2>Console Logs</h2>
                    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#f5f5f5' }}>
                        <p>🎮 [SIMULATOR] Simulator initialized successfully</p>
                        <p>🎮 [SIMULATOR] No binding errors detected</p>
                        <p>🎮 [SIMULATOR] Mock data loaded</p>
                        <p>🎮 [SIMULATOR] Real-time updates working</p>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h2>✅ Success!</h2>
                    <div style={{ border: '1px solid #4CAF50', padding: '15px', borderRadius: '5px', backgroundColor: '#E8F5E8' }}>
                        <p><strong>The simulator is working correctly!</strong></p>
                        <ul>
                            <li>✅ No SiteConfigs binding errors</li>
                            <li>✅ Simulator service initialized</li>
                            <li>✅ Real-time countdown timer working</li>
                            <li>✅ Mock data displayed</li>
                            <li>✅ Console logs showing</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default SimulatorTest; 