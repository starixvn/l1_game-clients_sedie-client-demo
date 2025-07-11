import * as gc from '@sg/sg-game-client';
import { sharedContainer } from '../startup';

/**
 * Enhanced gateway connection management for hot-league-wall
 * Based on the comprehensive ConnectionManager pattern from saba-games
 * Handles proper connection cleanup, tracking, and state management
 */
export class GatewayConnectionManager {
    private static instance: GatewayConnectionManager;
    private activeConnections: Set<any> = new Set();
    private isShuttingDown = false;

    private constructor() { }

    static getInstance(): GatewayConnectionManager {
        if (!GatewayConnectionManager.instance) {
            GatewayConnectionManager.instance = new GatewayConnectionManager();
        }
        return GatewayConnectionManager.instance;
    }

    /**
     * Get the shared container from various possible sources
     */
    private getSharedContainer(): any {
        const sources = [
            sharedContainer,
            window['hot_league_wall_shared_container'],
            (gc as any).sharedContainer,
            (window as any).sharedContainer
        ];

        for (const source of sources) {
            if (source && typeof source.get === 'function') {
                return source;
            }
        }

        console.warn('GatewayConnectionManager: No container sources found');
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
            return null;
        }
    }

    /**
     * Register a connection for tracking
     */
    registerConnection(connection: any): void {
        if (connection && !this.activeConnections.has(connection)) {
            this.activeConnections.add(connection);
        }
    }

    /**
     * Unregister a connection from tracking
     */
    unregisterConnection(connection: any): void {
        if (connection && this.activeConnections.has(connection)) {
            this.activeConnections.delete(connection);
        }
    }

    /**
     * Close a specific connection with proper cleanup
     */
    async closeConnection(connection: any, reason?: string): Promise<boolean> {
        if (!connection) {
            return false;
        }

        try {
            // 1. Remove event listeners first
            this.removeConnectionListeners(connection);

            // 2. Check connection state
            if (connection.readyState === WebSocket.OPEN) {
                // 3. Close the connection
                await this.performConnectionClose(connection);
            }

            // 4. Unregister from tracking
            this.unregisterConnection(connection);

            // 5. Clear references
            this.clearConnectionReferences(connection);

            return true;

        } catch (error) {
            return false;
        }
    }

    /**
     * Close all active connections
     */
    async closeAllConnections(reason?: string): Promise<void> {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;

        const connections = Array.from(this.activeConnections);
        const closePromises = connections.map(connection =>
            this.closeConnection(connection, reason)
        );

        try {
            await Promise.allSettled(closePromises);
        } catch (error) {
            // Error during bulk close
        } finally {
            this.isShuttingDown = false;
        }
    }

    /**
     * Disconnect using the handler's disconnect method
     */
    async disconnect(reason?: string): Promise<void> {
        try {
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
            }
        } catch (error) {
            // Failed to disconnect
        }
    }

    /**
     * Reset connection state
     */
    async reset(): Promise<void> {
        try {
            const handler = this.getConnectHandler();
            if (handler && typeof handler.reset === 'function') {
                await handler.reset();
            }

            // Clear all tracked connections
            this.activeConnections.clear();
            this.isShuttingDown = false;
        } catch (error) {
            // Failed to reset
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
            // Error removing event listeners
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
            // Error clearing references
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

    /**
     * Legacy method for backward compatibility
     */
    close(): void {
        this.disconnect('legacy_close_call');
    }

    /**
     * Check if gateway connection is available
     */
    isHandlerAvailable(): boolean {
        try {
            const handler = this.getConnectHandler();
            return !!handler;
        } catch (error) {
            return false;
        }
    }
} 