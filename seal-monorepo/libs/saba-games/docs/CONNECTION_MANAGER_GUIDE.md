# ConnectionManager Documentation

## Overview

The `ConnectionManager` is a singleton class designed to manage WebSocket gateway connections specifically for Saba Games. It provides centralized gateway connection tracking, cleanup, and ensures proper WebSocket close frames are sent to services.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Class Structure](#class-structure)
3. [Key Features](#key-features)
4. [Usage Patterns](#usage-patterns)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Examples](#examples)

## Architecture Overview

### Singleton Pattern

The ConnectionManager follows the singleton pattern to ensure only one instance manages all gateway connections across the application.

```typescript
// Get the singleton instance
const connectionManager = ConnectionManager.getInstance();
```

### Container Integration

The manager integrates with the dependency injection container to access gateway connection handlers:

```typescript
// Multiple container sources are tried in order:
1. sharedContainer (from startup)
2. window['seal_shared_container']
3. gc.sharedContainer
4. window.sharedContainer
5. gc.getContainer() (fallback)
```

### Connection Lifecycle Management

The manager tracks connections through their complete lifecycle:

1. **Registration**: Connections are registered when established
2. **Tracking**: Active connections are maintained in a Set
3. **Cleanup**: Proper WebSocket close frames are sent during shutdown
4. **Reference Clearing**: Memory references are cleared to prevent leaks

## Class Structure

### Core Properties

| Property             | Type                | Description                   |
| -------------------- | ------------------- | ----------------------------- |
| `instance`           | `ConnectionManager` | Singleton instance            |
| `connections`        | `Set<any>`          | Active gateway connections    |
| `shutdownInProgress` | `boolean`           | Prevents concurrent shutdowns |
| `sharedContainer`    | `any`               | Cached container reference    |

### Key Methods

#### Connection Management

-   `registerGatewayConnection(connection)`: Register a new connection
-   `unregisterGatewayConnection(connection)`: Remove connection from tracking
-   `closeGatewayConnection(connection, reason)`: Close specific connection
-   `closeAllGatewayConnections(reason)`: Close all tracked connections

#### Lifecycle Management

-   `disconnect(reason)`: Disconnect using handler's disconnect method
-   `reset()`: Reset all connection state
-   `clearGatewayConnections()`: Clear all connections (testing)

#### Status Queries

-   `getActiveGatewayConnectionCount()`: Get number of active connections
-   `hasActiveGatewayConnections()`: Check if any connections exist
-   `isGatewayShutdownInProgress()`: Check shutdown status
-   `isGatewayHandlerAvailable()`: Check handler availability

## Key Features

### 1. Proper WebSocket Cleanup

Ensures WebSocket close frames are sent to services:

```typescript
// Sends proper WebSocket close frame with code 41
connection.close();
```

### 2. Event Listener Cleanup

Removes all event listeners to prevent memory leaks:

```typescript
// Removes common WebSocket event listeners
const events = ['open', 'close', 'error', 'message'];
events.forEach((event) => {
    connection.removeEventListener(event, () => {});
});
```

### 3. Reference Clearing

Clears connection references to prevent memory leaks:

```typescript
// Clears properties containing 'connection' or 'socket'
Object.keys(connection).forEach((key) => {
    if (key.includes('connection') || key.includes('socket')) {
        (connection as any)[key] = null;
    }
});
```

### 4. Concurrent Shutdown Protection

Prevents multiple simultaneous shutdown operations:

```typescript
if (this.shutdownInProgress) {
    console.log('Gateway shutdown already in progress, skipping disconnect');
    return;
}
```

## Usage Patterns

### 1. Basic Usage in Lobby Component

```typescript
import { ConnectionManager } from '../_shared/components/game-base/connection-manager';

class LobbyComponent extends React.PureComponent {
    private connectionManager: ConnectionManager;

    constructor(props) {
        super(props);
        // Initialize connection manager
        this.connectionManager = ConnectionManager.getInstance();
    }

    componentWillUnmount() {
        // Clean up connections when component unmounts
        this.cleanupLobbyConnections();
    }

    private async cleanupLobbyConnections() {
        try {
            // Disconnect using handler's disconnect method
            await this.connectionManager.disconnect('lobby_unmount');

            // Close all remaining connections as safety measure
            await this.connectionManager.closeAllGatewayConnections('lobby_unmount');
        } catch (error) {
            console.error('Error during connection cleanup:', error);
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        const handler = this.getConnectionHandler();

        if (handler && (handler as any).connection) {
            // Register the connection for tracking
            this.connectionManager.registerGatewayConnection((handler as any).connection);
        }
    }
}
```

### 2. Connection Registration Pattern

```typescript
// When a new gateway connection is established
const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
if (handler && handler.connection) {
    connectionManager.registerGatewayConnection(handler.connection);
}
```

### 3. Graceful Shutdown Pattern

```typescript
// During application shutdown or component unmount
async function gracefulShutdown() {
    const connectionManager = ConnectionManager.getInstance();

    // 1. Disconnect using handler's disconnect method
    await connectionManager.disconnect('application_shutdown');

    // 2. Close all remaining connections
    await connectionManager.closeAllGatewayConnections('application_shutdown');

    // 3. Reset state if needed
    await connectionManager.reset();
}
```

### 4. Error Handling Pattern

```typescript
try {
    await connectionManager.disconnect('error_recovery');
} catch (error) {
    console.error('Failed to disconnect gracefully:', error);

    // Force close all connections as fallback
    try {
        await connectionManager.closeAllGatewayConnections('error_recovery');
    } catch (closeError) {
        console.error('Failed to close connections:', closeError);
    }
}
```

## API Reference

### Static Methods

#### `getInstance(): ConnectionManager`

Returns the singleton instance of ConnectionManager.

```typescript
const manager = ConnectionManager.getInstance();
```

### Instance Methods

#### Connection Registration

##### `registerGatewayConnection(connection: any): void`

Registers a gateway connection for tracking.

**Parameters:**

-   `connection`: The WebSocket connection object to track

**Example:**

```typescript
const connection = handler.connection;
connectionManager.registerGatewayConnection(connection);
```

##### `unregisterGatewayConnection(connection: any): void`

Removes a gateway connection from tracking.

**Parameters:**

-   `connection`: The WebSocket connection object to unregister

#### Connection Lifecycle

##### `closeGatewayConnection(connection: any, reason?: string): Promise<boolean>`

Closes a specific gateway connection with proper WebSocket cleanup.

**Parameters:**

-   `connection`: The WebSocket connection to close
-   `reason`: Optional reason for closing (for logging)

**Returns:** `Promise<boolean>` - True if closed successfully

**Example:**

```typescript
const success = await connectionManager.closeGatewayConnection(connection, 'user_logout');
```

##### `closeAllGatewayConnections(reason: string): Promise<void>`

Closes all tracked gateway connections.

**Parameters:**

-   `reason`: Reason for closing all connections

**Example:**

```typescript
await connectionManager.closeAllGatewayConnections('application_shutdown');
```

##### `disconnect(reason: string): Promise<void>`

Disconnects using the gateway handler's disconnect method and closes connections.

**Parameters:**

-   `reason`: Reason for disconnection

**Example:**

```typescript
await connectionManager.disconnect('component_unmount');
```

#### State Management

##### `reset(): Promise<void>`

Resets gateway connection state and clears all connections.

**Example:**

```typescript
await connectionManager.reset();
```

##### `clearGatewayConnections(): void`

Clears all gateway connections (for testing or reset).

**Example:**

```typescript
connectionManager.clearGatewayConnections();
```

#### Status Queries

##### `getActiveGatewayConnectionCount(): number`

Returns the number of active gateway connections.

**Returns:** `number` - Count of active connections

**Example:**

```typescript
const count = connectionManager.getActiveGatewayConnectionCount();
console.log(`Active connections: ${count}`);
```

##### `hasActiveGatewayConnections(): boolean`

Checks if there are any active gateway connections.

**Returns:** `boolean` - True if connections exist

**Example:**

```typescript
if (connectionManager.hasActiveGatewayConnections()) {
    console.log('Active connections found');
}
```

##### `isGatewayShutdownInProgress(): boolean`

Checks if gateway shutdown is in progress.

**Returns:** `boolean` - True if shutdown is in progress

**Example:**

```typescript
if (!connectionManager.isGatewayShutdownInProgress()) {
    await connectionManager.disconnect('user_action');
}
```

##### `isGatewayHandlerAvailable(): boolean`

Checks if gateway connect handler is available.

**Returns:** `boolean` - True if handler is available

**Example:**

```typescript
if (connectionManager.isGatewayHandlerAvailable()) {
    // Proceed with connection operations
}
```

##### `getGatewayConnections(): any[]`

Gets all tracked gateway connections (for debugging).

**Returns:** `any[]` - Array of connection objects

**Example:**

```typescript
const connections = connectionManager.getGatewayConnections();
console.log('Tracked connections:', connections.length);
```

## Best Practices

### 1. Always Use Singleton Pattern

```typescript
// ✅ Correct
const manager = ConnectionManager.getInstance();

// ❌ Incorrect - Don't create new instances
const manager = new ConnectionManager();
```

### 2. Register Connections Immediately

```typescript
// ✅ Register connection as soon as it's established
@handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
connectLiveGateway() {
    const handler = this.getConnectionHandler();
    if (handler?.connection) {
        this.connectionManager.registerGatewayConnection(handler.connection);
    }
}
```

### 3. Clean Up on Component Unmount

```typescript
// ✅ Always clean up connections
componentWillUnmount() {
    this.cleanupLobbyConnections();
}

private async cleanupLobbyConnections() {
    await this.connectionManager.disconnect('lobby_unmount');
    await this.connectionManager.closeAllGatewayConnections('lobby_unmount');
}
```

### 4. Use Descriptive Reasons

```typescript
// ✅ Use descriptive reasons for logging
await connectionManager.disconnect('user_logout');
await connectionManager.disconnect('session_timeout');
await connectionManager.disconnect('network_error');

// ❌ Avoid generic reasons
await connectionManager.disconnect('disconnect');
```

### 5. Handle Errors Gracefully

```typescript
// ✅ Implement proper error handling
try {
    await connectionManager.disconnect('graceful_shutdown');
} catch (error) {
    console.error('Graceful disconnect failed:', error);
    // Fallback to force close
    await connectionManager.closeAllGatewayConnections('force_shutdown');
}
```

### 6. Check Handler Availability

```typescript
// ✅ Check handler availability before operations
if (connectionManager.isGatewayHandlerAvailable()) {
    await connectionManager.disconnect('user_action');
} else {
    console.warn('Gateway handler not available');
}
```

## Troubleshooting

### Common Issues

#### 1. Handler Not Found

**Problem:** `Gateway ConnectHandler not found` error

**Solution:**

```typescript
// Check if container is properly configured
if (!connectionManager.isGatewayHandlerAvailable()) {
    console.warn('Gateway handler not available - check container configuration');
}
```

#### 2. Connection Not Registered

**Problem:** Connections not being tracked

**Solution:**

```typescript
// Ensure connections are registered when established
const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
if (handler?.connection) {
    connectionManager.registerGatewayConnection(handler.connection);
}
```

#### 3. Memory Leaks

**Problem:** Connections not being cleaned up

**Solution:**

```typescript
// Always call disconnect and closeAllGatewayConnections
componentWillUnmount() {
    this.cleanupConnections();
}

private async cleanupConnections() {
    await this.connectionManager.disconnect('component_unmount');
    await this.connectionManager.closeAllGatewayConnections('component_unmount');
}
```

#### 4. Concurrent Shutdown

**Problem:** Multiple disconnect calls simultaneously

**Solution:**

```typescript
// Check if shutdown is already in progress
if (!connectionManager.isGatewayShutdownInProgress()) {
    await connectionManager.disconnect('user_action');
}
```

### Debugging Tips

#### 1. Enable Console Logging

The ConnectionManager provides extensive console logging for debugging:

```typescript
// Check console for detailed connection lifecycle logs
console.log('ConnectionManager: Gateway connection registered. Total connections: 1');
console.log('ConnectionManager: Closing gateway connection - user_logout');
```

#### 2. Monitor Connection Count

```typescript
// Check active connection count
const count = connectionManager.getActiveGatewayConnectionCount();
console.log(`Active connections: ${count}`);

// Get all tracked connections
const connections = connectionManager.getGatewayConnections();
console.log('Tracked connections:', connections);
```

#### 3. Verify Handler Availability

```typescript
// Check if handler is available
if (connectionManager.isGatewayHandlerAvailable()) {
    console.log('Gateway handler is available');
} else {
    console.warn('Gateway handler not available');
}
```

## Examples

### Complete Lobby Integration Example

```typescript
import { ConnectionManager } from '../_shared/components/game-base/connection-manager';
import * as gc from '@sg/sg-game-client';

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private connectionManager: ConnectionManager;

    constructor(props: { token: string }) {
        super(props);
        this.connectionManager = ConnectionManager.getInstance();
        this.state = {
            // ... state initialization
        };
    }

    componentWillUnmount() {
        this.cleanupLobbyConnections();
    }

    private async cleanupLobbyConnections() {
        try {
            console.log('Lobby: Starting connection cleanup');

            // Disconnect using handler's disconnect method
            await this.connectionManager.disconnect('lobby_unmount');

            // Close all remaining connections as safety measure
            await this.connectionManager.closeAllGatewayConnections('lobby_unmount');

            console.log('Lobby: Connection cleanup completed');
        } catch (error) {
            console.error('Lobby: Error during connection cleanup:', error);
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        console.log('Lobby: connectLiveGateway called');

        const handler = this.getConnectionHandler();

        if (handler && (handler as any).connection) {
            console.log('Lobby: Registering gateway connection');
            this.connectionManager.registerGatewayConnection((handler as any).connection);
            console.log('Lobby: Gateway connection registered successfully');
        } else {
            console.log('Lobby: No handler or connection available for registration');
        }
    }

    private getConnectionHandler(): any {
        try {
            const container = sharedContainer;

            if (!container) {
                console.warn('Lobby: No container available');
                return null;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);

            if (handler) {
                console.log('Lobby: Handler properties:', Object.keys(handler));
                console.log('Lobby: Handler.connection:', (handler as any).connection ? 'exists' : 'null/undefined');
            }

            return handler;
        } catch (error) {
            console.error('Lobby: Failed to get connection handler:', error);
            return null;
        }
    }

    // ... rest of component implementation
}
```

### Application Shutdown Example

```typescript
class ApplicationManager {
    private connectionManager: ConnectionManager;

    constructor() {
        this.connectionManager = ConnectionManager.getInstance();
    }

    async shutdown(reason: string) {
        try {
            console.log(`Application: Starting shutdown (reason: ${reason})`);

            // Check if shutdown is already in progress
            if (this.connectionManager.isGatewayShutdownInProgress()) {
                console.log('Application: Shutdown already in progress');
                return;
            }

            // Check if handler is available
            if (!this.connectionManager.isGatewayHandlerAvailable()) {
                console.warn('Application: Gateway handler not available');
            }

            // Disconnect gracefully
            await this.connectionManager.disconnect(reason);

            // Close all remaining connections
            await this.connectionManager.closeAllGatewayConnections(reason);

            // Reset state
            await this.connectionManager.reset();

            console.log(`Application: Shutdown completed (reason: ${reason})`);
        } catch (error) {
            console.error('Application: Error during shutdown:', error);

            // Force close as fallback
            try {
                await this.connectionManager.closeAllGatewayConnections('force_shutdown');
            } catch (forceError) {
                console.error('Application: Force shutdown failed:', forceError);
            }
        }
    }

    getConnectionStatus() {
        return {
            activeConnections: this.connectionManager.getActiveGatewayConnectionCount(),
            hasConnections: this.connectionManager.hasActiveGatewayConnections(),
            shutdownInProgress: this.connectionManager.isGatewayShutdownInProgress(),
            handlerAvailable: this.connectionManager.isGatewayHandlerAvailable(),
        };
    }
}
```

### Testing Example

```typescript
describe('ConnectionManager Integration', () => {
    let connectionManager: ConnectionManager;
    let mockConnection: any;

    beforeEach(() => {
        // Reset singleton instance
        (ConnectionManager as any).instance = undefined;
        connectionManager = ConnectionManager.getInstance();

        // Create mock connection
        mockConnection = {
            readyState: WebSocket.OPEN,
            close: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };
    });

    afterEach(() => {
        // Clean up connections
        connectionManager.clearGatewayConnections();
    });

    it('should register and track connections', () => {
        // Arrange
        const initialCount = connectionManager.getActiveGatewayConnectionCount();

        // Act
        connectionManager.registerGatewayConnection(mockConnection);

        // Assert
        expect(connectionManager.getActiveGatewayConnectionCount()).toBe(initialCount + 1);
        expect(connectionManager.hasActiveGatewayConnections()).toBe(true);
    });

    it('should close connections properly', async () => {
        // Arrange
        connectionManager.registerGatewayConnection(mockConnection);

        // Act
        const result = await connectionManager.closeGatewayConnection(mockConnection, 'test');

        // Assert
        expect(result).toBe(true);
        expect(mockConnection.close).toHaveBeenCalled();
        expect(connectionManager.getActiveGatewayConnectionCount()).toBe(0);
    });

    it('should handle multiple connections', async () => {
        // Arrange
        const connection1 = { ...mockConnection };
        const connection2 = { ...mockConnection };

        connectionManager.registerGatewayConnection(connection1);
        connectionManager.registerGatewayConnection(connection2);

        // Act
        await connectionManager.closeAllGatewayConnections('test');

        // Assert
        expect(connectionManager.getActiveGatewayConnectionCount()).toBe(0);
        expect(connection1.close).toHaveBeenCalled();
        expect(connection2.close).toHaveBeenCalled();
    });
});
```

## Conclusion

The ConnectionManager provides a robust, centralized solution for managing WebSocket gateway connections in Saba Games. By following the patterns and best practices outlined in this documentation, developers can ensure proper connection lifecycle management, prevent memory leaks, and maintain reliable communication with gateway services.

Key takeaways:

-   Always use the singleton pattern
-   Register connections immediately when established
-   Clean up connections on component unmount
-   Use descriptive reasons for logging
-   Handle errors gracefully
-   Check handler availability before operations
-   Monitor connection state for debugging

For additional support or questions, refer to the test files or consult the development team.
