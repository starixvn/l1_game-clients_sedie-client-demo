import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useSentryHelper, SentryLogLevel } from '../../../sentry';

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
    const initializedRef = useRef(false);

    const { logInfo, logError } = useSentryHelper({
        componentName: 'GameBoard',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Log game board initialization - only once
    React.useEffect(() => {
        if (!initializedRef.current) {
            logInfo('GameBoard component initialized', {
                gameId,
                sessionId,
                timestamp: Date.now()
            });
            initializedRef.current = true;
        }
    }, [gameId, sessionId]); // Remove logInfo from dependencies

    // Handle end game action
    const handleEndGame = useCallback(async () => {
        setIsEnding(true);
        setEndGameMessage('Ending game and sending logs...');

        try {
            logInfo('Game ending initiated by user', {
                gameId,
                sessionId,
                action: 'end_game_button_clicked'
            });

            setEndGameMessage('Game ended successfully!');

            logInfo('Game ended successfully', {
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

            logError('Failed to end game', {
                gameId,
                sessionId,
                error: errorMessage,
                action: 'end_game_failed'
            });
        } finally {
            setIsEnding(false);
        }
    }, [logInfo, logError, gameId, sessionId, onGameEnd]);



    // Handle clear logs
    const handleClearLogs = useCallback(() => {
        logInfo('Clearing logs manually', {
            gameId,
            sessionId,
            action: 'clear_logs_button_clicked'
        });

        // Clear logs logic would go here
        // For now, just log the action
        logInfo('Logs cleared successfully', {
            gameId,
            sessionId,
            action: 'logs_cleared'
        });
    }, [logInfo, gameId, sessionId]);

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


        </div>
    );
}; 