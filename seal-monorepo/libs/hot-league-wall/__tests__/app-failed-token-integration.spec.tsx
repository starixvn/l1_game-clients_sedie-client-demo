import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/app';
import { TokenRequestManager } from '../src/_shared/utils/token-request-manager';
import * as ssoControlsConfig from '../src/_shared/utils/sso-controls-config';

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

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('App FailedToken Integration', () => {
    let mockTokenRequestManager: jest.Mocked<TokenRequestManager>;

    beforeEach(() => {
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
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    });

    describe('FailedToken with SSO Controls Enabled', () => {
        it('should use FailedToken when SSO controls are enabled', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
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

            // Verify correct logging
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Using FailedToken for SSO failure simulation (SSO controls enabled)')
            );
        });

        it('should log when FailedToken is being used', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
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
                    expect.stringContaining('FailedToken provided but SSO controls are disabled - using normal token flow instead')
                );
            });
        });
    });

    describe('FailedToken with SSO Controls Disabled', () => {
        it('should ignore FailedToken and use normal token flow when SSO controls are disabled', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(false);
            const failedToken = 'INVALID_TOKEN_SIMULATION_123';
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

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
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });

            // Verify FailedToken was not used
            expect(screen.getByTestId('lobby-component')).not.toHaveAttribute('data-token', failedToken);

            // Verify correct logging
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('FailedToken provided but SSO controls are disabled - using normal token flow instead')
            );
        });

        it('should log when FailedToken is being ignored', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(false);
            const failedToken = 'INVALID_TOKEN_SIMULATION_123';

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: failedToken
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('FailedToken provided but SSO controls are disabled - ignoring FailedToken')
            );
        });
    });

    describe('FailedToken Changes', () => {
        it('should update token when FailedToken changes and SSO controls are enabled', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
            const initialFailedToken = 'INVALID_TOKEN_1';
            const newFailedToken = 'INVALID_TOKEN_2';

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: initialFailedToken
            };

            // Act
            const { rerender } = render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert initial token
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', initialFailedToken);
            });

            // Act: Change FailedToken
            rerender(<App {...props} FailedToken={newFailedToken} />);

            // Assert: Token should be updated
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', newFailedToken);
            });
        });

        it('should not update token when FailedToken changes and SSO controls are disabled', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(false);
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const initialFailedToken = 'INVALID_TOKEN_1';
            const newFailedToken = 'INVALID_TOKEN_2';

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: initialFailedToken
            };

            // Act
            const { rerender } = render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert initial token (should be valid token, not failed token)
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });

            // Act: Change FailedToken
            rerender(<App {...props} FailedToken={newFailedToken} />);

            // Assert: Token should remain the same (valid token)
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null FailedToken when SSO controls are enabled', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                FailedToken: null
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert: Should use normal token flow
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });
        });

        it('should handle undefined FailedToken when SSO controls are enabled', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en'
                // FailedToken is undefined
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert: Should use normal token flow
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });
        });
    });
}); 