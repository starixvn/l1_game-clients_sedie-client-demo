import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { CoinTossResult, CoinTossSettlementResult } from '../type';
import Styles from './coin-toss-result-history.module.scss';
import Coin, { CoinSymbol } from '../../../../_shared/components/coin';  
import { RoundTitle } from './round-title';

export interface ICoinTossResultHistoryProps extends IPropsObserver {
    language: string;
}

export interface ICoinTossResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

const numberOfResult = 100;
export default class CoinTossResultHistory extends ObserverComponent<ICoinTossResultHistoryProps, ICoinTossResultHistoryState> {
    constructor(props: ICoinTossResultHistoryProps) {
        super(props);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds: rounds.slice(0, numberOfResult) });
    }

    renderCoin = (roundHistory: gc.RoundHistories.RoundHistory) => {
        const result = roundHistory.result as CoinTossResult;
        const coinType = result.head ? CoinSymbol.HEAD : CoinSymbol.TAIL;
        return <Coin coinType={coinType} />;
    };

    renderResult(roundHistory: gc.RoundHistories.RoundHistory) {
        const { settlementResult } = roundHistory;
        const { head } = settlementResult as CoinTossSettlementResult;

        const resultText = head ? gc.Translator.t('CoinToss.head') : gc.Translator.t('CoinToss.tail');

        return <div className={`${Styles['result-text']}`}>{resultText}</div>;
    }

    renderRoundResult(roundHistory: gc.RoundHistories.RoundHistory, index: number) {
        return (
            <div className={Styles['result-item']} key={index}>
                <RoundTitle roundId={roundHistory.roundId} />
                <div className={Styles['coin-result']}>
                    <div className={Styles['item-dot']}>{this.renderCoin(roundHistory)}</div>
                </div>
                <div>{this.renderResult(roundHistory)}</div>
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