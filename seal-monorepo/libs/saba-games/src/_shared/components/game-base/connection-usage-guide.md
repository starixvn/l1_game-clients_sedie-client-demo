# ConnectionManager Usage Guide

## How to Use `registerConnection` in Game Components

### 1. **Basic Usage in Game Components**

When creating connections in your game components, always register them with the ConnectionManager:

```typescript
import { ConnectionManager } from './connection-manager';

export default class MyGame extends GatewayGameBase<GameBaseProps, GameState> {
    private connectionManager = ConnectionManager.getInstance();

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
    connectLiveGateway() {
        // After connection is established, register it
        const handler = this.getConnectionHandler();
        if (handler && handler.connection) {
            this.registerConnection(handler.connection);
        }
    }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() {
        // Use ConnectionManager for proper cleanup
        this.connectionManager.disconnect('close_connect_handler');
    }
}
```

### 2. **Enhanced GameBase Integration**

The `GameBase` and `GatewayGameBase` classes now include built-in connection management:

```typescript
// In your game component
export default class ColorGamePage extends GatewayGameBase<IColorGamePageProps, IColorGamePageState> {
    constructor(props: IColorGamePageProps) {
        super(props);
        // ConnectionManager is automatically initialized
    }

    // Connection registration is handled automatically in connectLiveGateway()
    // You can also manually register connections if needed:

    private setupCustomConnection() {
        const customConnection = new WebSocket('ws://example.com');
        this.registerConnection(customConnection);
    }

    // Cleanup is handled automatically in componentWillUnmount()
}
```

### 3. **Manual Connection Registration**

If you need to register connections manually:

```typescript
export default class CustomGame extends GameBase<GameBaseProps, GameState> {
    private setupConnection() {
        try {
            // Create or get connection
            const connection = this.createWebSocketConnection();

            // Register for tracking
            this.registerConnection(connection);

            // Set up event listeners
            connection.addEventListener('open', this.handleConnectionOpen);
            connection.addEventListener('close', this.handleConnectionClose);
        } catch (error) {
            console.error('Failed to setup connection:', error);
        }
    }

    private handleConnectionClose = () => {
        // Unregister when connection is closed
        this.unregisterConnection(this.currentConnection);
    };
}
```

### 4. **Connection Lifecycle Management**

```typescript
export default class AdvancedGame extends GatewayGameBase<GameBaseProps, GameState> {
    componentDidMount() {
        super.componentDidMount();
        this.setupConnectionTracking();
    }

    private setupConnectionTracking() {
        // Monitor connection state changes
        this.connectionManager.hasActiveConnections();
        this.connectionManager.getActiveConnectionCount();
    }

    // Handle visibility changes
    onVisibilityChange = async () => {
        if (document.hidden) {
            // Page hidden - disconnect to save resources
            await this.connectionManager.disconnect('visibility_change');
        } else {
            // Page visible - reconnect if needed
            this.connectLiveGateway();
        }
    };

    // Get connection status
    getConnectionStatus() {
        return {
            activeConnections: this.connectionManager.getActiveConnectionCount(),
            isShuttingDown: this.connectionManager.isShutdownInProgress(),
            hasActiveConnections: this.connectionManager.hasActiveConnections(),
        };
    }
}
```

### 5. **Error Handling and Reconnection**

```typescript
export default class ResilientGame extends GatewayGameBase<GameBaseProps, GameState> {
    @render(gc.Connection.ConnectionStore, (store) => store.isConnectFailed)
    handleConnectionFailure(isConnectFailed: boolean) {
        if (isConnectFailed) {
            console.error('Connection failed, cleaning up');
            this.connectionManager.closeAllConnections('connection_failed');
        }
    }

    handleReconnect = async () => {
        try {
            console.log('Attempting reconnection');

            // 1. Clean up existing connections
            await this.connectionManager.closeAllConnections('reconnect');

            // 2. Reset connection state
            await this.connectionManager.reset();

            // 3. Create new connection
            this.connectLiveGateway();

            console.log('Reconnection completed');
        } catch (error) {
            console.error('Reconnection failed:', error);
        }
    };
}
```

### 6. **Testing Connection Registration**

```typescript
// In your test file
describe('Connection Registration', () => {
    it('should register connections when created', () => {
        const game = new MyGame(props);
        const mockConnection = { readyState: WebSocket.OPEN };

        game.registerConnection(mockConnection);

        expect(game.connectionManager.getActiveConnectionCount()).toBe(1);
    });

    it('should unregister connections when closed', () => {
        const game = new MyGame(props);
        const mockConnection = { readyState: WebSocket.OPEN };

        game.registerConnection(mockConnection);
        game.unregisterConnection(mockConnection);

        expect(game.connectionManager.getActiveConnectionCount()).toBe(0);
    });
});
```

### 7. **Best Practices**

1. **Always Register Connections**: Register every connection you create
2. **Use Built-in Methods**: Leverage the `registerConnection()` and `unregisterConnection()` methods from base classes
3. **Clean Up Properly**: Always clean up in `componentWillUnmount()`
4. **Handle Visibility Changes**: Disconnect when page is hidden
5. **Monitor Connection Health**: Use `getConnectionInfo()` to check status
6. **Implement Reconnection**: Handle connection failures gracefully
7. **Log Operations**: Use console logs for debugging connection issues

### 8. **Migration Checklist**

To migrate existing game components:

-   [ ] Import ConnectionManager
-   [ ] Initialize in constructor
-   [ ] Register connections in connection handlers
-   [ ] Use ConnectionManager for cleanup
-   [ ] Implement visibility change handling
-   [ ] Add connection status monitoring
-   [ ] Test connection lifecycle

### 9. **Common Patterns**

```typescript
// Pattern 1: Automatic registration in handlers
@handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
connectLiveGateway() {
    const handler = this.getConnectionHandler();
    if (handler?.connection) {
        this.registerConnection(handler.connection);
    }
}

// Pattern 2: Manual registration for custom connections
private createCustomConnection() {
    const connection = new WebSocket(url);
    this.registerConnection(connection);
    return connection;
}

// Pattern 3: Cleanup in componentWillUnmount
componentWillUnmount() {
    this.connectionManager.disconnect('component_unmount');
    super.componentWillUnmount();
}
```

This approach ensures that all connections are properly tracked, managed, and cleaned up, preventing memory leaks and connection issues.
