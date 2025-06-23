import React from 'react';
import { RoundId, IRoundIdProps } from './index';

/**
 * Interface for GameRoundId props
 */
export interface IGameRoundIdProps extends Omit<IRoundIdProps, 'clientRoundId' | 'useGameStyling'> {
    roundNumber: number;
}

/**
 * GameRoundId - A wrapper around RoundId with game styling enabled
 * This component is maintained for backward compatibility
 */
export const GameRoundId: React.FC<IGameRoundIdProps> = ({ roundNumber, ...rest }) => (
    <RoundId
        clientRoundId={roundNumber}
        {...rest}
    />
); 