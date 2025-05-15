import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import React from "react";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import styles from "./fish-prawn-crab-round-history.module.scss";
import FishPrawnCrabRoundHistoryItem from "./fish-prawn-crab-round-history-item";
import EmptyDiceRow from "./empty-dice-row";
import { MAX_DISPLAYED_ROUNDS } from "../constants/fish-prawn-crab-constants";
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { blinkRoundItem, emptyRoundItem } from "../constants";

const blinkDefaultRoundItem = {
    roundId: -1,
    result: blinkRoundItem,
    createdAt: new Date().toISOString(),
    settlementResult: {},
    date: new Date().toISOString(),
} as gc.RoundHistories.RoundHistory;

const emptyDefaultRoundItem = {
    roundId: -2,
    result: emptyRoundItem,
    createdAt: new Date().toISOString(),
    settlementResult: {},
    date: new Date().toISOString(),
} as gc.RoundHistories.RoundHistory;

export interface IFishPrawnCrabRoundHistoryProps extends IPropsObserver {
}

export interface IFishPrawnCrabRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
    hasBlink: boolean;
    fullRoundHistory: gc.RoundHistories.RoundHistory[];
}

export default class FishPrawnCrabRoundHistory extends ObserverComponent<IFishPrawnCrabRoundHistoryProps, IFishPrawnCrabRoundHistoryState> {
    constructor(props: IFishPrawnCrabRoundHistoryProps) {
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


    componentDidUpdate(prevProps: Readonly<IFishPrawnCrabRoundHistoryProps>, prevState: Readonly<IFishPrawnCrabRoundHistoryState>, snapshot?: any): void {
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
                            <EmptyDiceRow
                                key={MAX_DISPLAYED_ROUNDS}
                                isFinishedShowResult={false}
                                blinking={hasBlink}
                            />
                            :
                            <FishPrawnCrabRoundHistoryItem
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