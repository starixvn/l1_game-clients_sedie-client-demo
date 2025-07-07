# Connection Management Guide for Saba-Games

## Problem: Why `handler.connection?.close()` Doesn't Always Work

The issue with `handler.connection?.close()` not properly closing or destroying connections can be attributed to several common problems:

### 1. **Asynchronous Nature**
```typescript
// ❌ Problem: Not waiting for close to complete
handler.connection?.close();

// ✅ Solution: Wait for close to complete
await handler.connection?.close();
```

### 2. **Connection State Issues**
```typescript
// ❌ Problem: Connection might be in wrong state
handler.connection?.close();

// ✅ Solution: Check connection state first
if (handler.connection && handler.connection.readyState === WebSocket.OPEN) {
    await handler.connection.close();
}
```

### 3. **Event Listeners Not Cleaned Up**
```typescript
// ❌ Problem: Event listeners remain attached
handler.connection?.close();

// ✅ Solution: Remove event listeners before closing
if (handler.connection) {
    handler.connection.removeEventListener('message', this.handleMessage);
    handler.connection.removeEventListener('error', this.handleError);
    await handler.connection.close();
}
```

### 4. **Multiple Connection References**
```typescript
// ❌ Problem: Multiple references to same connection
handler.connection?.close();
// But other parts of code still hold references

// ✅ Solution: Clear all references
handler.connection?.close();
handler.connection = null;
this.connection = null;
```

### 5. **Auto-Reconnection Logic**
```typescript
// ❌ Problem: Auto-reconnection kicks in
handler.connection?.close();

// ✅ Solution: Disable auto-reconnection first
if (handler.connection) {
    handler.connection.autoReconnect = false;
    await handler.connection.close();
}
```

## Solution: ConnectionManager

We've created a comprehensive `ConnectionManager` class that handles all these issues:

### Key Features

1. **Proper Async Handling**: All connection operations are asynchronous and properly awaited
2. **State Management**: Checks connection state before operations
3. **Event Listener Cleanup**: Automatically removes event listeners
4. **Reference Tracking**: Tracks all active connections
5. **Auto-Reconnection Control**: Handles reconnection logic
6. **Error Handling**: Comprehensive error handling and logging
7. **Singleton Pattern**: Ensures single instance across the application

### Usage Example

```typescript
import { ConnectionManager } from './connection-manager';

class MyGame extends GameBase {
    private connectionManager = ConnectionManager.getInstance();

    componentWillUnmount() {
        // Proper cleanup sequence
        this.cleanupConnection();
        super.componentWillUnmount();
    }

    private async cleanupConnection() {
        try {
            // 1. Disconnect using the manager (handles both handler.disconnect() and connection.close())
            await this.connectionManager.disconnect('component_unmount');

            // 2. Close all remaining connections as a safety measure
            await this.connectionManager.closeAllConnections('component_unmount');

            console.log('Connection cleanup completed');
        } catch (error) {
            console.error('Error during connection cleanup:', error);
        }
    }
}
```

### ConnectionManager Methods

#### Core Methods
- `disconnect(reason?)`: Disconnects using handler and closes connection
- `closeConnection(connection, reason?)`: Closes a specific connection with cleanup
- `closeAllConnections(reason?)`: Closes all tracked connections
- `reset()`: Resets connection state and clears tracking

#### Tracking Methods
- `registerConnection(connection)`: Register a connection for tracking
- `unregisterConnection(connection)`: Unregister a connection from tracking
- `hasActiveConnections()`: Check if any connections are active
- `getActiveConnectionCount()`: Get number of active connections

#### Status Methods
- `isShutdownInProgress()`: Check if shutdown is in progress
- `isHandlerAvailable()`: Check if handler is available

### Best Practices

1. **Always use ConnectionManager.getInstance()** - Ensures singleton pattern
2. **Register connections when created** - Track all active connections
3. **Clean up in componentWillUnmount** - Ensure no memory leaks
4. **Handle visibility changes** - Disconnect when page is hidden
5. **Use async/await** - Connection operations are asynchronous
6. **Implement proper error handling** - Always catch and log errors
7. **Check connection state** - Verify before operations
8. **Use disconnect() instead of close()** - Handles both handler and connection cleanup
9. **Monitor connection health** - Check for connection issues
10. **Implement reconnection logic** - Handle connection failures gracefully

### Migration Guide

To migrate from direct `handler.connection?.close()` calls:

#### Before (Problematic)
```typescript
componentWillUnmount() {
    handler.connection?.close();
    super.componentWillUnmount();
}
```

#### After (Proper)
```typescript
componentWillUnmount() {
    this.connectionManager.disconnect('component_unmount');
    super.componentWillUnmount();
}
```

### Testing

The ConnectionManager includes comprehensive tests covering:
- Happy path scenarios
- Edge cases (null/undefined connections)
- Error handling
- Async operations
- State management
- Multiple connection scenarios

### Benefits

1. **Reliable Connection Cleanup**: Ensures connections are properly closed
2. **Memory Leak Prevention**: Proper cleanup of event listeners and references
3. **Error Resilience**: Handles connection errors gracefully
4. **State Consistency**: Maintains consistent connection state
5. **Debugging Support**: Comprehensive logging for troubleshooting
6. **Performance**: Efficient connection management
7. **Maintainability**: Centralized connection logic

### Integration with Existing Code

The ConnectionManager is designed to work with existing saba-games code:

```typescript
// In your game component
import { ConnectionManager } from '../../../_shared/components/game-base';

export default class MyGame extends GatewayGameBase {
    private connectionManager = ConnectionManager.getInstance();

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() {
        // Use ConnectionManager instead of direct calls
        this.connectionManager.disconnect('close_connect_handler');
    }
}
```

This approach ensures that all connections are properly managed and cleaned up, preventing the issues that arise from simple `handler.connection?.close()` calls. 