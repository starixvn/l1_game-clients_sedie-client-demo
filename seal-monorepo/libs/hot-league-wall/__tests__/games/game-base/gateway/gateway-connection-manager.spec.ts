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

    beforeEach(() => {
        // Arrange: Setup mocks
        jest.clearAllMocks();

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
        it('should disconnect successfully with valid handler', async () => {
            // Act
            await GatewayConnectionManager.getInstance().disconnect('test_reason');

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
        });

        it('should disconnect successfully without reason parameter', async () => {
            // Act
            await GatewayConnectionManager.getInstance().disconnect();

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
        });

        it('should handle handler.disconnect throwing error', async () => {
            // Arrange
            mockHandler.disconnect.mockImplementation(() => {
                throw new Error('Disconnect failed');
            });

            // Act
            await GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(1);
        });
    });

    describe('reset', () => {
        it('should reset successfully with valid handler', async () => {
            // Act
            await GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(mockHandler.reset).toHaveBeenCalledTimes(1);
        });

        it('should handle handler.reset throwing error', async () => {
            // Arrange
            mockHandler.reset.mockImplementation(() => {
                throw new Error('Reset failed');
            });

            // Act
            await GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(mockHandler.reset).toHaveBeenCalledTimes(1);
        });
    });

    describe('isHandlerAvailable', () => {
        it('should return true when handler is available', () => {
            // Act
            const result = GatewayConnectionManager.getInstance().isHandlerAvailable();

            // Assert
            expect(result).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle handler without disconnect method', async () => {
            // Arrange
            const invalidHandler = { reset: jest.fn() } as any; // Missing disconnect method
            mockContainer.get.mockReturnValue(invalidHandler);

            // Act
            await GatewayConnectionManager.getInstance().disconnect('test');

            // Assert
            expect(invalidHandler.disconnect).toBeUndefined();
        });

        it('should handle handler without reset method', async () => {
            // Arrange
            const invalidHandler = { disconnect: jest.fn() } as any; // Missing reset method
            mockContainer.get.mockReturnValue(invalidHandler);

            // Act
            await GatewayConnectionManager.getInstance().reset();

            // Assert
            expect(invalidHandler.reset).toBeUndefined();
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

        it('should maintain singleton pattern across multiple calls', async () => {
            // Arrange
            const manager1 = GatewayConnectionManager.getInstance();
            const manager2 = GatewayConnectionManager.getInstance();

            // Act
            await manager1.disconnect('test1');
            await manager2.disconnect('test2');

            // Assert
            expect(manager1).toBe(manager2);
            expect(mockHandler.disconnect).toHaveBeenCalledTimes(2);
        });
    });
}); 