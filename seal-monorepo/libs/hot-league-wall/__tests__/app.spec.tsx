import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/app';
import { TokenRequestManager } from '../src/_shared/utils/token-request-manager';

// Mock dependencies
jest.mock('../src/_shared/utils/token-request-manager');
jest.mock('../src/_shared/utils/sync-member-site-balance');
jest.mock('../src/i18n', () => ({
    loadI18n: jest.fn()
}));
jest.mock('../src/appProvider', () => ({
    AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
    useAppContext: () => ({
        language: 'en',
        appEnv: 'test',
        siteId: 'test-site'
    })
}));
jest.mock('../src/lobby/lobby', () => ({
    __esModule: true,
    default: ({ token, language }: { token: string; language: string }) => (
        <div data-testid="lobby-component" data-token={token} data-language={language}>
            Lobby Component
        </div>
    )
}));
jest.mock('../src/games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype', () => ({
    __esModule: true,
    default: ({ onPlayButtonClick, isLoading }: { onPlayButtonClick: () => void; isLoading: boolean }) => (
        <div data-testid="rng-soccer-prototype" data-loading={isLoading}>
            <button onClick={onPlayButtonClick} data-testid="play-button">
                Play Now
            </button>
        </div>
    )
}));
jest.mock('../src/games/game-base/components/game-disconnect-view', () => ({
    GameDisconnectView: ({ onReconnect, isSSOFailure }: { onReconnect: () => void; isSSOFailure: boolean }) => (
        <div data-testid="game-disconnect-view" data-sso-failure={isSSOFailure}>
            <button onClick={onReconnect} data-testid="reconnect-button">
                Retry
            </button>
        </div>
    )
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('App Component', () => {
    let mockTokenRequestManager: jest.Mocked<TokenRequestManager>;

    beforeEach(() => {
        // Arrange: Set up mocks and reset state
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();

        mockTokenRequestManager = {
            executeTokenRequest: jest.fn(),
            setTokenRequestCallback: jest.fn(),
            getInstance: jest.fn().mockReturnThis()
        } as any;

        (TokenRequestManager.getInstance as jest.Mock).mockReturnValue(mockTokenRequestManager);
    });

    afterEach(() => {
        // Clean up
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    });

    describe('AppProps Interface', () => {
        it('should accept all required props including FailedToken', () => {
            // Arrange
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: 'INVALID_TOKEN_SIMULATION_123'
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
        });

        it('should handle FailedToken as null', () => {
            // Arrange
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: null
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
        });

        it('should handle FailedToken as undefined', () => {
            // Arrange
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en'
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
        });
    });

    describe('FailedToken Simulation', () => {
        it('should use FailedToken when provided and skip TokenRequestManager', async () => {
            // Arrange
            const failedToken = 'INVALID_TOKEN_SIMULATION_123';
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: failedToken
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', failedToken);
            });

            // Verify TokenRequestManager was not called
            expect(mockTokenRequestManager.executeTokenRequest).not.toHaveBeenCalled();
        });

        it('should simulate realistic delay when using FailedToken', async () => {
            // Arrange
            const failedToken = 'INVALID_TOKEN_SIMULATION_123';
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: failedToken
            };

            const startTime = Date.now();

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should have at least 500ms delay (allowing for some variance)
            expect(duration).toBeGreaterThanOrEqual(450);
        });

        it('should log appropriate messages when using FailedToken', async () => {
            // Arrange
            const failedToken = 'INVALID_TOKEN_SIMULATION_123';
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: failedToken
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    expect.stringContaining('Using FailedToken for SSO failure simulation')
                );
                expect(console.log).toHaveBeenCalledWith(
                    expect.stringContaining('Setting current token to FailedToken')
                );
            });
        });
    });

    describe('Normal Token Flow (without FailedToken)', () => {
        it('should use TokenRequestManager when FailedToken is not provided', async () => {
            // Arrange
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en'
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });
        });

        it('should handle TokenRequestManager failure when FailedToken is not provided', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest.mockRejectedValue(new Error('Network error'));

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en'
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();
                expect(screen.getByTestId('game-disconnect-view')).toHaveAttribute('data-sso-failure', 'true');
            });
        });

        it('should handle TokenRequestManager returning null when FailedToken is not provided', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(null);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en'
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();
                expect(screen.getByTestId('game-disconnect-view')).toHaveAttribute('data-sso-failure', 'true');
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty FailedToken string', async () => {
            // Arrange
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: ''
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', '');
            });
        });

        it('should handle very long FailedToken', async () => {
            // Arrange
            const longFailedToken = 'A'.repeat(1000);
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: longFailedToken
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', longFailedToken);
            });
        });

        it('should handle special characters in FailedToken', async () => {
            // Arrange
            const specialFailedToken = 'INVALID_TOKEN_!@#$%^&*()_+-=[]{}|;:,.<>?';
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: specialFailedToken
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', specialFailedToken);
            });
        });
    });

    describe('Integration with SSO Control Simulator', () => {
        it('should work correctly when FailedToken changes dynamically', async () => {
            // Arrange
            const { rerender } = render(
                <App
                    appEnv="test"
                    siteId="test-site"
                    language="en"
                    FailedToken={null}
                />
            );

            // Act: First click without FailedToken
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert: Should use TokenRequestManager
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
            });

            // Arrange: Rerender with FailedToken
            rerender(
                <App
                    appEnv="test"
                    siteId="test-site"
                    language="en"
                    FailedToken="NEW_FAILED_TOKEN_456"
                />
            );

            // Act: Click again with FailedToken
            const newPlayButton = screen.getByTestId('play-button');
            fireEvent.click(newPlayButton);

            // Assert: Should use FailedToken instead
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', 'NEW_FAILED_TOKEN_456');
            });
        });
    });

    describe('Performance and Timing', () => {
        it('should complete FailedToken simulation faster than real token request', async () => {
            // Arrange
            const failedToken = 'INVALID_TOKEN_SIMULATION_123';
            mockTokenRequestManager.executeTokenRequest.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve('REAL_TOKEN'), 1000))
            );

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: failedToken
            };

            const startTime = Date.now();

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // FailedToken should complete in ~500ms, much faster than 1000ms real request
            expect(duration).toBeLessThan(800);
        });
    });
}); 