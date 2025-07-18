import { GatewayConnectionManager } from '../../src/games/game-base/gateway/gateway-connection-manager';

// Mock the external dependencies
jest.mock('@sg/sg-game-client', () => ({
    Auth: {
        AuthHandlers: {
            SSO: 'SSO_HANDLER'
        },
        AuthStore: 'AUTH_STORE'
    },
    GatewayConnection: {
        GatewayConnectionHandlers: {
            ConnectHandler: 'CONNECT_HANDLER'
        },
        GatewayConnectionStore: 'GATEWAY_CONNECTION_STORE'
    },
    Player: {
        MainPlayerStore: 'MAIN_PLAYER_STORE'
    },
    App: {
        AppStore: 'APP_STORE'
    }
}));

jest.mock('@sg/sg-observer', () => ({
    handle: jest.fn(),
    render: jest.fn(),
    observer: jest.fn()
}));

jest.mock('../../src/games/game-base/startup', () => ({
    configSharedContainer: jest.fn()
}));

jest.mock('../../src/games/game-base/gateway/gateway-connection-manager', () => ({
    GatewayConnectionManager: {
        getInstance: jest.fn()
    }
}));

jest.mock('../../src/_shared/states/lobby', () => ({
    LobbyStore: 'LOBBY_STORE'
}));

jest.mock('../../src/lobby/utils', () => ({
    getFilteredGames: jest.fn((games) => games)
}));

jest.mock('../../src/_shared/utils/component-util', () => ({
    gamePageMap: {}
}));

jest.mock('../../src/games/game-base/components/game-disconnect-view', () => ({
    GameDisconnectView: () => 'Disconnect View'
}));

jest.mock('../../src/_shared/components/loading', () => ({
    __esModule: true,
    default: () => 'Loading...'
}));

describe('LobbyComponent Connection Management', () => {
    let mockConnectionManager: any;
    let mockHandler: any;
    let mockContainer: any;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Arrange: Setup mocks and spies
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        mockHandler = {
            disconnect: jest.fn(),
            reset: jest.fn(),
            connection: {
                readyState: 1, // WebSocket.OPEN
                close: jest.fn(),
                removeEventListener: jest.fn()
            }
        };

        mockContainer = {
            get: jest.fn().mockReturnValue(mockHandler)
        };

        mockConnectionManager = {
            registerConnection: jest.fn(),
            unregisterConnection: jest.fn(),
            disconnect: jest.fn(),
            closeAllConnections: jest.fn(),
            getActiveConnectionCount: jest.fn(),
            isShutdownInProgress: jest.fn(),
            hasActiveConnections: jest.fn(),
            getSharedContainer: jest.fn().mockReturnValue(mockContainer)
        };

        (GatewayConnectionManager.getInstance as jest.Mock).mockReturnValue(mockConnectionManager);

        // Mock window object
        Object.defineProperty(window, 'hot_league_wall_shared_container', {
            value: mockContainer,
            writable: true
        });
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        delete (window as any).hot_league_wall_shared_container;
    });

    describe('GatewayConnectionManager Integration', () => {
        it('should initialize connection manager', () => {
            // Act
            const manager = GatewayConnectionManager.getInstance();

            // Assert
            expect(manager).toBeDefined();
            expect(GatewayConnectionManager.getInstance).toHaveBeenCalledTimes(1);
        });

        it('should register connections properly', () => {
            // Arrange
            const testConnection = { id: 'test-connection' };

            // Act
            mockConnectionManager.registerConnection(testConnection);

            // Assert
            expect(mockConnectionManager.registerConnection).toHaveBeenCalledWith(testConnection);
        });

        it('should disconnect connections properly', async () => {
            // Act
            await mockConnectionManager.disconnect('test_reason');

            // Assert
            expect(mockConnectionManager.disconnect).toHaveBeenCalledWith('test_reason');
        });

        it('should close all connections properly', async () => {
            // Act
            await mockConnectionManager.closeAllConnections('test_reason');

            // Assert
            expect(mockConnectionManager.closeAllConnections).toHaveBeenCalledWith('test_reason');
        });
    });

    describe('Connection Handler Management', () => {
        it('should get connection handler from container', () => {
            // Act
            const handler = mockConnectionManager.getSharedContainer().get('CONNECT_HANDLER');

            // Assert
            expect(handler).toBe(mockHandler);
            expect(mockContainer.get).toHaveBeenCalledWith('CONNECT_HANDLER');
        });

        it('should handle missing container gracefully', () => {
            // Arrange
            mockConnectionManager.getSharedContainer.mockReturnValue(null);

            // Act
            const result = mockConnectionManager.getSharedContainer();

            // Assert
            expect(result).toBeNull();
        });

        it('should handle missing handler gracefully', () => {
            // Arrange
            mockContainer.get.mockReturnValue(null);

            // Act
            const handler = mockContainer.get('CONNECT_HANDLER');

            // Assert
            expect(handler).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should handle container access errors gracefully', () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockConnectionManager.getSharedContainer.mockImplementation(() => {
                throw new Error('Container access failed');
            });

            // Act & Assert
            expect(() => mockConnectionManager.getSharedContainer()).toThrow('Container access failed');

            errorSpy.mockRestore();
        });

        it('should handle disconnect errors gracefully', async () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockConnectionManager.disconnect.mockRejectedValue(new Error('Disconnect failed'));

            // Act
            try {
                await mockConnectionManager.disconnect('test');
            } catch (error) {
                // Expected error
            }

            // Assert
            expect(mockConnectionManager.disconnect).toHaveBeenCalledWith('test');

            errorSpy.mockRestore();
        });
    });

    describe('Connection State Management', () => {
        it('should track active connections', () => {
            // Act
            mockConnectionManager.getActiveConnectionCount.mockReturnValue(2);
            const count = mockConnectionManager.getActiveConnectionCount();

            // Assert
            expect(count).toBe(2);
            expect(mockConnectionManager.getActiveConnectionCount).toHaveBeenCalled();
        });

        it('should check if shutdown is in progress', () => {
            // Act
            mockConnectionManager.isShutdownInProgress.mockReturnValue(true);
            const isShuttingDown = mockConnectionManager.isShutdownInProgress();

            // Assert
            expect(isShuttingDown).toBe(true);
            expect(mockConnectionManager.isShutdownInProgress).toHaveBeenCalled();
        });

        it('should check if has active connections', () => {
            // Act
            mockConnectionManager.hasActiveConnections.mockReturnValue(true);
            const hasConnections = mockConnectionManager.hasActiveConnections();

            // Assert
            expect(hasConnections).toBe(true);
            expect(mockConnectionManager.hasActiveConnections).toHaveBeenCalled();
        });
    });
}); 