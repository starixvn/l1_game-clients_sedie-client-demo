import { ConnectionManager } from '../../../../src/_shared/components/game-base/connection-manager';
import * as gc from '@sg/sg-game-client';

// Mock the startup module
jest.mock('../../../../src/_shared/components/game-base/startup', () => ({
    sharedContainer: {
        get: jest.fn(),
    },
}));

// Mock the sg-game-client
jest.mock('@sg/sg-game-client', () => ({
    GatewayConnection: {
        GatewayConnectionHandlers: {
            ConnectHandler: 'ConnectHandler',
        },
    },
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

        // Mock the startup module
        const { sharedContainer } = require('../../../../src/_shared/components/game-base/startup');
        sharedContainer.get = mockContainer.get;
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
            const spy = jest.spyOn(ConnectionManager.prototype, 'constructor' as any);

            // Act
            ConnectionManager.getInstance();
            ConnectionManager.getInstance();

            // Assert
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('registerConnection', () => {
        it('should register a new connection', () => {
            // Arrange
            const connection = { id: 'test-connection' };

            // Act
            manager.registerConnection(connection);

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(1);
            expect(manager.hasActiveConnections()).toBe(true);
        });

        it('should not register duplicate connections', () => {
            // Arrange
            const connection = { id: 'test-connection' };

            // Act
            manager.registerConnection(connection);
            manager.registerConnection(connection);

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(1);
        });

        it('should handle null/undefined connections gracefully', () => {
            // Act
            manager.registerConnection(null);
            manager.registerConnection(undefined);

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });
    });

    describe('unregisterConnection', () => {
        it('should unregister an existing connection', () => {
            // Arrange
            const connection = { id: 'test-connection' };
            manager.registerConnection(connection);

            // Act
            manager.unregisterConnection(connection);

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
            expect(manager.hasActiveConnections()).toBe(false);
        });

        it('should handle unregistering non-existent connections gracefully', () => {
            // Arrange
            const connection = { id: 'test-connection' };

            // Act
            manager.unregisterConnection(connection);

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });
    });

    describe('closeConnection', () => {
        it('should successfully close a connection with proper cleanup', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            manager.registerConnection(connection);

            // Mock close event
            let closeCallback: (() => void) | null = null;
            connection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallback = callback;
                }
            });

            // Act
            const result = manager.closeConnection(connection, 'test_close');

            // Simulate close event
            setTimeout(() => {
                if (closeCallback) closeCallback();
            }, 10);

            await result;

            // Assert
            expect(result).resolves.toBe(true);
            expect(connection.removeEventListener).toHaveBeenCalled();
            expect(connection.close).toHaveBeenCalled();
            expect(manager.getActiveConnectionCount()).toBe(0);
        });

        it('should handle connection already closed', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.CLOSED,
            };

            // Act
            const result = await manager.closeConnection(connection);

            // Assert
            expect(result).toBe(true);
            expect(connection.close).not.toHaveBeenCalled();
        });

        it('should handle null connection gracefully', async () => {
            // Act
            const result = await manager.closeConnection(null);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle connection close errors', async () => {
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
            const result = await manager.closeConnection(connection);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle timeout when close event does not fire', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            manager.registerConnection(connection);

            // Act
            const result = await manager.closeConnection(connection);

            // Assert
            expect(result).toBe(true);
            expect(connection.close).toHaveBeenCalled();
        });
    });

    describe('closeAllConnections', () => {
        it('should close all registered connections', async () => {
            // Arrange
            const connection1 = { ...mockConnection, id: 'conn1' };
            const connection2 = { ...mockConnection, id: 'conn2' };

            manager.registerConnection(connection1);
            manager.registerConnection(connection2);

            // Mock close events
            let closeCallbacks: (() => void)[] = [];
            mockConnection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallbacks.push(callback);
                }
            });

            // Act
            const promise = manager.closeAllConnections('bulk_close');

            // Simulate close events
            setTimeout(() => {
                closeCallbacks.forEach(callback => callback());
            }, 10);

            await promise;

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
            expect(manager.hasActiveConnections()).toBe(false);
        });

        it('should handle multiple close attempts gracefully', async () => {
            // Arrange
            const connection = { ...mockConnection };
            manager.registerConnection(connection);

            // Act
            const promise1 = manager.closeAllConnections('first_attempt');
            const promise2 = manager.closeAllConnections('second_attempt');

            // Simulate close event
            setTimeout(() => {
                const closeCallback = mockConnection.addEventListener.mock.calls.find(
                    call => call[0] === 'close'
                )?.[1];
                if (closeCallback) closeCallback();
            }, 10);

            await Promise.all([promise1, promise2]);

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });

        it('should handle errors during bulk close', async () => {
            // Arrange
            const connection = { ...mockConnection };
            manager.registerConnection(connection);

            const error = new Error('Bulk close failed');
            mockConnection.close.mockImplementation(() => {
                throw error;
            });

            // Act
            await manager.closeAllConnections('error_test');

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });
    });

    describe('disconnect', () => {
        it('should call handler disconnect and close connection', async () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // Mock close event
            let closeCallback: (() => void) | null = null;
            mockConnection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'close') {
                    closeCallback = callback;
                }
            });

            // Act
            const promise = manager.disconnect('test_disconnect');

            // Simulate close event
            setTimeout(() => {
                if (closeCallback) closeCallback();
            }, 10);

            await promise;

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalled();
            expect(mockConnection.close).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('ConnectionManager: Disconnect completed successfully');
        });

        it('should handle missing handler gracefully', async () => {
            // Arrange
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockContainer.get.mockReturnValue(null);

            // Act
            await manager.disconnect();

            // Assert
            expect(consoleWarnSpy).toHaveBeenCalledWith('ConnectionManager: ConnectHandler not found');
        });

        it('should handle handler without disconnect method', async () => {
            // Arrange
            const handlerWithoutDisconnect = { connection: mockConnection };
            mockContainer.get.mockReturnValue(handlerWithoutDisconnect);

            // Act
            await manager.disconnect();

            // Assert
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle disconnect errors', async () => {
            // Arrange
            const error = new Error('Disconnect failed');
            mockHandler.disconnect.mockRejectedValue(error);

            // Act
            await manager.disconnect();

            // Assert
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('should reset handler and clear connections', async () => {
            // Arrange
            const connection = { ...mockConnection };
            manager.registerConnection(connection);

            // Act
            await manager.reset();

            // Assert
            expect(mockHandler.reset).toHaveBeenCalled();
            expect(manager.getActiveConnectionCount()).toBe(0);
            expect(manager.isShutdownInProgress()).toBe(false);
        });

        it('should handle handler without reset method', async () => {
            // Arrange
            const handlerWithoutReset = { connection: mockConnection };
            mockContainer.get.mockReturnValue(handlerWithoutReset);

            // Act
            await manager.reset();

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });

        it('should handle reset errors', async () => {
            // Arrange
            const error = new Error('Reset failed');
            mockHandler.reset.mockRejectedValue(error);

            // Act
            await manager.reset();

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });
    });

    describe('getSharedContainer', () => {
        it('should try multiple container sources when primary fails', () => {
            // Arrange
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Mock different container sources
            const mockWindowContainer = { get: jest.fn() };

            const originalWindow = global.window;
            global.window = {
                ...originalWindow,
                seal_shared_container: null,
                sharedContainer: mockWindowContainer,
            } as any;

            // Mock startup container to return null
            const { sharedContainer } = require('../../../../src/_shared/components/game-base/startup');
            sharedContainer.get = null;

            // Act
            manager.disconnect();

            // Assert
            expect(consoleWarnSpy).toHaveBeenCalledWith('ConnectionManager: No container sources found');

            // Restore window
            global.window = originalWindow;
        });

        it('should use first available container source', async () => {
            // Arrange
            const mockWindowContainer = {
                get: jest.fn().mockReturnValue(mockHandler)
            };

            const originalWindow = global.window;
            global.window = {
                ...originalWindow,
                seal_shared_container: mockWindowContainer,
            } as any;

            // Mock startup container to return null
            const { sharedContainer } = require('../../../../src/_shared/components/game-base/startup');
            sharedContainer.get = null;

            // Act
            await manager.disconnect();

            // Assert
            expect(mockWindowContainer.get).toHaveBeenCalledWith(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            expect(mockHandler.disconnect).toHaveBeenCalled();

            // Restore window
            global.window = originalWindow;
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle connection with missing methods gracefully', async () => {
            // Arrange
            const incompleteConnection = { readyState: WebSocket.OPEN };

            // Act
            const result = await manager.closeConnection(incompleteConnection);

            // Assert
            expect(result).toBe(true);
        });

        it('should handle connection close with error event', async () => {
            // Arrange
            const connection = {
                ...mockConnection,
                readyState: WebSocket.OPEN,
            };
            const error = new Error('Connection error');

            // Mock error event
            let errorCallback: ((error: any) => void) | null = null;
            connection.addEventListener.mockImplementation((event, callback) => {
                if (event === 'error') {
                    errorCallback = callback;
                }
            });

            // Act
            const result = manager.closeConnection(connection);

            // Simulate error event
            setTimeout(() => {
                if (errorCallback) errorCallback(error);
            }, 10);

            await result;

            // Assert
            expect(result).resolves.toBe(false);
        });

        it('should handle rapid connection registration and unregistration', () => {
            // Arrange
            const connection = { id: 'test' };

            // Act
            for (let i = 0; i < 100; i++) {
                manager.registerConnection(connection);
                manager.unregisterConnection(connection);
            }

            // Assert
            expect(manager.getActiveConnectionCount()).toBe(0);
        });
    });
}); 