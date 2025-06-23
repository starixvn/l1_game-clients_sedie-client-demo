import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import Styles from './round-id.module.scss';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

export interface IRoundIdProps {
    clientRoundId: number;
    roundState?: string;
    className?: string;
}

export const RoundId: React.FC<IRoundIdProps> = ({ clientRoundId, roundState, className }) => {
    const [displayRoundId, setDisplayRoundId] = useState(clientRoundId);
    useEffect(() => {
        if (roundState !== ROUND_STATE.STARTING_ROUND) {
            setDisplayRoundId(clientRoundId);
        }
    }, [clientRoundId, roundState]);
    const isValidRoundNumber = displayRoundId && displayRoundId !== 0;
    const showRoundId = isValidRoundNumber && roundState;
    const content = showRoundId ? `#${displayRoundId}` : '';

    return (
        <div data-testid="round-id" className={classnames(Styles['round-id'], className)}>
            {content}
        </div>
    );
}
