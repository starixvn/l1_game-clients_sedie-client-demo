import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { RNGSoccerRoundDot } from '../dot';
import { RNGSoccerChoices, RNGSoccerSettlementItemResult, RNGSoccerResult } from '../type';
import Styles from './rng-soccer-round-history.module.scss';
import historyBtnIcon from '../../../../assets/rng-soccer/history-btn.svg';

export interface IRNGSoccerRoundHistoryProps extends IPropsObserver {
    language: string;
    togglePopup: () => void;
}

export interface IRNGSoccerRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

export default class RNGSoccerRoundHistory extends ObserverComponent<IRNGSoccerRoundHistoryProps, IRNGSoccerRoundHistoryState> {
    constructor(props: IRNGSoccerRoundHistoryProps) {
        super(props);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds: rounds.slice(0, 16) });
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
                    {roundHistories.toReversed().map((roundHistory) => {
                        return this.RoundHistoryItem(roundHistory);
                    })}
                    <RNGSoccerRoundDot highlight={true} value="?" choice="next" />
                </div>
                <div className={Styles['btn-stats']} onClick={this.props.togglePopup}>
                    <img src={historyBtnIcon} alt="statistics" />
                </div>
            </div>
        );
    }

    private getSettlementResult(
        settlementResult: gc.GameServiceMessage.TSettlementResult,
    ): RNGSoccerSettlementItemResult & { winner: string } {
        const result = {
            winner: RNGSoccerChoices.home,
            home: false,
            away: false,
            draw: false,
        };

        if (settlementResult && typeof settlementResult === 'object') {
            const data = settlementResult as Record<string, unknown>;
            result.home = !!data.home;
            result.away = !!data.away;
            result.draw = !!data.draw;

            if (result.home) {
                result.winner = RNGSoccerChoices.home;
            } else if (result.away) {
                result.winner = RNGSoccerChoices.away;
            } else if (result.draw) {
                result.winner = RNGSoccerChoices.draw;
            }
        }

        return result;
    }

    private RoundHistoryItem(roundHistory: gc.RoundHistories.RoundHistory): JSX.Element {
        if (!roundHistory.settlementResult || !roundHistory.result) {
            return <></>;
        }

        const settlement = this.getSettlementResult(roundHistory.settlementResult);
        const result = roundHistory.result as unknown as RNGSoccerResult;
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

        return (
            <div key={roundHistory.roundId} className={Styles['history-item']}>
                <RNGSoccerRoundDot choice={settlement.winner as RNGSoccerChoices} value={t(`RNGSoccer.beadboard_${settlement.winner}`)} />
            </div>
        );
    }
}
