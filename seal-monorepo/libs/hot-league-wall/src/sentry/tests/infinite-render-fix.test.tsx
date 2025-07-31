import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameBoard } from '../../_shared/components/GameBoard/GameBoard';
import { SentryLogProvider, useSentryLog } from '../../_shared/react-contexts/log-context/sentry-log-context';
import { LoggingDemo } from '../components/LoggingDemo';

// Mock SentryManager
jest.mock('../core/sentry-manager', () => {
    const mockSentryManager = {
        getInstance: jest.fn(() => mockSentryManager),
        initialize: jest.fn(),
        logError: jest.fn(),
        logWarning: jest.fn(),
        logInfo: jest.fn(),
        logDebug: jest.fn(),
        logTrace: jest.fn(),
        logFatal: jest.fn(),
        isManagerInitialized: jest.fn(() => true)
    };
    return {
        sentryManager: mockSentryManager,
        configureSentryManager: jest.fn(),
        SentryManager: mockSentryManager
    };
});

// Mock useSessionReplay hook
jest.mock('../hooks/useSessionReplay', () => ({
    useSessionReplay: jest.fn(() => ({
        startReplay: jest.fn(),
        stopReplay: jest.fn(),
        addData: jest.fn(),
        trackInteraction: jest.fn(),
        trackLifecycle: jest.fn(),
        trackError: jest.fn(),
        trackPerformance: jest.fn(),
        isRecording: false,
        sessionId: 'test-session-id'
    }))
}));

describe('Infinite Render Loop Fix', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset console.error to catch React warnings
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GameBoard Component', () => {
        it('should not cause infinite re-renders when mounted', async () => {
            // Arrange
            const renderCount = jest.fn();
            const TestComponent = () => {
                renderCount();
                return (
                    <SentryLogProvider
                        sessionId="test-session"
                        gameId="test-game"
                        enabled={true}
                        sentryConfig={{
                            dsn: "https://test@sentry.io/project",
                            environment: "test",
                            componentName: "TestComponent",
                            debug: false
                        }}
                    >
                        <GameBoard
                            gameId="test-game"
                            sessionId="test-session"
                            onGameEnd={jest.fn()}
                        />
                    </SentryLogProvider>
                );
            };

            // Act
            render(<TestComponent />);

            // Wait for any async operations to complete
            await waitFor(() => {
                expect(screen.getByText('Game Board')).toBeInTheDocument();
            });

            // Assert - Component should render only once for initial mount
            expect(renderCount).toHaveBeenCalledTimes(1);

            // Wait a bit more to ensure no additional renders
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(renderCount).toHaveBeenCalledTimes(1);
        });

        it('should handle button clicks without causing infinite re-renders', async () => {
            // Arrange
            const renderCount = jest.fn();
            const TestComponent = () => {
                renderCount();
                return (
                    <SentryLogProvider
                        sessionId="test-session"
                        gameId="test-game"
                        enabled={true}
                        sentryConfig={{
                            dsn: "https://test@sentry.io/project",
                            environment: "test",
                            componentName: "TestComponent",
                            debug: false
                        }}
                    >
                        <GameBoard
                            gameId="test-game"
                            sessionId="test-session"
                            onGameEnd={jest.fn()}
                        />
                    </SentryLogProvider>
                );
            };

            // Act
            render(<TestComponent />);
            const initialRenderCount = renderCount.mock.calls.length;

            // Click the "Send to Sentry" button
            const sendButton = screen.getByText('Send to Sentry');
            fireEvent.click(sendButton);

            // Wait for any async operations
            await waitFor(() => {
                // Should not have caused excessive re-renders
                expect(renderCount.mock.calls.length).toBeLessThan(initialRenderCount + 5);
            });
        });
    });

    describe('LoggingDemo Component', () => {
        it('should not cause infinite re-renders when mounted', async () => {
            // Arrange
            const renderCount = jest.fn();
            const TestComponent = () => {
                renderCount();
                return <LoggingDemo />;
            };

            // Act
            render(<TestComponent />);

            // Wait for component to mount
            await waitFor(() => {
                expect(screen.getByText('Game Logging Demo')).toBeInTheDocument();
            });

            // Assert - Component should render only once for initial mount
            expect(renderCount).toHaveBeenCalledTimes(1);

            // Wait a bit more to ensure no additional renders
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(renderCount).toHaveBeenCalledTimes(1);
        });

        it('should handle game state changes without causing infinite re-renders', async () => {
            // Arrange
            const renderCount = jest.fn();
            const TestComponent = () => {
                renderCount();
                return <LoggingDemo />;
            };

            // Act
            render(<TestComponent />);
            const initialRenderCount = renderCount.mock.calls.length;

            // Click the "Play" button
            const playButton = screen.getByText('Play');
            fireEvent.click(playButton);

            // Wait for state change - use a more flexible matcher
            await waitFor(() => {
                const gameStateElement = screen.getByText((content, element) => {
                    return Boolean(element?.textContent?.includes('Game State:') &&
                        element?.textContent?.includes('playing'));
                });
                expect(gameStateElement).toBeInTheDocument();
            });

            // Assert - Should not have caused excessive re-renders
            expect(renderCount.mock.calls.length).toBeLessThan(initialRenderCount + 10);
        });
    });

    describe('SentryLogProvider', () => {
        it('should not cause infinite re-renders when context values change', async () => {
            // Arrange
            const renderCount = jest.fn();
            const TestComponent = () => {
                renderCount();
                const { logs, addLog } = useSentryLog();

                return (
                    <div>
                        <div data-testid="log-count">{logs.length}</div>
                        <button onClick={() => addLog('Test log')}>Add Log</button>
                    </div>
                );
            };

            const Wrapper = () => (
                <SentryLogProvider
                    sessionId="test-session"
                    gameId="test-game"
                    enabled={true}
                    sentryConfig={{
                        dsn: "https://test@sentry.io/project",
                        environment: "test",
                        componentName: "TestComponent",
                        debug: false
                    }}
                >
                    <TestComponent />
                </SentryLogProvider>
            );

            // Act
            render(<Wrapper />);
            const initialRenderCount = renderCount.mock.calls.length;

            // Add a log
            const addLogButton = screen.getByText('Add Log');
            fireEvent.click(addLogButton);

            // Wait for state update
            await waitFor(() => {
                expect(screen.getByTestId('log-count')).toHaveTextContent('1');
            });

            // Assert - Should not have caused excessive re-renders
            expect(renderCount.mock.calls.length).toBeLessThan(initialRenderCount + 5);
        });
    });

    describe('React Warnings', () => {
        it('should not show "Maximum update depth exceeded" warning', async () => {
            // Arrange
            const consoleErrorSpy = jest.spyOn(console, 'error');

            // Act
            render(<LoggingDemo />);

            // Wait for component to mount and stabilize
            await waitFor(() => {
                expect(screen.getByText('Game Logging Demo')).toBeInTheDocument();
            });

            // Wait a bit more to catch any delayed warnings
            await new Promise(resolve => setTimeout(resolve, 200));

            // Assert - Should not have logged the infinite render warning
            const errorCalls = consoleErrorSpy.mock.calls;
            const infiniteRenderWarnings = errorCalls.filter(call =>
                call[0]?.includes?.('Maximum update depth exceeded') ||
                call[0]?.includes?.('infinite render loop')
            );

            expect(infiniteRenderWarnings).toHaveLength(0);
        });
    });
}); 