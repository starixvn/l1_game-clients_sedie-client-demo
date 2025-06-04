import React from 'react';
import Chip from './chip';
import './betting-chips.scss';

interface BettingChipsProps {
    min: number;
    max: number;
    currentAmount: number;
    onAmountChange: (amount: number) => void;
    t: (key: string) => string;
    addCommas: (num: number) => string;
}

const BettingChips: React.FC<BettingChipsProps> = ({
    min,
    max,
    currentAmount,
    onAmountChange,
    t,
    addCommas
}) => {
    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toString() + 'K';
        }
        return num.toString();
    };

    const chips = [
        {
            value: min,
            label: "min",//t('Common.min_bet'),
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
            label: "max",//t('Common.max_bet'),
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