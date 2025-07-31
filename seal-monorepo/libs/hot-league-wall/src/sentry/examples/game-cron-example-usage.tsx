import React, { useState, useEffect } from 'react';
import { useGameCronSentry, useAutoGameCronSentry } from '../hooks/useGameCronSentry';
import {
    sentryGameCronBatchManager,
    addGameCronLog,
    registerGameCron,
    completeGameCron,
    flushAllGameCronBatches,
    getGameCronBatchStats,
    getRegisteredGameCrons
} from '../utils/sentry-game-cron-batch-manager';

// Example component demonstrating the game cron batch system
export const GameCronExampleComponent: React.FC = () => {
    const [gameCronStats, setGameCronStats] = useState<Record<string, any>>({});
    const [activeGameCrons, setActiveGameCrons] = useState<string[]>([]);

    // Initialize the game cron batch manager
    useEffect(() => {
        sentryGameCronBatchManager.initialize();

        // Update stats every 2 seconds
        const interval = setInterval(() => {
            setGameCronStats(getGameCronBatchStats());
            setActiveGameCrons(getRegisteredGameCrons());
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Game Cron Batch Manager Examples</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>SG Game Examples</h3>
                <SGGameExample />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>VG Game Examples</h3>
                <VGGameExample />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>GN Game Examples</h3>
                <GNGameExample />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Direct API Examples</h3>
                <DirectAPIExample />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Game Cron Statistics</h3>
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '5px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                }}>
                    <h4>Active Game Crons: {activeGameCrons.length}</h4>
                    {activeGameCrons.map(cronId => (
                        <div key={cronId} style={{ marginBottom: '5px' }}>
                            <strong>{cronId}:</strong> {gameCronStats[cronId]?.logCount || 0} logs,
                            {gameCronStats[cronId]?.hasIssues ? ' HAS ISSUES' : ' No issues'},
                            Duration: {gameCronStats[cronId]?.duration || 0}ms
                        </div>
                    ))}
                </div>
            </div>

            <div style={{
                backgroundColor: '#e9ecef',
                padding: '15px',
                borderRadius: '5px',
                fontSize: '14px'
            }}>
                <h4>How Game Cron Batching Works:</h4>
                <ul>
                    <li>Each game cron has its own log batch</li>
                    <li>Logs are only sent to Sentry when there are warnings/errors/fatal</li>
                    <li>Batches are automatically flushed every 10 seconds</li>
                    <li>All log details are preserved in Sentry context</li>
                    <li>Game crons can be manually completed</li>
                    <li>Check Sentry dashboard to see game cron events</li>
                </ul>
            </div>
        </div>
    );
};

// SG Game Example
const SGGameExample: React.FC = () => {
    const {
        logInfo,
        logWarning,
        logError,
        startGameCron,
        completeGameCron,
        flushBatches
    } = useGameCronSentry({
        gameCronId: 'sg-rng-soccer-001',
        gameName: 'RNG Soccer',
        systemType: 'SG',
        environment: 'LOCAL1',
        onlySendOnIssues: true
    });

    const handleStartSGGame = () => {
        startGameCron({
            gameId: '118',
            roundId: 'round-123',
            playerId: 'player-456'
        });
        logInfo('SG game started', { gameType: 'RNG Soccer' });
    };

    const handleSGGameWarning = () => {
        logWarning('Connection timeout detected', {
            timeout: 5000,
            retryCount: 2
        });
    };

    const handleSGGameError = () => {
        logError('Bet placement failed', {
            betAmount: 100,
            errorCode: 'INSUFFICIENT_BALANCE'
        });
    };

    const handleCompleteSGGame = () => {
        logInfo('SG game completed successfully');
        completeGameCron(true, {
            totalBets: 5,
            totalWinnings: 250
        });
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>SG Game: RNG Soccer</h4>
            <button onClick={handleStartSGGame} style={{ marginRight: '10px' }}>
                Start SG Game
            </button>
            <button onClick={handleSGGameWarning} style={{ marginRight: '10px', backgroundColor: '#ffd93d' }}>
                Simulate Warning
            </button>
            <button onClick={handleSGGameError} style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}>
                Simulate Error
            </button>
            <button onClick={handleCompleteSGGame} style={{ marginRight: '10px', backgroundColor: '#51cf66' }}>
                Complete Game
            </button>
            <button onClick={flushBatches}>
                Flush Batches
            </button>
        </div>
    );
};

// VG Game Example
const VGGameExample: React.FC = () => {
    const {
        logInfo,
        logWarning,
        logError,
        startGameCron,
        completeGameCron
    } = useGameCronSentry({
        gameCronId: 'vg-baccarat-001',
        gameName: 'Baccarat',
        systemType: 'VG',
        environment: 'LOCAL1',
        onlySendOnIssues: true
    });

    const handleStartVGGame = () => {
        startGameCron({
            gameId: '201',
            tableId: 'table-789',
            dealerId: 'dealer-123'
        });
        logInfo('VG game started', { gameType: 'Baccarat' });
    };

    const handleVGGameWarning = () => {
        logWarning('High latency detected', {
            latency: 1500,
            threshold: 1000
        });
    };

    const handleVGGameError = () => {
        logError('Card dealing failed', {
            shoeId: 'shoe-456',
            errorCode: 'SHOE_EMPTY'
        });
    };

    const handleCompleteVGGame = () => {
        logInfo('VG game completed successfully');
        completeGameCron(true, {
            totalRounds: 10,
            totalBets: 1500
        });
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>VG Game: Baccarat</h4>
            <button onClick={handleStartVGGame} style={{ marginRight: '10px' }}>
                Start VG Game
            </button>
            <button onClick={handleVGGameWarning} style={{ marginRight: '10px', backgroundColor: '#ffd93d' }}>
                Simulate Warning
            </button>
            <button onClick={handleVGGameError} style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}>
                Simulate Error
            </button>
            <button onClick={handleCompleteVGGame} style={{ marginRight: '10px', backgroundColor: '#51cf66' }}>
                Complete Game
            </button>
        </div>
    );
};

// GN Game Example
const GNGameExample: React.FC = () => {
    const {
        logInfo,
        logWarning,
        logError,
        startGameCron,
        completeGameCron
    } = useGameCronSentry({
        gameCronId: 'gn-slot-machine-001',
        gameName: 'Slot Machine',
        systemType: 'GN',
        environment: 'LOCAL1',
        onlySendOnIssues: true
    });

    const handleStartGNGame = () => {
        startGameCron({
            gameId: '301',
            machineId: 'machine-999',
            sessionId: 'session-abc'
        });
        logInfo('GN game started', { gameType: 'Slot Machine' });
    };

    const handleGNGameWarning = () => {
        logWarning('Low balance warning', {
            balance: 50,
            minBet: 100
        });
    };

    const handleGNGameError = () => {
        logError('Spin failed', {
            betAmount: 200,
            errorCode: 'INSUFFICIENT_FUNDS'
        });
    };

    const handleCompleteGNGame = () => {
        logInfo('GN game completed successfully');
        completeGameCron(true, {
            totalSpins: 25,
            totalWinnings: 500
        });
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>GN Game: Slot Machine</h4>
            <button onClick={handleStartGNGame} style={{ marginRight: '10px' }}>
                Start GN Game
            </button>
            <button onClick={handleGNGameWarning} style={{ marginRight: '10px', backgroundColor: '#ffd93d' }}>
                Simulate Warning
            </button>
            <button onClick={handleGNGameError} style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}>
                Simulate Error
            </button>
            <button onClick={handleCompleteGNGame} style={{ marginRight: '10px', backgroundColor: '#51cf66' }}>
                Complete Game
            </button>
        </div>
    );
};

// Direct API Example
const DirectAPIExample: React.FC = () => {
    const handleDirectRegister = () => {
        registerGameCron('direct-api-game-001', {
            gameId: 'direct-001',
            gameName: 'Direct API Game',
            systemType: 'SG',
            environment: 'LOCAL1',
            onlySendOnIssues: true
        });
    };

    const handleDirectLog = () => {
        addGameCronLog('direct-api-game-001', 'Direct API log message', 'info', {
            source: 'direct-api',
            timestamp: Date.now()
        });
    };

    const handleDirectWarning = () => {
        addGameCronLog('direct-api-game-001', 'Direct API warning', 'warn', {
            source: 'direct-api',
            severity: 'medium'
        });
    };

    const handleDirectError = () => {
        addGameCronLog('direct-api-game-001', 'Direct API error', 'error', {
            source: 'direct-api',
            errorCode: 'DIRECT_ERROR'
        });
    };

    const handleDirectComplete = () => {
        completeGameCron('direct-api-game-001', true, {
            method: 'direct-api',
            success: true
        });
    };

    const handleFlushAll = async () => {
        await flushAllGameCronBatches();
        console.log('All game cron batches flushed');
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>Direct API Usage</h4>
            <button onClick={handleDirectRegister} style={{ marginRight: '10px' }}>
                Register Game Cron
            </button>
            <button onClick={handleDirectLog} style={{ marginRight: '10px' }}>
                Add Log
            </button>
            <button onClick={handleDirectWarning} style={{ marginRight: '10px', backgroundColor: '#ffd93d' }}>
                Add Warning
            </button>
            <button onClick={handleDirectError} style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}>
                Add Error
            </button>
            <button onClick={handleDirectComplete} style={{ marginRight: '10px', backgroundColor: '#51cf66' }}>
                Complete
            </button>
            <button onClick={handleFlushAll}>
                Flush All
            </button>
        </div>
    );
};

// Auto Game Cron Example
export const AutoGameCronExample: React.FC = () => {
    const { logInfo, logWarning, logError } = useAutoGameCronSentry(
        'auto-game-cron-001',
        'Auto Game Cron',
        {
            systemType: 'SG'
        }
    );

    const handleAutoLog = () => {
        logInfo('Auto game cron log message', { source: 'auto-example' });
    };

    const handleAutoWarning = () => {
        logWarning('Auto game cron warning', { source: 'auto-example' });
    };

    const handleAutoError = () => {
        logError('Auto game cron error', { source: 'auto-example' });
    };

    return (
        <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '5px', margin: '10px 0' }}>
            <h3>Auto Game Cron Example</h3>
            <p>This game cron automatically starts on mount and completes on unmount</p>
            <button onClick={handleAutoLog} style={{ marginRight: '10px' }}>
                Add Log
            </button>
            <button onClick={handleAutoWarning} style={{ marginRight: '10px', backgroundColor: '#ffd93d' }}>
                Add Warning
            </button>
            <button onClick={handleAutoError} style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}>
                Add Error
            </button>
        </div>
    );
}; 