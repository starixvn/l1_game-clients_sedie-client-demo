import * as gc from "@sg/sg-game-client";
import { RoundHistoryStore } from "@sg/sg-game-client/dist/game/round-histories";
import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { SettlementStore } from "@sg/sg-game-client/dist/game/settlements";
import { render } from "@sg/sg-observer";
import React from "react";

import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { BigSmallResult } from "../type";
import styles from "./big-small-settlement-result.module.scss";
import { DiceDisplay } from "./components/dice-display";
import { gameStateService } from "./services/game-state.service";

const DEFAULT_RESULT: BigSmallResult = {
    dice1: 0,
    dice2: 0,
    dice3: 0,
};

export interface IBigSmallSettlementResultState extends IStateObserver {
    result?: BigSmallResult;
    roundState: string;
    isAnimationResult: boolean;
    error?: Error;
    isResultUpdated: boolean;
    settlementResult: gc.GameServiceMessage.TSettlementResult | undefined;
}

export default class BigSmallSettlementResult extends ObserverComponent<IPropsObserver, IBigSmallSettlementResultState> {
    constructor(props: IPropsObserver) {
        super(props);
        this.state = {
            dispose: null,
            result: DEFAULT_RESULT,
            roundState: '',
            isAnimationResult: false,
            error: undefined,
            isResultUpdated: false,
            settlementResult: undefined,
        };
    }
    @render(RoundTimeStore, (store) => store.roundState)
    private handleRoundState(roundState: string): void {
        try {
            if (roundState === ROUND_STATE.PLACING_BET) {
                this.setState({ isResultUpdated: false });
            }
            if (roundState === ROUND_STATE.SHOW_RESULT) {
                this.setState({ isResultUpdated: true });
            }
            gameStateService.handleRoundState(roundState);
            this.setState({ roundState });
        } catch (error) {
            this.setState({ error: error as Error });
        }
    }

    @render(SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    private handleCurrentFinish(currentFinish: gc.GameServiceMessage.Finish): void {
        try {
            const result = gameStateService.handleSettlement(currentFinish);
            if (result && gameStateService.validateResult(result)) {
                this.setState({
                    result,
                    isAnimationResult: true,
                    isResultUpdated: true,
                    settlementResult: currentFinish.settlementResult,
                });
            }
        } catch (error) {
            this.setState({ error: error as Error });
        }
    }

    @render(RoundHistoryStore, (store) => store.firstJoinGameHistory)
    private handleJoinGameAndShowResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory): void {
        const { roundState } = this.state;

        if (roundState === ROUND_STATE.PLACING_BET || roundState === ROUND_STATE.LOCKING_BET) {
            return;
        }

        try {
            const result = gameStateService.handleGameHistory(firstJoinGameHistory);
            if (result && gameStateService.validateResult(result)) {
                this.setState({
                    result,
                    settlementResult: firstJoinGameHistory.roundHistory.settlementResult,
                });
            }
        } catch (error) {
            this.setState({ error: error as Error });
        }
    }

    private renderDiceDisplay() {
        const { result, isAnimationResult, roundState, isResultUpdated } = this.state;

        if (!result || roundState === ROUND_STATE.PLACING_BET || roundState === ROUND_STATE.LOCKING_BET || !isResultUpdated) {
            return (
                <div className={styles.settlementContainer}>
                    <DiceDisplay
                        result={DEFAULT_RESULT}
                        isAnimationResult={false}
                        language={this.props.language}
                        settlementResult={this.state.settlementResult}
                    />
                </div>
            );
        }

        return (
            <div className={styles.settlementContainer}>
                <DiceDisplay
                    result={result}
                    isAnimationResult={isAnimationResult}
                    language={this.props.language}
                    settlementResult={this.state.settlementResult}
                />
            </div>
        );
    }

    private renderContent(): JSX.Element {
        const { error } = this.state;

        if (error) {
            throw error;
        }

        return <div>{this.renderDiceDisplay()}</div>;
    }

    render(): JSX.Element {
        return <>{this.renderContent()}</>;
    }
}
