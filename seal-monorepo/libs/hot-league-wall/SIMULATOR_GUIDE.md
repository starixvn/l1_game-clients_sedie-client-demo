# 🎮 Game Simulator Guide

## Overview

The Game Simulator provides a complete offline prototyping environment for game development without requiring real service connections or internet access. It simulates all game client stores, handlers, and data flows using realistic fake data.

## 🚀 Quick Start

### 1. Enable Simulator Mode

Set your environment to development mode and use the simulator configuration:

```bash
# Set environment
export NODE_ENV=development

# Or use the simulator config
export SIMULATOR_CONFIG='{"simulationMode":{"enabled":true}}'
```

### 2. Use Simulator Gateway

Replace `GatewayGameBase` with `GatewayGameSimulator` in your game components:

```typescript
import GatewayGameSimulator from '../gateway/gateway-game-simulator';

class MyGame extends GatewayGameSimulator<MyGameProps, MyGameState> {
    // Your game implementation
}
```

### 3. Initialize Simulator

The simulator will automatically initialize when the component mounts, but you can also manually control it:

```typescript
import GameSimulatorService from '../_shared/services/game-simulator.service';

const simulator = GameSimulatorService.getInstance();
simulator.initialize({
    gameType: 'rng-soccer',
    enableErrorSimulation: false,
    updateInterval: 1000,
});
```

## 📋 Configuration

### Simulator Configuration File

Create `configs.SIMULATOR.json`:

```json
{
    "sentry": {
        "dsn": "https://2af29bdacdbf4d9ba2db6600b450541f@sentry.lumigame.com/28",
        "environment": "SIMULATOR"
    },
    "systemType": "SG",
    "serverDomain": "localhost",
    "ssl": false,
    "subDomain": "simulator",
    "env": "SIMULATOR",
    "simulatorConfigs": {
        "enabled": true,
        "gameLobbySimulatorUrl": "http://localhost:3000/simulator",
        "owApiSimulatorUrl": "http://localhost:3000/simulator/api",
        "operatorId": "SIMULATOR_OP",
        "operatorSecret": "simulator_secret_key",
        "operatorToken": "simulator_token",
        "updateInterval": 1000,
        "enableErrorSimulation": false,
        "defaultGameType": "rng-soccer"
    },
    "simulationMode": {
        "enabled": true,
        "autoConnect": true,
        "autoAuthorize": true,
        "realTimeUpdates": true,
        "fakeDataGeneration": true
    }
}
```

### Environment Variables

```bash
# Enable simulator mode
NODE_ENV=development
SIMULATOR_CONFIG='{"simulationMode":{"enabled":true}}'

# Or set specific simulator options
SIMULATOR_GAME_TYPE=rng-soccer
SIMULATOR_UPDATE_INTERVAL=1000
SIMULATOR_ERROR_SIMULATION=false
```

## 🎯 Supported Game Types

### 1. RNG Soccer

-   **ID**: `rng-soccer`
-   **Description**: Football betting simulation
-   **Features**: Team data, odds, betting, round history

### 2. Baccarat

-   **ID**: `baccarat`
-   **Description**: Card game simulation
-   **Features**: Player/Banker cards, tie betting, card history

### 3. Fish Prawn Crab

-   **ID**: `fish-prawn-crab`
-   **Description**: Dice game simulation
-   **Features**: 6-sided dice, multiple betting options

### 4. Custom Games

-   **ID**: Any string
-   **Description**: Default game simulation
-   **Features**: Basic betting, odds, round management

## 🔧 API Reference

### GameSimulatorService

#### Methods

```typescript
// Get singleton instance
const simulator = GameSimulatorService.getInstance();

// Initialize simulator
simulator.initialize({
    gameType: string,              // Game type (rng-soccer, baccarat, etc.)
    enableErrorSimulation?: boolean, // Enable error simulation
    updateInterval?: number,        // Update interval in milliseconds
    customData?: any               // Custom data to override defaults
});

// Get current fake data
const fakeData = simulator.getFakeData();

// Get simulation state
const state = simulator.getSimulationState();

// Toggle error simulation
simulator.toggleErrorSimulation();

// Reset failure count
simulator.resetFailureCount();

// Stop simulator
simulator.stop();

// Check if active
const isActive = simulator.isActive();
```

#### Simulation State

```typescript
{
    isSimulationMode: boolean,
    currentRoundId: number,
    roundState: string,           // placingBets, lockingBet, showingResult, finished
    countdownTimer: number,
    isConnected: boolean,
    isAuthorized: boolean,
    isSignedIn: boolean
}
```

### GatewayGameSimulator

#### Methods

```typescript
// Get simulator data
const data = this.getSimulatorData();

// Get simulator state
const state = this.getSimulatorState();

// Toggle error simulation
this.toggleErrorSimulation();

// Reset simulator failures
this.resetSimulatorFailures();

// Check if simulator mode is active
const isActive = this.isSimulatorModeActive();
```

## 🎮 Demo Component

Use the built-in demo component to test the simulator:

```typescript
import GameSimulatorDemo from '../_shared/components/game-simulator-demo/game-simulator-demo';

// In your app
<GameSimulatorDemo />
```

The demo provides:

-   Real-time simulation display
-   Game type switching
-   Error simulation controls
-   Live data monitoring
-   Configuration management

## 🔄 Data Flow

### 1. Initialization

```
Component Mount → Check Simulator Mode → Initialize Simulator → Set Initial State
```

### 2. Real-time Updates

```
Simulator Loop → Update Countdown → Update Round State → Update Fake Data → Emit Updates
```

### 3. Round Progression

```
Placing Bets → Locking Bet → Showing Result → Finished → New Round
```

### 4. Error Simulation

```
Error Trigger → Simulate Connection Loss → Wait → Restore Connection
```

## 🧪 Testing Scenarios

### 1. Happy Path Testing

```typescript
// Normal game flow without errors
simulator.initialize({
    gameType: 'rng-soccer',
    enableErrorSimulation: false,
});
```

### 2. Error Testing

```typescript
// Test error handling
simulator.initialize({
    gameType: 'rng-soccer',
    enableErrorSimulation: true,
});
```

### 3. Performance Testing

```typescript
// Test with different update intervals
simulator.initialize({
    gameType: 'rng-soccer',
    updateInterval: 500, // Faster updates
});
```

### 4. Game Type Testing

```typescript
// Test different game types
const gameTypes = ['rng-soccer', 'baccarat', 'fish-prawn-crab'];
gameTypes.forEach((type) => {
    simulator.initialize({ gameType: type });
});
```

## 🎨 Customization

### Custom Fake Data

```typescript
simulator.initialize({
    gameType: 'rng-soccer',
    customData: {
        teamData: {
            home: { name: 'Custom Team A', rank: 1, suit: 2, score: 3 },
            away: { name: 'Custom Team B', rank: 2, suit: 1, score: 1 },
        },
        roundOdds: {
            odds: { home: 2.0, draw: 3.5, away: 2.5 },
            boostedChoices: ['away'],
        },
    },
});
```

### Custom Round Durations

```typescript
simulator.initialize({
    gameType: 'rng-soccer',
    customData: {
        gameSettings: {
            durations: {
                placingBet: 45, // 45 seconds
                lockingBet: 15, // 15 seconds
                showingResult: 20, // 20 seconds
                finished: 5, // 5 seconds
            },
        },
    },
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Simulator not starting**

    - Check `NODE_ENV=development`
    - Verify simulator config is enabled
    - Check console for initialization errors

2. **No data updates**

    - Verify update interval is set correctly
    - Check if simulator is active
    - Monitor console logs for errors

3. **Wrong game type**
    - Verify game type string matches supported types
    - Check namespace or gameId mapping
    - Use custom data to override defaults

### Debug Mode

Enable detailed logging:

```typescript
// Add to your component
useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🎮 [SIMULATOR] Debug mode enabled');
        console.log('🎮 [SIMULATOR] Current state:', simulator.getSimulationState());
        console.log('🎮 [SIMULATOR] Fake data:', simulator.getFakeData());
    }
}, []);
```

## 📚 Examples

### Basic Game Component

```typescript
import React from 'react';
import GatewayGameSimulator from '../gateway/gateway-game-simulator';

interface MyGameProps {
    namespace: string;
    gameId: number;
}

interface MyGameState extends IGatewayGameBaseState {
    customField: string;
}

class MyGame extends GatewayGameSimulator<MyGameProps, MyGameState> {
    constructor(props: MyGameProps) {
        super(props);
        this.state = {
            ...this.state,
            customField: 'initial value'
        };
    }

    componentDidMount() {
        if (this.isSimulatorModeActive()) {
            console.log('🎮 [MY_GAME] Running in simulator mode');
        }
    }

    renderGameLayout(): JSX.Element {
        return (
            <div>
                <h1>My Game</h1>
                {this.isSimulatorModeActive() && (
                    <div style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        background: '#ffeb3b',
                        padding: '10px',
                        borderRadius: '4px'
                    }}>
                        🎮 Simulator Mode
                    </div>
                )}
                {/* Your game UI */}
            </div>
        );
    }
}

export default MyGame;
```

### Advanced Configuration

```typescript
// configs.SIMULATOR_ADVANCED.json
{
    "simulatorConfigs": {
        "enabled": true,
        "updateInterval": 500,
        "enableErrorSimulation": true,
        "defaultGameType": "baccarat",
        "customScenarios": {
            "highVolume": {
                "updateInterval": 200,
                "enableErrorSimulation": false
            },
            "errorTesting": {
                "updateInterval": 1000,
                "enableErrorSimulation": true
            }
        }
    }
}
```

## 🎯 Best Practices

1. **Always check simulator mode** before making real API calls
2. **Use realistic fake data** that matches your game requirements
3. **Test error scenarios** to ensure robust error handling
4. **Monitor performance** with different update intervals
5. **Document custom configurations** for team consistency
6. **Use the demo component** for initial testing and validation

## 🔗 Integration Points

-   **GatewayGameBase**: Base class for real service connections
-   **GameSimulatorService**: Core simulator functionality
-   **GameSimulatorDemo**: Demo component for testing
-   **Config files**: Environment-specific configurations
-   **Console logging**: Real-time debugging and monitoring

This simulator provides a complete offline development environment that mimics real service behavior while allowing full control over data and scenarios for testing and prototyping.
