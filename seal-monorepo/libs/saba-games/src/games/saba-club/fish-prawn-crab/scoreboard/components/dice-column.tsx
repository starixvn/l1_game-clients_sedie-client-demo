import React from 'react';
import styles from '../fish-prawn-crab-scoreboard.module.scss';
import FishPrawnCrabDice, { FishPrawnCrabSymbol } from '../../../../../_shared/components/fish-prawn-crab-dice';
import { Size } from '../../../../../_shared/constants';
import { FishPrawnCrabResult } from '../../type';

// Dice Column Component
export interface DiceColumnProps {
    result: FishPrawnCrabResult | null;
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
    const diceValues: FishPrawnCrabSymbol[] = [];

    if (resultAny.dice1 !== undefined) diceValues.push(resultAny.dice1);
    if (resultAny.dice2 !== undefined) diceValues.push(resultAny.dice2);
    if (resultAny.dice3 !== undefined) diceValues.push(resultAny.dice3);

    return (
        <div className={styles['dice-column']} data-testid="dice-column">
            {diceValues.map((symbol, index) => (
                <FishPrawnCrabDice
                    key={index}
                    symbol={symbol}
                    size={Size.large}
                />
            ))}
        </div>
    );
};

export default DiceColumn; 