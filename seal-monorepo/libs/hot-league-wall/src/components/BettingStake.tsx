import React from 'react';
import { BetPanelState } from '../types/betting';
import { addCommas, calculatePayout } from '../utils/formatting';

interface BettingStakeProps {
    betPanelState: BetPanelState;
    amount: number;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}

export const BettingStake: React.FC<BettingStakeProps> = ({
    betPanelState,
    amount,
    onInputChange,
    onClear
}) => {
    const displayAmount = amount > 0 ? addCommas(amount) : '';
    const payout = calculatePayout(amount, betPanelState.odd);

    return (
        <div className="c-betting-stake-group">
            <div className="c-betting-stake">
                <div className="c-textfield c-textfield--stake" data-focus="true">
                    <input
                        type="text"
                        className="c-textfield__input"
                        placeholder={`${addCommas(betPanelState.min)} - ${addCommas(betPanelState.max)}`}
                        value={displayAmount}
                        onChange={onInputChange}
                    />
                    <span className="c-textfield__currency">{betPanelState.currency}</span>
                    <span className="c-textfield__bg"></span>
                    <a className="c-btn c-btn--clear" aria-hidden="true" onClick={onClear}>
                        <i className="c-icon c-icon--clear-solid"></i>
                    </a>
                </div>
            </div>
            <div className="c-betting-stake-info">
                <span className="c-text-group">
                    <span className="c-text-label">Payout: </span>
                    <span className="c-text-value">{payout}</span>
                </span>
            </div>
        </div>
    );
}; 