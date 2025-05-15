import { Translator } from '@sg/sg-game-client';
import React from 'react';
import { FishPrawnCrabChoices } from '../type';
import { BetPercentagesProps } from './types';
import { calculateBetStatistics } from './utils';
import Styles from './fish-prawn-crab-bet-percentages.module.scss';
import BetPercentageItem from './bet-bercentage-item';

/**
 * Displays bet percentages for Fish Prawn Crab game
 */
const FishPrawnCrabBetPercentages: React.FC<BetPercentagesProps> = ({
    gameName,
    rounds,
    translator = (key: string) => Translator.t(`${gameName}.glossary_${key}`),
}) => {
    const betCounts = calculateBetStatistics(rounds);
    const choices = Object.values(FishPrawnCrabChoices);

    return (
        <div className={Styles['fpc-percentages']}>
            {choices.map((choice) => (
                <BetPercentageItem
                    key={choice}
                    gameName={gameName}
                    count={betCounts[choice as keyof typeof betCounts]}
                    translateBetOption={translator}
                    choice={choice as FishPrawnCrabChoices}
                />
            ))}
        </div>
    );
};

export default FishPrawnCrabBetPercentages; 