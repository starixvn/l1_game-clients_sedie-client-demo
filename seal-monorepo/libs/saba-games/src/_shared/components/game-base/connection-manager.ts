import * as gc from '@sg/sg-game-client';

/**
 * Manages WebSocket connections for game components
 * Provides centralized connection tracking and cleanup
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
     * Get the shared container for dependency injection
     */
    private getSharedContainer(): any {
        if (!this.sharedContainer) {
            try {
                this.sharedContainer = gc.getContainer();
            } catch (error) {
                console.error('ConnectionManager: Failed to get shared container:', error);
            }
        }
        return this.sharedContainer;
    }

    /**
     * Register a connection for tracking
     */
    public registerConnection(connection: any): void {
        if (connection && !this.connections.has(connection)) {
            this.connections.add(connection);
            console.log(`ConnectionManager: Connection registered. Total connections: ${this.connections.size}`);
        }
    }

    /**
     * Unregister a connection from tracking
     */
    public unregisterConnection(connection: any): void {
        if (connection && this.connections.has(connection)) {
            this.connections.delete(connection);
            console.log(`ConnectionManager: Connection unregistered. Total connections: ${this.connections.size}`);
        }
    }

    /**
     * Disconnect using the handler's disconnect method
     */
    public async disconnect(reason: string): Promise<void> {
        if (this.shutdownInProgress) {
            console.log('ConnectionManager: Shutdown already in progress, skipping disconnect');
            return;
        }

        try {
            console.log(`ConnectionManager: Starting disconnect (reason: ${reason})`);
            this.shutdownInProgress = true;

            const container = this.getSharedContainer();
            if (!container) {
                console.log('ConnectionManager: No container available for disconnect');
                return;
            }

            // Try to disconnect using the handler
            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            if (handler && typeof handler.disconnect === 'function') {
                console.log('ConnectionManager: Calling handler.disconnect()');
                await handler.disconnect();
            }

            console.log(`ConnectionManager: Disconnect completed (reason: ${reason})`);
        } catch (error) {
            console.error('ConnectionManager: Error during disconnect:', error);
        } finally {
            this.shutdownInProgress = false;
        }
    }

    /**
     * Close all tracked connections directly
     */
    public async closeAllConnections(reason: string): Promise<void> {
        if (this.connections.size === 0) {
            console.log('ConnectionManager: No connections to close');
            return;
        }

        console.log(`ConnectionManager: Closing ${this.connections.size} connections (reason: ${reason})`);

        const closePromises = Array.from(this.connections).map(async (connection) => {
            try {
                if (connection && typeof connection.close === 'function') {
                    await connection.close();
                    console.log('ConnectionManager: Connection closed successfully');
                } else if (connection && typeof connection.disconnect === 'function') {
                    await connection.disconnect();
                    console.log('ConnectionManager: Connection disconnected successfully');
                }
            } catch (error) {
                console.error('ConnectionManager: Error closing connection:', error);
            }
        });

        await Promise.all(closePromises);
        this.connections.clear();
        console.log(`ConnectionManager: All connections closed (reason: ${reason})`);
    }

    /**
     * Get the number of active connections
     */
    public getActiveConnectionCount(): number {
        return this.connections.size;
    }

    /**
     * Check if shutdown is in progress
     */
    public isShutdownInProgress(): boolean {
        return this.shutdownInProgress;
    }

    /**
     * Check if there are any active connections
     */
    public hasActiveConnections(): boolean {
        return this.connections.size > 0;
    }

    /**
     * Get all tracked connections (for debugging)
     */
    public getConnections(): any[] {
        return Array.from(this.connections);
    }

    /**
     * Clear all connections (for testing or reset)
     */
    public clearConnections(): void {
        this.connections.clear();
        console.log('ConnectionManager: All connections cleared');
    }

    /**
     * Reset connection state and clear all connections
     */
    public async reset(): Promise<void> {
        try {
            console.log('ConnectionManager: Resetting connections');
            await this.closeAllConnections('reset');
            this.shutdownInProgress = false;
            console.log('ConnectionManager: Reset completed');
        } catch (error) {
            console.error('ConnectionManager: Error during reset:', error);
        }
    }
} 