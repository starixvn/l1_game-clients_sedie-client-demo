import { Translator } from '@sg/sg-game-client';
import * as gc from '@sg/sg-game-client';
import React from 'react';

import Styles from './fish-prawn-crab-bet-percentages.module.scss';
import FishPrawnCrabDot from '../dot/fish-prawn-crab-dot';
import { FishPrawnCrabChoices } from '../type';
import FishPrawnCrabDice, { FishPrawnCrabSymbol } from '../../../../_shared/components/fish-prawn-crab-dice';
import { Size } from '../../../../_shared/constants';

// Types and Interfaces
interface BetResult {
    fish: boolean;
    prawn: boolean;
    crab: boolean;
    rooster: boolean;
    gourd: boolean;
    stag: boolean;
}

interface BetCounts {
    fish: number;
    prawn: number;
    crab: number;
    rooster: number;
    gourd: number;
    stag: number;
}

interface Props {
    gameName: string;
    rounds: gc.RoundHistories.RoundHistory[];
    translator?: (key: string) => string;
    language?: string;
}

// Mapping of choices to dice symbols
const choiceToSymbolMap: Record<FishPrawnCrabChoices, number> = {
    [FishPrawnCrabChoices.fish]: 3,   // Mapping to dice value
    [FishPrawnCrabChoices.prawn]: 5,  // Mapping to dice value
    [FishPrawnCrabChoices.crab]: 4,   // Mapping to dice value
    [FishPrawnCrabChoices.rooster]: 2, // Mapping to dice value
    [FishPrawnCrabChoices.gourd]: 1,  // Mapping to dice value
    [FishPrawnCrabChoices.stag]: 0,   // Mapping to dice value
};

const countResult = (roundHistory: gc.RoundHistories.RoundHistory[]) => {
    return roundHistory.reduce((resultCount, { result }) => {
        Object.values(result).forEach((character: number) => {
            resultCount[character] = (resultCount[character] ?? 0) + 1;
        });
        return resultCount;
    }, {});
};


// Pure function for calculating bet statistics
const calculateBetStatistics = (data: gc.RoundHistories.RoundHistory[]): BetCounts => {
    const initialCounts: BetCounts = {
        fish: 0,
        prawn: 0,
        crab: 0,
        rooster: 0,
        gourd: 0,
        stag: 0
    };

    return data.reduce((counts, item) => {
        if (!item.settlementResult) return counts;

        const result = item.settlementResult as unknown as BetResult;
        return {
            fish: counts.fish + (result.fish ? 1 : 0),
            prawn: counts.prawn + (result.prawn ? 1 : 0),
            crab: counts.crab + (result.crab ? 1 : 0),
            rooster: counts.rooster + (result.rooster ? 1 : 0),
            gourd: counts.gourd + (result.gourd ? 1 : 0),
            stag: counts.stag + (result.stag ? 1 : 0)
        };
    }, initialCounts);
};

const BetPercentageItem: React.FC<{
    gameName: string;
    choice: FishPrawnCrabChoices;
    count: number;
    translateBetOption: (option: string) => string;
}> = ({ gameName, choice, count, translateBetOption }) => (
    <div className={Styles['percentage-item']}>
        <FishPrawnCrabDice
            symbol={choiceToSymbolMap[choice]}
            size={Size.small}
        />
        {/* {translateBetOption(choice)} */}
        <span className={Styles.count}>{count}</span>
    </div>
);

const FishPrawnCrabBetPercentages: React.FC<Props> = ({
    gameName,
    rounds,
    translator = (key: string) => Translator.t(`${gameName}.glossary_${key}`),
}) => {
    const betCounts = calculateBetStatistics(rounds);
    console.log('betCounts', betCounts);
    const choices = Object.values(FishPrawnCrabChoices);

    return (
        <div className={Styles['fpc-percentages']}>
            {choices.map((choice) => (
                <BetPercentageItem
                    key={choice}
                    gameName={gameName}
                    count={betCounts[choice as keyof BetCounts]}
                    translateBetOption={translator}
                    choice={choice as FishPrawnCrabChoices}
                />
            ))}
        </div>
    );
};

export { FishPrawnCrabBetPercentages, calculateBetStatistics, type BetCounts, type BetResult }; 