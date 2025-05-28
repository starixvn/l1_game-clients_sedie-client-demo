import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { RoundDot } from '../../../../_shared/components/dot';
import {
    IPropsObserver,
    IStateObserver,
    ObserverComponent,
} from '../../../../_shared/components/observer-component/observer-component';
import Styles from '../sedie.module.scss';
import { SeDieChoices } from '../type';
import { RoundHistoryTooltip } from './tooltip';

export interface ISeDieRoundHistoryProps extends IPropsObserver {
    language: string;
}

export interface ISeDieRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}
export default class SeDieRoundHistory extends ObserverComponent<ISeDieRoundHistoryProps, ISeDieRoundHistoryState> {
    constructor(props: ISeDieRoundHistoryProps) {
        super(props);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds: rounds.slice(0, 10) });
    }

    render() {
        const { rounds } = this.state;
        if (!rounds || rounds.length === 0) {
            return <></>;
        }
        const roundHistories = rounds as gc.RoundHistories.RoundHistory[];
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

        return (
            <div className={Styles['round-history']}>
                <div className={Styles['hstack-round']}>
                    <span className={`${Styles['hstack-box']} ${Styles['live']}`}><span className={Styles['hstack-live-icon']}></span></span>
                    <span className={Styles['hstack-box']}><span className={Styles['hstack-history-icon']}></span></span>
                    <span className={Styles['hstack-text']}>{t('Common.previous_round')}:</span>
                    {roundHistories.toReversed().map((roundHistory) => {
                        return this.RoundHistoryItem(roundHistory);
                    })}
                    <RoundDot highlight={true} value={'?'} />
                </div>
            </div>
        );
    }

    private RoundHistoryItem(roundHistory: gc.RoundHistories.RoundHistory): JSX.Element {
        if (!roundHistory.settlementResult) {
            return <></>;
        }
        const value = this.getResult(roundHistory.settlementResult);
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
        const choice = value === 'O' ? SeDieChoices.odd : SeDieChoices.even;
        const dotValue = t(`SeDie.beadboard_${choice}`);
        const isOdd = value === 'O';

        let countRed = 0;
        const dotsTotal = 4;
        Object.values(roundHistory.result).forEach((value) => {
            if (value) {
                countRed++;
            }
        });

        return (
            <div className={Styles['hstack']} key={roundHistory.roundId}>
                <RoundDot choice={isOdd ? SeDieChoices.odd : SeDieChoices.even} value={dotValue} />
                <span className={Styles['arrow']}></span>
                <RoundHistoryTooltip
                    roundId={roundHistory.roundId}
                    choice={choice}
                    countRed={countRed}
                    dotsTotal={dotsTotal}
                />
            </div>
        );
    }

    private getResult(settlementResult: gc.GameServiceMessage.TSettlementResult): string {
        let value = '';
        settlementResult &&
            Object.keys(settlementResult).map((choice) => {
                if (settlementResult[choice]) {
                    if (choice === SeDieChoices.odd || choice === SeDieChoices.even) {
                        value = choice.charAt(0).toUpperCase();
                    }
                }
            });
        return value;
    }
}
