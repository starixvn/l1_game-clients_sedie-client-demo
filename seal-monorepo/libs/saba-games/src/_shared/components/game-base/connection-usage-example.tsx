import React from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import GameBase, { IGameBaseState } from './index';
import { ConnectionManager } from './connection-manager';
import { GameBaseProps } from './type';

interface IExampleGameState extends IGameBaseState {
    isConnected: boolean;
}

/**
 * Example showing proper connection management in a game component
 * This demonstrates how to ensure connections are properly closed and cleaned up
 */
export default class ExampleGame extends GameBase<GameBaseProps, IExampleGameState> {
    private connectionManager: ConnectionManager;

    constructor(props: GameBaseProps) {
        super(props);
        this.state = {
            ...this.state,
            isConnected: false,
        };

        this.connectionManager = ConnectionManager.getInstance();
    }

    componentDidMount() {
        super.componentDidMount();
        this.setupConnection();
    }

    componentWillUnmount() {
        // Proper cleanup sequence
        this.cleanupConnection();
        super.componentWillUnmount();
    }

    private async setupConnection() {
        try {
            // Register connection when it's created
            // Note: In actual implementation, you would get the handler from the container
            console.log('ExampleGame: Setting up connection tracking');
        } catch (error) {
            console.error('Failed to setup connection:', error);
        }
    }

    private async cleanupConnection() {
        try {
            console.log('ExampleGame: Starting connection cleanup');

            // 1. Disconnect using the manager (handles both handler.disconnect() and connection.close())
            await this.connectionManager.disconnect('component_unmount');

            // 2. Close all remaining connections as a safety measure
            await this.connectionManager.closeAllConnections('component_unmount');

            console.log('ExampleGame: Connection cleanup completed');
        } catch (error) {
            console.error('ExampleGame: Error during connection cleanup:', error);
        }
    }

    // Override the visibility change handler to properly manage connections
    onVisibilityChange = async () => {
        if (document.hidden) {
            // Page is hidden - disconnect to save resources
            console.log('ExampleGame: Page hidden, disconnecting connections');
            await this.connectionManager.disconnect('visibility_change');
        } else {
            // Page is visible - reconnect if needed
            console.log('ExampleGame: Page visible, reconnecting if needed');
            this.createConnection();
        }
    };

    // Override connection methods to use the manager
    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handle())
    override closeConnect(): void {
        // Use the connection manager instead of direct handler calls
        this.connectionManager.disconnect('close_connect_handler');
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleConnectionStateChange(isConnected: boolean): void {
        this.setState({ isConnected });

        if (!isConnected) {
            // Connection lost - cleanup
            this.connectionManager.closeAllConnections('connection_lost');
        }
    }

    // Example of proper error handling for connection issues
    @render(gc.Connection.ConnectionStore, (store) => store.isConnectFailed)
    handleConnectionFailure(isConnectFailed: boolean): void {
        if (isConnectFailed) {
            console.error('ExampleGame: Connection failed, cleaning up');
            this.connectionManager.closeAllConnections('connection_failed');
        }
    }

    // Example of reconnection logic
    handleReconnect = async () => {
        try {
            console.log('ExampleGame: Attempting reconnection');

            // 1. Clean up existing connections
            await this.connectionManager.closeAllConnections('reconnect');

            // 2. Reset connection state
            await this.connectionManager.reset();

            // 3. Create new connection
            this.createConnection();

            console.log('ExampleGame: Reconnection completed');
        } catch (error) {
            console.error('ExampleGame: Reconnection failed:', error);
        }
    };

    // Example of checking connection status
    isConnectionHealthy(): boolean {
        return this.state.isConnected && !this.connectionManager.isShutdownInProgress();
    }

    // Example of getting connection statistics
    getConnectionInfo() {
        return {
            isConnected: this.state.isConnected,
            activeConnections: this.connectionManager.getActiveConnectionCount(),
            isShuttingDown: this.connectionManager.isShutdownInProgress(),
        };
    }

    // Abstract method implementations
    override joinGame(): void {
        // Implementation specific to this game
        console.log('ExampleGame: Joining game');
    }

    override connectLiveGateway(): void {
        // Implementation specific to this game
        console.log('ExampleGame: Connecting to live gateway');
    }

    override processAuthorizationIfRoundMatches(roundId: number): void {
        // Implementation specific to this game
        console.log('ExampleGame: Processing authorization for round', roundId);
    }

    override showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ): Promise<void> {
        // Implementation specific to this game
        console.log('ExampleGame: Showing result');
        return Promise.resolve();
    }

    render() {
        const connectionInfo = this.getConnectionInfo();

        return (
            <div>
                <h2>Example Game</h2>
                <div>
                    <p>Connection Status: {connectionInfo.isConnected ? 'Connected' : 'Disconnected'}</p>
                    <p>Active Connections: {connectionInfo.activeConnections}</p>
                    <p>Shutdown in Progress: {connectionInfo.isShuttingDown ? 'Yes' : 'No'}</p>
                    <button onClick={this.handleReconnect} disabled={connectionInfo.isConnected}>
                        Reconnect
                    </button>
                </div>
                {/* Game-specific UI components */}
            </div>
        );
    }
}

/**
 * Key Points for Proper Connection Management:
 * 
 * 1. **Always use ConnectionManager.getInstance()** - Ensures singleton pattern
 * 2. **Register connections when created** - Track all active connections
 * 3. **Clean up in componentWillUnmount** - Ensure no memory leaks
 * 4. **Handle visibility changes** - Disconnect when page is hidden
 * 5. **Use async/await** - Connection operations are asynchronous
 * 6. **Implement proper error handling** - Always catch and log errors
 * 7. **Check connection state** - Verify before operations
 * 8. **Use disconnect() instead of close()** - Handles both handler and connection cleanup
 * 9. **Monitor connection health** - Check for connection issues
 * 10. **Implement reconnection logic** - Handle connection failures gracefully
 */ 