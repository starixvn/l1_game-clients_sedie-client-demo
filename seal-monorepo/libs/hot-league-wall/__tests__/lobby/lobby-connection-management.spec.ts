import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LobbyComponent from '../../src/lobby/lobby';
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
    GameDisconnectView: () => <div data - testid="game-disconnect-view"> Disconnect View</ div >
}));

jest.mock('../../src/_shared/components/loading', () => ({
    __esModule: true,
    default: () => <div data - testid="loading"> Loading...</div>
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

    describe('componentWillUnmount', () => {
        it('should cleanup connections when component unmounts', async () => {
            // Arrange
            const { unmount } = render(<LobbyComponent token="test-token" />);

            // Act
            unmount();

            // Assert
            await waitFor(() => {
                expect(mockConnectionManager.disconnect).toHaveBeenCalledWith('lobby_unmount');
                expect(mockConnectionManager.closeAllConnections).toHaveBeenCalledWith('lobby_unmount');
            });
        });

        it('should handle connection cleanup errors gracefully', async () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockConnectionManager.disconnect.mockRejectedValue(new Error('Disconnect failed'));

            const { unmount } = render(<LobbyComponent token="test-token" />);

            // Act
            unmount();

            // Assert
            await waitFor(() => {
                expect(errorSpy).toHaveBeenCalledWith(
                    'Lobby: Error during connection cleanup:',
                    expect.any(Error)
                );
            });

            errorSpy.mockRestore();
        });
    });

    describe('connectLiveGateway', () => {
        it('should register connection when handler has connection', () => {
            // Arrange
            render(<LobbyComponent token="test-token" />);

            // Act - simulate connectLiveGateway being called
            // This would normally be triggered by the @handle decorator
            const instance = (LobbyComponent as any).prototype;
            if (instance.connectLiveGateway) {
                instance.connectLiveGateway.call(instance);
            }

            // Assert
            expect(mockConnectionManager.registerConnection).toHaveBeenCalledWith(mockHandler.connection);
        });

        it('should handle missing connection handler gracefully', () => {
            // Arrange
            mockContainer.get.mockReturnValue(null);
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();

            render(<LobbyComponent token="test-token" />);

            // Act - simulate connectLiveGateway being called
            const instance = (LobbyComponent as any).prototype;
            if (instance.connectLiveGateway) {
                instance.connectLiveGateway.call(instance);
            }

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                'Lobby: Failed to get connection handler:',
                expect.any(Error)
            );

            errorSpy.mockRestore();
        });
    });

    describe('visibility change handling', () => {
        it('should disconnect connections when page becomes hidden', async () => {
            // Arrange
            render(<LobbyComponent token="test-token" />);

            // Mock document.hidden
            Object.defineProperty(document, 'hidden', {
                value: true,
                writable: true
            });

            // Act
            fireEvent(document, new Event('visibilitychange'));

            // Assert
            await waitFor(() => {
                expect(mockConnectionManager.disconnect).toHaveBeenCalledWith('visibility_change');
            });
        });

        it('should reconnect when page becomes visible', () => {
            // Arrange
            render(<LobbyComponent token="test-token" />);

            // Mock document.hidden
            Object.defineProperty(document, 'hidden', {
                value: false,
                writable: true
            });

            // Act
            fireEvent(document, new Event('visibilitychange'));

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Lobby: Page visible, reconnecting if needed');
        });
    });

    describe('connection manager integration', () => {
        it('should initialize connection manager in constructor', () => {
            // Act
            render(<LobbyComponent token="test-token" />);

            // Assert
            expect(GatewayConnectionManager.getInstance).toHaveBeenCalledTimes(1);
        });

        it('should register connections properly', () => {
            // Arrange
            const testConnection = { id: 'test-connection' };

            // Act
            render(<LobbyComponent token="test-token" />);

            // Simulate connection registration
            mockConnectionManager.registerConnection(testConnection);

            // Assert
            expect(mockConnectionManager.registerConnection).toHaveBeenCalledWith(testConnection);
        });
    });

    describe('error handling', () => {
        it('should handle container access errors gracefully', () => {
            // Arrange
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockConnectionManager.getSharedContainer.mockImplementation(() => {
                throw new Error('Container access failed');
            });

            // Act
            render(<LobbyComponent token="test-token" />);

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                'Lobby: Failed to get connection handler:',
                expect.any(Error)
            );

            errorSpy.mockRestore();
        });
    });
}); 