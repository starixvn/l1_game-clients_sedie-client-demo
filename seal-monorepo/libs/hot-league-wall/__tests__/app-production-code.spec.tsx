import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/app';
import { TokenRequestManager } from '../src/_shared/utils/token-request-manager';

// Mock dependencies
jest.mock('../src/_shared/utils/token-request-manager');

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('App Production Code', () => {
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

    describe('Production Token Flow', () => {
        it('should use TokenRequestManager to get token when Play button is clicked', async () => {
            // Arrange
            const validToken = 'VALID_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const onPlayButtonTokenRequest = jest.fn().mockResolvedValue(validToken);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                onPlayButtonTokenRequest
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

        it('should handle token request failure and show SSO failure view', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest.mockRejectedValue(new Error('Network error'));

            const onPlayButtonTokenRequest = jest.fn().mockRejectedValue(new Error('Network error'));

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                onPlayButtonTokenRequest
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

            // Should show SSO failure view
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
            expect(screen.getByText('Retry Login')).toBeInTheDocument();
        });

        it('should handle token request returning null and show SSO failure view', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(null);

            const onPlayButtonTokenRequest = jest.fn().mockResolvedValue(null);

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                onPlayButtonTokenRequest
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

            // Should show SSO failure view
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
            expect(screen.getByText('Retry Login')).toBeInTheDocument();
        });
    });

    describe('SSO Retry Functionality', () => {
        it('should call onSSORetry callback when retry button is clicked', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(null);
            const onSSORetry = jest.fn();

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                onSSORetry
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Wait for SSO failure view to appear
            await waitFor(() => {
                expect(screen.getByText('Retry Login')).toBeInTheDocument();
            });

            // Click retry button
            const retryButton = screen.getByText('Retry Login');
            fireEvent.click(retryButton);

            // Assert
            expect(onSSORetry).toHaveBeenCalledTimes(1);
        });

        it('should use TokenRequestManager for retry attempt', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest
                .mockResolvedValueOnce(null) // First attempt fails
                .mockResolvedValueOnce('RETRY_TOKEN_123'); // Retry succeeds

            const onSSORetry = jest.fn();

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                onSSORetry
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Wait for SSO failure view to appear
            await waitFor(() => {
                expect(screen.getByText('Retry Login')).toBeInTheDocument();
            });

            // Click retry button
            const retryButton = screen.getByText('Retry Login');
            fireEvent.click(retryButton);

            // Assert
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalledTimes(2);
                expect(screen.getByTestId('lobby-component')).toBeInTheDocument();
                expect(screen.getByTestId('lobby-component')).toHaveAttribute('data-token', 'RETRY_TOKEN_123');
            });
        });

        it('should handle retry failure gracefully', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest
                .mockResolvedValueOnce(null) // First attempt fails
                .mockRejectedValueOnce(new Error('Retry failed')); // Retry fails

            const onSSORetry = jest.fn();

            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                onSSORetry
            };

            // Act
            render(<App {...props} />);
            const playButton = screen.getByTestId('play-button');
            fireEvent.click(playButton);

            // Wait for SSO failure view to appear
            await waitFor(() => {
                expect(screen.getByText('Retry Login')).toBeInTheDocument();
            });

            // Click retry button
            const retryButton = screen.getByText('Retry Login');
            fireEvent.click(retryButton);

            // Assert
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalledTimes(2);
                expect(console.error).toHaveBeenCalledWith(
                    '[SSO_RETRY] TokenRequestManager error:',
                    expect.any(Error)
                );
            });

            // Should still show SSO failure view
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
        });
    });

    describe('SSO Props Integration', () => {
        it('should handle isSSOFailureMode prop when provided', () => {
            // Arrange
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                isSSOFailureMode: true
            };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
            expect(screen.getByText('Retry Login')).toBeInTheDocument();
        });

        it('should handle isSSOFailureMode prop changes', async () => {
            // Arrange
            const props = {
                appEnv: 'test',
                siteId: 'test-site',
                language: 'en',
                isSSOFailureMode: false
            };

            // Act
            const { rerender } = render(<App {...props} />);

            // Initially should show prototype
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();

            // Change to failure mode
            rerender(<App {...props} isSSOFailureMode={true} />);

            // Should show SSO failure view
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
        });

        it('should handle FailedToken prop when provided', () => {
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

            // Assert - FailedToken should not affect the initial render
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing onPlayButtonTokenRequest prop', async () => {
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
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
            });

            // Should show SSO failure view since no token was obtained
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
        });

        it('should handle missing onSSORetry prop', async () => {
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

            // Wait for SSO failure view to appear
            await waitFor(() => {
                expect(screen.getByText('Retry Login')).toBeInTheDocument();
            });

            // Click retry button (should not throw error)
            const retryButton = screen.getByText('Retry Login');
            fireEvent.click(retryButton);

            // Assert
            await waitFor(() => {
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalledTimes(2);
            });
        });

        it('should handle TokenRequestManager not being set up', async () => {
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
                expect(mockTokenRequestManager.executeTokenRequest).toHaveBeenCalled();
            });

            // Should show SSO failure view
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
        });
    });

    describe('Production Readiness', () => {
        it('should work without any SSO-related props in production', async () => {
            // Arrange
            const validToken = 'PRODUCTION_TOKEN_123';
            mockTokenRequestManager.executeTokenRequest.mockResolvedValue(validToken);

            const props = {
                appEnv: 'production',
                siteId: 'production-site',
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

        it('should handle production token request failure gracefully', async () => {
            // Arrange
            mockTokenRequestManager.executeTokenRequest.mockRejectedValue(new Error('Production error'));

            const props = {
                appEnv: 'production',
                siteId: 'production-site',
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

            // Should show SSO failure view
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
        });
    });
}); 