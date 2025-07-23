# RNG Soccer Round History

This directory contains the round history implementation for the RNG Soccer game, providing both the original observer-based component and integration with the prototype system.

## Components

### RNGSoccerRoundHistory (Original)

The main round history component that displays the last 16 rounds with their results using the observer pattern.

**Features:**

-   Displays round history as colored dots (home, away, draw)
-   Shows tooltips with detailed round information on hover
-   Integrates with the game's observer system for real-time updates
-   Supports internationalization
-   Displays up to 16 most recent rounds

**Props:**

-   `language`: The current language for translations
-   `togglePopup`: Callback function to toggle statistics popup

### RNGSoccerRoundDot

A reusable dot component that represents a single round result.

**Props:**

-   `choice`: The result choice ('home', 'away', 'draw', or 'next')
-   `value`: The text to display in the dot (H, A, D, or ?)
-   `highlight`: Whether to highlight the dot (for "next" round)

### Integration with Prototype

The round history is also integrated into the `RNGSoccerBase` prototype component, providing static round history functionality for development and testing.

**Features:**

-   Static round history display using fake data
-   Same visual representation as the original component
-   Statistics button integration
-   Responsive design

## Data Structure

### Round History Item

```typescript
interface RNGSoccerRoundHistory {
    roundId: number;
    settlementResult: {
        home: boolean;
        away: boolean;
        draw: boolean;
    };
    result: {
        homeScore: number;
        awayScore: number;
        home: { rank: number; suit: number };
        away: { rank: number; suit: number };
    };
}
```

### Fake Data

The prototype uses comprehensive fake data with **16 rounds** of history:

**Recent Rounds (newest first):**

1. Round 12344: Home win (2-0)
2. Round 12343: Away win (0-1)
3. Round 12342: Draw (1-1)
4. Round 12341: Home win (3-1)
5. Round 12340: Away win (0-2)
6. Round 12339: Home win (2-0)
7. Round 12338: Draw (1-1)
8. Round 12337: Away win (0-1)
9. Round 12336: Home win (2-1)
10. Round 12335: Draw (0-0)
11. Round 12334: Home win (3-0)
12. Round 12333: Away win (1-2)
13. Round 12332: Home win (2-1)
14. Round 12331: Draw (1-1)
15. Round 12330: Away win (0-3)
16. Round 12329: Home win (2-0)

**Pattern Analysis:**

-   **Home Wins**: 8 rounds (50%)
-   **Away Wins**: 6 rounds (37.5%)
-   **Draws**: 2 rounds (12.5%)

## Styling

The round history uses dedicated SCSS modules:

### rng-soccer-round-history.module.scss

-   **Layout**: Flexbox-based responsive layout
-   **Dot container**: Horizontal stack with wrapping
-   **Statistics button**: Hover effects and proper spacing
-   **Responsive design**: Adapts to different screen sizes

### dot.module.scss

-   **Color-coded dots**:
    -   Blue gradient for home wins (`#1875e2` to `#0158be`)
    -   Red gradient for away wins (`#f31a29` to `#cc0110`)
    -   Green gradient for draws (`#0dd009` to `#04a801`)
    -   Gray gradient for "next" round
-   **Animations**: Smooth transitions and effects
-   **Sizing**: Consistent 14px diameter dots

## Integration

### Original Implementation

The round history is integrated into the main game page using the observer pattern:

```tsx
import RNGSoccerRoundHistory from './round-history/rng-soccer-round-history';

// In your component
<RNGSoccerRoundHistory language={this.props.language} togglePopup={this.toggleStatisticsPopup} />;
```

### Prototype Integration

The round history is integrated into the `RNGSoccerBase` component:

```tsx
import RNGSoccerBase from './rng-soccer-base';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';

const gameData = {
    // ... other game data
    roundHistory: FAKE_RNG_SOCCER_DATA.roundHistory,
};

<RNGSoccerBase gameData={gameData} />;
```

## Usage Examples

### Basic Usage with Fake Data

```tsx
import RNGSoccerBase from './rng-soccer-base';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';

const gameData = {
    gameSettings: { gameName: 'RNG Soccer' },
    currentRound: { roundId: 12345, roundState: 'placingBets', countdownTimer: 15 },
    teamData: {
        /* team data */
    },
    currentResult: {
        /* result data */
    },
    roundOdds: { odds: { home: 1.85, draw: 3.2, away: 2.1 } },
    roundHistory: FAKE_RNG_SOCCER_DATA.roundHistory, // 16 rounds of history
};

<RNGSoccerBase gameData={gameData} />;
```

### Custom Round History

```tsx
const customHistory = [
    {
        roundId: 1,
        settlementResult: { home: true, away: false, draw: false },
        result: { homeScore: 2, awayScore: 0, home: { rank: 1, suit: 1 }, away: { rank: 2, suit: 2 } },
    },
    // ... more rounds
];

const gameData = {
    // ... other data
    roundHistory: customHistory,
};
```

## Data Flow

### Observer Pattern (Original)

1. Component observes round history changes via `@render` decorator
2. When new data arrives, updates state with latest 16 rounds
3. Renders rounds as colored dots with appropriate styling
4. Provides hover tooltips with detailed information

### Static Pattern (Prototype)

1. Receives round history data as props
2. Processes settlement results to determine winners
3. Renders up to 16 most recent rounds
4. Shows "next" round indicator
5. Provides statistics button functionality

## Translation Keys

The component uses the following translation keys:

-   `RNGSoccer.beadboard_home`: Home team label
-   `RNGSoccer.beadboard_away`: Away team label
-   `RNGSoccer.beadboard_draw`: Draw label
-   `RNGSoccer.home_win`: Home win text
-   `RNGSoccer.away_win`: Away win text
-   `RNGSoccer.draw`: Draw text

## Testing

### Visual Testing

-   **16 rounds**: Verify all 16 dots display correctly
-   **Color coding**: Confirm proper colors for each result type
-   **Responsive**: Test on different screen sizes
-   **Statistics button**: Verify hover effects and click functionality

### Data Testing

-   **Empty history**: Test behavior with no rounds
-   **Partial history**: Test with fewer than 16 rounds
-   **Mixed results**: Verify proper handling of various win patterns

## Future Enhancements

Potential improvements:

1. **Animations**: Add smooth transitions for new round results
2. **Click handlers**: Implement click functionality for individual dots
3. **Detailed tooltips**: Show more round information on hover
4. **Performance**: Optimize rendering for large history sets
5. **Accessibility**: Add ARIA labels and keyboard navigation
