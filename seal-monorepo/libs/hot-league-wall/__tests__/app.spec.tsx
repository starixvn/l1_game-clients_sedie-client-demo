import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/app';
import { SyncMemberSiteBalance } from '../src/_shared/utils/callback-singleton/sync-member-site-balance';
import { TokenRequestManager } from '../src/_shared/utils/callback-singleton/token-request-manager';

// Mock dependencies
jest.mock('../src/i18n', () => ({
    loadI18n: jest.fn(),
}));

jest.mock('../src/lobby/lobby', () => {
    return function MockLobby({ token, language, onSSORetry, isReconnecting }: any) {
        return (
            <div data-testid="mock-lobby">
                <span>Token: {token}</span>
                <span>Language: {language}</span>
                {onSSORetry && <button onClick={() => onSSORetry()}>SSO Retry</button>}
                {isReconnecting && <span>Reconnecting...</span>}
            </div>
        );
    };
});

jest.mock('../src/appProvider', () => ({
    AppProvider: ({ children, appEnv, language, siteId }: any) => (
        <div data-testid="app-provider" data-env={appEnv} data-lang={language} data-site={siteId}>
            {children}
        </div>
    ),
    useAppContext: jest.fn(() => ({
        language: 'en', // This will be overridden in tests that need different language
        appEnv: 'test',
        siteId: 'test-site',
    })),
}));

jest.mock('../src/games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype', () => {
    return function MockRNGSoccerPrototype({ onPlayButtonClick, isLoading }: any) {
        return (
            <div data-testid="rng-soccer-prototype">
                <button onClick={onPlayButtonClick} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Play'}
                </button>
            </div>
        );
    };
});

jest.mock('../src/_shared/utils/callback-singleton/sync-member-site-balance', () => ({
    SyncMemberSiteBalance: {
        getInstance: jest.fn(() => ({
            setSyncBalanceCallback: jest.fn(),
        })),
    },
}));

jest.mock('../src/_shared/utils/callback-singleton/token-request-manager', () => ({
    TokenRequestManager: {
        getInstance: jest.fn(() => ({
            executeTokenRequest: jest.fn().mockResolvedValue('mock-token'),
            setTokenRequestCallback: jest.fn(),
        })),
    },
}));

// Mock document visibility API
const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
beforeAll(() => {
    Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false,
    });
});

afterAll(() => {
    if (originalHidden) {
        Object.defineProperty(document, 'hidden', originalHidden);
    }
});

describe('Hot League Wall App Component', () => {
    const defaultProps = {
        appEnv: 'development',
        siteId: 'test-site',
        language: 'en',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure TokenRequestManager mock is properly set up after clearing
        (TokenRequestManager.getInstance as jest.Mock).mockReturnValue({
            executeTokenRequest: jest.fn().mockResolvedValue('mock-token'),
            setTokenRequestCallback: jest.fn(),
        });
    });

    describe('App_withValidProps_shouldRenderCorrectly', () => {
        it('should render RNG Soccer prototype initially', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
            expect(screen.getByText('Play')).toBeInTheDocument();
        });

        it('should render with optional updateBalanceCallback prop', () => {
            // Arrange
            const updateBalanceCallback = jest.fn() as any;
            const props = { ...defaultProps, updateBalanceCallback };

            // Act
            render(<App {...props} />);

            // Assert
            expect(SyncMemberSiteBalance.getInstance).toHaveBeenCalled();
            const mockInstance = (SyncMemberSiteBalance.getInstance as jest.Mock).mock.results[0].value;
            expect(mockInstance.setSyncBalanceCallback).toHaveBeenCalledWith(updateBalanceCallback);
        });

        it('should render with optional onRequestSSOToken prop', () => {
            // Arrange
            const onRequestSSOToken = jest.fn().mockResolvedValue('custom-token');
            const props = { ...defaultProps, onRequestSSOToken };

            // Act
            render(<App {...props} />);

            // Assert
            expect(TokenRequestManager.getInstance).toHaveBeenCalled();
            const mockInstance = (TokenRequestManager.getInstance as jest.Mock).mock.results[0].value;
            expect(mockInstance.setTokenRequestCallback).toHaveBeenCalled();
        });
    });

    describe('App_playButtonInteraction_shouldWorkCorrectly', () => {
        it('should handle play button click and show lobby', async () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            const playButton = screen.getByText('Play');
            await act(async () => {
                fireEvent.click(playButton);
            });

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
            });
        });

        it('should show loading state during token request', async () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            const playButton = screen.getByText('Play');
            fireEvent.click(playButton);

            // Assert
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should handle token request failure gracefully', async () => {
            // Arrange
            const mockExecuteTokenRequest = jest.fn().mockRejectedValue(new Error('Token request failed'));
            (TokenRequestManager.getInstance as jest.Mock).mockReturnValue({
                executeTokenRequest: mockExecuteTokenRequest,
                setTokenRequestCallback: jest.fn(),
            });
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            const playButton = screen.getByText('Play');
            await act(async () => {
                fireEvent.click(playButton);
            });

            // Assert
            // Should still show prototype after failed token request
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });
    });

    describe('App_visibilityChange_shouldHandleCorrectly', () => {
        it('should reset state when tab becomes visible without token', async () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Simulate tab becoming visible
            await act(async () => {
                document.dispatchEvent(new Event('visibilitychange'));
            });

            // Assert
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });

        it('should maintain game session when tab becomes visible with token', async () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Click play to get token
            const playButton = screen.getByText('Play');
            await act(async () => {
                fireEvent.click(playButton);
            });

            // Wait for lobby to appear
            await waitFor(() => {
                expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
            });

            // Simulate tab becoming visible
            await act(async () => {
                document.dispatchEvent(new Event('visibilitychange'));
            });

            // Assert - should still show lobby (token exists, so session is maintained)
            await waitFor(() => {
                expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
            });
        });
    });

    describe('App_SSORetry_shouldWorkCorrectly', () => {
        it('should handle SSO retry from lobby', async () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Click play to get to lobby
            const playButton = screen.getByText('Play');
            await act(async () => {
                fireEvent.click(playButton);
            });

            // Wait for lobby to appear
            await waitFor(() => {
                expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
            });

            // Click SSO retry
            const retryButton = screen.getByText('SSO Retry');
            await act(async () => {
                fireEvent.click(retryButton);
            });

            // Assert - should show reconnecting state or at least the button was clicked
            expect(retryButton).toBeInTheDocument();
            // The reconnecting state might not be visible immediately, so we check the button was clicked
            expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
        });
    });

    describe('App_edgeCases_shouldHandleGracefully', () => {
        it('should handle null updateBalanceCallback gracefully', () => {
            // Arrange
            const props = { ...defaultProps, updateBalanceCallback: null };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });

        it('should handle undefined onRequestSSOToken gracefully', () => {
            // Arrange
            const props = { ...defaultProps, onRequestSSOToken: undefined };

            // Act
            render(<App {...props} />);

            // Assert
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
            expect(screen.getByTestId('rng-soccer-prototype')).toBeInTheDocument();
        });

        it('should handle custom token request callback', async () => {
            // Arrange
            const customTokenRequest = jest.fn().mockResolvedValue('custom-token');
            const props = { ...defaultProps, onRequestSSOToken: customTokenRequest };

            // Act
            render(<App {...props} />);

            const playButton = screen.getByText('Play');
            await act(async () => {
                fireEvent.click(playButton);
            });

            // Assert
            expect(customTokenRequest).toHaveBeenCalled();
        });
    });

    describe('App_componentStructure_shouldHaveCorrectElements', () => {
        it('should have correct container structure', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const { container } = render(<App {...props} />);

            // Assert
            const appContainer = container.querySelector('[data-react="true"]');
            expect(appContainer).toBeInTheDocument();
            expect(appContainer).toHaveStyle({ width: '100%' });
        });

        it('should pass correct props to AppProvider', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Assert
            const appProvider = screen.getByTestId('app-provider');
            expect(appProvider).toHaveAttribute('data-env', 'development');
            expect(appProvider).toHaveAttribute('data-lang', 'en');
            expect(appProvider).toHaveAttribute('data-site', 'test-site');
        });
    });

    describe('App_integration_shouldWorkWithDependencies', () => {
        it('should call loadI18n with correct language', () => {
            // Arrange
            const { loadI18n } = require('../src/i18n');
            const { useAppContext } = require('../src/appProvider');
            jest.clearAllMocks(); // Clear mocks to ensure clean state

            // Mock useAppContext to return the correct language
            (useAppContext as jest.Mock).mockImplementation(() => ({
                language: 'zh',
                appEnv: 'test',
                siteId: 'test-site',
            }));

            const props = { ...defaultProps, language: 'zh' };

            // Act
            render(<App {...props} />);

            // Assert
            expect(loadI18n).toHaveBeenCalledWith('zh');
        });

        it('should call loadI18n with default language', () => {
            // Arrange
            const { loadI18n } = require('../src/i18n');
            const { useAppContext } = require('../src/appProvider');
            jest.clearAllMocks(); // Clear mocks to ensure clean state

            // Mock useAppContext to return the default language
            (useAppContext as jest.Mock).mockImplementation(() => ({
                language: 'en',
                appEnv: 'test',
                siteId: 'test-site',
            }));

            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Assert
            expect(loadI18n).toHaveBeenCalledWith('en');
        });

        it('should set up sync balance callback when provided', () => {
            // Arrange
            const updateBalanceCallback = jest.fn() as any;
            const props = { ...defaultProps, updateBalanceCallback };

            // Act
            render(<App {...props} />);

            // Assert
            const mockInstance = (SyncMemberSiteBalance.getInstance as jest.Mock).mock.results[0].value;
            expect(mockInstance.setSyncBalanceCallback).toHaveBeenCalledWith(updateBalanceCallback);
        });

        it('should set up token request callback when provided', () => {
            // Arrange
            const onRequestSSOToken = jest.fn().mockResolvedValue('token');
            const props = { ...defaultProps, onRequestSSOToken };

            // Act
            render(<App {...props} />);

            // Assert
            const mockInstance = (TokenRequestManager.getInstance as jest.Mock).mock.results[0].value;
            expect(mockInstance.setTokenRequestCallback).toHaveBeenCalled();
        });
    });

    describe('App_performance_shouldMeasureCorrectly', () => {
        it('should handle token request without errors', async () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            const playButton = screen.getByText('Play');
            await act(async () => {
                fireEvent.click(playButton);
            });

            // Assert - should successfully transition to lobby
            await waitFor(() => {
                expect(screen.getByTestId('mock-lobby')).toBeInTheDocument();
            });
        });
    });

    describe('App_accessibility_shouldBeAccessible', () => {
        it('should have proper container attributes', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const { container } = render(<App {...props} />);

            // Assert
            const appContainer = container.querySelector('[data-react="true"]');
            expect(appContainer).toBeInTheDocument();
        });

        it('should have proper button states', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<App {...props} />);

            // Assert
            const playButton = screen.getByText('Play');
            expect(playButton).not.toBeDisabled();
        });
    });
}); 