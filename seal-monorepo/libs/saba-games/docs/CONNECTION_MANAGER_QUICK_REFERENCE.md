# ConnectionManager Quick Reference

## 🚀 Quick Start

```typescript
import { ConnectionManager } from '../_shared/components/game-base/connection-manager';

// Get singleton instance
const connectionManager = ConnectionManager.getInstance();

// Register a connection
connectionManager.registerGatewayConnection(websocketConnection);

// Clean up on component unmount
await connectionManager.disconnect('component_unmount');
await connectionManager.closeAllGatewayConnections('component_unmount');
```

## 📋 API Reference

### Core Methods

| Method                                    | Parameters        | Returns             | Description                      |
| ----------------------------------------- | ----------------- | ------------------- | -------------------------------- |
| `getInstance()`                           | -                 | `ConnectionManager` | Get singleton instance           |
| `registerGatewayConnection(connection)`   | `connection: any` | `void`              | Register connection for tracking |
| `unregisterGatewayConnection(connection)` | `connection: any` | `void`              | Remove connection from tracking  |
| `disconnect(reason)`                      | `reason: string`  | `Promise<void>`     | Disconnect using handler         |
| `closeAllGatewayConnections(reason)`      | `reason: string`  | `Promise<void>`     | Close all connections            |

### Status Methods

| Method                              | Returns   | Description                 |
| ----------------------------------- | --------- | --------------------------- |
| `getActiveGatewayConnectionCount()` | `number`  | Count of active connections |
| `hasActiveGatewayConnections()`     | `boolean` | Check if connections exist  |
| `isGatewayShutdownInProgress()`     | `boolean` | Check shutdown status       |
| `isGatewayHandlerAvailable()`       | `boolean` | Check handler availability  |

### Utility Methods

| Method                                       | Parameters                         | Returns            | Description                     |
| -------------------------------------------- | ---------------------------------- | ------------------ | ------------------------------- |
| `closeGatewayConnection(connection, reason)` | `connection: any, reason?: string` | `Promise<boolean>` | Close specific connection       |
| `reset()`                                    | -                                  | `Promise<void>`    | Reset all state                 |
| `clearGatewayConnections()`                  | -                                  | `void`             | Clear all connections (testing) |
| `getGatewayConnections()`                    | -                                  | `any[]`            | Get all connections (debugging) |

## 🔄 Usage Patterns

### 1. React Component Integration

```typescript
class MyComponent extends React.PureComponent {
    private connectionManager: ConnectionManager;

    constructor(props) {
        super(props);
        this.connectionManager = ConnectionManager.getInstance();
    }

    componentWillUnmount() {
        this.cleanupConnections();
    }

    private async cleanupConnections() {
        try {
            await this.connectionManager.disconnect('component_unmount');
            await this.connectionManager.closeAllGatewayConnections('component_unmount');
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        const handler = this.getConnectionHandler();
        if (handler?.connection) {
            this.connectionManager.registerGatewayConnection(handler.connection);
        }
    }
}
```

### 2. Connection Registration

```typescript
// When connection is established
const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
if (handler && handler.connection) {
    connectionManager.registerGatewayConnection(handler.connection);
}
```

### 3. Graceful Shutdown

```typescript
async function gracefulShutdown() {
    const connectionManager = ConnectionManager.getInstance();

    if (!connectionManager.isGatewayShutdownInProgress()) {
        await connectionManager.disconnect('application_shutdown');
        await connectionManager.closeAllGatewayConnections('application_shutdown');
    }
}
```

### 4. Error Handling

```typescript
try {
    await connectionManager.disconnect('user_action');
} catch (error) {
    console.error('Disconnect failed:', error);
    // Force close as fallback
    await connectionManager.closeAllGatewayConnections('force_close');
}
```

## ⚠️ Common Pitfalls

### ❌ Don't Do This

```typescript
// Don't create new instances
const manager = new ConnectionManager();

// Don't forget to clean up
componentWillUnmount() {
    // Missing cleanup!
}

// Don't use generic reasons
await connectionManager.disconnect('disconnect');

// Don't ignore errors
await connectionManager.disconnect('user_logout');
// Missing error handling
```

### ✅ Do This Instead

```typescript
// Use singleton pattern
const manager = ConnectionManager.getInstance();

// Always clean up
componentWillUnmount() {
    this.cleanupConnections();
}

// Use descriptive reasons
await connectionManager.disconnect('user_logout');

// Handle errors properly
try {
    await connectionManager.disconnect('user_logout');
} catch (error) {
    console.error('Disconnect failed:', error);
}
```

## 🔍 Debugging

### Check Connection Status

```typescript
const connectionManager = ConnectionManager.getInstance();

console.log('Active connections:', connectionManager.getActiveGatewayConnectionCount());
console.log('Has connections:', connectionManager.hasActiveGatewayConnections());
console.log('Shutdown in progress:', connectionManager.isGatewayShutdownInProgress());
console.log('Handler available:', connectionManager.isGatewayHandlerAvailable());
```

### Monitor Connection Lifecycle

```typescript
// The ConnectionManager logs detailed information:
// "ConnectionManager: Gateway connection registered. Total connections: 1"
// "ConnectionManager: Closing gateway connection - user_logout"
// "ConnectionManager: Gateway connection closed successfully"
```

### Get All Connections

```typescript
const connections = connectionManager.getGatewayConnections();
console.log('Tracked connections:', connections);
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │    │ ConnectionManager│    │   WebSocket     │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Lobby     │ │───▶│ │  Singleton   │ │───▶│ │ Connection  │ │
│ │ Component   │ │    │ │  Instance    │ │    │ │             │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Game      │ │───▶│ │ Connections  │ │───▶│ │ Gateway     │ │
│ │ Component   │ │    │ │     Set      │ │    │ │ Service     │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 Connection States

```
┌─────────────┐    register    ┌─────────────┐    disconnect    ┌─────────────┐
│   No        │ ─────────────▶ │   Active    │ ───────────────▶ │  Shutdown   │
│ Connections │                │ Connections │                  │  In Progress│
└─────────────┘                └─────────────┘                  └─────────────┘
       ▲                              │                                │
       │                              │                                │
       └─────────── cleanup ──────────┘                                │
                                                                       │
       ┌─────────────┐    reset       ┌─────────────┐                  │
       │   Reset     │ ◀───────────── │   Complete  │ ◀────────────────┘
       │   State     │                │   Cleanup   │
       └─────────────┘                └─────────────┘
```

## 🎯 Best Practices Checklist

-   [ ] Use `getInstance()` to get the singleton instance
-   [ ] Register connections immediately when established
-   [ ] Clean up connections in `componentWillUnmount()`
-   [ ] Use descriptive reasons for logging
-   [ ] Handle errors gracefully with try-catch
-   [ ] Check handler availability before operations
-   [ ] Monitor connection count for debugging
-   [ ] Avoid concurrent shutdown operations

## 🚨 Error Codes & Messages

| Error Message                             | Cause                         | Solution                             |
| ----------------------------------------- | ----------------------------- | ------------------------------------ |
| `Gateway ConnectHandler not found`        | Container not configured      | Check container setup                |
| `No gateway connection provided to close` | Null connection passed        | Validate connection before closing   |
| `Gateway shutdown already in progress`    | Concurrent disconnect calls   | Check shutdown status before calling |
| `Failed to get shared container`          | Container sources unavailable | Verify container configuration       |

## 📝 Example Integration

```typescript
import { ConnectionManager } from '../_shared/components/game-base/connection-manager';
import * as gc from '@sg/sg-game-client';

@observer
class GameLobby extends React.PureComponent {
    private connectionManager: ConnectionManager;

    constructor(props) {
        super(props);
        this.connectionManager = ConnectionManager.getInstance();
    }

    componentWillUnmount() {
        this.cleanupConnections();
    }

    private async cleanupConnections() {
        try {
            console.log('Starting connection cleanup');

            if (!this.connectionManager.isGatewayShutdownInProgress()) {
                await this.connectionManager.disconnect('lobby_unmount');
                await this.connectionManager.closeAllGatewayConnections('lobby_unmount');
            }

            console.log('Connection cleanup completed');
        } catch (error) {
            console.error('Connection cleanup failed:', error);
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        const handler = this.getConnectionHandler();

        if (handler?.connection) {
            this.connectionManager.registerGatewayConnection(handler.connection);
            console.log('Gateway connection registered');
        }
    }

    private getConnectionHandler() {
        try {
            const container = sharedContainer;
            return container?.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
        } catch (error) {
            console.error('Failed to get handler:', error);
            return null;
        }
    }

    render() {
        const connectionCount = this.connectionManager.getActiveGatewayConnectionCount();

        return (
            <div>
                <p>Active connections: {connectionCount}</p>
                {/* Your component JSX */}
            </div>
        );
    }
}
```

## 🔗 Related Documentation

-   [Full Documentation](./CONNECTION_MANAGER_GUIDE.md)
-   [Architectural Diagrams](./CONNECTION_MANAGER_DIAGRAMS.md)
-   [Test Examples](../__tests__/_shared/components/game-base/connection-manager.spec.ts)
-   [Lobby Integration Example](../src/lobby/lobby.tsx)
