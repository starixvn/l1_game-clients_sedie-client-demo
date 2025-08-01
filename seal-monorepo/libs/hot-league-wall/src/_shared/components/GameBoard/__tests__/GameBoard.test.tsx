import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameBoard } from '../GameBoard';
import { SentryLogProvider } from 'sg-sentry-dev';

// Mock the Sentry logger to avoid actual logging during tests
const mockLogInfo = jest.fn();
const mockLogError = jest.fn();
const mockSendLogsToSentry = jest.fn();

jest.mock('../../../react-contexts/log-context/sentry-log-context', () => ({
    ...jest.requireActual('../../../react-contexts/log-context/sentry-log-context'),
    useGameSentryLogger: () => ({
        logInfo: mockLogInfo,
        logError: mockLogError,
    }),
    useSentryLog: () => ({
        sendLogsToSentry: mockSendLogsToSentry,
        logs: [
            {
                id: '1',
                timestamp: Date.now(),
                message: 'Test log 1',
                level: 'info'
            },
            {
                id: '2',
                timestamp: Date.now(),
                message: 'Test log 2',
                level: 'error'
            }
        ]
    }),
}));

describe('GameBoard Component', () => {
    const defaultProps = {
        gameId: 'test-game-123',
        sessionId: 'test-session-456',
        onGameEnd: jest.fn(),
    };

    const renderWithProvider = (props = {}) => {
        return render(
            <SentryLogProvider>
                <GameBoard {...defaultProps} {...props} />
            </SentryLogProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should render without crashing', () => {
            renderWithProvider();
            expect(screen.getByText('Game Board')).toBeInTheDocument();
        });

        it('should log initialization on mount', () => {
            renderWithProvider();
            expect(mockLogInfo).toHaveBeenCalledWith('GameBoard component initialized', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                timestamp: expect.any(Number),
            });
        });

        it('should not cause infinite re-renders', () => {
            const { rerender } = renderWithProvider();

            // Re-render multiple times to ensure no infinite loop
            for (let i = 0; i < 5; i++) {
                rerender(
                    <SentryLogProvider>
                        <GameBoard {...defaultProps} />
                    </SentryLogProvider>
                );
            }

            // Should only log initialization once
            expect(mockLogInfo).toHaveBeenCalledTimes(1);
        });
    });

    describe('End Game Functionality', () => {
        it('should handle end game button click', async () => {
            const onGameEnd = jest.fn();
            renderWithProvider({ onGameEnd });

            const endGameButton = screen.getByText('End Game');
            fireEvent.click(endGameButton);

            expect(screen.getByText('Ending Game...')).toBeInTheDocument();
            expect(endGameButton).toBeDisabled();

            await waitFor(() => {
                expect(mockSendLogsToSentry).toHaveBeenCalled();
            });

            expect(mockLogInfo).toHaveBeenCalledWith('Game ending initiated by user', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                action: 'end_game_button_clicked'
            });
        });

        it('should call onGameEnd callback when successful', async () => {
            const onGameEnd = jest.fn();
            mockSendLogsToSentry.mockResolvedValue(undefined);

            renderWithProvider({ onGameEnd });

            const endGameButton = screen.getByText('End Game');
            fireEvent.click(endGameButton);

            await waitFor(() => {
                expect(onGameEnd).toHaveBeenCalled();
            });

            expect(screen.getByText('Game ended successfully! Logs sent to Sentry.')).toBeInTheDocument();
        });

        it('should handle end game errors gracefully', async () => {
            const onGameEnd = jest.fn();
            mockSendLogsToSentry.mockRejectedValue(new Error('Network error'));

            renderWithProvider({ onGameEnd });

            const endGameButton = screen.getByText('End Game');
            fireEvent.click(endGameButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to end game: Network error')).toBeInTheDocument();
            });

            expect(mockLogError).toHaveBeenCalledWith('Failed to end game', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                error: 'Network error',
                action: 'end_game_failed'
            });

            expect(onGameEnd).not.toHaveBeenCalled();
        });
    });

    describe('Send Logs Functionality', () => {
        it('should handle send logs button click', async () => {
            mockSendLogsToSentry.mockResolvedValue(undefined);
            renderWithProvider();

            const sendLogsButton = screen.getByText('Send to Sentry');
            fireEvent.click(sendLogsButton);

            await waitFor(() => {
                expect(mockSendLogsToSentry).toHaveBeenCalled();
            });

            expect(mockLogInfo).toHaveBeenCalledWith('Manual log sending initiated', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                action: 'manual_log_send'
            });

            expect(mockLogInfo).toHaveBeenCalledWith('Manual log sending completed', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                action: 'manual_log_send_success'
            });
        });

        it('should handle send logs errors', async () => {
            mockSendLogsToSentry.mockRejectedValue(new Error('Sentry error'));
            renderWithProvider();

            const sendLogsButton = screen.getByText('Send to Sentry');
            fireEvent.click(sendLogsButton);

            await waitFor(() => {
                expect(mockLogError).toHaveBeenCalledWith('Manual log sending failed', {
                    gameId: 'test-game-123',
                    sessionId: 'test-session-456',
                    error: 'Sentry error',
                    action: 'manual_log_send_failed'
                });
            });
        });
    });

    describe('Clear Logs Functionality', () => {
        it('should handle clear logs button click', () => {
            renderWithProvider();

            const clearLogsButton = screen.getByText('Clear Logs');
            fireEvent.click(clearLogsButton);

            expect(mockLogInfo).toHaveBeenCalledWith('Clearing logs manually', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                action: 'clear_logs_button_clicked'
            });

            expect(mockLogInfo).toHaveBeenCalledWith('Logs cleared successfully', {
                gameId: 'test-game-123',
                sessionId: 'test-session-456',
                action: 'logs_cleared'
            });
        });
    });

    describe('Performance and Stability', () => {
        it('should not cause infinite re-renders with rapid button clicks', async () => {
            mockSendLogsToSentry.mockResolvedValue(undefined);
            renderWithProvider();

            const sendLogsButton = screen.getByText('Send to Sentry');

            // Rapid clicks
            for (let i = 0; i < 5; i++) {
                fireEvent.click(sendLogsButton);
            }

            await waitFor(() => {
                expect(mockSendLogsToSentry).toHaveBeenCalledTimes(5);
            });
        });

        it('should maintain stable component state during re-renders', () => {
            const { rerender } = renderWithProvider();

            // Multiple re-renders
            for (let i = 0; i < 10; i++) {
                rerender(
                    <SentryLogProvider>
                        <GameBoard {...defaultProps} />
                    </SentryLogProvider>
                );
            }

            // Component should still be functional
            expect(screen.getByText('End Game')).toBeInTheDocument();
            expect(screen.getByText('Send to Sentry')).toBeInTheDocument();
            expect(screen.getByText('Clear Logs')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing onGameEnd callback', async () => {
            mockSendLogsToSentry.mockResolvedValue(undefined);
            renderWithProvider({ onGameEnd: undefined });

            const endGameButton = screen.getByText('End Game');
            fireEvent.click(endGameButton);

            await waitFor(() => {
                expect(screen.getByText('Game ended successfully! Logs sent to Sentry.')).toBeInTheDocument();
            });
        });
    });
}); 