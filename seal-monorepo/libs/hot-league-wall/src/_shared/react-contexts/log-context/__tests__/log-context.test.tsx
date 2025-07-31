import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LogProvider, useLog, useGameLogger } from '../log-context';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test component that uses the log context
const TestComponent: React.FC<{ componentName?: string }> = ({ componentName }) => {
    const logContext = useLog();
    const gameLogger = useGameLogger(componentName);

    return (
        <div>
            <div data-testid="log-count">{logContext.logs.length}</div>
            <div data-testid="session-id">{logContext.sessionId}</div>
            <div data-testid="game-id">{logContext.gameId || 'no-game-id'}</div>
            <div data-testid="is-enabled">{logContext.isEnabled.toString()}</div>

            <button
                data-testid="add-log"
                onClick={() => logContext.addLog('Test log message')}
            >
                Add Log
            </button>

            <button
                data-testid="add-game-log"
                onClick={() => gameLogger.logInfo('Game log message')}
            >
                Add Game Log
            </button>

            <button
                data-testid="get-merged-logs"
                onClick={() => {
                    const merged = logContext.getMergedLogs();
                    (window as any).mergedLogs = merged;
                }}
            >
                Get Merged Logs
            </button>

            <button
                data-testid="clear-logs"
                onClick={() => logContext.clearLogs()}
            >
                Clear Logs
            </button>

            <button
                data-testid="send-logs"
                onClick={() => logContext.sendLogsToBackend()}
            >
                Send Logs
            </button>

            <button
                data-testid="set-session-id"
                onClick={() => logContext.setSessionId('new-session-id')}
            >
                Set Session ID
            </button>

            <button
                data-testid="set-game-id"
                onClick={() => logContext.setGameId('new-game-id')}
            >
                Set Game ID
            </button>

            <button
                data-testid="set-enabled"
                onClick={() => logContext.setEnabled(false)}
            >
                Disable Logging
            </button>
        </div>
    );
};

describe('LogContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (window as any).mergedLogs = undefined;
    });

    describe('LogProvider - Happy Path Tests', () => {
        it('should initialize with default values', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act & Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('0');
            expect(screen.getByTestId('session-id')).toHaveTextContent(/^session_\d+_/);
            expect(screen.getByTestId('game-id')).toHaveTextContent('no-game-id');
            expect(screen.getByTestId('is-enabled')).toHaveTextContent('true');
        });

        it('should initialize with custom values', () => {
            // Arrange
            render(
                <LogProvider
                    sessionId="custom-session"
                    gameId="custom-game"
                    enabled={false}
                >
                    <TestComponent />
                </LogProvider>
            );

            // Act & Assert
            expect(screen.getByTestId('session-id')).toHaveTextContent('custom-session');
            expect(screen.getByTestId('game-id')).toHaveTextContent('custom-game');
            expect(screen.getByTestId('is-enabled')).toHaveTextContent('false');
        });

        it('should add logs when enabled', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));

            // Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('1');
        });

        it('should not add logs when disabled', () => {
            // Arrange
            render(
                <LogProvider enabled={false}>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));

            // Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('0');
        });

        it('should clear logs', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            expect(screen.getByTestId('log-count')).toHaveTextContent('1');

            fireEvent.click(screen.getByTestId('clear-logs'));

            // Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('0');
        });

        it('should get merged logs correctly', () => {
            // Arrange
            render(
                <LogProvider sessionId="test-session" gameId="test-game">
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            fireEvent.click(screen.getByTestId('get-merged-logs'));

            // Assert
            expect((window as any).mergedLogs).toContain('test-session');
            expect((window as any).mergedLogs).toContain('test-game');
            expect((window as any).mergedLogs).toContain('Test log message');
        });

        it('should update session ID', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('set-session-id'));

            // Assert
            expect(screen.getByTestId('session-id')).toHaveTextContent('new-session-id');
        });

        it('should update game ID', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('set-game-id'));

            // Assert
            expect(screen.getByTestId('game-id')).toHaveTextContent('new-game-id');
        });

        it('should update enabled state', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('set-enabled'));

            // Assert
            expect(screen.getByTestId('is-enabled')).toHaveTextContent('false');
        });
    });

    describe('useGameLogger - Happy Path Tests', () => {
        it('should add game logs with component name', () => {
            // Arrange
            render(
                <LogProvider sessionId="test-session" gameId="test-game">
                    <TestComponent componentName="TestComponent" />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-game-log'));
            fireEvent.click(screen.getByTestId('get-merged-logs'));

            // Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('1');
            expect((window as any).mergedLogs).toContain('TestComponent');
            expect((window as any).mergedLogs).toContain('Game log message');
        });

        it('should add logs with different levels', () => {
            // Arrange
            const TestComponentWithLevels: React.FC = () => {
                const logger = useGameLogger('TestComponent');

                return (
                    <div>
                        <button
                            data-testid="log-info"
                            onClick={() => logger.logInfo('Info message')}
                        >
                            Log Info
                        </button>
                        <button
                            data-testid="log-warn"
                            onClick={() => logger.logWarn('Warning message')}
                        >
                            Log Warn
                        </button>
                        <button
                            data-testid="log-error"
                            onClick={() => logger.logError('Error message')}
                        >
                            Log Error
                        </button>
                        <button
                            data-testid="log-debug"
                            onClick={() => logger.logDebug('Debug message')}
                        >
                            Log Debug
                        </button>
                        <button
                            data-testid="get-logs"
                            onClick={() => {
                                const merged = logger.getMergedLogs();
                                (window as any).mergedLogs = merged;
                            }}
                        >
                            Get Logs
                        </button>
                    </div>
                );
            };

            render(
                <LogProvider>
                    <TestComponentWithLevels />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('log-info'));
            fireEvent.click(screen.getByTestId('log-warn'));
            fireEvent.click(screen.getByTestId('log-error'));
            fireEvent.click(screen.getByTestId('log-debug'));
            fireEvent.click(screen.getByTestId('get-logs'));

            // Assert
            expect((window as any).mergedLogs).toContain('[INFO]');
            expect((window as any).mergedLogs).toContain('[WARN]');
            expect((window as any).mergedLogs).toContain('[ERROR]');
            expect((window as any).mergedLogs).toContain('[DEBUG]');
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle empty log messages', () => {
            // Arrange
            const TestEmptyLog: React.FC = () => {
                const logContext = useLog();

                return (
                    <div>
                        <button
                            data-testid="add-empty-log"
                            onClick={() => logContext.addLog('')}
                        >
                            Add Empty Log
                        </button>
                        <button
                            data-testid="get-logs"
                            onClick={() => {
                                const merged = logContext.getMergedLogs();
                                (window as any).mergedLogs = merged;
                            }}
                        >
                            Get Logs
                        </button>
                    </div>
                );
            };

            render(
                <LogProvider>
                    <TestEmptyLog />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-empty-log'));
            fireEvent.click(screen.getByTestId('get-logs'));

            // Assert
            expect((window as any).mergedLogs).toContain(': ');
        });

        it('should handle very long log messages', () => {
            // Arrange
            const longMessage = 'A'.repeat(1000);
            const TestLongLog: React.FC = () => {
                const logContext = useLog();

                return (
                    <div>
                        <button
                            data-testid="add-long-log"
                            onClick={() => logContext.addLog(longMessage)}
                        >
                            Add Long Log
                        </button>
                        <button
                            data-testid="get-logs"
                            onClick={() => {
                                const merged = logContext.getMergedLogs();
                                (window as any).mergedLogs = merged;
                            }}
                        >
                            Get Logs
                        </button>
                    </div>
                );
            };

            render(
                <LogProvider>
                    <TestLongLog />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-long-log'));
            fireEvent.click(screen.getByTestId('get-logs'));

            // Assert
            expect((window as any).mergedLogs).toContain(longMessage);
        });

        it('should respect maxLogs limit', () => {
            // Arrange
            const TestMaxLogs: React.FC = () => {
                const logContext = useLog();

                return (
                    <div>
                        <button
                            data-testid="add-many-logs"
                            onClick={() => {
                                for (let i = 0; i < 15; i++) {
                                    logContext.addLog(`Log ${i}`);
                                }
                            }}
                        >
                            Add Many Logs
                        </button>
                        <div data-testid="log-count">{logContext.logs.length}</div>
                    </div>
                );
            };

            render(
                <LogProvider maxLogs={10}>
                    <TestMaxLogs />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-many-logs'));

            // Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('10');
        });

        it('should handle getMergedLogs with no logs', () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('get-merged-logs'));

            // Assert
            expect((window as any).mergedLogs).toBe('');
        });
    });

    describe('Error Handling', () => {
        it('should throw error when useLog is used outside provider', () => {
            // Arrange & Act & Assert
            expect(() => {
                render(<TestComponent />);
            }).toThrow('useLog must be used within a LogProvider');
        });

        it('should handle fetch errors gracefully', async () => {
            // Arrange
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            fireEvent.click(screen.getByTestId('send-logs'));

            // Assert
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/send-logs', expect.any(Object));
            });
        });

        it('should handle non-OK response from fetch', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            fireEvent.click(screen.getByTestId('send-logs'));

            // Assert
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalled();
            });
        });

        it('should not send logs when no logs exist', async () => {
            // Arrange
            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('send-logs'));

            // Assert
            await waitFor(() => {
                expect(mockFetch).not.toHaveBeenCalled();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should send logs with correct payload structure', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200
            });

            render(
                <LogProvider sessionId="test-session" gameId="test-game">
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            fireEvent.click(screen.getByTestId('send-logs'));

            // Assert
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/send-logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: expect.stringContaining('test-session')
                });
            });

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody).toHaveProperty('sessionId', 'test-session');
            expect(callBody).toHaveProperty('gameId', 'test-game');
            expect(callBody).toHaveProperty('logs');
            expect(callBody).toHaveProperty('mergedLogs');
            expect(callBody).toHaveProperty('timestamp');
        });

        it('should clear logs after successful send', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200
            });

            render(
                <LogProvider>
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            expect(screen.getByTestId('log-count')).toHaveTextContent('1');

            fireEvent.click(screen.getByTestId('send-logs'));

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('log-count')).toHaveTextContent('0');
            });
        });

        it('should handle custom endpoint', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200
            });

            render(
                <LogProvider sendEndpoint="/custom/endpoint">
                    <TestComponent />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-log'));
            fireEvent.click(screen.getByTestId('send-logs'));

            // Assert
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/custom/endpoint', expect.any(Object));
            });
        });
    });

    describe('Performance and Memory Tests', () => {
        it('should handle rapid log additions', () => {
            // Arrange
            const TestRapidLogs: React.FC = () => {
                const logContext = useLog();

                return (
                    <div>
                        <button
                            data-testid="add-rapid-logs"
                            onClick={() => {
                                for (let i = 0; i < 100; i++) {
                                    logContext.addLog(`Rapid log ${i}`);
                                }
                            }}
                        >
                            Add Rapid Logs
                        </button>
                        <div data-testid="log-count">{logContext.logs.length}</div>
                    </div>
                );
            };

            render(
                <LogProvider maxLogs={1000}>
                    <TestRapidLogs />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-rapid-logs'));

            // Assert
            expect(screen.getByTestId('log-count')).toHaveTextContent('100');
        });

        it('should maintain log order', () => {
            // Arrange
            const TestLogOrder: React.FC = () => {
                const logContext = useLog();

                return (
                    <div>
                        <button
                            data-testid="add-ordered-logs"
                            onClick={() => {
                                logContext.addLog('First log');
                                logContext.addLog('Second log');
                                logContext.addLog('Third log');
                            }}
                        >
                            Add Ordered Logs
                        </button>
                        <button
                            data-testid="get-logs"
                            onClick={() => {
                                const merged = logContext.getMergedLogs();
                                (window as any).mergedLogs = merged;
                            }}
                        >
                            Get Logs
                        </button>
                    </div>
                );
            };

            render(
                <LogProvider>
                    <TestLogOrder />
                </LogProvider>
            );

            // Act
            fireEvent.click(screen.getByTestId('add-ordered-logs'));
            fireEvent.click(screen.getByTestId('get-logs'));

            // Assert
            const logs = (window as any).mergedLogs;
            const firstIndex = logs.indexOf('First log');
            const secondIndex = logs.indexOf('Second log');
            const thirdIndex = logs.indexOf('Third log');

            expect(firstIndex).toBeLessThan(secondIndex);
            expect(secondIndex).toBeLessThan(thirdIndex);
        });
    });
}); 