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
        // Try multiple sources for the shared container
        const sources = [
            sharedContainer, // Imported from startup
            window['seal_shared_container'],
            (gc as any).sharedContainer,
            (window as any).sharedContainer
        ];

        for (const source of sources) {
            if (source && typeof source.get === 'function') {
                console.log('GatewayConnectionManager: Found container source:', source);
                return source;
            }
        }

        console.warn('GatewayConnectionManager: No container sources found');
        console.log('Available sources:', {
            imported_shared: sharedContainer,
            window_seal: window['seal_shared_container'],
            gc_shared: (gc as any).sharedContainer,
            window_shared: (window as any).sharedContainer
        });

        return null;
    }

    /**
 * Disconnect gateway connection directly without decorator dependency
 * @param reason - Optional reason for disconnection (for logging)
 */
    disconnect(reason?: string): void {
        try {
            console.log(`GatewayConnectionManager: Disconnecting gateway connection${reason ? ` - ${reason}` : ''}`);

            // Try multiple approaches to get the handler
            let handler: any = null;

            // Approach 1: Try container access
            const container = this.getSharedContainer();
            if (container) {
                console.log('GatewayConnectionManager: Container found, attempting to get handler');
                console.log('GatewayConnectionManager: Handler class:', gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);

                try {
                    handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
                    console.log('GatewayConnectionManager: Handler retrieved from container:', handler);
                } catch (e) {
                    console.log('GatewayConnectionManager: Failed to get handler from container:', e);
                }
            }

            // Approach 2: Try global window access
            if (!handler && window['seal_shared_container']) {
                try {
                    handler = window['seal_shared_container'].get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
                    console.log('GatewayConnectionManager: Handler retrieved from window:', handler);
                } catch (e) {
                    console.log('GatewayConnectionManager: Failed to get handler from window:', e);
                }
            }

            // Approach 3: Try to create a new instance directly
            if (!handler) {
                try {
                    console.log('GatewayConnectionManager: Attempting to create handler instance directly');
                    const HandlerClass = gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler;
                    if (typeof HandlerClass === 'function') {
                        // Try to get the store from the container first
                        const store = container?.get(gc.GatewayConnection.GatewayConnectionStore);
                        if (store) {
                            handler = new HandlerClass(store);
                            console.log('GatewayConnectionManager: Created handler instance directly:', handler);
                        }
                    }
                } catch (e) {
                    console.log('GatewayConnectionManager: Failed to create handler instance:', e);
                }
            }

            if (handler) {
                console.log('GatewayConnectionManager: Calling handler.disconnect()');
                handler.disconnect();
                console.log('GatewayConnectionManager: Disconnect called successfully');
            } else {
                console.warn('GatewayConnectionManager: ConnectHandler not found in any source');

                // Try to list available handlers in container
                if (container) {
                    try {
                        if (container._registry && container._registry._registrations) {
                            const registrations = Object.keys(container._registry._registrations);
                            console.log('GatewayConnectionManager: Available registrations:', registrations);
                        }
                    } catch (e) {
                        console.log('GatewayConnectionManager: Could not inspect container registrations');
                    }
                }
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

            const container = this.getSharedContainer();
            if (!container) {
                console.warn('GatewayConnectionManager: No shared container found');
                return;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
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
            const container = this.getSharedContainer();
            if (!container) {
                return false;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            return !!handler;
        } catch (error) {
            console.error('GatewayConnectionManager: Error checking handler availability:', error);
            return false;
        }
    }
} 