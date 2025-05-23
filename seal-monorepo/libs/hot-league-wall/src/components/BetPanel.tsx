import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import BettingChips from './BettingChips';
import './BetPanel.scss';

export interface BetPanelState {
    isShowBetSlip: boolean;
    top: number;
    left: number;
    betChoice: string;
    odd: number;
    amount: number;
    currency: string;
    min: number;
    max: number;
    payout: string;
    gameName: string;
    namespace: string;
    clientRoundId: number;
    isSpecialChoice: boolean;
    warnMsg: string;
    position?: {
        top: number;
        left: number;
    };
}

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
        setAmount(amount);
        onInputChange({ target: { value: amount.toString() } } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        const numValue = value ? parseInt(value, 10) : 0;
        setAmount(numValue);
        onInputChange(event);
    };

    const t = (key: string) => key; // Placeholder translation function
    const addCommas = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const displayAmount = amount > 0 ? addCommas(amount) : '';
    const payout = amount > 0 ? addCommas(amount * betPanelState.odd) : '0.00';

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
                                        <div className="c-ticket" data-status="default" data-open="true">
                                            <div className="c-ticket__header">
                                                <span className="c-text-bettype sg-bet-panel__header-flex">
                                                    <div className={`sg-bet-panel__game-icon ${betPanelState.namespace}-icon`}></div>
                                                    <div>
                                                        <div className="game-name">{betPanelState.gameName}</div>
                                                        <div className="bet-option">{betPanelState.betChoice}</div>
                                                    </div>
                                                </span>
                                                <a className="c-btn c-btn--caret" aria-hidden="true">
                                                    <i className="c-icon c-icon--caret"></i>
                                                </a>
                                                <a className="c-btn c-btn--clear" aria-hidden="true" onClick={onClose}>
                                                    <i className="c-icon c-icon--clear"></i>
                                                </a>
                                            </div>

                                            <div className="c-ticket__main">
                                                <div className="c-ticket__choice">
                                                    <span className="c-text-betchoice">{betPanelState.betChoice}</span>
                                                </div>
                                                <div className="c-ticket__odds">
                                                    <span className="c-text-balls">
                                                        {/* Game elements will be rendered here */}
                                                    </span>
                                                    <span className="c-text-odds">
                                                        @
                                                        <span className="c-odds sg-bet-panel__text-bold" data-odds-status="default">
                                                            {betPanelState.odd || ''}
                                                        </span>
                                                    </span>
                                                    <span className="c-text-oddstype">(Decimal)</span>
                                                </div>
                                            </div>

                                            <div className="c-ticket__info">
                                                <div className="c-ticket-match-info">
                                                    <div className="c-ticket-match-info__row">{betPanelState.namespace}</div>
                                                    <div className="c-ticket-match-info__row">{betPanelState.gameName}</div>
                                                    <div className="c-ticket-match-info__row">
                                                        Result No. {betPanelState.clientRoundId}
                                                    </div>
                                                </div>
                                            </div>

                                            {warnMsg && (
                                                <div className="c-ticket__status">
                                                    <div className="c-betting-msg sg-bet-panel__betting-msg">
                                                        <i className="c-icon c-icon--warning" data-icon="warning" />
                                                        <span className="c-text">{warnMsg}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="c-betting-stake-group">
                                            <div className="c-betting-stake">
                                                <div className="c-textfield c-textfield--stake" data-focus="true">
                                                    <input
                                                        type="text"
                                                        className="c-textfield__input"
                                                        placeholder={`${addCommas(betPanelState.min)} - ${addCommas(betPanelState.max)}`}
                                                        value={displayAmount}
                                                        onChange={handleInputChange}
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
                                        <BettingChips
                                            min={betPanelState.min}
                                            max={betPanelState.max}
                                            currentAmount={amount}
                                            onAmountChange={handleChipAmountChange}
                                            t={t}
                                            addCommas={addCommas}
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