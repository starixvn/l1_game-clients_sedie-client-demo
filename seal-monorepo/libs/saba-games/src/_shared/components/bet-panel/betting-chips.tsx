import React from 'react';
import { BettingChipsProps } from './types';

export const BettingChips: React.FC<BettingChipsProps> = ({
    min,
    max,
    currentAmount,
    onAmountChange,
    t,
    addCommas
}) => {
    const handleChipClick = (amount: number) => {
        onAmountChange(amount);
    };

    return (
        <div className="c-betting-chips">
            {/* Add your betting chips UI here */}
            <div className="c-betting-chips__container">
                {/* Example chip buttons */}
                <button
                    className="c-betting-chip"
                    onClick={() => handleChipClick(min)}
                >
                    {addCommas(min)}
                </button>
                <button
                    className="c-betting-chip"
                    onClick={() => handleChipClick(max)}
                >
                    {addCommas(max)}
                </button>
            </div>
        </div>
    );
}; 