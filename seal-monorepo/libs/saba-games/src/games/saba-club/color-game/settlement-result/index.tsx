import * as gc from "@sg/sg-game-client";
import { Settlements } from '@sg/sg-game-client';
import { RoundHistoryStore } from "@sg/sg-game-client/dist/game/round-histories";
import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { SettlementStore } from "@sg/sg-game-client/dist/game/settlements";
import { render, handle } from "@sg/sg-observer";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { ColorGameResult } from "../type";
import Styles from "./color-game-animations.module.scss";
import { gameStateService } from "./services/game-state.service";
import ColorGameDice, { ColorGameSymbol } from "../../../../_shared/components/color-game-dice";
import { Size } from "../../../../_shared/constants";
import { convertValueToSymbol } from "../color-game-utils";
import { AnimatedDiceSet } from '../../../../_shared/components/color-game-dice/animated-dice';
import { ResultDisplay } from "./result-display";
import { ANIMATION_DURATION_MS } from "../constants";

const DEFAULT_RESULT = {};

export interface IColorGameSettlementResultState extends IStateObserver {
    result: gc.GameServiceMessage.TResult;
    roundState: string;
    isAnimationResult: boolean;
    isFinishShowResult: boolean;
    settlementResult: gc.GameServiceMessage.TSettlementResult;
    winningSymbols: string[];
    isResultUpdated: boolean;
}

export default class ColorGameSettlementResult extends ObserverComponent<IPropsObserver, IColorGameSettlementResultState> {
    constructor(props: IPropsObserver) {
        super(props);
        this.state = {
            dispose: null,
            result: DEFAULT_RESULT,
            roundState: '',
            isAnimationResult: false,
            isFinishShowResult: false,
            settlementResult: {},
            winningSymbols: [],
            isResultUpdated: false,
        };
    }

    @handle(Settlements.SettlementUIHandlers.FinishedShowResult)
    protected handleFinishedShowResult() {
        this.setState({ isFinishShowResult: true });
    }

    @render(RoundTimeStore, (store) => store.roundState)
    private handleRoundState(roundState: string) {
        if (roundState === ROUND_STATE.STARTING_ROUND || roundState === ROUND_STATE.PLACING_BET) {
            this.setState({
                isFinishShowResult: false,
                result: DEFAULT_RESULT,
                settlementResult: {},
                winningSymbols: [],
                isResultUpdated: false,
                isAnimationResult: false
            });
        }

        if (roundState === ROUND_STATE.SHOW_RESULT) {
            this.setState({ isResultUpdated: true });
        }

        if (roundState === ROUND_STATE.SHOW_ANIMATION_RESULT) {
            this.setState({
                roundState,
                isAnimationResult: true
            });
        }

        this.setState({ roundState });
    }

    @render(SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    private renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        const { result, settlementResult } = currentFinish;

        if (!result || !settlementResult) {
            return;
        }

        const winningSymbols = this.getWinningSymbols(settlementResult);
        this.setState({
            result,
            isAnimationResult: true,
            isFinishShowResult: false,
            settlementResult,
            winningSymbols,
            isResultUpdated: true
        });
    }

    private getWinningSymbols(settlementResult: gc.GameServiceMessage.TSettlementResult): string[] {
        const winningSymbols: string[] = [];

        Object.entries(settlementResult).forEach(([key, value]) => {
            if (value) {
                winningSymbols.push(key);
            }
        });

        return winningSymbols;
    }

    @render(RoundHistoryStore, (store) => store.firstJoinGameHistory)
    private handleJoinGameAndShowResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        const { roundState } = this.state;

        if (roundState === ROUND_STATE.PLACING_BET || roundState === ROUND_STATE.LOCKING_BET) {
            return;
        }

        if (!firstJoinGameHistory) {
            return;
        }

        const result = gameStateService.handleGameHistory(firstJoinGameHistory);
        if (result && gameStateService.validateResult(result as ColorGameResult)) {
            this.setState({
                result,
                isFinishShowResult: true
            });
        }
        const lastRound = firstJoinGameHistory?.roundHistory;
        if (lastRound) {
            const winningSymbols = this.getWinningSymbols(lastRound?.settlementResult);
            this.setState({
                result: lastRound?.result,
                settlementResult: lastRound?.settlementResult,
                winningSymbols
            });
        }
    }

    @render(gc.Settlements.SettlementStore, (store) => store.isFinishedShowResult)
    finishShowResult(isFinishedShowResult: boolean) {
        this.setState({ isFinishShowResult: isFinishedShowResult });
    }

    renderWinnerDisplay = () => {
        const { settlementResult, result } = this.state;

        if (!settlementResult || Object.keys(settlementResult).length === 0 && result) {
            return null;
        }

        return this.state.isFinishShowResult ? <ResultDisplay
            result={result}
            language={this.props.language}
        /> : null;
    };

    renderIcons = (result: gc.GameServiceMessage.TResult) => {
        const { isAnimationResult } = this.state;

        const resultSymbols = Object.entries(result).map(([key, value]) => {
            return convertValueToSymbol(value);
        });

        const handleAnimationComplete = () => {
            this.setState({ isFinishShowResult: true });
        };

        const animationDuration = ANIMATION_DURATION_MS;
        const staggerDelay = 150;

        if (!isAnimationResult) {
            this.setState({ isFinishShowResult: true });
        }

        return (
            <div className={`${Styles['container-bets']} ${isAnimationResult ? Styles['has-animation'] : ''}`}>
                <div className={Styles['result-container']}>
                    {isAnimationResult ? (
                        <AnimatedDiceSet
                            finalSymbols={resultSymbols}
                            size={Size.large}
                            onAllAnimationsComplete={handleAnimationComplete}
                            staggerDelay={staggerDelay}
                        />
                    ) : (
                        Object.entries(result).map(([key, value], index) => {
                            const symbol = convertValueToSymbol(value);
                            return (
                                <div key={index} className={Styles['result-item']}>
                                    <ColorGameDice
                                        symbol={symbol}
                                        size={Size.large}
                                        isWooden={true}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                {this.renderWinnerDisplay()}
            </div>
        );
    };

    renderNoResultIcons = (): JSX.Element => {
        return (
            <div className={Styles['container-bets']}>
                <div className={Styles['result-container']}>
                    <div className={Styles['dice-empty']}>
                        <ColorGameDice symbol={ColorGameSymbol.EMPTY} size={Size.large} isWooden={true} />
                    </div>
                    <div className={Styles['dice-empty']}>
                        <ColorGameDice symbol={ColorGameSymbol.EMPTY} size={Size.large} isWooden={true} />
                    </div>
                    <div className={Styles['dice-empty']}>
                        <ColorGameDice symbol={ColorGameSymbol.EMPTY} size={Size.large} isWooden={true} />
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const isEmpty = (obj: object): boolean => {
            return !obj || Object.keys(obj).length === 0;
        };

        const { result, isResultUpdated } = this.state;

        if (!isResultUpdated || isEmpty(result as object)) {
            return this.renderNoResultIcons();
        }

        return this.renderIcons(result);
    }
} 