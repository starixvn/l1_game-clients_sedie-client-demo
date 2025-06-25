import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Preview from '../../../../../src/preview';
import App from '../../../../../src/app';
import RNGSoccerStaticPrototype from '../../../../../src/games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';
import RNGSoccerBase from '../../../../../src/games/saba-club/rng-soccer/prototype/rng-soccer-base';
import { requestSSO } from '../../../../../src/_shared/utils/sso-helper';

// Mock the SSO helper
jest.mock('../../../../../src/_shared/utils/sso-helper');
const mockedRequestSSO = requestSSO as jest.MockedFunction<typeof requestSSO>;

// Mock the preview context
jest.mock('../../../../../src/previewProvider', () => ({
    PreviewProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    usePreviewContext: () => ({
        theme: 'light',
        isDarkMode: false,
        language: 'en'
    })
}));

// Mock the app provider
jest.mock('../../../../../src/appProvider', () => ({
    AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAppContext: () => ({
        language: 'en'
    }),
    AppContextConsumer: ({ children }: { children: any }) => children({ language: 'en' }),
}));

// Mock Sentry
jest.mock('../../../../../src/saba-games-index', () => ({
    useSentryInit: jest.fn()
}));

describe('Token Callback Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock successful SSO response
        mockedRequestSSO.mockResolvedValue({ token: 'test-token-123' });
    });

    describe('Preview Component', () => {
        it('should create handlePlayButtonTokenRequest callback function', async () => {
            const { container } = render(<Preview />);

            // Wait for the game content to appear first
            await waitFor(() => {
                expect(screen.getByText('RNGSoccer')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Wait for Play button to appear
            await waitFor(() => {
                expect(screen.getByText('Play Now')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Simulate Play button click
            fireEvent.click(screen.getByText('Play Now'));
            await waitFor(() => {
                expect(mockedRequestSSO).toHaveBeenCalled();
            });

            // The component should render after token is obtained
            expect(container).toBeInTheDocument();
        });

        it('should handle SSO request failure gracefully', async () => {
            mockedRequestSSO.mockRejectedValue(new Error('SSO failed'));

            const { container } = render(<Preview />);

            // Wait for the game content to appear first
            await waitFor(() => {
                expect(screen.getByText('RNGSoccer')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Wait for Play button to appear
            await waitFor(() => {
                expect(screen.getByText('Play Now')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Simulate Play button click
            fireEvent.click(screen.getByText('Play Now'));
            await waitFor(() => {
                expect(mockedRequestSSO).toHaveBeenCalled();
            });

            // The Play button should still be visible after failure
            expect(screen.getByText('Play Now')).toBeInTheDocument();
        });
    });

    describe('App Component', () => {
        const mockOnPlayButtonTokenRequest = jest.fn();

        beforeEach(() => {
            mockOnPlayButtonTokenRequest.mockResolvedValue('new-token-456');
        });

        it('should pass onPlayButtonTokenRequest to AppContent', () => {
            render(
                <App
                    appEnv="test"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={mockOnPlayButtonTokenRequest}
                />
            );

            // AppContent should receive the callback
            expect(mockOnPlayButtonTokenRequest).not.toHaveBeenCalled(); // Not called yet
        });

        it('should update token when onPlayButtonTokenRequest is called', async () => {
            const { rerender } = render(
                <App
                    appEnv="test"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={mockOnPlayButtonTokenRequest}
                />
            );

            // Initially shows prototype
            expect(screen.getByText('Play Now')).toBeInTheDocument();

            // Simulate play button click
            fireEvent.click(screen.getByText('Play Now'));

            await waitFor(() => {
                expect(mockOnPlayButtonTokenRequest).toHaveBeenCalledTimes(1);
            });

            // Should transition to main app after token update
            await waitFor(() => {
                expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
            });
        });

        it('should handle token request failure gracefully', async () => {
            mockOnPlayButtonTokenRequest.mockRejectedValue(new Error('Token request failed'));

            render(
                <App
                    appEnv="test"
                    language="en"
                    siteId="test-site"
                    onPlayButtonTokenRequest={mockOnPlayButtonTokenRequest}
                />
            );

            // Click play button
            fireEvent.click(screen.getByText('Play Now'));

            await waitFor(() => {
                expect(mockOnPlayButtonTokenRequest).toHaveBeenCalledTimes(1);
            });

            // Should still transition to main app even if token request fails
            await waitFor(() => {
                expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
            });
        });
    });

    describe('RNGSoccerStaticPrototype Component', () => {
        const mockOnPlayButtonClick = jest.fn();

        beforeEach(() => {
            mockOnPlayButtonClick.mockResolvedValue(undefined);
        });

        it('should call onPlayButtonClick when Play button is clicked', async () => {
            render(
                <RNGSoccerStaticPrototype onPlayButtonClick={mockOnPlayButtonClick} />
            );

            // Find and click the play button
            const playButton = screen.getByText('Play Now');
            fireEvent.click(playButton);

            await waitFor(() => {
                expect(mockOnPlayButtonClick).toHaveBeenCalledTimes(1);
            });
        });

        it('should handle async onPlayButtonClick errors gracefully', async () => {
            mockOnPlayButtonClick.mockRejectedValue(new Error('Play button error'));

            render(
                <RNGSoccerStaticPrototype onPlayButtonClick={mockOnPlayButtonClick} />
            );

            // Click play button
            const playButton = screen.getByText('Play Now');
            fireEvent.click(playButton);

            await waitFor(() => {
                expect(mockOnPlayButtonClick).toHaveBeenCalledTimes(1);
            });

            // Should re-show play button on error
            await waitFor(() => {
                expect(screen.getByText('Play Now')).toBeInTheDocument();
            });
        });

        it('should hide play button after successful click', async () => {
            render(
                <RNGSoccerStaticPrototype onPlayButtonClick={mockOnPlayButtonClick} />
            );

            // Initially visible
            expect(screen.getByText('Play Now')).toBeInTheDocument();

            // Click play button
            fireEvent.click(screen.getByText('Play Now'));

            await waitFor(() => {
                expect(mockOnPlayButtonClick).toHaveBeenCalledTimes(1);
            });

            // Should be hidden after successful click
            await waitFor(() => {
                expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
            });
        });
    });

    describe('RNGSoccerBase Component', () => {
        const mockGameData = {
            gameSettings: { gameName: 'RNG Soccer' },
            currentRound: {
                roundId: 1,
                roundState: 'placingBets',
                countdownTimer: 15
            },
            teamData: {
                home: { name: 'Home Team', rank: 1, suit: 1, score: 0 },
                away: { name: 'Away Team', rank: 2, suit: 2, score: 0 }
            },
            currentResult: {
                homeScore: 0,
                awayScore: 0,
                home: { rank: 1, suit: 1 },
                away: { rank: 2, suit: 2 }
            },
            roundOdds: {
                odds: { home: 1.5, away: 2.0, draw: 3.0 }
            }
        };

        const mockOnPlayClick = jest.fn();

        beforeEach(() => {
            mockOnPlayClick.mockResolvedValue(undefined);
        });

        it('should call onPlayClick when Play button is clicked', async () => {
            render(
                <RNGSoccerBase
                    gameData={mockGameData}
                    showPlayOverlay={true}
                    onPlayClick={mockOnPlayClick}
                />
            );

            // Click play button
            const playButton = screen.getByText('Play Now');
            fireEvent.click(playButton);

            await waitFor(() => {
                expect(mockOnPlayClick).toHaveBeenCalledTimes(1);
            });
        });

        it('should handle async onPlayClick errors gracefully', async () => {
            mockOnPlayClick.mockRejectedValue(new Error('Play click error'));

            render(
                <RNGSoccerBase
                    gameData={mockGameData}
                    showPlayOverlay={true}
                    onPlayClick={mockOnPlayClick}
                />
            );

            // Click play button
            const playButton = screen.getByText('Play Now');
            fireEvent.click(playButton);

            await waitFor(() => {
                expect(mockOnPlayClick).toHaveBeenCalledTimes(1);
            });

            // Should handle error gracefully
            expect(screen.getByText('Play Now')).toBeInTheDocument();
        });
    });

    describe('Full Integration Flow', () => {
        it('should complete full token callback flow from Play button to App', async () => {
            const mockOnPlayButtonTokenRequest = jest.fn().mockResolvedValue('integration-token-789');

            render(
                <BrowserRouter>
                    <App
                        appEnv="test"
                        language="en"
                        siteId="test-site"
                        onPlayButtonTokenRequest={mockOnPlayButtonTokenRequest}
                    />
                </BrowserRouter>
            );

            // Initially shows prototype
            expect(screen.getByText('Play Now')).toBeInTheDocument();

            // Click play button
            fireEvent.click(screen.getByText('Play Now'));

            // Should call token request
            await waitFor(() => {
                expect(mockOnPlayButtonTokenRequest).toHaveBeenCalledTimes(1);
            });

            // Should transition to main app
            await waitFor(() => {
                expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
            });
        });

        it('should handle token request failure in full flow', async () => {
            const mockOnPlayButtonTokenRequest = jest.fn().mockRejectedValue(new Error('Integration error'));

            render(
                <BrowserRouter>
                    <App
                        appEnv="test"
                        language="en"
                        siteId="test-site"
                        onPlayButtonTokenRequest={mockOnPlayButtonTokenRequest}
                    />
                </BrowserRouter>
            );

            // Click play button
            fireEvent.click(screen.getByText('Play Now'));

            // Should call token request
            await waitFor(() => {
                expect(mockOnPlayButtonTokenRequest).toHaveBeenCalledTimes(1);
            });

            // Should still transition to main app even on error
            await waitFor(() => {
                expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
            });
        });
    });
}); 