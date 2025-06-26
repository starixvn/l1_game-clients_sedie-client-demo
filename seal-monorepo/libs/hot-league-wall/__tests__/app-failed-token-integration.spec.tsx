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

describe('App Token Request Integration', () => {
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

    describe('Token Request Flow', () => {
        it('should always use TokenRequestManager for real token flow regardless of FailedToken', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
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
                expect.stringContaining('Using TokenRequestManager for REAL APP')
            );
        });

        it('should use real token flow when SSO controls are disabled', async () => {
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
                expect.stringContaining('Using TokenRequestManager for REAL APP')
            );
        });

        it('should handle token request failure gracefully', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
            mockTokenRequestManager.executeTokenRequest.mockRejectedValue(new Error('Token request failed'));

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
                expect(console.error).toHaveBeenCalledWith(
                    '[APP_TIMING] TokenRequestManager error:',
                    expect.any(Error)
                );
            });

            // Should still show the prototype since no valid token was obtained
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });
    });

    describe('SSO Failure Mode Integration', () => {
        it('should show SSO failure view when SSO controls are enabled and isSSOFailureMode is true', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                isSSOFailureMode: true
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();
            expect(screen.getByTestId('game-disconnect-view')).toHaveAttribute('data-sso-failure', 'true');
        });

        it('should not show SSO failure view when SSO controls are disabled even if isSSOFailureMode is true', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(false);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                isSSOFailureMode: true
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.queryByTestId('game-disconnect-view')).not.toBeInTheDocument();
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });

        it('should show normal app flow when isSSOFailureMode is false', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                isSSOFailureMode: false
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', validToken);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null FailedToken gracefully', async () => {
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

        it('should handle undefined FailedToken gracefully', async () => {
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

        it('should handle token request returning null', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
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
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
                expect(console.log).toHaveBeenCalledWith(
                    expect.stringContaining('TokenRequestManager returned null for REAL APP')
                );
            });

            // Should still show the prototype since no valid token was obtained
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });
    });

    describe('SSO Retry Functionality', () => {
        it('should retry token request when SSO retry button is clicked', async () => {
            // Arrange
            jest.spyOn(ssoControlsConfig, 'shouldShowSSOControls').mockReturnValue(true);
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                isSSOFailureMode: true
            };

            // Act
            render(<App {...props} />);

            // Initially should show SSO failure view
            expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();

            // Click retry button
            const retryButton = screen.getByTestId('reconnect-button');
            fireEvent.click(retryButton);

            // Assert
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
            });
        });
    });
}); 