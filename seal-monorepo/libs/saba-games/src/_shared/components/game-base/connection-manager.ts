import * as gc from '@sg/sg-game-client';
import { sharedContainer } from './startup';

/**
 * Comprehensive connection management for saba-games
 * Handles proper connection cleanup and state management
 */
export class ConnectionManager {
    private static instance: ConnectionManager;
    private activeConnections: Set<any> = new Set();
    private isShuttingDown = false;

    private constructor() { }

    static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    /**
     * Get the shared container from various possible sources
     */
    private getSharedContainer(): any {
        const sources = [
            sharedContainer,
            window['seal_shared_container'],
            (gc as any).sharedContainer,
            (window as any).sharedContainer
        ];

        for (const source of sources) {
            if (source && typeof source.get === 'function') {
                return source;
            }
        }

        console.warn('ConnectionManager: No container sources found');
        return null;
    }

    /**
     * Get the ConnectHandler from the container
     */
    private getConnectHandler(): any {
        const container = this.getSharedContainer();
        if (!container) {
            return null;
        }

        try {
            return container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
        } catch (error) {
            console.log('ConnectionManager: Failed to get handler from container:', error);
            return null;
        }
    }

    /**
     * Register a connection for tracking
     */
    registerConnection(connection: any): void {
        if (connection && !this.activeConnections.has(connection)) {
            this.activeConnections.add(connection);
            console.log('ConnectionManager: Connection registered, total active:', this.activeConnections.size);
        }
    }

    /**
     * Unregister a connection from tracking
     */
    unregisterConnection(connection: any): void {
        if (connection && this.activeConnections.has(connection)) {
            this.activeConnections.delete(connection);
            console.log('ConnectionManager: Connection unregistered, total active:', this.activeConnections.size);
        }
    }

    /**
     * Close a specific connection with proper cleanup
     */
    async closeConnection(connection: any, reason?: string): Promise<boolean> {
        if (!connection) {
            console.warn('ConnectionManager: No connection provided to close');
            return false;
        }

        try {
            console.log(`ConnectionManager: Closing connection${reason ? ` - ${reason}` : ''}`);

            // 1. Remove event listeners first
            this.removeConnectionListeners(connection);

            // 2. Check connection state
            if (connection.readyState === WebSocket.OPEN) {
                // 3. Close the connection
                await this.performConnectionClose(connection);
            } else {
                console.log('ConnectionManager: Connection already closed or in closing state');
            }

            // 4. Unregister from tracking
            this.unregisterConnection(connection);

            // 5. Clear references
            this.clearConnectionReferences(connection);

            console.log('ConnectionManager: Connection closed successfully');
            return true;

        } catch (error) {
            console.error('ConnectionManager: Failed to close connection:', error);
            return false;
        }
    }

    /**
     * Close all active connections
     */
    async closeAllConnections(reason?: string): Promise<void> {
        if (this.isShuttingDown) {
            console.log('ConnectionManager: Already shutting down, skipping');
            return;
        }

        this.isShuttingDown = true;
        console.log(`ConnectionManager: Closing all connections${reason ? ` - ${reason}` : ''}`);

        const connections = Array.from(this.activeConnections);
        const closePromises = connections.map(connection =>
            this.closeConnection(connection, reason)
        );

        try {
            await Promise.allSettled(closePromises);
            console.log('ConnectionManager: All connections closed');
        } catch (error) {
            console.error('ConnectionManager: Error during bulk close:', error);
        } finally {
            this.isShuttingDown = false;
        }
    }

    /**
     * Disconnect using the handler's disconnect method
     */
    async disconnect(reason?: string): Promise<void> {
        try {
            console.log(`ConnectionManager: Disconnecting${reason ? ` - ${reason}` : ''}`);

            const handler = this.getConnectHandler();
            if (handler) {
                // 1. Call handler's disconnect method
                if (typeof handler.disconnect === 'function') {
                    await handler.disconnect();
                }

                // 2. Close the connection if it exists
                if (handler.connection) {
                    await this.closeConnection(handler.connection, reason);
                }

                console.log('ConnectionManager: Disconnect completed successfully');
            } else {
                console.warn('ConnectionManager: ConnectHandler not found');
            }
        } catch (error) {
            console.error('ConnectionManager: Failed to disconnect:', error);
        }
    }

    /**
     * Reset connection state
     */
    async reset(): Promise<void> {
        try {
            console.log('ConnectionManager: Resetting connections');

            const handler = this.getConnectHandler();
            if (handler && typeof handler.reset === 'function') {
                await handler.reset();
            }

            // Clear all tracked connections
            this.activeConnections.clear();
            this.isShuttingDown = false;

            console.log('ConnectionManager: Reset completed');
        } catch (error) {
            console.error('ConnectionManager: Failed to reset:', error);
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

            console.log('ConnectionManager: Event listeners removed');
        } catch (error) {
            console.warn('ConnectionManager: Error removing event listeners:', error);
        }
    }

    /**
     * Perform the actual connection close
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

                // Close the connection
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
            console.warn('ConnectionManager: Error clearing references:', error);
        }
    }

    /**
     * Check if any connections are still active
     */
    hasActiveConnections(): boolean {
        return this.activeConnections.size > 0;
    }

    /**
     * Get the number of active connections
     */
    getActiveConnectionCount(): number {
        return this.activeConnections.size;
    }

    /**
     * Check if connection manager is shutting down
     */
    isShutdownInProgress(): boolean {
        return this.isShuttingDown;
    }
} 