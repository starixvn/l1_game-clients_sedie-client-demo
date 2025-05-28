import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { BigSmallRoundDot } from "../dot";
import { BigSmallChoices, BigSmallSettlementResult } from "../type";
import Styles from "./big-small-round-history.module.scss";
import { BigSmallRoundHistoryTooltip } from "./tooltip";

interface BigSmallResult {
    dice1: number;
    dice2: number;
    dice3: number;
}

export interface IBigSmallRoundHistoryProps extends IPropsObserver {
    language: string;
}

export interface IBigSmallRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

export default class BigSmallRoundHistory extends ObserverComponent<IBigSmallRoundHistoryProps, IBigSmallRoundHistoryState> {
    constructor(props: IBigSmallRoundHistoryProps) {
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
            <div className={Styles["round-history"]}>
                <div className={Styles["hstack-round"]}>
                    {t('Common.previous_round')}:
                    {roundHistories.toReversed().map((roundHistory) => {
                        return this.RoundHistoryItem(roundHistory);
                    })}
                    <BigSmallRoundDot
                        highlight={true}
                        size="large"
                        value="?"
                        choice="next"
                    />
                </div>
            </div>
        );
    }

    private getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): BigSmallSettlementResult & { winner: string } {
        const result = {
            winner: BigSmallChoices.big,
            big: false,
            small: false
        };

        if (settlementResult && typeof settlementResult === "object") {
            const data = settlementResult as Record<string, unknown>;
            result.big = !!data.big;
            result.small = !!data.small;

            if (result.big) {
                result.winner = BigSmallChoices.big;
            } else if (result.small) {
                result.winner = BigSmallChoices.small;
            }
        }

        return result;
    }

    private RoundHistoryItem(roundHistory: gc.RoundHistories.RoundHistory): JSX.Element {
        if (!roundHistory.settlementResult || !roundHistory.result) {
            return <></>;
        }

        const settlement = this.getSettlementResult(roundHistory.settlementResult);
        const result = roundHistory.result as unknown as BigSmallResult;
        const diceValues = [result.dice1, result.dice2, result.dice3];
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

        return (
            <div key={roundHistory.roundId} className={Styles["history-item"]}>
                <BigSmallRoundDot
                    choice={settlement.winner}
                    size="large"
                    value={t(`UnbalancedBigSmall4.beadboard_${settlement.winner}`)}
                />
                <span className={Styles["arrow"]}></span>
                <BigSmallRoundHistoryTooltip
                    roundId={roundHistory.roundId}
                    winner={settlement.winner}
                    diceValues={diceValues}
                />
            </div>
        );
    }
}
