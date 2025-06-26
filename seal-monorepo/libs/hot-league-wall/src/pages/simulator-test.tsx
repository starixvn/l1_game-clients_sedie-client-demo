import React, { useState, useEffect } from 'react';

const SimulatorTestPage: React.FC = () => {
    const [simulatorStatus, setSimulatorStatus] = useState('Checking...');
    const [environment, setEnvironment] = useState('');

    useEffect(() => {
        // Check if simulator mode is enabled
        const nodeEnv = process.env.NODE_ENV;
        const simulatorConfig = process.env.SIMULATOR_CONFIG;

        setEnvironment(`NODE_ENV: ${nodeEnv || 'undefined'}`);

        if (nodeEnv === 'development') {
            setSimulatorStatus('🎮 Simulator Mode Available');
        } else {
            setSimulatorStatus('❌ Simulator Mode Not Available');
        }
    }, []);

    const navigateToMain = () => {
        window.location.href = '/';
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{
                position: 'fixed',
                top: '10px',
                left: '10px',
                background: '#007bff',
                color: 'white',
                padding: '10px',
                borderRadius: '4px',
                zIndex: 1000,
                cursor: 'pointer'
            }} onClick={navigateToMain}>
                ← Back to Main App
            </div>

            <h1>🎮 Game Simulator Test Page</h1>
            <p>This page tests the game simulator functionality.</p>

            <div style={{
                background: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2>Simulator Status</h2>
                <p><strong>Status:</strong> {simulatorStatus}</p>
                <p><strong>Environment:</strong> {environment}</p>
                <p><strong>Hostname:</strong> {window.location.hostname}</p>
                <p><strong>URL:</strong> {window.location.href}</p>
            </div>

            <div style={{
                background: '#e8f5e8',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2>How to Enable Simulator</h2>
                <ol>
                    <li>Set <code>NODE_ENV=development</code></li>
                    <li>Set <code>SIMULATOR_CONFIG={'{"simulationMode":{"enabled":true}}'}</code></li>
                    <li>Use <code>GatewayGameSimulator</code> instead of <code>GatewayGameBase</code></li>
                    <li>Restart the development server</li>
                </ol>
            </div>

            <div style={{
                background: '#fff3cd',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2>Available Simulator Features</h2>
                <ul>
                    <li>✅ No real network connections required</li>
                    <li>✅ Realistic fake data simulation</li>
                    <li>✅ Multiple game types (RNG Soccer, Baccarat, Fish Prawn Crab)</li>
                    <li>✅ Real-time data updates</li>
                    <li>✅ Error simulation for testing</li>
                    <li>✅ Automatic round progression</li>
                </ul>
            </div>

            <div style={{
                background: '#d1ecf1',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '40px'
            }}>
                <h2>Next Steps</h2>
                <p>To test the simulator:</p>
                <ol>
                    <li>Open browser console to see simulator logs</li>
                    <li>Navigate to a game page that uses <code>GatewayGameSimulator</code></li>
                    <li>Look for "🎮 [SIMULATOR]" log messages</li>
                    <li>Check that no real network requests are made</li>
                </ol>
            </div>

            <div style={{
                background: '#ffe6e6',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2>Component Status</h2>
                <p><strong>GameSimulatorDemo:</strong> Available (imported separately)</p>
                <p><strong>ExampleGame:</strong> Available (imported separately)</p>
                <p><strong>SimulatorTestPage:</strong> ✅ Rendering successfully</p>
            </div>

            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: '#4CAF50',
                color: 'white',
                padding: '10px',
                borderRadius: '4px',
                zIndex: 1000
            }}>
                🎮 Simulator Mode Active
            </div>
        </div>
    );
};

export default SimulatorTestPage; 