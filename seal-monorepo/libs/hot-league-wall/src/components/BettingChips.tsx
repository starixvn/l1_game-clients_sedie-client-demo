import React from 'react';
import Chip from './Chip';
import { BettingChip } from '../types/betting';
import { formatNumber } from '../utils/formatting';
import './BettingChips.scss';

interface BettingChipsProps {
    min: number;
    max: number;
    currentAmount: number;
    onAmountChange: (amount: number) => void;
}

const BettingChips: React.FC<BettingChipsProps> = ({
    min,
    max,
    currentAmount,
    onAmountChange
}) => {
    const chips: BettingChip[] = [
        {
            value: min,
            label: "min",
            onClick: () => onAmountChange(min)
        },
        {
            value: min * 5,
            label: `+${formatNumber(min * 5)}`,
            onClick: () => onAmountChange(currentAmount + (min * 5)),
            disabled: currentAmount + (min * 5) > max
        },
        {
            value: min * 10,
            label: `+${formatNumber(min * 10)}`,
            onClick: () => onAmountChange(currentAmount + (min * 10)),
            disabled: currentAmount + (min * 10) > max
        },
        {
            value: max,
            label: "max",
            onClick: () => onAmountChange(max)
        }
    ];

    return (
        <div className='c-betting-quick-stake' data-disabled='0'>
            {chips.map((chip, index) => (
                <Chip
                    key={index}
                    label={chip.label}
                    onClick={chip.onClick}
                    disabled={chip.disabled}
                />
            ))}
        </div>
    );
};

export default BettingChips; 