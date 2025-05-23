import React from 'react';
import { BetPanelState } from '../types/betting';
import { addCommas } from '../utils/formatting';

interface BettingTicketProps {
    betPanelState: BetPanelState;
    onClose: () => void;
}

export const BettingTicket: React.FC<BettingTicketProps> = ({
    betPanelState,
    onClose
}) => {
    return (
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

            {betPanelState.warnMsg && (
                <div className="c-ticket__status">
                    <div className="c-betting-msg sg-bet-panel__betting-msg">
                        <i className="c-icon c-icon--warning" data-icon="warning" />
                        <span className="c-text">{betPanelState.warnMsg}</span>
                    </div>
                </div>
            )}
        </div>
    );
}; 