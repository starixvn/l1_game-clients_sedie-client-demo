import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';

import Dice from '../../../../_shared/components/dice';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { Size } from '../../../../_shared/constants';
import { calculateTotalDiceNumber } from '../../../../_shared/utils/number-helper';
import { BigSmallResult, BigSmallSettlementResult } from '../type';
import Styles from './big-small-result-history.module.scss';

export interface IBigSmallResultHistoryProps extends IPropsObserver {
    language: string;
}

export interface IBigSmallResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

const numberOfResult = 100;
export default class BigSmallResultHistory extends ObserverComponent<IBigSmallResultHistoryProps, IBigSmallResultHistoryState> {
    constructor(props: IBigSmallResultHistoryProps) {
        super(props);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds: rounds.slice(0, numberOfResult) });
    }

    renderDices = (roundHistory: gc.RoundHistories.RoundHistory) => {
        const result = roundHistory.result as BigSmallResult;
        const dices = [result.dice1, result.dice2, result.dice3];
        return dices.map((diceNumber, index) => <Dice key={index} diceNumber={diceNumber} size={Size.medium} />);
    };

    renderTotalDice(roundHistory: gc.RoundHistories.RoundHistory) {
        const result = roundHistory.result as BigSmallResult;
        const totalDice = calculateTotalDiceNumber([result.dice1, result.dice2, result.dice3]);
        return <div className={Styles['total-dice']}>{totalDice}</div>;
    }

    renderBigSmall(roundHistory: gc.RoundHistories.RoundHistory) {
        const { settlementResult } = roundHistory;
        const { big } = settlementResult as BigSmallSettlementResult;

        const resultText = big ? gc.Translator.t('UnbalancedBigSmall4.big') : gc.Translator.t('UnbalancedBigSmall4.small');

        return <div className={`${Styles['result-text']}`}>{resultText}</div>;
    }

    renderRoundResult(roundHistory: gc.RoundHistories.RoundHistory, index: number) {
        return (
            <div className={Styles['result-item']} key={index}>
                <RoundTitle roundId={roundHistory.roundId} />
                <div className={Styles['dice-result']}>
                    <div className={Styles['item-dot']}>{this.renderDices(roundHistory)}</div>
                    {this.renderTotalDice(roundHistory)}
                </div>
                <div>{this.renderBigSmall(roundHistory)}</div>
            </div>
        );
    }

    render() {
        const { rounds } = this.state;
        if (!rounds || rounds.length === 0) {
            return <></>;
        }
        const roundHistories = rounds as gc.RoundHistories.RoundHistory[];
        const resultTitle = gc.Translator.translate('Common.result_title');

        return (
            <div className={`c-ng-result ${Styles['result-history']}`}>
                <div className={Styles['result-title']}>{resultTitle}</div>
                <div className={Styles['result-wrapper-content']}>
                    <div className={Styles['result-content']}>
                        {roundHistories.map((roundHistory, index) => {
                            return this.renderRoundResult(roundHistory, index);
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export const RoundTitle: React.FC<{ roundId: number }> = ({ roundId }) => (
    <div>{`${gc.Translator.translate('Common.result_no')} ${roundId}`}</div>
);
