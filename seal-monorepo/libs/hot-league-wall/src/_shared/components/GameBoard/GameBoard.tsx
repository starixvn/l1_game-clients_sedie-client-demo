import React, { useState, useCallback } from 'react';
import { useGameLogger } from '../../react-contexts/log-context';

interface GameBoardProps {
    gameId: string;
    sessionId: string;
    onGameEnd?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
    gameId,
    sessionId,
    onGameEnd
}) => {
    const [isEnding, setIsEnding] = useState(false);
    const [endGameMessage, setEndGameMessage] = useState('');

    const logger = useGameLogger('GameBoard');

    // Log game board initialization
    React.useEffect(() => {
        logger.logInfo('GameBoard component initialized', {
            gameId,
            sessionId,
            timestamp: Date.now()
        });
    }, [gameId, sessionId, logger]);

    // Handle end game action
    const handleEndGame = useCallback(async () => {
        setIsEnding(true);
        setEndGameMessage('Ending game and sending logs...');

        try {
            logger.logInfo('Game ending initiated by user', {
                gameId,
                sessionId,
                action: 'end_game_button_clicked'
            });

            // Send logs to backend
            await logger.sendLogsToBackend();

            setEndGameMessage('Game ended successfully! Logs sent to backend.');

            logger.logInfo('Game ended successfully', {
                gameId,
                sessionId,
                action: 'game_ended_successfully'
            });

            // Call the onGameEnd callback if provided
            if (onGameEnd) {
                onGameEnd();
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setEndGameMessage(`Failed to end game: ${errorMessage}`);

            logger.logError('Failed to end game', {
                gameId,
                sessionId,
                error: errorMessage,
                action: 'end_game_failed'
            });
        } finally {
            setIsEnding(false);
        }
    }, [logger, gameId, sessionId, onGameEnd]);

    // Handle manual log sending
    const handleSendLogs = useCallback(async () => {
        try {
            logger.logInfo('Manual log sending initiated', {
                gameId,
                sessionId,
                action: 'manual_log_send'
            });

            await logger.sendLogsToBackend();

            logger.logInfo('Manual log sending completed', {
                gameId,
                sessionId,
                action: 'manual_log_send_success'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.logError('Manual log sending failed', {
                gameId,
                sessionId,
                error: errorMessage,
                action: 'manual_log_send_failed'
            });
        }
    }, [logger, gameId, sessionId]);

    // Handle clear logs
    const handleClearLogs = useCallback(() => {
        logger.logInfo('Clearing logs manually', {
            gameId,
            sessionId,
            action: 'clear_logs'
        });

        logger.clearLogs();

        logger.logInfo('Logs cleared successfully', {
            gameId,
            sessionId,
            action: 'logs_cleared'
        });
    }, [logger, gameId, sessionId]);

    return (
        <div className="game-board" style={{
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            margin: '10px'
        }}>
            <h2>Game Board</h2>
            <div style={{ marginBottom: '15px' }}>
                <strong>Game ID:</strong> {gameId}
            </div>
            <div style={{ marginBottom: '15px' }}>
                <strong>Session ID:</strong> {sessionId}
            </div>
            <div style={{ marginBottom: '15px' }}>
                <strong>Log Count:</strong> {logger.logs.length}
            </div>

            {endGameMessage && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #4caf50',
                    borderRadius: '4px',
                    color: '#2e7d32'
                }}>
                    {endGameMessage}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleEndGame}
                    disabled={isEnding}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isEnding ? 'not-allowed' : 'pointer',
                        opacity: isEnding ? 0.6 : 1
                    }}
                >
                    {isEnding ? 'Ending Game...' : 'End Game'}
                </button>

                <button
                    onClick={handleSendLogs}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Send Logs
                </button>

                <button
                    onClick={handleClearLogs}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Logs
                </button>
            </div>

            {/* Log Preview */}
            {logger.logs.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Recent Logs (Last 5)</h3>
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '10px',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                    }}>
                        {logger.logs.slice(-5).map((log) => (
                            <div key={log.id} style={{ marginBottom: '5px' }}>
                                <span style={{ color: '#666' }}>
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span style={{
                                    color: log.level === 'error' ? '#f44336' :
                                        log.level === 'warn' ? '#ff9800' :
                                            log.level === 'debug' ? '#9c27b0' : '#2196f3',
                                    marginLeft: '10px'
                                }}>
                                    [{log.level?.toUpperCase()}]
                                </span>
                                <span style={{ marginLeft: '10px' }}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 