# ConnectionManager Architectural Diagrams

## Table of Contents

1. [Class Diagram](#class-diagram)
2. [Sequence Diagrams](#sequence-diagrams)
3. [State Machine Diagram](#state-machine-diagram)
4. [Component Integration Diagram](#component-integration-diagram)
5. [Connection Lifecycle Flow](#connection-lifecycle-flow)
6. [Shutdown Process Flow](#shutdown-process-flow)

## Class Diagram

```mermaid
classDiagram
    class ConnectionManager {
        -instance: ConnectionManager
        -connections: Set~any~
        -shutdownInProgress: boolean
        -sharedContainer: any

        +getInstance(): ConnectionManager
        -getSharedContainer(): any
        -getGatewayConnectHandler(): any

        +registerGatewayConnection(connection): void
        +unregisterGatewayConnection(connection): void
        +closeGatewayConnection(connection, reason): Promise~boolean~
        +closeAllGatewayConnections(reason): Promise~void~

        +disconnect(reason): Promise~void~
        +reset(): Promise~void~
        +clearGatewayConnections(): void

        +getActiveGatewayConnectionCount(): number
        +hasActiveGatewayConnections(): boolean
        +isGatewayShutdownInProgress(): boolean
        +isGatewayHandlerAvailable(): boolean
        +getGatewayConnections(): any[]

        -removeConnectionListeners(connection): void
        -performConnectionClose(connection): Promise~void~
        -clearConnectionReferences(connection): void
    }

    class WebSocket {
        +readyState: number
        +close(): void
        +addEventListener(type, listener): void
        +removeEventListener(type, listener): void
    }

    class GatewayHandler {
        +connection: WebSocket
        +disconnect(): Promise~void~
    }

    class Container {
        +get(key): any
    }

    ConnectionManager --> WebSocket : manages
    ConnectionManager --> GatewayHandler : uses
    ConnectionManager --> Container : gets handler from
    GatewayHandler --> WebSocket : contains
```

## Sequence Diagrams

### 1. Connection Registration Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant CM as ConnectionManager
    participant Handler as GatewayHandler
    participant WS as WebSocket
    participant Container as Container

    App->>CM: getInstance()
    CM-->>App: singleton instance

    App->>Container: get(ConnectHandler)
    Container-->>App: GatewayHandler

    App->>Handler: establish connection
    Handler->>WS: new WebSocket()
    WS-->>Handler: connection established

    App->>CM: registerGatewayConnection(connection)
    CM->>CM: add to connections Set
    CM-->>App: connection registered

    Note over CM: Total connections: 1
```

### 2. Connection Cleanup Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant CM as ConnectionManager
    participant Handler as GatewayHandler
    participant WS as WebSocket

    App->>CM: disconnect('component_unmount')
    CM->>CM: check shutdownInProgress
    CM->>Handler: getGatewayConnectHandler()
    Handler-->>CM: handler instance

    CM->>Handler: disconnect()
    Handler->>WS: close connection
    WS-->>Handler: connection closed
    Handler-->>CM: disconnect completed

    CM->>CM: closeAllGatewayConnections()
    CM->>WS: removeEventListener()
    CM->>WS: close()
    WS-->>CM: close event fired

    CM->>CM: clearConnectionReferences()
    CM->>CM: unregisterGatewayConnection()
    CM-->>App: cleanup completed
```

### 3. Container Integration Flow

```mermaid
sequenceDiagram
    participant CM as ConnectionManager
    participant Shared as sharedContainer
    participant Window as window.saba_games_shared_container
    participant GC as gc.sharedContainer
    participant Fallback as gc.getContainer()

    CM->>Shared: check if exists
    alt Shared container available
        Shared-->>CM: container instance
    else Shared container not available
        CM->>Window: check window.saba_games_shared_container
        alt Window container available
            Window-->>CM: container instance
        else Window container not available
            CM->>GC: check gc.sharedContainer
            alt GC container available
                GC-->>CM: container instance
            else GC container not available
                CM->>Fallback: gc.getContainer()
                Fallback-->>CM: container instance
            end
        end
    end

    CM->>CM: cache container reference
```

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> Initialized
    Initialized --> NoConnections : getInstance()

    NoConnections --> HasConnections : registerGatewayConnection()
    HasConnections --> NoConnections : unregisterGatewayConnection()
    HasConnections --> HasConnections : registerGatewayConnection()

    HasConnections --> ShutdownInProgress : disconnect()
    ShutdownInProgress --> NoConnections : cleanup completed
    ShutdownInProgress --> ShutdownInProgress : concurrent disconnect() calls

    NoConnections --> [*] : application shutdown
    ShutdownInProgress --> [*] : cleanup completed
```

## Component Integration Diagram

```mermaid
graph TB
    subgraph "Saba Games Application"
        subgraph "Lobby Component"
            Lobby[LobbyComponent]
            LobbyCM[ConnectionManager Instance]
        end

        subgraph "Game Components"
            Game1[GameComponent1]
            Game2[GameComponent2]
            GameCM[ConnectionManager Instance]
        end

        subgraph "Shared Infrastructure"
            Startup[Startup Configuration]
            Container[DI Container]
            Handler[Gateway ConnectHandler]
        end

        subgraph "External Services"
            Gateway[Gateway Service]
            WebSocket[WebSocket Connection]
        end
    end

    Lobby --> LobbyCM
    Game1 --> GameCM
    Game2 --> GameCM
    LobbyCM -.->|singleton| GameCM

    LobbyCM --> Container
    GameCM --> Container
    Container --> Handler
    Handler --> WebSocket
    WebSocket --> Gateway

    Startup --> Container
```

## Connection Lifecycle Flow

```mermaid
flowchart TD
    A[Application Start] --> B[Initialize ConnectionManager]
    B --> C[Get Singleton Instance]
    C --> D[Configure Container]
    D --> E[Wait for Connection Establishment]

    E --> F[Connection Established]
    F --> G[Register Connection]
    G --> H[Track in Set]
    H --> I[Connection Active]

    I --> J{Component Unmount?}
    J -->|Yes| K[Start Cleanup Process]
    J -->|No| I

    K --> L[Check Shutdown Status]
    L --> M{Shutdown in Progress?}
    M -->|Yes| N[Skip Disconnect]
    M -->|No| O[Set Shutdown Flag]

    O --> P[Get Gateway Handler]
    P --> Q{Handler Available?}
    Q -->|No| R[Log Warning]
    Q -->|Yes| S[Call Handler.disconnect]

    S --> T[Close Handler Connection]
    T --> U[Close All Tracked Connections]
    U --> V[Remove Event Listeners]
    V --> W[Send WebSocket Close Frame]
    W --> X[Clear References]
    X --> Y[Unregister Connections]
    Y --> Z[Reset Shutdown Flag]
    Z --> AA[Cleanup Complete]

    R --> U
    N --> AA
```

## Shutdown Process Flow

```mermaid
flowchart TD
    A[Shutdown Request] --> B{Shutdown Already in Progress?}
    B -->|Yes| C[Skip - Log Message]
    B -->|No| D[Set shutdownInProgress = true]

    D --> E[Get Gateway ConnectHandler]
    E --> F{Handler Found?}
    F -->|No| G[Log Warning]
    F -->|Yes| H{Handler.disconnect is Function?}

    H -->|No| I[Log Warning]
    H -->|Yes| J[Call handler.disconnect()]

    J --> K[Handler Disconnect Complete]
    K --> L{Handler has Connection?}
    L -->|Yes| M[Close Handler Connection]
    L -->|No| N[Log Info]

    M --> O[Close All Tracked Connections]
    N --> O

    O --> P[Remove Event Listeners]
    P --> Q[Send WebSocket Close Frames]
    Q --> R[Clear Connection References]
    R --> S[Unregister from Tracking]
    S --> T[Set shutdownInProgress = false]
    T --> U[Shutdown Complete]

    G --> O
    I --> O
    C --> V[End Process]
    U --> V
```

## Memory Management Flow

```mermaid
flowchart TD
    A[Connection Object] --> B{Has Event Listeners?}
    B -->|Yes| C[Remove Event Listeners]
    B -->|No| D[Skip Listener Removal]

    C --> E[Check Connection State]
    D --> E

    E --> F{Connection Open?}
    F -->|Yes| G[Send Close Frame]
    F -->|No| H[Skip Close Frame]

    G --> I[Wait for Close Event]
    H --> I

    I --> J[Clear Connection References]
    J --> K[Remove from Tracking Set]
    K --> L[Set References to Null]
    L --> M[Memory Freed]
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Operation Request] --> B{Container Available?}
    B -->|No| C[Log Error - Return Null]
    B -->|Yes| D[Get Handler from Container]

    D --> E{Handler Retrieved?}
    E -->|No| F[Log Error - Return Null]
    E -->|Yes| G{Handler Valid?}

    G -->|No| H[Log Warning]
    G -->|Yes| I[Execute Operation]

    I --> J{Operation Success?}
    J -->|No| K[Log Error - Return False]
    J -->|Yes| L[Return Success]

    C --> M[End Process]
    F --> M
    H --> M
    K --> M
    L --> M
```

## Performance Monitoring Points

```mermaid
graph LR
    subgraph "ConnectionManager Metrics"
        A[Active Connection Count]
        B[Shutdown Status]
        C[Handler Availability]
        D[Operation Success Rate]
    end

    subgraph "Monitoring Points"
        E[registerGatewayConnection]
        F[unregisterGatewayConnection]
        G[closeGatewayConnection]
        H[disconnect]
        I[closeAllGatewayConnections]
    end

    E --> A
    F --> A
    G --> A
    H --> B
    H --> C
    I --> A
    I --> B
```

## Integration with React Lifecycle

```mermaid
sequenceDiagram
    participant React as React Component
    participant CM as ConnectionManager
    participant Handler as GatewayHandler
    participant WS as WebSocket

    React->>React: constructor()
    React->>CM: getInstance()
    CM-->>React: singleton instance

    React->>React: componentDidMount()
    React->>Handler: establish connection
    Handler->>WS: create WebSocket
    WS-->>Handler: connection ready
    React->>CM: registerGatewayConnection()

    React->>React: componentWillUnmount()
    React->>CM: disconnect('component_unmount')
    CM->>Handler: disconnect()
    Handler->>WS: close()
    CM->>CM: closeAllGatewayConnections()
    CM->>WS: cleanup
    CM-->>React: cleanup complete
```

## Container Source Priority

```mermaid
flowchart TD
    A[Get Shared Container] --> B[Try sharedContainer]
    B --> C{Available?}
    C -->|Yes| D[Use sharedContainer]
    C -->|No| E[Try window.saba_games_shared_container]

    E --> F{Available?}
    F -->|Yes| G[Use window.saba_games_shared_container]
    F -->|No| H[Try gc.sharedContainer]

    H --> I{Available?}
    I -->|Yes| J[Use gc.sharedContainer]
    I -->|No| K[Try window.sharedContainer]

    K --> L{Available?}
    L -->|Yes| M[Use window.sharedContainer]
    L -->|No| N[Try gc.getContainer]

    N --> O{Available?}
    O -->|Yes| P[Use gc.getContainer]
    O -->|No| Q[Log Error - No Container]

    D --> R[Cache Container Reference]
    G --> R
    J --> R
    M --> R
    P --> R
    Q --> S[End Process]
    R --> T[Container Ready]
```

These diagrams provide a comprehensive visual representation of the ConnectionManager's architecture, behavior, and integration patterns. They help developers understand:

1. **Class Structure**: How the ConnectionManager is organized internally
2. **Interaction Patterns**: How components interact with the ConnectionManager
3. **Lifecycle Management**: The complete flow of connection handling
4. **Error Handling**: How errors are managed throughout the process
5. **Integration Points**: How the ConnectionManager fits into the larger application architecture

Use these diagrams alongside the detailed documentation to implement and maintain ConnectionManager effectively in your Saba Games application.
