# RNG Soccer Prototype Components

This directory contains separated components that were extracted from the original `RNGSoccerPage` class to improve code organization and maintainability. These components have been cleaned of external dependencies on `@sg/sg-game-client` and `@sg/sg-observer` to make them more portable and testable.

## Architecture Diagrams

### 1. Component Structure Diagram

```mermaid
graph TB
    subgraph "RNG Soccer Prototype Architecture"
        A[RNGSoccerOrchestrator] --> B[RNGSoccerStateManager]
        A --> C[RNGSoccerUIConfig]
        A --> D[RNGSoccerRenderers]

        subgraph "State Management"
            B --> B1[Game State]
            B --> B2[UI State]
            B --> B3[Betting State]
        end

        subgraph "UI Configuration"
            C --> C1[UI Extension Options]
            C --> C2[CSS Classes]
            C --> C3[Background Images]
            C --> C4[Custom Components]
        end

        subgraph "Rendering Logic"
            D --> D1[Custom Content]
            D --> D2[Custom Footer]
            D --> D3[Custom Betting]
            D --> D4[Custom History]
        end

        subgraph "External Dependencies"
            E[GameBaseProps] --> A
            F[Game Settings] --> B
            G[SCSS Styles] --> C
            H[React Components] --> D
        end
    end

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

### 2. Data Flow Diagram

```mermaid
flowchart TD
    Start([Game Initialization]) --> Props[GameBaseProps]
    Props --> Orchestrator[RNGSoccerOrchestrator]

    Orchestrator --> StateManager[RNGSoccerStateManager]
    Orchestrator --> UIConfig[RNGSoccerUIConfig]
    Orchestrator --> Renderers[RNGSoccerRenderers]

    StateManager --> State[Game State]
    State --> StateUpdate{State Changes?}

    StateUpdate -->|Yes| UpdateComponents[Update Components]
    StateUpdate -->|No| Continue[Continue Game Loop]

    UpdateComponents --> RecreateRenderers[Recreate Renderers]
    UpdateComponents --> RecreateUIConfig[Recreate UI Config]

    RecreateRenderers --> Renderers
    RecreateUIConfig --> UIConfig

    Renderers --> UIOutput[UI Output]
    UIConfig --> UISettings[UI Settings]

    UIOutput --> UserInteraction[User Interaction]
    UISettings --> UserInteraction

    UserInteraction --> StateManager
    UserInteraction --> Renderers

    Continue --> StateUpdate

    style Orchestrator fill:#e1f5fe
    style StateManager fill:#f3e5f5
    style Renderers fill:#fff3e0
    style UIConfig fill:#e8f5e8
```

### 3. Component Relationships Diagram

```mermaid
graph LR
    subgraph "Main Orchestrator"
        A[RNGSoccerOrchestrator]
    end

    subgraph "Core Components"
        B[RNGSoccerStateManager]
        C[RNGSoccerUIConfig]
        D[RNGSoccerRenderers]
    end

    subgraph "State Interface"
        E[IRNGSoccerPageState]
    end

    subgraph "Dependencies"
        F[GameBaseProps]
        G[Game Settings]
        H[SCSS Styles]
        I[React Components]
    end

    A -->|manages| B
    A -->|configures| C
    A -->|renders| D
    A -->|uses| E

    B -->|implements| E
    B -->|uses| F
    B -->|uses| G

    C -->|uses| H
    C -->|uses| I
    C -->|references| E

    D -->|uses| F
    D -->|uses| I
    D -->|uses| E

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

### 4. Method Call Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Orchestrator as RNGSoccerOrchestrator
    participant StateManager as RNGSoccerStateManager
    participant UIConfig as RNGSoccerUIConfig
    participant Renderers as RNGSoccerRenderers

    User->>Orchestrator: Initialize Game
    Orchestrator->>StateManager: new RNGSoccerStateManager(props)
    Orchestrator->>Renderers: new RNGSoccerRenderers(props, state, callbacks)
    Orchestrator->>UIConfig: new RNGSoccerUIConfig(callbacks, renderers)

    User->>Orchestrator: User Interaction (e.g., toggle popup)
    Orchestrator->>StateManager: togglePopup()
    StateManager->>Orchestrator: setState(newState)
    Orchestrator->>Renderers: Recreate with new state
    Orchestrator->>UIConfig: Recreate with new renderers

    User->>Orchestrator: Request UI Configuration
    Orchestrator->>UIConfig: getUIExtensionOptions()
    UIConfig->>Renderers: renderCustomContent()
    UIConfig->>Renderers: renderCustomFooter()
    UIConfig->>Renderers: renderCustomHistory()
    UIConfig->>Renderers: renderCustomBetting()

    User->>Orchestrator: Betting Action
    Orchestrator->>Renderers: renderCustomBetting()
    Renderers->>StateManager: handleBetCallback()
    StateManager->>Orchestrator: setState(bettingState)
```

### 5. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Initialized: Constructor
    Initialized --> GameRunning: Start Game

    GameRunning --> PopupVisible: togglePopup()
    PopupVisible --> GameRunning: togglePopup()

    GameRunning --> BetPanelOpen: setShowBetPanel(true)
    BetPanelOpen --> GameRunning: setShowBetPanel(false)

    BetPanelOpen --> PanelSelected: setPanelId(id)
    PanelSelected --> BetPanelOpen: setPanelId(newId)

    BetPanelOpen --> BetPlaced: handleBetCallback()
    BetPlaced --> NextRoundMessage: isShowNextRoundMessage = true
    NextRoundMessage --> GameRunning: Timeout (3s)

    GameRunning --> [*]: Game End
```

## Components Overview

### 1. `RNGSoccerStateManager` (`rng-soccer-state-manager.tsx`)

**Responsibility**: Manages all state-related logic and operations

-   Initializes game state with default values
-   Handles state updates for popup visibility, betting panel, and panel IDs
-   Manages betting callbacks and timeout logic
-   Configures game container on initialization

**Key Methods**:

-   `togglePopup()` - Toggles popup visibility
-   `setShowBetPanel()` - Controls betting panel visibility
-   `setPanelId()` - Sets active panel ID
-   `resetBettingPanel()` - Resets betting panel state
-   `handleBetCallback()` - Handles bet completion logic

### 2. `RNGSoccerUIConfig` (`rng-soccer-ui-config.tsx`)

**Responsibility**: Manages UI configuration and styling

-   Provides UI extension options for the game renderer
-   Manages CSS classes and styling configurations
-   Handles background image configurations
-   Configures custom component renderers

**Key Methods**:

-   `getUIExtensionOptions()` - Returns UI configuration object
-   `getGameBackgroundImage()` - Returns game background image
-   `getDisconnectViewBackground()` - Returns disconnect view background

### 3. `RNGSoccerRenderers` (`rng-soccer-renderers.tsx`)

**Responsibility**: Handles all custom rendering logic

-   Renders custom content (settlement results)
-   Renders custom footer with betting options
-   Renders custom betting interface
-   Renders custom history/statistics

**Key Methods**:

-   `renderCustomContent()` - Renders main game content
-   `renderCustomFooter()` - Renders footer section
-   `renderCustomBetting()` - Renders betting interface
-   `renderCustomHistory()` - Renders statistics/history

### 4. `RNGSoccerEventHandlers` (`rng-soccer-event-handlers.tsx`)

**Responsibility**: Manages game lifecycle events

-   Handles connection events
-   Manages game state transitions
-   Processes game-specific events

**Key Methods**:

-   `closeConnect()` - Handles connection closure

### 5. `RNGSoccerOrchestrator` (`rng-soccer-orchestrator.tsx`)

**Responsibility**: Main orchestrator that combines all components

-   Initializes and coordinates all separated components
-   Manages state and component lifecycle
-   Delegates operations to appropriate components
-   Provides public interface for accessing components

**Key Methods**:

-   `setState()` - Updates internal state and triggers component updates
-   `getState()` - Returns current state
-   `getRenderers()` - Returns renderers component
-   `getUIConfig()` - Returns UI configuration component
-   `getEventHandlers()` - Returns event handlers component

## Usage

### Basic Usage

```typescript
import { RNGSoccerOrchestrator } from './prototype';

// Create orchestrator instance
const orchestrator = new RNGSoccerOrchestrator(props);

// Access components
const renderers = orchestrator.getRenderers();
const uiConfig = orchestrator.getUIConfig();
const eventHandlers = orchestrator.getEventHandlers();

// Use components
const content = renderers.renderCustomContent();
const background = uiConfig.getGameBackgroundImage();
```

### Individual Component Usage

```typescript
import { RNGSoccerStateManager, RNGSoccerUIConfig, RNGSoccerRenderers, RNGSoccerEventHandlers } from './prototype';

// Use individual components for specific functionality
const stateManager = new RNGSoccerStateManager(props);
const uiConfig = new RNGSoccerUIConfig(/* dependencies */);
const renderers = new RNGSoccerRenderers(/* dependencies */);
const eventHandlers = new RNGSoccerEventHandlers();
```

## Benefits of Separation

1. **Single Responsibility**: Each component has a clear, focused responsibility
2. **Testability**: Individual components can be tested in isolation
3. **Maintainability**: Changes to specific functionality are localized
4. **Reusability**: Components can be reused in different contexts
5. **Readability**: Code is easier to understand and navigate
6. **Portability**: Components are free from external framework dependencies
7. **Independence**: No inheritance dependencies, pure composition

## Architecture Pattern

This separation follows the **Composition Pattern** where:

-   Each component handles a specific aspect of the original class
-   The orchestrator combines all components to recreate the original functionality
-   Dependencies are injected through constructors
-   State management is centralized in the state manager
-   UI logic is separated from business logic
-   No inheritance, pure composition for better flexibility

## Dependencies Removed

The following external dependencies have been removed from the prototype components:

-   `@sg/sg-game-client` - Game client framework
-   `@sg/sg-observer` - Observer pattern framework
-   `GatewayGameBase` - Base class inheritance
-   Decorators like `@observer` and `@handle`

This makes the components more portable and easier to test in isolation.

## Migration Notes

-   The `RNGSoccerOrchestrator` is now a standalone class, not extending any base class
-   All original functionality is preserved through composition
-   No new business logic was added during separation
-   All components maintain the same console logging for debugging
-   Components are now framework-agnostic and can be used in different contexts
-   State management is handled internally by the orchestrator
