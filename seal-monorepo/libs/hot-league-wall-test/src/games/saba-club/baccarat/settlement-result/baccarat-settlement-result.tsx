import * as gc from "@sg/sg-game-client";
import { RoundHistoryStore } from "@sg/sg-game-client/dist/game/round-histories";
import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { SettlementStore } from "@sg/sg-game-client/dist/game/settlements";
import { observer, render } from "@sg/sg-observer";

import { EmptyCardIndex } from "../../../../_shared/components/card";
import { ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { setting } from "../game-settings";
import { CardDisplay } from "./components/card-display";
import { ErrorBoundary } from "./components/error-boundary";
import { Loading } from "./components/loading";
import { gameStateService } from "./services/game-state.service";
import Styles from "./styles/baccarat-animations.module.scss";

import type { Result } from '../baccarat';
import type { IPropsObserver, IStateObserver } from '../../../../_shared/components/observer-component/observer-component';
const DEFAULT_RESULT: Result = {
    banker: {
        card1: { card: EmptyCardIndex, type: 0 },
        card2: { card: EmptyCardIndex, type: 0 },
    },
    player: {
        card1: { card: EmptyCardIndex, type: 1 },
        card2: { card: EmptyCardIndex, type: 1 },
    },
};

interface IBaccaratSettlementResultState extends IStateObserver {
    result?: Result;
    roundState: string;
    isAnimationResult: boolean;
    isLoading: boolean;
    error?: Error;
    currentDemoIndex: number;
    isFinish: boolean;
    isFinishShowResult: boolean;
    isHideAllCards: boolean;
}

@observer(setting.mainObserverNamespace)
export default class BaccaratSettlementResult extends ObserverComponent<IPropsObserver, IBaccaratSettlementResultState> {
    constructor(props: IPropsObserver) {
        super(props);
        this.state = {
            dispose: null,
            result: undefined,
            roundState: '',
            isAnimationResult: false,
            isLoading: true,
            error: undefined,
            currentDemoIndex: 0,
            isFinish: false,
            isFinishShowResult: false,
            isHideAllCards: false,
        };
    }

    @render(gc.Settlements.SettlementStore, (store) => store.isFinishedShowResult)
    finishShowResult(isFinishedShowResult: boolean) {
        this.setState({ isFinishShowResult: isFinishedShowResult });
    }

    @render(RoundTimeStore, (store) => store.isStartingRound)
    private handleStartNewRound(isStartingRound: boolean): void {
        this.setState({ isHideAllCards: isStartingRound });
    }

    @render(RoundTimeStore, (store) => store.roundState)
    private handleRoundState(roundState: string): void {
        try {
            if (
                roundState === ROUND_STATE.STARTING_ROUND ||
                roundState === ROUND_STATE.PLACING_BET ||
                roundState === ROUND_STATE.LOCKING_BET
            ) {
                this.setState({ isFinish: false });
            }
            gameStateService.handleRoundState(roundState);
            this.setState({ roundState, isLoading: false, isFinishShowResult: false });
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
                this.setState({ result, isAnimationResult: true, isLoading: false, isFinish: true });
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
                this.setState({ result, isLoading: false, isFinish: true, isFinishShowResult: true });
            }
        } catch (error) {
            this.setState({ error: error as Error });
        }
    }

    private renderCardDisplay(): JSX.Element | null {
        const { result, isAnimationResult, isFinish, roundState, isFinishShowResult, isHideAllCards } = this.state;
        const language = this.props.language || gc.Translator.getCurrentLanguageId();

        if (!result || !isFinish || roundState === ROUND_STATE.PLACING_BET || roundState === ROUND_STATE.LOCKING_BET) {
            return (
                <CardDisplay
                    isFinishShowResult={isFinishShowResult}
                    result={DEFAULT_RESULT}
                    isAnimationResult={false}
                    isShowResult={false}
                    language={language}
                    isHideAllCards={isHideAllCards}
                />
            );
        }

        return (
            <CardDisplay
                isFinishShowResult={isFinishShowResult}
                result={result}
                isAnimationResult={isAnimationResult}
                isShowResult={true}
                language={language}
                isHideAllCards={isHideAllCards}
            />
        );
    }

    private renderContent(): JSX.Element {
        const { isLoading, error } = this.state;

        if (error) {
            throw error;
        }

        if (isLoading) {
            return <Loading message="Loading game results..." />;
        }

        return <div className={Styles['settlement-container']}>{this.renderCardDisplay()}</div>;
    }

    render(): JSX.Element {
        return <ErrorBoundary>{this.renderContent()}</ErrorBoundary>;
    }
}
