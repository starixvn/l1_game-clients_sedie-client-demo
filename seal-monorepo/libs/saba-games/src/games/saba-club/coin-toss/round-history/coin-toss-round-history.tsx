import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import React from "react";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import styles from "./coin-toss-round-history.module.scss";
import EmptyCoinRow from "./empty-coin-row";
import { MAX_DISPLAYED_ROUNDS, blinkRoundItem, emptyRoundItem } from "../constants/coin-toss-constants";
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import CoinTossRoundHistoryItem from "./coin-toss-round-history-item";

const blinkDefaultRoundItem = {
    roundId: -1,
    result: blinkRoundItem,
    createdAt: new Date().toISOString(),
    settlementResult: {},
    date: new Date().toISOString(),
} as gc.RoundHistories.RoundHistory;

const emptyDefaultRoundItem = {
    roundId: -1,
    result: emptyRoundItem,
    createdAt: new Date().toISOString(),
    settlementResult: {},
    date: new Date().toISOString(),
} as gc.RoundHistories.RoundHistory;

export interface ICoinTossRoundHistoryProps extends IPropsObserver {
}

export interface ICoinTossRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
    hasBlink: boolean;
    fullRoundHistory: gc.RoundHistories.RoundHistory[];
}

export default class CoinTossRoundHistory extends ObserverComponent<ICoinTossRoundHistoryProps, ICoinTossRoundHistoryState> {
    constructor(props: ICoinTossRoundHistoryProps) {
        super(props);
        this.state = {
            dispose: null,
            rounds: [],
            roundState: '',
            hasBlink: false,
            fullRoundHistory: [],
        };
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ fullRoundHistory: rounds });
        this.setState({ rounds: [emptyDefaultRoundItem, ...rounds.slice(0, MAX_DISPLAYED_ROUNDS)] });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string) {
        const hasBlink = roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
        this.setState({ roundState, hasBlink });
    }


    componentDidUpdate(prevProps: Readonly<ICoinTossRoundHistoryProps>, prevState: Readonly<ICoinTossRoundHistoryState>, snapshot?: any): void {
        if (this.state.roundState !== prevState.roundState) {
            const hasBlink = this.state.roundState === ROUND_STATE.LOCKING_BET || this.state.roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
            this.setState({ hasBlink });

            if (hasBlink && this.state.rounds.findIndex(round => round.roundId === blinkDefaultRoundItem.roundId) === -1) {
                this.setState({ rounds: [blinkDefaultRoundItem, ...this.state.fullRoundHistory.slice(0, MAX_DISPLAYED_ROUNDS)] });
            }
        }
    }

    render(): React.ReactElement {
        const { rounds, hasBlink } = this.state;
        if (!rounds || rounds.length === 0) {
            return <React.Fragment />;
        }

        const t = (key: string) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

        return (
            <div className={styles["round-history"]}>
                <div className={styles["hstack-round"]}>
                    {t('Common.previous_round')}:
                    {rounds.toReversed().map((roundHistory, index) => (
                        roundHistory.roundId === blinkDefaultRoundItem.roundId ?
                            <EmptyCoinRow
                                key={MAX_DISPLAYED_ROUNDS}
                                isFinishedShowResult={false}
                                blinking={hasBlink}
                            />
                            :
                            <CoinTossRoundHistoryItem
                                key={roundHistory.roundId}
                                roundHistory={roundHistory}
                                showArrow={index < MAX_DISPLAYED_ROUNDS}
                            />
                    ))}
                </div>
            </div>
        );
    }
}