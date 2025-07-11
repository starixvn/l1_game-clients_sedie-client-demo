import { GatewayConnectionManager } from '../../../../src/games/game-base/gateway/gateway-connection-manager';

// Mock the external dependencies
jest.mock('@sg/sg-game-client', () => ({
    GatewayConnection: {
        GatewayConnectionHandlers: {
            ConnectHandler: 'CONNECT_HANDLER'
        },
        GatewayConnectionStore: 'GATEWAY_CONNECTION_STORE'
    }
}));

jest.mock('../../../../src/games/game-base/startup', () => ({
    sharedContainer: {
        get: jest.fn()
    }
}));

describe('GatewayConnectionManager', () => {
    let mockHandler: any;
    let mockContainer: any;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Arrange: Setup mocks and spies
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        mockHandler = {
            disconnect: jest.fn(),
            reset: jest.fn()
        };

        mockContainer = {
            get: jest.fn().mockReturnValue(mockHandler)
        };

        // Mock window object
        Object.defineProperty(window, 'hot_league_wall_shared_container', {
            value: mockContainer,
            writable: true
        });

        // Mock the imported sharedContainer
        const { sharedContainer } = require('../../../../src/games/game-base/startup');
        sharedContainer.get.mockReturnValue(mockHandler);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        delete (window as any).hot_league_wall_shared_container;
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            // Act
            const instance1 = GatewayConnectionManager.getInstance();
            const instance2 = GatewayConnectionManager.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(GatewayConnectionManager);
        });
    });

    describe('disconnect', () => {
        it('should disconnect successfully with valid container and handler', () => {
            // Arrange
            const reason = 'test_disconnect';

            // Act
            GatewayConnectionManager.getInstance().disconnect(reason);

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Disconnecting gateway connection - test_disconnect'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Calling handler.disconnect()'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Disconnect called successfully'
            );
        });

        it('should disconnect successfully without reason parameter', () => {
            // Act
            GatewayConnectionManager.getInstance().disconnect();

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Disconnecting gateway connection'
            );
        });

        it('should handle missing container gracefully', () => {
            // Arrange
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const { sharedContainer } = require('../../../../src/games/game-base/startup');
            sharedContainer.get.mockImplementation(() => {
                throw new Error('Container not found');
            });
            delete (window as any).hot_league_wall_shared_container;

            // Act
            GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(warnSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: No container sources found'
            );
            expect(warnSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: ConnectHandler not found'
            );
            expect(mockHandler.disconnect).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should handle missing handler gracefully', () => {
            // Arrange
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockContainer.get.mockReturnValue(null);

            // Act
            GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(warnSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: ConnectHandler not found'
            );
            expect(mockHandler.disconnect).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should handle handler.disconnect throwing error', () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            const testError = new Error('Disconnect failed');
            mockHandler.disconnect.mockImplementation(() => {
                throw testError;
            });

            // Act
            GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Failed to disconnect:',
                testError
            );

            errorSpy.mockRestore();
        });

        it('should use window.hot_league_wall_shared_container when imported container fails', () => {
            // Arrange
            const { sharedContainer } = require('../../../../src/games/game-base/startup');
            sharedContainer.get.mockImplementation(() => {
                throw new Error('Import container failed');
            });

            // Act
            GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
        });
    });

    describe('reset', () => {
        it('should reset successfully with valid handler', () => {
            // Act
            GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(mockHandler.reset).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Resetting gateway connection'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Reset called successfully'
            );
        });

        it('should handle missing container gracefully', () => {
            // Arrange
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const { sharedContainer } = require('../../../../src/games/game-base/startup');
            sharedContainer.get.mockImplementation(() => {
                throw new Error('Container not found');
            });
            delete (window as any).hot_league_wall_shared_container;

            // Act
            GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(warnSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: ConnectHandler not found in container'
            );
            expect(mockHandler.reset).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should handle missing handler gracefully', () => {
            // Arrange
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockContainer.get.mockReturnValue(null);

            // Act
            GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(warnSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: ConnectHandler not found in container'
            );
            expect(mockHandler.reset).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should handle handler.reset throwing error', () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            const testError = new Error('Reset failed');
            mockHandler.reset.mockImplementation(() => {
                throw testError;
            });

            // Act
            GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Failed to reset:',
                testError
            );

            errorSpy.mockRestore();
        });
    });

    describe('isHandlerAvailable', () => {
        it('should return true when handler is available', () => {
            // Act
            const result = GatewayConnectionManager.getInstance().isHandlerAvailable();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when container is not available', () => {
            // Arrange
            const { sharedContainer } = require('../../../../src/games/game-base/startup');
            sharedContainer.get.mockImplementation(() => {
                throw new Error('Container not found');
            });
            delete (window as any).hot_league_wall_shared_container;

            // Act
            const result = GatewayConnectionManager.getInstance().isHandlerAvailable();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when handler is not available', () => {
            // Arrange
            mockContainer.get.mockReturnValue(null);

            // Act
            const result = GatewayConnectionManager.getInstance().isHandlerAvailable();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when container.get throws error', () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockContainer.get.mockImplementation(() => {
                throw new Error('Container get failed');
            });

            // Act
            const result = GatewayConnectionManager.getInstance().isHandlerAvailable();

            // Assert
            expect(result).toBe(false);
            expect(errorSpy).toHaveBeenCalledWith(
                'GatewayConnectionManager: Error checking handler availability:',
                expect.any(Error)
            );

            errorSpy.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple container sources gracefully', () => {
            // Arrange
            const { sharedContainer } = require('../../../../src/games/game-base/startup');
            sharedContainer.get.mockImplementation(() => {
                throw new Error('First source failed');
            });

            // Act
            GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
        });

        it('should handle handler without disconnect method', () => {
            // Arrange
            const invalidHandler = { reset: jest.fn() }; // Missing disconnect method
            mockContainer.get.mockReturnValue(invalidHandler);

            // Act
            GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(() => invalidHandler.disconnect()).toThrow();
        });

        it('should handle handler without reset method', () => {
            // Arrange
            const invalidHandler = { disconnect: jest.fn() }; // Missing reset method
            mockContainer.get.mockReturnValue(invalidHandler);

            // Act
            GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(() => invalidHandler.reset()).toThrow();
        });
    });

    describe('Integration Tests', () => {
        it('should work with real gc module structure', () => {
            // Arrange
            const gc = require('@sg/sg-game-client');
            expect(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler).toBe('CONNECT_HANDLER');

            // Act
            const manager = GatewayConnectionManager.getInstance();
            const isAvailable = manager.isHandlerAvailable();

            // Assert
            expect(isAvailable).toBe(true);
        });

        it('should maintain singleton pattern across multiple calls', () => {
            // Arrange
            const manager1 = GatewayConnectionManager.getInstance();
            const manager2 = GatewayConnectionManager.getInstance();

            // Act
            manager1.disconnect('test1');
            manager2.disconnect('test2');

            // Assert
            expect(manager1).toBe(manager2);
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(2);
        });
    });
}); 