# Guide to Implementing a New Game Product

This guide provides step-by-step instructions for adding a new game product to the SABA Games platform, based on implementations like Fish-Prawn-Crab, Color Game, and Big-Small.

## Table of Contents

-   [1. Project Structure](#1-project-structure)
-   [2. Configuration](#2-configuration)
-   [3. Component Creation](#3-component-creation)
-   [4. Integration](#4-integration)
-   [5. Styling Best Practices](#5-styling-best-practices)
-   [6. Common Issues and Solutions](#6-common-issues-and-solutions)

## 1. Project Structure

Create the following folder structure for your new game (replace `game-name` with your game's name):

```
seal-monorepo/libs/saba-games/src/games/saba-club/game-name/
├── bet-option/
│   ├── index.ts
│   └── bet-option.module.scss
├── round-history/
│   ├── index.ts
│   └── round-history.module.scss
├── scoreboard/
│   ├── index.ts
│   └── scoreboard.module.scss
├── settlement-result/
│   ├── index.ts
│   └── settlement-result.module.scss
├── statistic/
│   ├── index.ts
│   └── statistic.module.scss
├── result-history/
│   ├── index.ts
│   └── result-history.module.scss
├── dot/
│   └── ...
├── index.ts
├── game-settings.ts
├── header.tsx
├── header.module.scss
├── page.tsx
├── type.ts
└── game-name.module.scss
```

## 2. Configuration

### 2.1 Define Game Constants

Add your game ID and namespace to the constants file:

```typescript
// seal-monorepo/libs/saba-games/constant/app.ts
export const YOUR_GAME_ID = XX; // Replace XX with your game ID
export const YOUR_GAME_NAMESPACE = 'yourgame'; // Replace with your game namespace
```

### 2.2 Create Game Settings

Implement a game-settings.ts file with your game configuration:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/game-settings.ts
import * as gc from '@sg/sg-game-client';
import { getGameSetting, getSiteConfig } from '../../../_shared/app-settings';
import { sharedContainer } from '../../../_shared/components/game-base/startup';

// Use your game ID from saba-game-settings.json
export const setting = getGameSetting(YOUR_GAME_ID);
export const siteConfigs = getSiteConfig(YOUR_GAME_ID);

export const containerOptions: gc.IContainerOptions = gc.getGameContainer(setting, siteConfigs, sharedContainer);
```

### 2.3 Define Game Types

Create type definitions in type.ts, including choices, results, and history types:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/type.ts
// Define game choices (e.g., Big-Small has "big" and "small")
export const GameChoices = {
    choice1: 'choice1',
    choice2: 'choice2',
};

// Group choices as needed
export const mainChoices = [GameChoices.choice1, GameChoices.choice2];

// Define result structure
export type GameResult = {
    // Game-specific result properties
    property1: number;
    property2: boolean;
};

// Define settlement result structure
export type GameSettlementResult = {
    // Which choices won in this round
    choice1: boolean;
    choice2: boolean;
};

// Define round history structure for displaying past results
export type GameRoundHistory = {
    settlementResult: GameSettlementResult;
    result: GameResult;
    roundId: number;
};
```

### 2.4 Create Index File

Create an index.ts file to export your components (optional but recommended):

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/index.ts
export { default as GamePage } from './page';
export { GameHeader } from './header';
export * from './type';
// Export other components as needed
```

## 3. Component Creation

### 3.1 Main Page Component

Create the page.tsx file as the main container for your game:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/page.tsx
import React, { Suspense, useState } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer } from '@sg/sg-observer';
import GatewayGameBase, { IGatewayGameBaseState } from '../../../_shared/components/game-base/gateway-gamebase';
import { configGameContainer } from '../../../_shared/components/game-base/startup';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';
import { GameBetOptions } from './bet-option';
import { containerOptions, setting } from './game-settings';
import Styles from './game-name.module.scss';
import { GameSettlementResult } from './settlement-result';
import { GameHeader } from './header';
import { GameRoundHistory } from './round-history';
import { GameStatistic } from './statistic';

@observer(setting.mainObserverNamespace)
export default class GamePage extends GatewayGameBase<{ namespace: string; language: string }, IGatewayGameBaseState> {
    override overrideClasses = {
        blockWrapper: Styles['block-wrapper'],
        betOptions: Styles['bet-options-block'],
        info: Styles['info-block'],
        result: Styles['result-block'],
    };

    state = {
        ...this.state,
        gameId: setting.id,
        isHeaderExpanded: true
    };

    constructor(props: { namespace: string; language: string }) {
        super(props);
        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
            // Silent fail on initialization error
        }
    }

    toggleHeader = () => {
        this.setState({
            ...this.state,
            isHeaderExpanded: !this.state.isHeaderExpanded
        });
    }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() { }

    renderHeader() {
        return (
            <GameHeader
                isExpanded={this.state.isHeaderExpanded}
                handleToggle={this.toggleHeader}
            />
        );
    }

    renderRoundHistory() {
        return (
            <Suspense>
                <GameRoundHistory namespace={this.props.namespace} language={this.props.language} />
            </Suspense>
        );
    }

    renderBettingBlock() {
        return (
            <GameBettingOptionsContext.Provider
                value={{
                    panelId: this.state.activePanelId,
                    setPanelId: this.setPanelId,
                    show: this.state.showBetPanel,
                    setShow: this.setShowBetPanel,
                }}
            >
                <GameBetOptions
                    gameName={setting.gameName}
                    namespace={this.props.namespace}
                    language={this.props.language}
                    onBet={this.handleBetOption}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderResultBlock() {
        return <GameSettlementResult namespace={this.props.namespace} language={this.props.language} />;
    }

    renderStatistic() {
        return (
            <Suspense>
                <GameStatistic namespace={this.props.namespace} gameName={setting.gameName} language={this.props.language} />
            </Suspense>
        );
    }

    async showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ) {
        await FunctionUtils.delay(2000);
        // Implement result display logic
    }
}
```

### 3.2 Header Component

Implement a functional header component with toggle functionality:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/header.tsx
import * as gc from '@sg/sg-game-client';
import classNames from 'classnames';
import styles from './header.module.scss';

interface GameHeaderProps {
    isExpanded: boolean;
    handleToggle: () => void;
}

export const GameHeader = ({ isExpanded, handleToggle }: GameHeaderProps) => {
    // Use translator for internationalization
    const gameName = gc.Translator.translate('YourNamespace.game_name');
    const gameOptions = gc.Translator.translate('YourNamespace.choices_type');

    return (
        <div className={styles['game-title']} onClick={handleToggle}>
            <div className={styles['title-with-icon']}>
                <div
                    className={classNames(styles['collapse-btn'], {
                        [styles['collapsed']]: !isExpanded,
                    })}
                >
                    <div className={styles['collapse-icon']}></div>
                </div>
                <div className={styles['game-header']}>
                    <div className={styles['game-icon']}></div>
                    <div className={styles['game-name']}>{gameName}</div>
                </div>
            </div>

            {isExpanded && (
                <div className={styles['game-option-container']}>
                    <span className={styles['game-option']}>{gameOptions}</span>
                </div>
            )}
        </div>
    );
};
```

### 3.3 Statistic Component

Create a statistics component that displays game outcomes:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/statistic/game-statistic.tsx
import React from 'react';
import styles from './statistic.module.scss';
import { GameScoreboard } from '../scoreboard';
import { GameResultHistory } from '../result-history';

interface Props {
    namespace: string;
    gameName?: string;
    language: string;
}

export default function GameStatistic({ namespace, gameName, language }: Props) {
    return (
        <div className={styles.statistic}>
            <GameScoreboard
                namespace={namespace}
                gameName={gameName}
                language={language}
            />
            <GameResultHistory
                namespace={namespace}
                language={language}
            />
        </div>
    );
}
```

And create an index.ts file to export it:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/statistic/index.ts
export { default as GameStatistic } from './game-statistic';
```

### 3.4 Round History Component

Create a round history component to display past game results:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/round-history/game-round-history.tsx
import React from 'react';
import * as gc from '@sg/sg-game-client';
import { observer } from '@sg/sg-observer';
import styles from './round-history.module.scss';
import { GameChoices } from '../type';
import { setting } from '../game-settings';

interface Props {
    namespace: string;
    language: string;
}

@observer(setting.mainObserverNamespace)
export default class GameRoundHistory extends React.Component<Props> {
    render() {
        return (
            <div className={styles.roundHistory}>
                <div className={styles.title}>Round History</div>
                <div className={styles.content}>
                    {/* Implement round history display logic */}
                </div>
            </div>
        );
    }
}
```

And create an index.ts file to export it:

```typescript
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/round-history/index.ts
export { default as GameRoundHistory } from './game-round-history';
```

### 3.5 Additional Components

Follow similar patterns for other components:

-   Bet Options
-   Settlement Results
-   Scoreboard
-   Result History

Each component should:

1. Have a clear interface defining its props
2. Be properly exported in an index.ts file
3. Have associated styles in a .module.scss file

## 4. Integration

### 4.1 Update Component Mapping

Add your game to the gamePageMap and gameHeaderMap in component-util.ts:

```typescript
// seal-monorepo/libs/saba-games/src/_shared/utils/component-util.ts
import { YOUR_GAME_ID, YOUR_GAME_NAMESPACE } from '../../../constant/app';
import GamePage from '../../games/saba-club/game-name/page';
import { GameHeader } from '../../games/saba-club/game-name/header';

export const gamePageMap = {
    // Existing mappings...
    [YOUR_GAME_ID]: { component: GamePage, namespace: YOUR_GAME_NAMESPACE },
};

export const gameHeaderMap = {
    // Existing mappings...
    [YOUR_GAME_ID]: GameHeader,
};
```

### 4.2 Update Game Tab List

Add your game to the GameListTab component:

```typescript
// seal-monorepo/libs/saba-games/src/_shared/components/all-tab-components/game-list-tab/index.tsx
import { YOUR_GAME_ID } from "../../../../../../saba-games/constant/app";

// Inside the component JSX
<div
    className={classNames({
        [styles['tab-button']]: true,
        [styles['tab-button-active']]: game.gameId === selectedGameId,
        // Other game buttons...
        [styles['tab-button-your-game']]: game.gameId === YOUR_GAME_ID,
    })}
>
    <div
        className={classNames({
            // Other game icons...
            [styles['your-game-icon']]: game.gameId === YOUR_GAME_ID,
        })}
    ></div>
    <span>{getGameTabName(gamePageMap[game.gameId].namespace)}</span>
</div>
```

### 4.3 Add Tab Icon Styles

Add your game's tab icon styles to the CSS:

```scss
// seal-monorepo/libs/saba-games/src/_shared/components/all-tab-components/game-list-tab/game-list-tab.module.scss
.your-game-icon {
    @extend %icon;
    background-image: url('../../../../assets/game-icons/your-game.png');
    // Fallback if icon doesn't exist
    background-color: #your-color;
    border-radius: 50%;
}
```

## 5. Styling Best Practices

### 5.1 Direct CSS Values Over SCSS Imports

Avoid SCSS imports and use direct CSS values instead:

```scss
/* Avoid these problematic imports */
@import '../../../_shared/scss/theme';
@import '../../../_shared/scss/variables';
@import '../../../_shared/scss/mixins';

/* Instead, use direct values */
.element {
    color: #ffffff; /* Instead of $white */
    background-color: #1e1e1e; /* Instead of $darkbackground */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Instead of @include default-box-shadow */
}
```

### 5.2 Media Queries

Use standard media queries instead of SCSS mixins:

```scss
/* Avoid this */
@include screen-sizes {
    .element {
        font-size: 20px;
    }
}

/* Do this instead */
@media (min-width: 768px) {
    .element {
        font-size: 20px;
    }
}
```

### 5.3 Main Stylesheet Structure

Follow a consistent pattern for your main stylesheet:

```scss
// seal-monorepo/libs/saba-games/src/games/saba-club/game-name/game-name.module.scss
.block-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
}

.bet-options-block {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-block {
    border-radius: 4px;
    background-color: #2a2a2a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-block {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border-radius: 4px;
    overflow: hidden;
    padding: 0;
    margin: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Add responsive styles */
@media (min-width: 768px) {
    .block-wrapper {
        gap: 20px;
    }

    .result-block {
        min-height: 300px;
    }

    .bet-options-block {
        min-height: 400px;
    }
}
```

## 6. Common Issues and Solutions

### 6.1 Missing Type Definitions

Check module existence and update import paths:

```typescript
// If you see errors like:
// Cannot find module '../../../_shared/components/game-base/base-game-header'

// First, verify the path is correct
// Then, you might need to create type definitions for the module
declare module '../../../_shared/components/game-base/base-game-header' {
    export class BaseGameHeader<T> extends React.Component<T> {
        // Define required methods and properties
    }
}
```

### 6.2 Component Props Type Errors

Ensure all props are properly defined in interfaces:

```typescript
// If you see errors like:
// Property 'namespace' does not exist on type 'IntrinsicAttributes & Props'

// Make sure your Props interface includes all required properties
interface Props {
    namespace: string; // Add the missing property
    language: string;
    // Other properties...
}
```

### 6.3 Translation Issues

Add translation keys and use the translator utility:

```typescript
// Add translations to the relevant language files for your game

// Then use the translator in your components
const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
const gameName = t('YourNamespace.game_name');
```

### 6.4 Stylesheet Issues

Remove problematic imports and use direct CSS values:

```scss
// If you encounter SCSS compilation errors, convert:
color: $white;
// To:
color: #ffffff;

// And convert:
@include default-box-shadow;
// To:
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

## 7. Advanced Features

### 7.1 Component Organization Patterns

For larger games, consider organizing components with these patterns:

1. **Container/Presenter pattern**: Separate data handling from UI rendering
2. **Export index files**: Use index.ts files in each folder to simplify imports
3. **Lazy loading**: Use React.lazy() for components that aren't needed immediately

### 7.2 State Management

Consider different state management approaches:

1. **Observer pattern**: Using the @observer decorator for reactive updates
2. **React Context**: For sharing state between components without prop drilling
3. **Custom hooks**: For reusable stateful logic

## Conclusion

Following this guide will help you implement a new game product in the SABA Games platform with a consistent structure and approach. The modular organization makes it easier to maintain and update your game components in the future.

Remember to test thoroughly at each stage and keep your code consistent with existing implementations like Big-Small, Fish-Prawn-Crab, and Color Game.
