import React from 'react';
import * as gc from '@sg/sg-game-client';
import FishPrawnCrabDice from '../../../../../_shared/components/fish-prawn-crab-dice';
import { Size } from '../../../../../_shared/constants';
import styles from '../fish-prawn-crab-result-history.module.scss';

interface IDiceDisplayProps {
    result: gc.RoundHistories.RoundHistory['result'];
}

export const DiceDisplay: React.FC<IDiceDisplayProps> = ({ result }) => {
    if (!result) return null;

    return (
        <div className={styles['dice-container']}>
            <FishPrawnCrabDice
                symbol={result["dice1"]}
                size={Size.small}
            />
            <FishPrawnCrabDice
                symbol={result["dice2"]}
                size={Size.small}
            />
            <FishPrawnCrabDice
                symbol={result["dice3"]}
                size={Size.small}
            />
        </div>
    );
}; 