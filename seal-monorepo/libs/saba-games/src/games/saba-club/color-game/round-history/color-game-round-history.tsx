import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import React from "react";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import styles from "./color-game-round-history.module.scss";
import { RoundHistoryItem } from "../../../../_shared/components/round-history-item/round-history-item";
import { EmptyDiceRow } from "../../../../_shared/components/empty-dice-row/empty-dice-row";
import { MAX_DISPLAYED_ROUNDS } from "../constants/color-game-constants";
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { ColorGameSymbol } from "../../../../_shared/components/color-game-dice";
import ColorGameDice from "../../../../_shared/components/color-game-dice";
import { Size } from "../../../../_shared/constants";

const blinkDefaultRoundItem = {
    roundId: -1,
    result: {
        dice1: ColorGameSymbol.EMPTY,
        dice2: ColorGameSymbol.EMPTY,
        dice3: ColorGameSymbol.EMPTY
    },
    settlementResult: {}
} as gc.RoundHistories.RoundHistory;

const emptyDefaultRoundItem = {
    roundId: -2,
    result: {
        dice1: ColorGameSymbol.EMPTY,
        dice2: ColorGameSymbol.EMPTY,
        dice3: ColorGameSymbol.EMPTY
    },
    settlementResult: {}
} as gc.RoundHistories.RoundHistory;

export interface IColorGameRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
    hasBlink: boolean;
    fullRoundHistory: gc.RoundHistories.RoundHistory[];
}

export default class ColorGameRoundHistory extends ObserverComponent<IPropsObserver, IColorGameRoundHistoryState> {
    constructor(props: IPropsObserver) {
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

    componentDidUpdate(prevProps: Readonly<IPropsObserver>, prevState: Readonly<IColorGameRoundHistoryState>, snapshot?: any): void {
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
                                renderDice={({ index, size }) => (
                                    <ColorGameDice
                                        symbol={ColorGameSymbol.EMPTY}
                                        size={size}
                                    />
                                )}
                            />
                            :
                            <RoundHistoryItem<ColorGameSymbol>
                                key={roundHistory.roundId}
                                roundHistory={roundHistory}
                                showArrow={index < MAX_DISPLAYED_ROUNDS}
                                styles={styles}
                                renderDice={({ symbol, size }) => (
                                    <ColorGameDice
                                        symbol={symbol}
                                        size={size}
                                    />
                                )}
                            />
                    ))}
                </div>
            </div>
        );
    }
}