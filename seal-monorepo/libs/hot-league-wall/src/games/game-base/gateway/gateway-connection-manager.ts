import * as gc from '@sg/sg-game-client';
import { sharedContainer } from '../startup';

/**
 * Centralized connection management for gateway connections
 * This singleton manager handles connection cleanup independently of component lifecycle
 */
export class GatewayConnectionManager {
    private static instance: GatewayConnectionManager;

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
            window['seal_shared_container'],
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
            console.log('GatewayConnectionManager: Failed to get handler from container:', error);
            return null;
        }
    }

    /**
     * Disconnect gateway connection directly without decorator dependency
     * @param reason - Optional reason for disconnection (for logging)
     */
    disconnect(reason?: string): void {
        try {
            console.log(`GatewayConnectionManager: Disconnecting gateway connection${reason ? ` - ${reason}` : ''}`);

            const handler = this.getConnectHandler();

            if (handler) {
                console.log('GatewayConnectionManager: Calling handler.disconnect()');
                handler.disconnect();
                console.log('GatewayConnectionManager: Disconnect called successfully');
            } else {
                console.warn('GatewayConnectionManager: ConnectHandler not found');
            }
        } catch (error) {
            console.error('GatewayConnectionManager: Failed to disconnect:', error);
        }
    }

    /**
     * Reset gateway connection state
     */
    reset(): void {
        try {
            console.log('GatewayConnectionManager: Resetting gateway connection');

            const handler = this.getConnectHandler();

            if (handler) {
                handler.reset();
                console.log('GatewayConnectionManager: Reset called successfully');
            } else {
                console.warn('GatewayConnectionManager: ConnectHandler not found in container');
            }
        } catch (error) {
            console.error('GatewayConnectionManager: Failed to reset:', error);
        }
    }

    /**
     * Check if gateway connection is available
     */
    isHandlerAvailable(): boolean {
        try {
            const handler = this.getConnectHandler();
            return !!handler;
        } catch (error) {
            console.error('GatewayConnectionManager: Error checking handler availability:', error);
            return false;
        }
    }
} 