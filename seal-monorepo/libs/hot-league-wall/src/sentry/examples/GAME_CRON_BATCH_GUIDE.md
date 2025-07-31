# Game Cron Batch Manager Guide

## Overview

The Game Cron Batch Manager is an advanced logging system designed specifically for game monitoring. It groups logs by game cron (game session) and only sends them to Sentry when there are issues (warnings/errors/fatal), significantly reducing noise while maintaining comprehensive monitoring.

## Key Features

-   **Game Cron Isolation**: Each game session has its own log batch
-   **Issue-Only Reporting**: Only sends to Sentry when warnings/errors/fatal occur
-   **System Type Support**: Supports SG, VG, and GN game types
-   **Automatic Lifecycle Management**: Handles game cron start/complete automatically
-   **Comprehensive Context**: Preserves all log details in structured format
-   **Performance Optimized**: Reduces network overhead and Sentry noise

## Architecture

### Core Components

1. **SentryGameCronBatchManager** - Core batching logic for game crons
2. **useGameCronSentry** - React hook for game cron logging
3. **useAutoGameCronSentry** - Auto-start/complete game cron hook
4. **Direct API Functions** - For non-React usage

### Game Cron Lifecycle

```
Game Cron Start → Log Collection → Issue Detection → Sentry Reporting → Game Cron Complete
```

## Usage Examples

### 1. React Hook Usage (Recommended)

```typescript
import { useGameCronSentry } from '../hooks/useGameCronSentry';

const MyGameComponent = () => {
    const {
        logInfo,
        logWarning,
        logError,
        startGameCron,
        completeGameCron
    } = useGameCronSentry({
        gameCronId: 'sg-rng-soccer-001',
        gameName: 'RNG Soccer',
        systemType: 'SG',
        environment: 'LOCAL1',
        onlySendOnIssues: true
    });

    useEffect(() => {
        // Start the game cron
        startGameCron({
            gameId: '118',
            roundId: 'round-123',
            playerId: 'player-456'
        });

        logInfo('Game component mounted', { component: 'MyGameComponent' });
    }, []);

    const handleBet = () => {
        try {
            logInfo('Processing bet', { amount: 100, type: 'straight' });
            // ... bet processing logic
        } catch (error) {
            logError('Bet processing failed', {
                error: error.message,
                betAmount: 100
            });
        }
    };

    const handleGameComplete = () => {
        logInfo('Game completed successfully');
        completeGameCron(true, {
            totalBets: 5,
            totalWinnings: 250
        });
    };

    return (
        <div>
            <button onClick={handleBet}>Place Bet</button>
            <button onClick={handleGameComplete}>Complete Game</button>
        </div>
    );
};
```

### 2. Auto Game Cron Hook

```typescript
import { useAutoGameCronSentry } from '../hooks/useGameCronSentry';

const AutoGameComponent = () => {
    // Automatically starts on mount and completes on unmount
    const { logInfo, logWarning, logError } = useAutoGameCronSentry({
        gameCronId: 'auto-vg-baccarat-001',
        gameName: 'Baccarat',
        systemType: 'VG'
    });

    const handleGameAction = () => {
        logInfo('Game action performed', { action: 'card_deal' });
    };

    return <div>Auto Game Component</div>;
};
```

### 3. Direct API Usage

```typescript
import { registerGameCron, addGameCronLog, completeGameCron } from './sentry-game-cron-batch-manager';

// Register a game cron
registerGameCron('direct-sg-game-001', {
    gameId: 'direct-001',
    gameName: 'Direct API Game',
    systemType: 'SG',
    environment: 'LOCAL1',
    onlySendOnIssues: true,
});

// Add logs
addGameCronLog('direct-sg-game-001', 'Game started', 'info', {
    gameType: 'RNG Soccer',
    timestamp: Date.now(),
});

addGameCronLog('direct-sg-game-001', 'Connection warning', 'warn', {
    latency: 1500,
    threshold: 1000,
});

addGameCronLog('direct-sg-game-001', 'Bet failed', 'error', {
    errorCode: 'INSUFFICIENT_BALANCE',
    betAmount: 200,
});

// Complete the game cron
completeGameCron('direct-sg-game-001', true, {
    totalBets: 3,
    success: true,
});
```

## Game Type Examples

### SG Games (RNG Soccer, etc.)

```typescript
const SGGameExample = () => {
    const { logInfo, logWarning, logError, startGameCron, completeGameCron } = useGameCronSentry({
        gameCronId: 'sg-rng-soccer-001',
        gameName: 'RNG Soccer',
        systemType: 'SG',
        environment: 'LOCAL1',
    });

    const handleSGGameStart = () => {
        startGameCron({
            gameId: '118',
            roundId: 'round-123',
            playerId: 'player-456',
        });
        logInfo('SG game started', { gameType: 'RNG Soccer' });
    };

    const handleSGGameWarning = () => {
        logWarning('Connection timeout detected', {
            timeout: 5000,
            retryCount: 2,
        });
    };

    const handleSGGameError = () => {
        logError('Bet placement failed', {
            betAmount: 100,
            errorCode: 'INSUFFICIENT_BALANCE',
        });
    };

    const handleSGGameComplete = () => {
        logInfo('SG game completed successfully');
        completeGameCron(true, {
            totalBets: 5,
            totalWinnings: 250,
        });
    };
};
```

### VG Games (Baccarat, etc.)

```typescript
const VGGameExample = () => {
    const { logInfo, logWarning, logError, startGameCron, completeGameCron } = useGameCronSentry({
        gameCronId: 'vg-baccarat-001',
        gameName: 'Baccarat',
        systemType: 'VG',
        environment: 'LOCAL1',
    });

    const handleVGGameStart = () => {
        startGameCron({
            gameId: '201',
            tableId: 'table-789',
            dealerId: 'dealer-123',
        });
        logInfo('VG game started', { gameType: 'Baccarat' });
    };

    const handleVGGameWarning = () => {
        logWarning('High latency detected', {
            latency: 1500,
            threshold: 1000,
        });
    };

    const handleVGGameError = () => {
        logError('Card dealing failed', {
            shoeId: 'shoe-456',
            errorCode: 'SHOE_EMPTY',
        });
    };

    const handleVGGameComplete = () => {
        logInfo('VG game completed successfully');
        completeGameCron(true, {
            totalRounds: 10,
            totalBets: 1500,
        });
    };
};
```

### GN Games (Slot Machines, etc.)

```typescript
const GNGameExample = () => {
    const { logInfo, logWarning, logError, startGameCron, completeGameCron } = useGameCronSentry({
        gameCronId: 'gn-slot-machine-001',
        gameName: 'Slot Machine',
        systemType: 'GN',
        environment: 'LOCAL1',
    });

    const handleGNGameStart = () => {
        startGameCron({
            gameId: '301',
            machineId: 'machine-999',
            sessionId: 'session-abc',
        });
        logInfo('GN game started', { gameType: 'Slot Machine' });
    };

    const handleGNGameWarning = () => {
        logWarning('Low balance warning', {
            balance: 50,
            minBet: 100,
        });
    };

    const handleGNGameError = () => {
        logError('Spin failed', {
            betAmount: 200,
            errorCode: 'INSUFFICIENT_FUNDS',
        });
    };

    const handleGNGameComplete = () => {
        logInfo('GN game completed successfully');
        completeGameCron(true, {
            totalSpins: 25,
            totalWinnings: 500,
        });
    };
};
```

## Configuration Options

### Game Cron Configuration

```typescript
interface GameCronConfig {
    gameId: string; // Unique game identifier
    gameName: string; // Human-readable game name
    systemType: 'SG' | 'VG' | 'GN'; // Game system type
    environment: string; // Environment (LOCAL1, PROD, etc.)
    maxBatchSize: number; // Maximum logs per batch (default: 100)
    flushInterval: number; // Flush interval in ms (default: 10000)
    onlySendOnIssues: boolean; // Only send to Sentry on issues (default: true)
}
```

### Hook Options

```typescript
interface UseGameCronSentryOptions {
    gameCronId: string; // Unique game cron identifier
    gameName: string; // Human-readable game name
    systemType?: 'SG' | 'VG' | 'GN'; // Game system type
    environment?: string; // Environment
    maxBatchSize?: number; // Maximum batch size
    flushInterval?: number; // Flush interval
    onlySendOnIssues?: boolean; // Only send on issues
    autoComplete?: boolean; // Auto-complete on unmount
}
```

## What You See in Sentry

### Normal Operation (No Issues)

-   No Sentry events are sent
-   Logs are collected locally
-   Batch statistics are available via API

### When Issues Occur

```
[WARNING] [Game Cron: RNG Soccer] Batch Log Summary - Total: 15 (info: 12, warn: 2, error: 1) - Duration: 45000ms (WITH ISSUES)
```

### Detailed Context in Sentry Event

```json
{
    "gameCronId": "sg-rng-soccer-001",
    "gameName": "RNG Soccer",
    "systemType": "SG",
    "environment": "LOCAL1",
    "batchSize": 15,
    "duration": 45000,
    "hasIssues": true,
    "levels": {
        "info": {
            "count": 12,
            "messages": [
                { "message": "Game started", "timestamp": 1234567890, "componentName": "MyGameComponent" },
                { "message": "Bet placed", "timestamp": 1234567891, "componentName": "BetPanel" }
            ]
        },
        "warn": {
            "count": 2,
            "messages": [{ "message": "Connection timeout", "timestamp": 1234567892, "componentName": "ConnectionManager" }]
        },
        "error": {
            "count": 1,
            "messages": [{ "message": "Bet failed", "timestamp": 1234567893, "componentName": "BetPanel" }]
        }
    },
    "componentBreakdown": {
        "MyGameComponent": 5,
        "BetPanel": 8,
        "ConnectionManager": 2
    }
}
```

## Benefits

1. **Reduced Noise**: Only sends to Sentry when there are actual issues
2. **Game-Specific Monitoring**: Each game session is isolated
3. **Comprehensive Context**: All logs preserved with timestamps and component info
4. **Performance**: Reduces network overhead and Sentry processing
5. **Debugging**: Easy to correlate issues within a specific game session
6. **System Type Awareness**: Different handling for SG, VG, and GN games

## Best Practices

### 1. Use Descriptive Game Cron IDs

```typescript
// Good
gameCronId: 'sg-rng-soccer-2024-01-15-001';

// Avoid
gameCronId: 'game1';
```

### 2. Include Relevant Context

```typescript
logError('Bet failed', {
    betAmount: 100,
    betType: 'straight',
    playerId: 'player-123',
    roundId: 'round-456',
    errorCode: 'INSUFFICIENT_BALANCE',
});
```

### 3. Use Component Names

```typescript
logInfo('Component action', { action: 'button_click' }, 'BetPanel');
```

### 4. Complete Game Crons Properly

```typescript
// Always complete game crons with success/failure status
completeGameCron(true, { totalBets: 5, totalWinnings: 250 });
```

### 5. Handle Errors Gracefully

```typescript
try {
    // Game logic
    logInfo('Operation successful');
} catch (error) {
    logError('Operation failed', {
        error: error.message,
        operation: 'bet_placement',
    });
}
```

## Migration from Component Logging

### Before (Component-based)

```typescript
const { logInfo, logError } = useSentryHelperBatched({
    componentName: 'MyGameComponent',
    logLevel: SentryLogLevel.INFO,
});

logInfo('Game action performed');
```

### After (Game Cron-based)

```typescript
const { logInfo, logError, startGameCron, completeGameCron } = useGameCronSentry({
    gameCronId: 'sg-rng-soccer-001',
    gameName: 'RNG Soccer',
    systemType: 'SG',
});

startGameCron({ gameId: '118' });
logInfo('Game action performed');
completeGameCron(true);
```

## Troubleshooting

### Logs Not Appearing

1. Check if game cron is registered
2. Verify `onlySendOnIssues` setting
3. Ensure game cron has issues (warnings/errors/fatal)
4. Check batch statistics

### Performance Issues

1. Adjust `maxBatchSize` for larger games
2. Reduce `flushInterval` for more frequent updates
3. Use manual flushing for critical operations

### Memory Leaks

1. Ensure game crons are completed
2. Use auto-complete hooks
3. Monitor batch statistics for unusual growth

## API Reference

### Core Functions

-   `registerGameCron(gameCronId, config)` - Register a new game cron
-   `addGameCronLog(gameCronId, message, level, context?, componentName?)` - Add log to game cron
-   `completeGameCron(gameCronId, success?, metadata?)` - Complete a game cron
-   `flushAllGameCronBatches()` - Force flush all batches
-   `getGameCronBatchStats()` - Get batch statistics

### React Hooks

-   `useGameCronSentry(options)` - Main game cron hook
-   `useAutoGameCronSentry(options)` - Auto-start/complete hook
-   `useSimpleGameCronSentry(gameCronId, gameName, options?)` - Simple hook

### Configuration

-   `sentryGameCronBatchManager.setDefaultConfig(config)` - Set default configuration
-   `sentryGameCronBatchManager.getDefaultConfig()` - Get default configuration
