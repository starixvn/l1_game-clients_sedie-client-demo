import React, { useState, useCallback, useEffect } from 'react';
import { SentryLogProvider, useGameSentryLogger, useSentryLog } from '../../react-contexts/log-context/sentry-log-context';
import { GameBoard } from '../GameBoard';
import { GamePiece, GamePieceControls } from '../GamePiece';
import { SentryLogLevel } from '../../utils/sentry/sentry-types';

// Demo game component that uses the logging system
const DemoGame: React.FC = () => {
    const [gameState, setGameState] = useState<'playing' | 'paused' | 'ended'>('playing');
    const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
    const [pieces, setPieces] = useState([
        { id: 'player1', type: 'player' as const, position: { x: 1, y: 1 } },
        { id: 'enemy1', type: 'enemy' as const, position: { x: 3, y: 2 } },
        { id: 'item1', type: 'item' as const, position: { x: 2, y: 3 } },
        { id: 'obstacle1', type: 'obstacle' as const, position: { x: 4, y: 1 } },
    ]);

    const { logInfo, logWarn, logDebug } = useGameSentryLogger('DemoGame');

    // Session Replay functionality
    const {
        startSessionReplay,
        stopSessionReplay,
        trackInteraction,
        trackLifecycle,
        isRecording
    } = useSentryLog();

    // Log game initialization and start Session Replay
    useEffect(() => {
        logInfo('Demo game initialized', {
            gameState,
            piecesCount: pieces.length,
            timestamp: Date.now()
        });

        // Start Session Replay for the game session
        startSessionReplay('DemoGame Session', {
            gameState,
            piecesCount: pieces.length,
            sessionType: 'game_session'
        });

        // Track component lifecycle
        trackLifecycle('mount', {
            component: 'DemoGame',
            gameState,
            piecesCount: pieces.length
        });

        // Cleanup on unmount
        return () => {
            trackLifecycle('unmount', {
                component: 'DemoGame',
                finalGameState: gameState
            });
            stopSessionReplay();
        };
    }, [gameState, pieces.length, logInfo, startSessionReplay, stopSessionReplay, trackLifecycle]);

    // Handle piece movement
    const handlePieceMove = useCallback((pieceId: string, newPosition: { x: number; y: number }) => {
        logInfo('Piece movement request received', {
            pieceId,
            newPosition,
            action: 'piece_movement_request'
        });

        setPieces(prevPieces =>
            prevPieces.map(piece =>
                piece.id === pieceId
                    ? { ...piece, position: newPosition }
                    : piece
            )
        );

        logInfo('Piece movement completed', {
            pieceId,
            newPosition,
            action: 'piece_movement_completed'
        });
    }, [logInfo]);

    // Handle piece interaction
    const handlePieceInteraction = useCallback((pieceId: string, action: string) => {
        logInfo('Piece interaction request received', {
            pieceId,
            action,
            action_type: 'piece_interaction_request'
        });

        // Track interaction in Session Replay
        trackInteraction('piece_interaction', {
            pieceId,
            action,
            gameState,
            timestamp: Date.now()
        });

        // Simulate different interactions
        switch (action) {
            case 'attack':
                logInfo('Attack action executed', {
                    pieceId,
                    action,
                    gameState,
                    action_type: 'attack_executed'
                });
                break;
            case 'heal':
                logInfo('Heal action executed', {
                    pieceId,
                    action,
                    gameState,
                    action_type: 'heal_executed'
                });
                break;
            case 'collect':
                logInfo('Collect action executed', {
                    pieceId,
                    action,
                    gameState,
                    action_type: 'collect_executed'
                });
                break;
            default:
                logWarn('Unknown action executed', {
                    pieceId,
                    action,
                    gameState,
                    action_type: 'unknown_action'
                });
        }
    }, [logInfo, logWarn, trackInteraction, gameState]);

    // Handle game state changes
    const handleGameStateChange = useCallback((newState: 'playing' | 'paused' | 'ended') => {
        logInfo('Game state change requested', {
            oldState: gameState,
            newState,
            action: 'game_state_change_request'
        });

        // Track game state change in Session Replay
        trackInteraction('game_state_change', {
            oldState: gameState,
            newState,
            timestamp: Date.now()
        });

        setGameState(newState);

        logInfo('Game state changed', {
            oldState: gameState,
            newState,
            action: 'game_state_changed'
        });

        // Track lifecycle update
        trackLifecycle('update', {
            component: 'DemoGame',
            oldState: gameState,
            newState
        });
    }, [gameState, logInfo, trackInteraction, trackLifecycle]);

    // Handle game end
    const handleGameEnd = useCallback(() => {
        logInfo('Game end requested', {
            gameState,
            piecesCount: pieces.length,
            action: 'game_end_request'
        });

        // Track game end in Session Replay
        trackInteraction('game_end', {
            gameState,
            piecesCount: pieces.length,
            timestamp: Date.now()
        });

        handleGameStateChange('ended');
    }, [gameState, pieces.length, handleGameStateChange, logInfo, trackInteraction]);

    // Simulate game events
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                // Random game events
                const events = [
                    () => {
                        logDebug('Game tick', { timestamp: Date.now() });
                        trackInteraction('game_tick', { timestamp: Date.now() });
                    },
                    () => {
                        logInfo('Random game event occurred', { eventType: 'random' });
                        trackInteraction('random_game_event', { eventType: 'random' });
                    },
                    () => {
                        const fps = Math.random() * 30 + 20;
                        logWarn('Low performance detected', { fps });
                        trackInteraction('performance_warning', { fps });
                    },
                ];

                const randomEvent = events[Math.floor(Math.random() * events.length)];
                randomEvent();
            }, 10000); // Every 10 seconds

            return () => clearInterval(interval);
        }
    }, [gameState, logDebug, trackInteraction]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Game Logging Demo</h1>

            <div style={{ marginBottom: '20px' }}>
                <strong>Game State:</strong> {gameState}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={() => {
                            trackInteraction('ui_button_click', { button: 'play', currentState: gameState });
                            handleGameStateChange('playing');
                        }}
                        disabled={gameState === 'playing'}
                        style={{ padding: '5px 10px' }}
                    >
                        Play
                    </button>
                    <button
                        onClick={() => {
                            trackInteraction('ui_button_click', { button: 'pause', currentState: gameState });
                            handleGameStateChange('paused');
                        }}
                        disabled={gameState === 'paused'}
                        style={{ padding: '5px 10px' }}
                    >
                        Pause
                    </button>
                    <button
                        onClick={() => {
                            trackInteraction('ui_button_click', { button: 'end', currentState: gameState });
                            handleGameStateChange('ended');
                        }}
                        disabled={gameState === 'ended'}
                        style={{ padding: '5px 10px' }}
                    >
                        End
                    </button>
                </div>
            </div>

            {/* Game Board */}
            <GameBoard
                gameId="demo-game-123"
                sessionId="demo-session-456"
                onGameEnd={handleGameEnd}
            />

            {/* Game Area */}
            <div style={{
                position: 'relative',
                width: '300px',
                height: '300px',
                border: '2px solid #333',
                backgroundColor: '#f0f0f0',
                margin: '20px 0'
            }}>
                {pieces.map(piece => (
                    <GamePiece
                        key={piece.id}
                        pieceId={piece.id}
                        pieceType={piece.type}
                        position={piece.position}
                        onMove={(newPosition) => handlePieceMove(piece.id, newPosition)}
                        onInteraction={handlePieceInteraction}
                    />
                ))}
            </div>

            {/* Piece Controls */}
            {selectedPieceId && (
                <GamePieceControls
                    pieceId={selectedPieceId}
                    onMove={(direction) => {
                        const piece = pieces.find(p => p.id === selectedPieceId);
                        if (piece) {
                            const newPosition = { ...piece.position };
                            switch (direction) {
                                case 'up': newPosition.y = Math.max(0, newPosition.y - 1); break;
                                case 'down': newPosition.y = Math.min(4, newPosition.y + 1); break;
                                case 'left': newPosition.x = Math.max(0, newPosition.x - 1); break;
                                case 'right': newPosition.x = Math.min(4, newPosition.x + 1); break;
                            }
                            handlePieceMove(selectedPieceId, newPosition);
                        }
                    }}
                    onInteraction={(action) => handlePieceInteraction(selectedPieceId, action)}
                />
            )}

            {/* Piece Selection */}
            <div style={{ marginTop: '20px' }}>
                <h3>Select a Piece:</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {pieces.map(piece => (
                        <button
                            key={piece.id}
                            onClick={() => setSelectedPieceId(piece.id)}
                            style={{
                                padding: '10px',
                                backgroundColor: selectedPieceId === piece.id ? '#4caf50' : '#ddd',
                                color: selectedPieceId === piece.id ? 'white' : 'black',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {piece.type} ({piece.id})
                        </button>
                    ))}
                </div>
            </div>

            {/* Game Instructions */}
            <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                border: '1px solid #2196f3'
            }}>
                <h3>How to Use:</h3>
                <ul>
                    <li>Click on a piece to select it</li>
                    <li>Use the controls to move or interact with the selected piece</li>
                    <li>Watch the logs accumulate in the Game Board</li>
                    <li>Click "End Game" to send all logs to Sentry</li>
                    <li>Use "Send to Sentry" to manually send logs without ending the game</li>
                    <li>Use "Clear Logs" to clear the log buffer</li>
                    <li>Logs are collected locally and only sent to Sentry when requested</li>
                </ul>
            </div>
        </div>
    );
};

// Main demo component with SentryLogProvider
export const LoggingDemo: React.FC = () => {
    return (
        <SentryLogProvider
            sessionId="demo-session-123"
            gameId="demo-game-456"
            enabled={true}
            maxLogs={500}
            autoSendOnUnmount={false}
            sentryConfig={{
                dsn: "https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056",
                environment: "LOCAL1",
                componentName: "LoggingDemo",
                debug: false, // Disable debug to reduce noise
                logLevel: SentryLogLevel.INFO
            }}
        >
            <DemoGame />
        </SentryLogProvider>
    );
}; 