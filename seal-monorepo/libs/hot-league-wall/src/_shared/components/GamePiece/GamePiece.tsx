import React, { useState, useCallback, useEffect } from 'react';
import { useGameSentryLogger } from '../../react-contexts/log-context/sentry-log-context';

interface GamePieceProps {
    pieceId: string;
    pieceType: 'player' | 'enemy' | 'item' | 'obstacle';
    position: { x: number; y: number };
    onMove?: (newPosition: { x: number; y: number }) => void;
    onInteraction?: (pieceId: string, action: string) => void;
}

export const GamePiece: React.FC<GamePieceProps> = ({
    pieceId,
    pieceType,
    position,
    onMove,
    onInteraction
}) => {
    const [isSelected, setIsSelected] = useState(false);
    const [health, setHealth] = useState(pieceType === 'player' ? 100 : 50);
    const [isMoving, setIsMoving] = useState(false);

    const logger = useGameSentryLogger(`GamePiece_${pieceId}`);

    // Log component initialization
    useEffect(() => {
        logger.logInfo('GamePiece component initialized', {
            pieceId,
            pieceType,
            position,
            health,
            timestamp: Date.now()
        });
    }, [pieceId, pieceType, position, health, logger]);

    // Handle piece selection
    const handleSelect = useCallback(() => {
        setIsSelected(true);
        logger.logInfo('GamePiece selected', {
            pieceId,
            pieceType,
            position,
            action: 'piece_selected'
        });
    }, [pieceId, pieceType, position, logger]);

    // Handle piece deselection
    const handleDeselect = useCallback(() => {
        setIsSelected(false);
        logger.logInfo('GamePiece deselected', {
            pieceId,
            pieceType,
            position,
            action: 'piece_deselected'
        });
    }, [pieceId, pieceType, position, logger]);

    // Handle piece movement
    const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (isMoving) return;

        setIsMoving(true);
        const newPosition = { ...position };

        switch (direction) {
            case 'up':
                newPosition.y -= 1;
                break;
            case 'down':
                newPosition.y += 1;
                break;
            case 'left':
                newPosition.x -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
        }

        logger.logInfo('GamePiece movement initiated', {
            pieceId,
            pieceType,
            oldPosition: position,
            newPosition,
            direction,
            action: 'piece_movement_started'
        });

        // Simulate movement delay
        setTimeout(() => {
            if (onMove) {
                onMove(newPosition);
            }

            logger.logInfo('GamePiece movement completed', {
                pieceId,
                pieceType,
                position: newPosition,
                direction,
                action: 'piece_movement_completed'
            });

            setIsMoving(false);
        }, 300);
    }, [pieceId, pieceType, position, isMoving, onMove, logger]);

    // Handle piece interaction
    const handleInteraction = useCallback((action: string) => {
        logger.logInfo('GamePiece interaction initiated', {
            pieceId,
            pieceType,
            position,
            action,
            health,
            action_type: 'piece_interaction_started'
        });

        if (onInteraction) {
            onInteraction(pieceId, action);
        }

        // Simulate health change for certain actions
        if (action === 'attack' && pieceType === 'enemy') {
            const newHealth = Math.max(0, health - 10);
            setHealth(newHealth);

            logger.logInfo('GamePiece health changed', {
                pieceId,
                pieceType,
                position,
                action,
                oldHealth: health,
                newHealth,
                damage: 10,
                action_type: 'health_changed'
            });

            if (newHealth <= 0) {
                logger.logWarn('GamePiece destroyed', {
                    pieceId,
                    pieceType,
                    position,
                    action,
                    action_type: 'piece_destroyed'
                });
            }
        }

        logger.logInfo('GamePiece interaction completed', {
            pieceId,
            pieceType,
            position,
            action,
            health,
            action_type: 'piece_interaction_completed'
        });
    }, [pieceId, pieceType, position, health, onInteraction, logger]);

    // Handle health regeneration (for player pieces)
    useEffect(() => {
        if (pieceType === 'player' && health < 100) {
            const interval = setInterval(() => {
                setHealth(prevHealth => {
                    const newHealth = Math.min(100, prevHealth + 1);
                    if (newHealth !== prevHealth) {
                        logger.logDebug('Player health regenerated', {
                            pieceId,
                            pieceType,
                            position,
                            oldHealth: prevHealth,
                            newHealth,
                            action_type: 'health_regeneration'
                        });
                    }
                    return newHealth;
                });
            }, 5000); // Regenerate 1 health every 5 seconds

            return () => clearInterval(interval);
        }
    }, [pieceType, health, pieceId, position, logger]);

    // Get piece color based on type and state
    const getPieceColor = () => {
        if (isSelected) return '#ffeb3b'; // Yellow when selected
        if (isMoving) return '#9c27b0'; // Purple when moving

        switch (pieceType) {
            case 'player':
                return health > 50 ? '#4caf50' : '#ff9800'; // Green/Orange based on health
            case 'enemy':
                return health > 25 ? '#f44336' : '#9e9e9e'; // Red/Gray based on health
            case 'item':
                return '#2196f3'; // Blue
            case 'obstacle':
                return '#795548'; // Brown
            default:
                return '#000000';
        }
    };

    // Get piece symbol
    const getPieceSymbol = () => {
        switch (pieceType) {
            case 'player':
                return '👤';
            case 'enemy':
                return '👹';
            case 'item':
                return '💎';
            case 'obstacle':
                return '🪨';
            default:
                return '❓';
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x * 60}px`,
                top: `${position.y * 60}px`,
                width: '50px',
                height: '50px',
                backgroundColor: getPieceColor(),
                border: isSelected ? '3px solid #000' : '2px solid #333',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: health <= 0 ? 0.3 : 1,
                transform: isMoving ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={isSelected ? handleDeselect : handleSelect}
            title={`${pieceType} (${pieceId}) - Health: ${health}`}
        >
            {getPieceSymbol()}

            {/* Health bar */}
            {pieceType === 'player' || pieceType === 'enemy' ? (
                <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '0',
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#ddd',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${health}%`,
                        height: '100%',
                        backgroundColor: health > 50 ? '#4caf50' : health > 25 ? '#ff9800' : '#f44336',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            ) : null}
        </div>
    );
};

// Control panel for the game piece
export const GamePieceControls: React.FC<{ pieceId: string; onMove: (direction: 'up' | 'down' | 'left' | 'right') => void; onInteraction: (action: string) => void }> = ({
    pieceId,
    onMove,
    onInteraction
}) => {
    const logger = useGameSentryLogger(`GamePieceControls_${pieceId}`);

    const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        logger.logInfo('Move command issued', {
            pieceId,
            direction,
            action: 'move_command'
        });
        onMove(direction);
    }, [pieceId, onMove, logger]);

    const handleInteraction = useCallback((action: string) => {
        logger.logInfo('Interaction command issued', {
            pieceId,
            action,
            action_type: 'interaction_command'
        });
        onInteraction(action);
    }, [pieceId, onInteraction, logger]);

    return (
        <div style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            margin: '10px 0'
        }}>
            <h4>Controls for {pieceId}</h4>

            <div style={{ marginBottom: '10px' }}>
                <strong>Movement:</strong>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button onClick={() => handleMove('up')} style={{ padding: '5px 10px' }}>↑</button>
                    <button onClick={() => handleMove('down')} style={{ padding: '5px 10px' }}>↓</button>
                    <button onClick={() => handleMove('left')} style={{ padding: '5px 10px' }}>←</button>
                    <button onClick={() => handleMove('right')} style={{ padding: '5px 10px' }}>→</button>
                </div>
            </div>

            <div>
                <strong>Actions:</strong>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button onClick={() => handleInteraction('attack')} style={{ padding: '5px 10px' }}>Attack</button>
                    <button onClick={() => handleInteraction('heal')} style={{ padding: '5px 10px' }}>Heal</button>
                    <button onClick={() => handleInteraction('collect')} style={{ padding: '5px 10px' }}>Collect</button>
                </div>
            </div>
        </div>
    );
}; 