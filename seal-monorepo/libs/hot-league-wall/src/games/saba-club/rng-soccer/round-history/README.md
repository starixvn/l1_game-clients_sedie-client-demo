# RNG Soccer Round History

This directory contains the round history implementation for the RNG Soccer game, based on the big-small round history pattern.

## Components

### RNGSoccerRoundHistory

The main round history component that displays the last 10 rounds with their results.

**Features:**

-   Displays round history as colored dots (home, away, draw)
-   Shows tooltips with detailed round information on hover
-   Integrates with the game's observer system for real-time updates
-   Supports internationalization

**Props:**

-   `namespace`: The game namespace for observer integration
-   `language`: The current language for translations

### RNGSoccerRoundDot

A reusable dot component that represents a single round result.

**Props:**

-   `choice`: The result choice ('home', 'away', 'draw', or 'next')
-   `size`: The dot size ('small', 'medium', 'large')
-   `value`: The text to display in the dot
-   `highlight`: Whether to highlight the dot

### RNGSoccerRoundHistoryTooltip

A tooltip component that shows detailed information about a round.

**Props:**

-   `roundId`: The round ID
-   `winner`: The winning choice
-   `result`: The detailed round result with scores and cards

## Styling

The round history uses a dedicated SCSS module (`rng-soccer-round-history.module.scss`) with:

-   **Color-coded dots**: Red for home wins, blue for away wins, yellow for draws
-   **Hover effects**: Tooltips appear on hover with detailed information
-   **Responsive design**: Adapts to different screen sizes
-   **Animations**: Smooth transitions and pulse effects for the "next" dot

## Integration

The round history is integrated into the main game page (`page.tsx`) in the `renderCustomContent()` method, alongside the settlement result component.

## Usage

```tsx
import { RNGSoccerRoundHistory } from './round-history';

// In your component
<RNGSoccerRoundHistory namespace={setting.mainObserverNamespace} language={this.props.language} />;
```

## Data Flow

1. The component observes round history changes via the `@render` decorator
2. When new data arrives, it updates the state with the latest 10 rounds
3. The component renders the rounds as dots with appropriate colors
4. Hovering over a dot shows a tooltip with detailed round information

## Translation Keys

The component uses the following translation keys:

-   `Common.previous_round`: Label for the round history section
-   `Common.round`: Round ID label
-   `RNGSoccer.beadboard_home`: Home team label
-   `RNGSoccer.beadboard_away`: Away team label
-   `RNGSoccer.beadboard_draw`: Draw label
-   `RNGSoccer.home_win`: Home win text
-   `RNGSoccer.away_win`: Away win text
-   `RNGSoccer.draw`: Draw text
-   `RNGSoccer.home`: Home team label
-   `RNGSoccer.away`: Away team label
-   `RNGSoccer.suit_*`: Card suit labels
