# RNG Soccer Game - Console Logs & Static Prototype

This document provides information about the console logs added to all RNG Soccer components and the static prototype created with fake data.

## 🔍 Console Logs Added

### Color-coded Logging System

All console logs use color-coded emojis for easy identification:

- 🔵 **RNGSoccerPage** - Main game page component
- 🟢 **RNGSoccerStatistic** - Statistics popup component  
- 🟡 **RNGSoccerSettlementResult** - Settlement result display
- 🟠 **RNGSoccerScoreboard** - Scoreboard and big road
- 🟣 **RNGSoccerBetOptions** - Betting options component
- 🔴 **GameBase Components** - Base game components and services

### Component Logs

#### RNGSoccerPage (🔵)
- Constructor calls with props
- Initial state setup
- Game container configuration
- State management method calls (togglePopup, setShowBetPanel, setPanelId)
- UI rendering method calls
- Bet callback triggers

#### RNGSoccerStatistic (🟢)
- Component rendering with props
- Close button interactions

#### RNGSoccerSettlementResult (🟡)
- Constructor and initial state
- Round state changes
- Settlement result handling
- Game history processing
- Animation state changes
- Error handling

#### RNGSoccerScoreboard (🟠)
- Constructor and big road initialization
- Round history updates
- Locking state changes
- Data processing and rendering

#### RNGSoccerBetOptions (🟣)
- Bet option rendering
- Bet placement interactions
- Boosted choice detection
- State updates

#### GameBase Components (🔴)
- GameUIRenderer method calls
- GameConnectionService operations
- GameUIService interactions
- Message logic processing
- Component lifecycle events

## 📊 Fake Data Structure

The static prototype uses comprehensive fake data that mimics real game state:

### Core Data Objects

```typescript
FAKE_RNG_SOCCER_DATA = {
  gameSettings: {
    id: 'rng-soccer',
    name: 'RNGSoccer',
    durations: { placingBet: 30, lockingBet: 10, showingResult: 15, finished: 5 }
  },
  
  currentRound: {
    roundId: 12345,
    roundState: 'placingBets',
    countdownTimer: 15,
    isAllowedBet: true,
    isLocking: false
  },
  
  teamData: {
    home: { name: 'Manchester United', rank: 1, suit: 2, score: 2 },
    away: { name: 'Liverpool', rank: 3, suit: 1, score: 1 }
  },
  
  roundOdds: {
    odds: { home: 1.85, draw: 3.20, away: 2.10 },
    boostedChoices: ['home']
  },
  
  roundHistory: [
    // Array of 10 previous rounds with results
  ],
  
  uiState: {
    isPopupVisible: false,
    showBetPanel: false,
    isShowNextRoundMessage: false,
    isAnimationResult: false
  }
}
```

### Data Relationships

1. **Round State Flow**: `placingBets` → `lockingBet` → `showingResult` → `finished`
2. **Betting Flow**: User selects bet → Bet confirmation → Next round message
3. **Result Display**: Team scores → Winner determination → Settlement result
4. **History Tracking**: Previous rounds stored with settlement results

## 🎮 Static Prototype Features

### Interactive Elements

1. **Countdown Timer**: Simulates real-time countdown with state changes
2. **Betting Interface**: Clickable bet options during placing bets phase
3. **Statistics Popup**: Toggle-able round history display
4. **Console Log Capture**: Real-time logging of all component interactions
5. **Round State Simulation**: Automatic progression through game phases

### Demo Controls

- **Show/Hide Console Logs**: Toggle real-time log display
- **Clear Logs**: Reset console log history
- **Interactive Betting**: Place bets during appropriate phases
- **Statistics View**: Access round history popup

## 🚀 Usage Instructions

### Running the Static Prototype

1. Import the demo component:
```typescript
import RNGSoccerDemo from './rng-soccer-demo';
```

2. Use in your application:
```typescript
<RNGSoccerDemo />
```

### Console Log Analysis

1. **Open Browser DevTools**: Press F12 to open developer tools
2. **Navigate to Console Tab**: View all color-coded logs
3. **Filter by Component**: Use browser console filtering for specific components
4. **Monitor Interactions**: Watch logs as you interact with the prototype

### Data Flow Observation

1. **Component Initialization**: Watch constructor and setup logs
2. **State Changes**: Monitor state update logs during interactions
3. **Method Calls**: Track function execution through logs
4. **Error Handling**: Identify error scenarios and handling

## 📈 Benefits of Console Logging

### Development Benefits

1. **Debugging**: Easy identification of component issues
2. **State Tracking**: Monitor data flow and state changes
3. **Performance**: Identify slow operations or unnecessary re-renders
4. **Integration**: Understand component interaction patterns

### Testing Benefits

1. **Behavior Verification**: Confirm expected component behavior
2. **Data Validation**: Verify correct data processing
3. **User Flow Testing**: Test complete user interaction flows
4. **Error Scenario Testing**: Test error handling and edge cases

## 🔧 Customization

### Adding More Logs

To add additional console logs:

```typescript
console.log('🔵 ComponentName: Description of action', data);
```

### Modifying Fake Data

Update the `fake-data.ts` file to modify:
- Game settings and durations
- Team data and odds
- Round history
- UI state defaults

### Extending the Prototype

Add new features by:
1. Extending the fake data structure
2. Adding new UI components
3. Implementing additional interaction handlers
4. Creating new console log categories

## 📝 Notes

- All console logs are prefixed with component identifiers for easy filtering
- The static prototype is completely self-contained and doesn't require backend services
- Fake data is realistic and covers all major game scenarios
- Console logging can be easily disabled for production builds
- The prototype demonstrates the complete game flow without external dependencies 