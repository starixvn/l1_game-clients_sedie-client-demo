import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import React from "react";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";
import EmptyDiceRow from "../empty-dice-row/empty-dice-row";
import { RoundHistoryItem } from "../round-history-item/round-history-item";
import { Size } from "../../constants";
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

export interface BaseRoundHistoryProps<T> extends IPropsObserver {
    maxDisplayedRounds: number;
    blinkRoundItem: Record<string, any>;
    emptyRoundItem: Record<string, any>;
    styles: {
        [key: string]: string;
    };
    renderDice: (props: { symbol: T; size: typeof Size[keyof typeof Size] }) => React.ReactNode;
    renderEmptyDice: (props: { index: number; size: typeof Size[keyof typeof Size] }) => React.ReactNode;
}

export interface BaseRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
    hasBlink: boolean;
    fullRoundHistory: gc.RoundHistories.RoundHistory[];
}

export abstract class BaseRoundHistory<T> extends ObserverComponent<BaseRoundHistoryProps<T>, BaseRoundHistoryState> {
    protected abstract get blinkDefaultRoundItem(): gc.RoundHistories.RoundHistory;
    protected abstract get emptyDefaultRoundItem(): gc.RoundHistories.RoundHistory;

    constructor(props: BaseRoundHistoryProps<T>) {
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
        this.setState({ rounds: [this.emptyDefaultRoundItem, ...rounds.slice(0, this.props.maxDisplayedRounds)] });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string) {
        const hasBlink = roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
        this.setState({ roundState, hasBlink });
    }

    componentDidUpdate(prevProps: Readonly<BaseRoundHistoryProps<T>>, prevState: Readonly<BaseRoundHistoryState>, snapshot?: any): void {
        if (this.state.roundState !== prevState.roundState) {
            const hasBlink = this.state.roundState === ROUND_STATE.LOCKING_BET || this.state.roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
            this.setState({ hasBlink });

            if (hasBlink && this.state.rounds.findIndex(round => round.roundId === this.blinkDefaultRoundItem.roundId) === -1) {
                this.setState({ rounds: [this.blinkDefaultRoundItem, ...this.state.fullRoundHistory.slice(0, this.props.maxDisplayedRounds)] });
            }
        }
    }

    render(): React.ReactElement {
        const { rounds, hasBlink } = this.state;
        if (!rounds || rounds.length === 0 || !this.props.styles) {
            return <React.Fragment />;
        }

        const t = (key: string) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });


        return (
            <div className={this.props.styles["round-history"]}>
                <div className={this.props.styles["hstack-round"]}>
                    {t('Common.previous_round')}:
                    {rounds.toReversed().map((roundHistory, index) => (
                        roundHistory.roundId === this.blinkDefaultRoundItem.roundId ?
                            <EmptyDiceRow
                                key={this.props.maxDisplayedRounds}
                                isFinishedShowResult={false}
                                blinking={hasBlink}
                                renderDice={this.props.renderEmptyDice}
                            />
                            :
                            <RoundHistoryItem<T>
                                key={roundHistory.roundId}
                                roundHistory={roundHistory}
                                showArrow={index < this.props.maxDisplayedRounds}
                                styles={this.props.styles}
                                renderDice={this.props.renderDice}
                            />
                    ))}
                </div>
            </div>
        );
    }
} 