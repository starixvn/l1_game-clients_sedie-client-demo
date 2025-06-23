import React from 'react';
import styles from '../color-game-scoreboard.module.scss';
import ColorGameDice, { ColorGameSymbol } from '../../../../../_shared/components/color-game-dice';
import { Size } from '../../../../../_shared/constants';
import { ColorGameResult } from '../../type';

// Dice Column Component
export interface DiceColumnProps {
    result: ColorGameResult | null;
    hasBlink: boolean;
}

const DiceColumn: React.FC<DiceColumnProps> = ({ result, hasBlink }) => {
    if (!result) {
        return (
            <div className={styles['dice-column']} data-testid="empty-dice-column">
                {hasBlink && (
                    <>
                        <div className={styles['symbol-blink']} data-testid="blink-dice"></div>
                        <div className={styles['symbol-blink']} data-testid="blink-dice"></div>
                        <div className={styles['symbol-blink']} data-testid="blink-dice"></div>
                    </>
                )}
            </div>
        );
    }

    // Get dice values from the result
    const resultAny = result as any;
    const diceValues: ColorGameSymbol[] = [];

    if (resultAny.dice1 !== undefined) diceValues.push(resultAny.dice1);
    if (resultAny.dice2 !== undefined) diceValues.push(resultAny.dice2);
    if (resultAny.dice3 !== undefined) diceValues.push(resultAny.dice3);

    return (
        <div className={styles['dice-column']} data-testid="dice-column">
            {diceValues.map((symbol, index) => (
                <ColorGameDice
                    key={index}
                    symbol={symbol}
                    size={Size.large}
                />
            ))}
        </div>
    );
};

export default DiceColumn; 