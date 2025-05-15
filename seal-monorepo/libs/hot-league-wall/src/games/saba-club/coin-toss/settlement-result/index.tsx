import * as gc from "@sg/sg-game-client";
import { Settlements } from '@sg/sg-game-client';
import { RoundHistoryStore } from "@sg/sg-game-client/dist/game/round-histories";
import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { SettlementStore } from "@sg/sg-game-client/dist/game/settlements";
import { render, handle } from "@sg/sg-observer";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { CoinTossResult, CoinTossChoices } from "../type";
import Styles from "./coin-toss-animations.module.scss";
import { gameStateService } from "./services/game-state.service";
import { choiceToSymbolMap } from "../coin-toss-utils";
import { ResultDisplay } from "./result-display";
import { Size } from "../../../../_shared/constants";
import Coin, { CoinSymbol } from "../../../../_shared/components/coin";
import AnimatedCoin from "../../../../_shared/components/coin/animated-coin";

const DEFAULT_RESULT = {};

const POP_UP_ANIMATION_DURATION = 0.3;

export interface ICoinTossSettlementResultState extends IStateObserver {
    result: gc.GameServiceMessage.TResult;
    roundState: string;
    isAnimationResult: boolean;
    isFinishShowResult: boolean;
    settlementResult: gc.GameServiceMessage.TSettlementResult;
    winningSymbols: string[];
    isResultUpdated: boolean;
}

export default class CoinTossSettlementResult extends ObserverComponent<IPropsObserver, ICoinTossSettlementResultState> {
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
        if (result && gameStateService.validateResult(result as CoinTossResult)) {
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

        const resultChoice = Object.entries(result).find(([key, value]) => {
            return value;
        });

        const resultChoiceKey = resultChoice?.[0];

        const resultSymbol = choiceToSymbolMap[resultChoiceKey as CoinTossChoices];

        if (!isAnimationResult) {
            this.setState({ isFinishShowResult: true });
        }

        return (
            <div className={`${Styles['container-bets']} ${isAnimationResult ? Styles['has-animation'] : ''}`}>
                <div className={Styles['result-container']}>
                    {isAnimationResult ? (
                        <AnimatedCoin result={resultSymbol} />
                    ) : (
                        <div className={Styles['result-item']}>
                            <Coin coinType={resultSymbol} size={Size.large} />
                        </div>
                    )}
                </div>
                {this.renderWinnerDisplay()}
            </div>
        );
    };

    renderNoResultIcons = (): JSX.Element => {
        return (
            <div className={`${Styles['container-bets']} ${Styles['pop-in-animation']}`}>
                <div className={Styles['result-container']}>
                    <Coin
                        coinType={CoinSymbol.EMPTY}
                        size={Size.large}
                    />
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