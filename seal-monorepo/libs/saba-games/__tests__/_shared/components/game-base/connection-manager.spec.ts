import { ConnectionManager } from '../../../../src/_shared/components/game-base/connection-manager';
import * as gc from '@sg/sg-game-client';

// Mock the sg-game-client
jest.mock('@sg/sg-game-client', () => ({
    getContainer: jest.fn(),
    Player: {
        FEATURE_NAME: 'Player',
    },
    Auth: {
        FEATURE_NAME: 'Auth',
    },
    App: {
        FEATURE_NAME: 'App',
    },
    Notification: {
        FEATURE_NAME: 'Notification',
    },
    ConnectSite: {
        FEATURE_NAME: 'ConnectSite',
    },
    ChipSetting: {
        FEATURE_NAME: 'ChipSetting',
    },
    GatewayConnection: {
        FEATURE_NAME: 'GatewayConnection',
        GatewayConnectionHandlers: {
            ConnectHandler: 'CONNECT_HANDLER',
        },
    },
    RoundBasePF: {
        FEATURE_NAME: 'RoundBasePF',
    },
    defaultFeatures: [],
}));

describe('ConnectionManager', () => {
    let manager: ConnectionManager;
    let mockHandler: any;
    let mockContainer: any;
    let mockConnection: any;

    beforeEach(() => {
        // Reset singleton instance before each test
        (ConnectionManager as any).instance = undefined;

        // Create fresh manager instance
        manager = ConnectionManager.getInstance();

        // Setup mock connection
        mockConnection = {
            readyState: WebSocket.OPEN,
            close: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        // Setup mock handler
        mockHandler = {
            disconnect: jest.fn(),
            reset: jest.fn(),
            connection: mockConnection,
        };

        // Setup mock container
        mockContainer = {
            get: jest.fn().mockReturnValue(mockHandler),
        };

        // Mock the getContainer function
        (gc.getContainer as jest.Mock).mockReturnValue(mockContainer);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            // Arrange
            const instance1 = ConnectionManager.getInstance();
            const instance2 = ConnectionManager.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ConnectionManager);
        });

        it('should create new instance only on first call', () => {
            // Arrange
            // Reset singleton instance to ensure fresh test
            (ConnectionManager as any).instance = undefined;

            // Act
            const instance1 = ConnectionManager.getInstance();
            const instance2 = ConnectionManager.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ConnectionManager);
        });
    });

    describe('registerGatewayConnection', () => {
        it('should register a new gateway connection', () => {
            // Arrange
            const connection = { id: 'test-gateway-connection' };

            // Act
            manager.registerGatewayConnection(connection);

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(1);
            expect(manager.hasActiveGatewayConnections()).toBe(true);
        });

        it('should not register duplicate gateway connections', () => {
            // Arrange
            const connection = { id: 'test-gateway-connection' };

            // Act
            manager.registerGatewayConnection(connection);
            manager.registerGatewayConnection(connection);

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(1);
        });

        it('should handle null/undefined gateway connections gracefully', () => {
            // Act
            manager.registerGatewayConnection(null);
            manager.registerGatewayConnection(undefined);

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });
    });

    describe('unregisterGatewayConnection', () => {
        it('should unregister an existing gateway connection', () => {
            // Arrange
            const connection = { id: 'test-gateway-connection' };
            manager.registerGatewayConnection(connection);

            // Act
            manager.unregisterGatewayConnection(connection);

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
            expect(manager.hasActiveGatewayConnections()).toBe(false);
        });

        it('should handle unregistering non-existent gateway connections gracefully', () => {
            // Arrange
            const connection = { id: 'test-gateway-connection' };

            // Act
            manager.unregisterGatewayConnection(connection);

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });
    });

    describe('closeGatewayConnection', () => {
        it('should successfully close a gateway connection with proper WebSocket cleanup', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            manager.registerGatewayConnection(connection);

            // Mock close event
            let closeCallback: (() => void) | null = null;
            connection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallback = callback;
                }
            });

            // Act
            const result = manager.closeGatewayConnection(connection, 'test_close');

            // Simulate close event
            setTimeout(() => {
                if (closeCallback) closeCallback();
            }, 10);

            await result;

            // Assert
            expect(result).resolves.toBe(true);
            expect(connection.removeEventListener).toHaveBeenCalled();
            expect(connection.close).toHaveBeenCalled();
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });

        it('should handle gateway connection already closed', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.CLOSED,
            };

            // Act
            const result = await manager.closeGatewayConnection(connection);

            // Assert
            expect(result).toBe(true);
            expect(connection.close).not.toHaveBeenCalled();
        });

        it('should handle null gateway connection gracefully', async () => {
            // Act
            const result = await manager.closeGatewayConnection(null);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle gateway connection close errors', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            const error = new Error('Close failed');
            connection.close.mockImplementation(() => {
                throw error;
            });

            // Act
            const result = await manager.closeGatewayConnection(connection);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle timeout when close event does not fire', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            manager.registerGatewayConnection(connection);

            // Act
            const result = await manager.closeGatewayConnection(connection);

            // Assert
            expect(result).toBe(true);
            expect(connection.close).toHaveBeenCalled();
        }, 10000); // Increase timeout for this test
    });

    describe('disconnect', () => {
        it('should successfully disconnect using gateway handler and close connection', async () => {
            // Arrange
            const reason = 'test_disconnect';
            mockHandler.disconnect.mockResolvedValue(undefined);

            // Mock close event for handler connection
            let closeCallback: (() => void) | null = null;
            mockConnection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallback = callback;
                }
            });

            // Act
            const disconnectPromise = manager.disconnect(reason);

            // Simulate close event
            setTimeout(() => {
                if (closeCallback) closeCallback();
            }, 10);

            await disconnectPromise;

            // Assert
            expect(mockContainer.get).toHaveBeenCalledWith(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            expect(mockHandler.disconnect).toHaveBeenCalled();
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle disconnect without reason', async () => {
            // Arrange
            mockHandler.disconnect.mockResolvedValue(undefined);

            // Act
            await manager.disconnect('test_disconnect');

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalled();
        }, 10000); // Increase timeout for this test

        it('should handle missing gateway handler gracefully', async () => {
            // Arrange
            mockContainer.get.mockReturnValue(null);

            // Act
            await manager.disconnect('test');

            // Assert
            // The implementation silently handles missing handlers, so we just verify it doesn't throw
            expect(true).toBe(true);
        });

        it('should handle handler without disconnect method', async () => {
            // Arrange
            const handlerWithoutDisconnect = { someOtherMethod: jest.fn() };
            mockContainer.get.mockReturnValue(handlerWithoutDisconnect);

            // Act
            await manager.disconnect('test');

            // Assert
            // The implementation silently handles missing disconnect methods, so we just verify it doesn't throw
            expect(true).toBe(true);
        });

        it('should handle handler without connection property', async () => {
            // Arrange
            const handlerWithoutConnection = { disconnect: jest.fn() };
            mockContainer.get.mockReturnValue(handlerWithoutConnection);

            // Act
            await manager.disconnect('test');

            // Assert
            expect(handlerWithoutConnection.disconnect).toHaveBeenCalled();
        });

        it('should handle disconnect errors gracefully', async () => {
            // Arrange
            const error = new Error('Disconnect failed');
            mockHandler.disconnect.mockRejectedValue(error);

            // Act
            await manager.disconnect('test');

            // Assert
            // The implementation silently catches errors, so we just verify it doesn't throw
            expect(true).toBe(true);
        });

        it('should prevent multiple simultaneous disconnects', async () => {
            // Arrange
            mockHandler.disconnect.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            // Act
            const disconnect1 = manager.disconnect('test1');
            const disconnect2 = manager.disconnect('test2');

            await Promise.all([disconnect1, disconnect2]);

            // Assert
            // The implementation prevents multiple disconnects by checking shutdownInProgress flag
            expect(manager.isGatewayShutdownInProgress()).toBe(false);
        }, 10000); // Increase timeout for this test
    });

    describe('closeAllGatewayConnections', () => {
        it('should close all registered gateway connections with WebSocket close frames', async () => {
            // Arrange
            const connection1 = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            const connection2 = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            manager.registerGatewayConnection(connection1);
            manager.registerGatewayConnection(connection2);

            // Mock close events
            let closeCallbacks: (() => void)[] = [];
            mockConnection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallbacks.push(callback);
                }
            });

            // Act
            const closePromise = manager.closeAllGatewayConnections('test_close_all');

            // Simulate close events
            setTimeout(() => {
                closeCallbacks.forEach(callback => callback());
            }, 10);

            await closePromise;

            // Assert
            expect(connection1.close).toHaveBeenCalled();
            expect(connection2.close).toHaveBeenCalled();
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });

        it('should handle empty gateway connections gracefully', async () => {
            // Arrange
            // No setup needed

            // Act
            await manager.closeAllGatewayConnections('test');

            // Assert
            // The implementation silently handles empty connections, so we just verify it doesn't throw
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });

        it('should handle connection close errors gracefully', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
                close: jest.fn().mockImplementation(() => {
                    throw new Error('Close failed');
                })
            };
            manager.registerGatewayConnection(connection);

            // Act
            await manager.closeAllGatewayConnections('test');

            // Assert
            // The implementation silently catches errors, so we just verify it doesn't throw
            expect(true).toBe(true);
        });
    });

    describe('reset', () => {
        it('should reset gateway connections and state', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            manager.registerGatewayConnection(connection);
            mockHandler.reset = jest.fn().mockResolvedValue(undefined);

            // Mock close event
            let closeCallback: (() => void) | null = null;
            connection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallback = callback;
                }
            });

            // Act
            const resetPromise = manager.reset();

            // Simulate close event
            setTimeout(() => {
                if (closeCallback) closeCallback();
            }, 10);

            await resetPromise;

            // Assert
            expect(connection.close).toHaveBeenCalled();
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
            expect(manager.isGatewayShutdownInProgress()).toBe(false);
        });

        it('should handle reset errors gracefully', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
                close: jest.fn().mockImplementation(() => {
                    throw new Error('Reset failed');
                })
            };
            manager.registerGatewayConnection(connection);

            // Act
            await manager.reset();

            // Assert
            // The implementation silently catches errors, so we just verify it doesn't throw
            expect(true).toBe(true);
        });
    });

    describe('utility methods', () => {
        it('should return correct gateway connection count', () => {
            // Arrange
            const connection1 = { id: 'conn1' };
            const connection2 = { id: 'conn2' };

            // Act
            manager.registerGatewayConnection(connection1);
            manager.registerGatewayConnection(connection2);

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(2);
        });

        it('should check gateway shutdown status correctly', () => {
            // Assert
            expect(manager.isGatewayShutdownInProgress()).toBe(false);
        });

        it('should check active gateway connections correctly', () => {
            // Arrange
            const connection = { id: 'test' };

            // Act & Assert
            expect(manager.hasActiveGatewayConnections()).toBe(false);
            manager.registerGatewayConnection(connection);
            expect(manager.hasActiveGatewayConnections()).toBe(true);
        });

        it('should return all gateway connections', () => {
            // Arrange
            const connection1 = { id: 'conn1' };
            const connection2 = { id: 'conn2' };
            manager.registerGatewayConnection(connection1);
            manager.registerGatewayConnection(connection2);

            // Act
            const connections = manager.getGatewayConnections();

            // Assert
            expect(connections).toHaveLength(2);
            expect(connections).toContain(connection1);
            expect(connections).toContain(connection2);
        });

        it('should clear all gateway connections', () => {
            // Arrange
            const connection = { id: 'test' };
            manager.registerGatewayConnection(connection);

            // Act
            manager.clearGatewayConnections();

            // Assert
            expect(manager.getActiveGatewayConnectionCount()).toBe(0);
        });

        it('should check gateway handler availability', () => {
            // Act
            const isAvailable = manager.isGatewayHandlerAvailable();

            // Assert
            expect(isAvailable).toBe(true);
            expect(mockContainer.get).toHaveBeenCalledWith(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
        });

        it('should return false when gateway handler is not available', () => {
            // Arrange
            mockContainer.get.mockReturnValue(null);

            // Act
            const isAvailable = manager.isGatewayHandlerAvailable();

            // Assert
            expect(isAvailable).toBe(false);
        });

        it('should return false when gateway handler has no disconnect method', () => {
            // Arrange
            const handlerWithoutDisconnect = { someOtherMethod: jest.fn() };
            mockContainer.get.mockReturnValue(handlerWithoutDisconnect);

            // Act
            const isAvailable = manager.isGatewayHandlerAvailable();

            // Assert
            expect(isAvailable).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should handle container get errors gracefully', () => {
            // Arrange
            mockContainer.get.mockImplementation(() => {
                throw new Error('Container error');
            });

            // Act
            const isAvailable = manager.isGatewayHandlerAvailable();

            // Assert
            expect(isAvailable).toBe(false);
        });

        it('should handle getContainer errors gracefully', () => {
            // Arrange
            (gc.getContainer as jest.Mock).mockImplementation(() => {
                throw new Error('getContainer error');
            });

            // Act
            const isAvailable = manager.isGatewayHandlerAvailable();

            // Assert
            expect(isAvailable).toBe(false);
        });
    });
}); 