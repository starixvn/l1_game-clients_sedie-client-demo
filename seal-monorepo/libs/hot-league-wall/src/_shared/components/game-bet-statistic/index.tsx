import { Translator } from '@sg/sg-game-client';
import React from 'react';
import { BetCountsType } from '../../types/bet-statistics';

export interface GameBetPercentagesProps<T extends string> {
    gameName: string;
    rounds: any[];
    choices: T[];
    betCounts: BetCountsType<T>;
    renderDice: (choice: T) => React.ReactNode;
    translator?: (key: string) => string;
    styles: {
        container: string;
        item: string;
        count: string;
    };
}

/**
 * Generic component for displaying bet percentages for any game
 */
export const GameBetStatistic = <T extends string>({
    gameName,
    choices,
    betCounts,
    renderDice,
    translator = (key: string) => Translator.t(`${gameName}.glossary_${key}`),
    styles
}: GameBetPercentagesProps<T>) => {
    return (
        <div className={styles.container}>
            {choices.map((choice) => (
                <div key={choice} className={styles.item}>
                    {renderDice(choice)}
                    <span className={styles.count}>{betCounts[choice]}</span>
                </div>
            ))}
        </div>
    );
}; 