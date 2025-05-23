import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { BetPanelState } from '../types/betting';
import { BettingTicket } from './BettingTicket';
import { BettingStake } from './BettingStake';
import BettingChips from './BettingChips';
import './BetPanel.scss';

interface BetPanelProps {
    betPanelState: BetPanelState;
    isPanelVisible: boolean;
    panelRef: React.RefObject<HTMLDivElement>;
    onClose: () => void;
    onBet: (amount: number, betChoice: string) => void;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onHidePanel: () => void;
}

export const BetPanel: React.FC<BetPanelProps> = ({
    betPanelState,
    isPanelVisible,
    panelRef,
    onClose,
    onBet,
    onInputChange,
    onClear,
    onHidePanel
}) => {
    const [amount, setAmount] = useState(betPanelState.amount);
    const [warnMsg, setWarnMsg] = useState(betPanelState.warnMsg);

    useEffect(() => {
        setAmount(betPanelState.amount);
        setWarnMsg(betPanelState.warnMsg);
    }, [betPanelState]);

    if (!isPanelVisible) return null;

    const handleChipAmountChange = (amount: number) => {
        onInputChange({ target: { value: amount.toString() } } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className="seal-vg-sg-index" style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
        }}>
            <div
                ref={panelRef}
                className={classNames('c-quick-bet c-quick-bet--bottom-left', {
                    ['sg-bet-panel__left-dec-100']: betPanelState.isSpecialChoice,
                })}
                style={{
                    pointerEvents: 'auto',
                    position: 'absolute',
                    top: `${betPanelState.top}px`,
                    left: `${betPanelState.left}px`,
                    transform: 'translateY(10px)'
                }}
            >
                <div className="c-quick-bet__arrow"></div>
                <div className="c-quick-bet__btn"></div>
                <div className="c-quick-bet__panel">
                    <div className="c-betslip">
                        <div className="c-betslip__content">
                            <div className="c-betting-scroller">
                                <div className="c-betting-group" data-status="default">
                                    <div className="c-betting" data-open="true">
                                        <BettingTicket
                                            betPanelState={betPanelState}
                                            onClose={onClose}
                                        />
                                        <BettingStake
                                            betPanelState={betPanelState}
                                            amount={amount}
                                            onInputChange={onInputChange}
                                            onClear={onClear}
                                        />
                                        <BettingChips
                                            min={betPanelState.min}
                                            max={betPanelState.max}
                                            currentAmount={amount}
                                            onAmountChange={handleChipAmountChange}
                                        />
                                    </div>
                                    <div className="c-betting-submit">
                                        <button
                                            className="c-btn c-btn--bet"
                                            data-disabled={false}
                                            aria-hidden="true"
                                            onClick={() => {
                                                onBet(amount, betPanelState.betChoice);
                                                onClose();
                                            }}
                                        >
                                            <span className="c-text">Bet</span>
                                        </button>
                                        <button
                                            className="c-btn c-btn--default"
                                            aria-hidden="true"
                                            onClick={onHidePanel}
                                        >
                                            <span className="c-text">Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BetPanel; 