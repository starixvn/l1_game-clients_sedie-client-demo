import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LobbyComponent from '../src/lobby/lobby';
import { TokenRequestManager } from '../src/_shared/utils/token-request-manager';

// Mock dependencies
jest.mock('../src/_shared/utils/token-request-manager');
jest.mock('../src/_shared/utils/sync-member-site-balance');
jest.mock('../src/i18n', () => ({
    loadI18n: jest.fn()
}));
jest.mock('../src/appProvider', () => ({
    AppContextConsumer: ({ children }: { children: (context: any) => React.ReactNode }) =>
        children({ language: 'en' })
}));
jest.mock('../src/games/game-base/components/game-disconnect-view', () => ({
    GameDisconnectView: ({ onReconnect, isSSOFailure, customMessage, customButtonText }: {
        onReconnect: () => void;
        isSSOFailure: boolean;
        customMessage?: string;
        customButtonText?: string;
    }) => (
        <div data-testid="game-disconnect-view" data-sso-failure={isSSOFailure}>
            <p data-testid="disconnect-message">{customMessage || 'Connection failed'}</p>
            <button onClick={onReconnect} data-testid="reconnect-button">
                {customButtonText || 'Reconnect'}
            </button>
        </div>
    )
}));

// Mock the game client modules
jest.mock('@sg/sg-game-client', () => ({
    Auth: {
        AuthHandlers: {
            SSO: 'SSO'
        },
        AuthStore: {
            isAuthenticated: false,
            username: ''
        }
    },
    App: {
        AppStore: {
            isSessionTimeout: false
        }
    },
    Player: {
        MainPlayerStore: {
            offerGames: []
        }
    },
    GatewayConnection: {
        GatewayConnectionHandlers: {
            ConnectHandler: 'ConnectHandler'
        }
    },
    Translator: {
        t: jest.fn((key: string) => key),
        translate: jest.fn((key: string) => key)
    }
}));

// Mock the observer decorators
jest.mock('@sg/sg-observer', () => ({
    observer: (Component: any) => Component,
    handle: jest.fn(() => jest.fn()),
    render: jest.fn(() => jest.fn())
}));

describe('Lobby Session Timeout Integration', () => {
    let mockTokenRequestManager: jest.Mocked<TokenRequestManager>;
    let mockOnSSORetry: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();

        mockOnSSORetry = jest.fn();
        mockTokenRequestManager = {
            executeTokenRequest: jest.fn(),
            setTokenRequestCallback: jest.fn(),
            getInstance: jest.fn().mockReturnThis()
        } as any;

        (TokenRequestManager.getInstance as jest.Mock).mockReturnValue(mockTokenRequestManager);
    });

    describe('Session Timeout Handling', () => {
        it('should show GameDisconnectView when isSessionTimeout is true', () => {
            // Arrange
            const props = {
                token: 'test-token-123',
                onSSORetry: mockOnSSORetry
            };

            // Act
            render(<LobbyComponent {...props} />);

            // Simulate session timeout by directly setting state
            const lobbyInstance = screen.getByTestId('lobby') as any;
            if (lobbyInstance && lobbyInstance._reactInternalFiber) {
                const component = lobbyInstance._reactInternalFiber.return.stateNode;
                if (component && component.setState) {
                    component.setState({ isSessionTimeout: true });
                }
            }

            // Assert
            expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();
            expect(screen.getByTestId('disconnect-message')).toHaveTextContent('Session expired. Please reconnect to continue.');
            expect(screen.getByTestId('reconnect-button')).toHaveTextContent('Reconnect');
        });

        it('should call onSSORetry when reconnect button is clicked', async () => {
            // Arrange
            const props = {
                token: 'test-token-123',
                onSSORetry: mockOnSSORetry
            };

            // Act
            render(<LobbyComponent {...props} />);

            // Simulate session timeout
            const lobbyInstance = screen.getByTestId('lobby') as any;
            if (lobbyInstance && lobbyInstance._reactInternalFiber) {
                const component = lobbyInstance._reactInternalFiber.return.stateNode;
                if (component && component.setState) {
                    component.setState({ isSessionTimeout: true });
                }
            }

            // Click reconnect button
            const reconnectButton = screen.getByTestId('reconnect-button');
            fireEvent.click(reconnectButton);

            // Assert
            await waitFor(() => {
                expect(mockOnSSORetry).toHaveBeenCalledTimes(1);
            });
        });

        it('should set isSSOFailure to true in GameDisconnectView', () => {
            // Arrange
            const props = {
                token: 'test-token-123',
                onSSORetry: mockOnSSORetry
            };

            // Act
            render(<LobbyComponent {...props} />);

            // Simulate session timeout
            const lobbyInstance = screen.getByTestId('lobby') as any;
            if (lobbyInstance && lobbyInstance._reactInternalFiber) {
                const component = lobbyInstance._reactInternalFiber.return.stateNode;
                if (component && component.setState) {
                    component.setState({ isSessionTimeout: true });
                }
            }

            // Assert
            const disconnectView = screen.getByTestId('game-disconnect-view');
            expect(disconnectView).toHaveAttribute('data-sso-failure', 'true');
        });

        it('should fallback to page refresh when onSSORetry is not provided', async () => {
            // Arrange
            const props = {
                token: 'test-token-123'
                // No onSSORetry prop
            };

            // Mock window.location.reload
            const mockReload = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { reload: mockReload },
                writable: true
            });

            // Act
            render(<LobbyComponent {...props} />);

            // Simulate session timeout
            const lobbyInstance = screen.getByTestId('lobby') as any;
            if (lobbyInstance && lobbyInstance._reactInternalFiber) {
                const component = lobbyInstance._reactInternalFiber.return.stateNode;
                if (component && component.setState) {
                    component.setState({ isSessionTimeout: true });
                }
            }

            // Click reconnect button
            const reconnectButton = screen.getByTestId('reconnect-button');
            fireEvent.click(reconnectButton);

            // Assert
            await waitFor(() => {
                expect(mockReload).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Props Interface', () => {
        it('should accept onSSORetry prop in constructor', () => {
            // Arrange & Act
            const props = {
                token: 'test-token-123',
                onSSORetry: mockOnSSORetry
            };

            // This should not throw an error
            expect(() => {
                render(<LobbyComponent {...props} />);
            }).not.toThrow();
        });

        it('should work without onSSORetry prop', () => {
            // Arrange & Act
            const props = {
                token: 'test-token-123'
                // No onSSORetry prop
            };

            // This should not throw an error
            expect(() => {
                render(<LobbyComponent {...props} />);
            }).not.toThrow();
        });
    });

    describe('Console Logging', () => {
        it('should log appropriate messages when reconnect is requested', async () => {
            // Arrange
            const props = {
                token: 'test-token-123',
                onSSORetry: mockOnSSORetry
            };

            // Act
            render(<LobbyComponent {...props} />);

            // Simulate session timeout
            const lobbyInstance = screen.getByTestId('lobby') as any;
            if (lobbyInstance && lobbyInstance._reactInternalFiber) {
                const component = lobbyInstance._reactInternalFiber.return.stateNode;
                if (component && component.setState) {
                    component.setState({ isSessionTimeout: true });
                }
            }

            // Click reconnect button
            const reconnectButton = screen.getByTestId('reconnect-button');
            fireEvent.click(reconnectButton);

            // Assert
            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith('🔄 [LOBBY] Session reconnect requested');
                expect(console.log).toHaveBeenCalledWith('🔄 [LOBBY] Calling parent onSSORetry callback');
            });
        });

        it('should log fallback message when onSSORetry is not provided', async () => {
            // Arrange
            const props = {
                token: 'test-token-123'
                // No onSSORetry prop
            };

            // Act
            render(<LobbyComponent {...props} />);

            // Simulate session timeout
            const lobbyInstance = screen.getByTestId('lobby') as any;
            if (lobbyInstance && lobbyInstance._reactInternalFiber) {
                const component = lobbyInstance._reactInternalFiber.return.stateNode;
                if (component && component.setState) {
                    component.setState({ isSessionTimeout: true });
                }
            }

            // Click reconnect button
            const reconnectButton = screen.getByTestId('reconnect-button');
            fireEvent.click(reconnectButton);

            // Assert
            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith('🔄 [LOBBY] Session reconnect requested');
                expect(console.log).toHaveBeenCalledWith('🔄 [LOBBY] No onSSORetry callback provided, refreshing page as fallback');
            });
        });
    });
}); 