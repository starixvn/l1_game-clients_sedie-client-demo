import React from 'react';
import { Size } from '../../../../_shared/constants';
import FishPrawnCrabDice from '../../../../_shared/components/fish-prawn-crab-dice';
import { choiceToSymbolMap } from '../fish-prawn-crab-utils';
import { BetPercentageItemProps } from './types';
import Styles from './fish-prawn-crab-bet-percentages.module.scss';

/**
 * Renders a single bet percentage item with symbol and count
 */
const BetPercentageItem: React.FC<BetPercentageItemProps> = ({
    choice,
    count,
    gameName,
    translateBetOption
}) => (
    <div className={Styles['percentage-item']}>
        <FishPrawnCrabDice
            symbol={choiceToSymbolMap[choice]}
            size={Size.small}
        />
        <span className={Styles.count}>{count}</span>
    </div>
);

export default BetPercentageItem; 