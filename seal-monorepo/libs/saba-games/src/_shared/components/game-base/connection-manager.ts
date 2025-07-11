import * as gc from '@sg/sg-game-client';
import { sharedContainer } from './startup';

/**
 * Gateway Connection Manager for Saba Games
 * Manages WebSocket gateway connections specifically for saba-games
 * Provides centralized gateway connection tracking and cleanup
 * Ensures proper WebSocket close frames are sent to services
 */
export class ConnectionManager {
    private static instance: ConnectionManager;
    private connections: Set<any> = new Set();
    private shutdownInProgress = false;
    private sharedContainer: any = null;

    private constructor() {
        // Private constructor for singleton pattern
    }

    public static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    /**
     * Get the shared container from various possible sources
     */
    private getSharedContainer(): any {
        if (!this.sharedContainer) {
            try {
                console.log('ConnectionManager: Attempting to get container from multiple sources');

                // Try multiple container sources like hot-league-wall
                const sources = [
                    sharedContainer,
                    window['saba_games_shared_container'],
                    (gc as any).sharedContainer,
                    (window as any).sharedContainer
                ];

                for (const source of sources) {
                    if (source && typeof source.get === 'function') {
                        console.log('ConnectionManager: Found valid container source');
                        this.sharedContainer = source;
                        break;
                    }
                }

                // Fallback to gc.getContainer() if no other sources work
                if (!this.sharedContainer) {
                    console.log('ConnectionManager: No container sources found, trying gc.getContainer()');
                    this.sharedContainer = gc.getContainer();
                }

                console.log('ConnectionManager: Final container:', this.sharedContainer ? 'exists' : 'null/undefined');
            } catch (error) {
                console.error('ConnectionManager: Failed to get shared container:', error);
            }
        } else {
            console.log('ConnectionManager: Using cached shared container');
        }
        return this.sharedContainer;
    }

    /**
     * Get the Gateway ConnectHandler from the container
     */
    private getGatewayConnectHandler(): any {
        const container = this.getSharedContainer();
        console.log('ConnectionManager: Container retrieved:', container ? 'exists' : 'null/undefined');

        if (!container) {
            console.warn('ConnectionManager: No container available for handler retrieval');
            return null;
        }

        try {
            console.log('ConnectionManager: Attempting to get handler with key:', gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            console.log('ConnectionManager: Handler from container:', handler ? 'exists' : 'null/undefined');
            return handler;
        } catch (error) {
            console.error('ConnectionManager: Failed to get gateway connect handler:', error);
            return null;
        }
    }

    /**
     * Register a gateway connection for tracking
     */
    public registerGatewayConnection(connection: any): void {
        if (connection && !this.connections.has(connection)) {
            this.connections.add(connection);
            console.log(`ConnectionManager: Gateway connection registered. Total connections: ${this.connections.size}`);
        }
    }

    /**
     * Unregister a gateway connection from tracking
     */
    public unregisterGatewayConnection(connection: any): void {
        if (connection && this.connections.has(connection)) {
            this.connections.delete(connection);
            console.log(`ConnectionManager: Gateway connection unregistered. Total connections: ${this.connections.size}`);
        }
    }

    /**
     * Close a specific gateway connection with proper WebSocket cleanup
     */
    public async closeGatewayConnection(connection: any, reason?: string): Promise<boolean> {
        if (!connection) {
            console.warn('ConnectionManager: No gateway connection provided to close');
            return false;
        }

        try {
            console.log(`ConnectionManager: Closing gateway connection${reason ? ` - ${reason}` : ''}`);

            // 1. Remove event listeners first
            this.removeConnectionListeners(connection);

            // 2. Check connection state
            if (connection.readyState === WebSocket.OPEN) {
                // 3. Close the connection (this sends WebSocket close frame)
                await this.performConnectionClose(connection);
            } else {
                console.log('ConnectionManager: Gateway connection already closed or in closing state');
            }

            // 4. Unregister from tracking
            this.unregisterGatewayConnection(connection);

            // 5. Clear references
            this.clearConnectionReferences(connection);

            console.log('ConnectionManager: Gateway connection closed successfully');
            return true;

        } catch (error) {
            console.error('ConnectionManager: Failed to close gateway connection:', error);
            return false;
        }
    }

    /**
     * Remove event listeners from connection
     */
    private removeConnectionListeners(connection: any): void {
        if (!connection || typeof connection.removeEventListener !== 'function') {
            return;
        }

        try {
            // Remove common event listeners
            const events = ['open', 'close', 'error', 'message'];
            events.forEach(event => {
                connection.removeEventListener(event, () => { });
            });

            console.log('ConnectionManager: Gateway connection event listeners removed');
        } catch (error) {
            console.warn('ConnectionManager: Error removing gateway connection event listeners:', error);
        }
    }

    /**
     * Perform the actual connection close (sends WebSocket close frame)
     */
    private async performConnectionClose(connection: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Set up close event listener
                const onClose = () => {
                    connection.removeEventListener('close', onClose);
                    resolve();
                };

                const onError = (error: any) => {
                    connection.removeEventListener('error', onError);
                    reject(error);
                };

                connection.addEventListener('close', onClose);
                connection.addEventListener('error', onError);

                // Close the connection (this sends WebSocket close frame with code 41)
                connection.close();

                // Set a timeout in case the close event doesn't fire
                setTimeout(() => {
                    connection.removeEventListener('close', onClose);
                    connection.removeEventListener('error', onError);
                    resolve();
                }, 5000);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Clear connection references
     */
    private clearConnectionReferences(connection: any): void {
        try {
            // Clear common reference properties
            if (connection && typeof connection === 'object') {
                Object.keys(connection).forEach(key => {
                    if (key.includes('connection') || key.includes('socket')) {
                        (connection as any)[key] = null;
                    }
                });
            }
        } catch (error) {
            console.warn('ConnectionManager: Error clearing gateway connection references:', error);
        }
    }

    /**
     * Disconnect using the gateway handler's disconnect method and close connections
     */
    public async disconnect(reason: string): Promise<void> {
        if (this.shutdownInProgress) {
            console.log('ConnectionManager: Gateway shutdown already in progress, skipping disconnect');
            return;
        }

        try {
            console.log(`ConnectionManager: Starting gateway disconnect (reason: ${reason})`);
            this.shutdownInProgress = true;

            const handler = this.getGatewayConnectHandler();
            console.log('ConnectionManager: Handler retrieved:', handler ? 'exists' : 'null/undefined');

            if (handler) {
                console.log('ConnectionManager: Handler properties:', Object.keys(handler));
                console.log('ConnectionManager: Handler.disconnect type:', typeof handler.disconnect);

                // 1. Call handler's disconnect method
                if (typeof handler.disconnect === 'function') {
                    console.log('ConnectionManager: Calling gateway handler.disconnect()');
                    await handler.disconnect();
                    console.log('ConnectionManager: Gateway handler.disconnect() completed');
                } else {
                    console.warn('ConnectionManager: Handler exists but disconnect is not a function:', typeof handler.disconnect);
                }

                // 2. Close the handler's connection if it exists (sends WebSocket close frame)
                if (handler.connection) {
                    console.log('ConnectionManager: Closing handler connection');
                    await this.closeGatewayConnection(handler.connection, reason);
                } else {
                    console.log('ConnectionManager: Handler has no connection property');
                }

                console.log(`ConnectionManager: Gateway disconnect completed (reason: ${reason})`);
            } else {
                console.warn('ConnectionManager: Gateway ConnectHandler not found');
            }
        } catch (error) {
            console.error('ConnectionManager: Error during gateway disconnect:', error);
        } finally {
            this.shutdownInProgress = false;
        }
    }

    /**
     * Close all tracked gateway connections directly (sends WebSocket close frames)
     */
    public async closeAllGatewayConnections(reason: string): Promise<void> {
        if (this.connections.size === 0) {
            console.log('ConnectionManager: No gateway connections to close');
            return;
        }

        console.log(`ConnectionManager: Closing ${this.connections.size} gateway connections (reason: ${reason})`);

        const connections = Array.from(this.connections);
        const closePromises = connections.map(connection =>
            this.closeGatewayConnection(connection, reason)
        );

        try {
            await Promise.allSettled(closePromises);
            console.log(`ConnectionManager: All gateway connections closed (reason: ${reason})`);
        } catch (error) {
            console.error('ConnectionManager: Error during bulk gateway close:', error);
        }
    }

    /**
     * Get the number of active gateway connections
     */
    public getActiveGatewayConnectionCount(): number {
        return this.connections.size;
    }

    /**
     * Check if gateway shutdown is in progress
     */
    public isGatewayShutdownInProgress(): boolean {
        return this.shutdownInProgress;
    }

    /**
     * Check if there are any active gateway connections
     */
    public hasActiveGatewayConnections(): boolean {
        return this.connections.size > 0;
    }

    /**
     * Get all tracked gateway connections (for debugging)
     */
    public getGatewayConnections(): any[] {
        return Array.from(this.connections);
    }

    /**
     * Clear all gateway connections (for testing or reset)
     */
    public clearGatewayConnections(): void {
        this.connections.clear();
        console.log('ConnectionManager: All gateway connections cleared');
    }

    /**
     * Reset gateway connection state and clear all connections
     */
    public async reset(): Promise<void> {
        try {
            console.log('ConnectionManager: Resetting gateway connections');
            await this.closeAllGatewayConnections('reset');
            this.shutdownInProgress = false;
            console.log('ConnectionManager: Gateway reset completed');
        } catch (error) {
            console.error('ConnectionManager: Error during gateway reset:', error);
        }
    }

    /**
     * Check if gateway connect handler is available
     */
    public isGatewayHandlerAvailable(): boolean {
        const handler = this.getGatewayConnectHandler();
        return handler !== null && typeof handler.disconnect === 'function';
    }
} 