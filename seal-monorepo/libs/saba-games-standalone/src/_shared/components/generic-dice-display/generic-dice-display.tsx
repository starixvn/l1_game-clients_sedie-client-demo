import React from 'react';
import * as gc from '@sg/sg-game-client';
import { Size } from '../../constants';
import styles from './generic-dice-display.module.scss';

interface GenericDiceDisplayProps<T> {
    result: gc.RoundHistories.RoundHistory['result'];
    DiceComponent: React.ComponentType<{
        symbol: T;
        size?: typeof Size.large | typeof Size.medium | typeof Size.small;
    }>;
}

export function GenericDiceDisplay<T>({
    result,
    DiceComponent
}: GenericDiceDisplayProps<T>) {
    if (!result) return null;

    return (
        <div className={styles['dice-container']}>
            <DiceComponent
                symbol={result["dice1"] as T}
                size={Size.small}
            />
            <DiceComponent
                symbol={result["dice2"] as T}
                size={Size.small}
            />
            <DiceComponent
                symbol={result["dice3"] as T}
                size={Size.small}
            />
        </div>
    );
} 