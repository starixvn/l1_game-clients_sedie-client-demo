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
                // Try multiple container sources like hot-league-wall
                const sources = [
                    sharedContainer,
                    window['saba_games_shared_container'],
                    (gc as any).sharedContainer,
                    (window as any).sharedContainer
                ];

                for (const source of sources) {
                    if (source && typeof source.get === 'function') {
                        this.sharedContainer = source;
                        break;
                    }
                }

                // Fallback to gc.getContainer() if no other sources work
                if (!this.sharedContainer) {
                    this.sharedContainer = gc.getContainer();
                }
            } catch (error) {
                // Failed to get shared container
            }
        }
        return this.sharedContainer;
    }

    /**
     * Get the Gateway ConnectHandler from the container
     */
    private getGatewayConnectHandler(): any {
        const container = this.getSharedContainer();

        if (!container) {
            return null;
        }

        try {
            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            return handler;
        } catch (error) {
            return null;
        }
    }

    /**
     * Register a gateway connection for tracking
     */
    public registerGatewayConnection(connection: any): void {
        if (connection && !this.connections.has(connection)) {
            this.connections.add(connection);
        }
    }

    /**
     * Unregister a gateway connection from tracking
     */
    public unregisterGatewayConnection(connection: any): void {
        if (connection && this.connections.has(connection)) {
            this.connections.delete(connection);
        }
    }

    /**
     * Close a specific gateway connection with proper WebSocket cleanup
     */
    public async closeGatewayConnection(connection: any, reason?: string): Promise<boolean> {
        if (!connection) {
            return false;
        }

        try {
            // 1. Remove event listeners first
            this.removeConnectionListeners(connection);

            // 2. Check connection state
            if (connection.readyState === WebSocket.OPEN) {
                // 3. Close the connection (this sends WebSocket close frame)
                await this.performConnectionClose(connection);
            }

            // 4. Unregister from tracking
            this.unregisterGatewayConnection(connection);

            // 5. Clear references
            this.clearConnectionReferences(connection);

            return true;

        } catch (error) {
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
        } catch (error) {
            // Error removing gateway connection event listeners
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
            // Error clearing gateway connection references
        }
    }

    /**
     * Disconnect using the gateway handler's disconnect method and close connections
     */
    public async disconnect(reason: string): Promise<void> {
        if (this.shutdownInProgress) {
            return;
        }

        try {
            this.shutdownInProgress = true;

            const handler = this.getGatewayConnectHandler();

            if (handler) {
                // 1. Call handler's disconnect method
                if (typeof handler.disconnect === 'function') {
                    await handler.disconnect();
                }

                // 2. Close the handler's connection if it exists (sends WebSocket close frame)
                if (handler.connection) {
                    await this.closeGatewayConnection(handler.connection, reason);
                }
            }
        } catch (error) {
            // Error during gateway disconnect
        } finally {
            this.shutdownInProgress = false;
        }
    }

    /**
     * Close all tracked gateway connections directly (sends WebSocket close frames)
     */
    public async closeAllGatewayConnections(reason: string): Promise<void> {
        if (this.connections.size === 0) {
            return;
        }

        const connections = Array.from(this.connections);
        const closePromises = connections.map(connection =>
            this.closeGatewayConnection(connection, reason)
        );

        try {
            await Promise.allSettled(closePromises);
        } catch (error) {
            // Error during bulk gateway close
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
    }

    /**
     * Reset gateway connection state and clear all connections
     */
    public async reset(): Promise<void> {
        try {
            await this.closeAllGatewayConnections('reset');
            this.shutdownInProgress = false;
        } catch (error) {
            // Error during gateway reset
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