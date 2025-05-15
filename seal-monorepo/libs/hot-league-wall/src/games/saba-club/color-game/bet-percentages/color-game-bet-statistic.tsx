import { Translator } from '@sg/sg-game-client';
import React from 'react';
import { ColorGameChoices } from '../type';
import { BetPercentagesProps } from './types';
import { calculateBetStatistics } from './utils';
import Styles from './color-game-bet-percentages.module.scss';
import ColorGameDice from '../../../../_shared/components/color-game-dice';
import { Size } from '../../../../_shared/constants';
import { choiceToSymbolMap } from '../color-game-utils';
import { GameBetStatistic } from '../../../../_shared/components/game-bet-statistic';

/**
 * Displays bet percentages for Color game
 */
const ColorGameBetStatistic: React.FC<BetPercentagesProps> = ({
    gameName,
    rounds,
    translator = (key: string) => Translator.t(`${gameName}.glossary_${key}`),
}) => {
    const betCounts = calculateBetStatistics(rounds);
    const choices = Object.values(ColorGameChoices);

    return (
        <GameBetStatistic
            gameName={gameName}
            rounds={rounds}
            choices={choices}
            betCounts={betCounts}
            translator={translator}
            styles={{
                container: Styles['color-game-percentages'],
                item: Styles['percentage-item'],
                count: Styles.count
            }}
            renderDice={(choice) => (
                <ColorGameDice
                    symbol={choiceToSymbolMap[choice]}
                    size={Size.small}
                />
            )}
        />
    );
};

export default ColorGameBetStatistic; 