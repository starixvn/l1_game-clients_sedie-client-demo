import * as gc from "@sg/sg-game-client";
import { RoundHistoryStore } from "@sg/sg-game-client/dist/game/round-histories";
import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { SettlementStore } from "@sg/sg-game-client/dist/game/settlements";
import { observer, render } from "@sg/sg-observer";
import { ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { setting } from "../game-settings";
import { ErrorBoundary } from "./components";
import { gameStateService } from "./services/game-state.service";

// Import new components and utilities
import { GameDisplay } from "./components";
import { GameResult, TeamsData } from "./models";

import type { RNGSoccerResult } from '../type';
import type { IPropsObserver, IStateObserver } from '../../../../_shared/components/observer-component/observer-component';

interface IRNGSoccerSettlementResultState extends IStateObserver {
    result?: RNGSoccerResult;
    roundState: string;
    isAnimationResult: boolean;
    isLoading: boolean;
    error?: Error;
    isFinish: boolean;
    isFinishShowResult: boolean;
    teamData: TeamsData;
}

@observer(setting.mainObserverNamespace)
export default class RNGSoccerSettlementResult extends ObserverComponent<IPropsObserver, IRNGSoccerSettlementResultState> {
    constructor(props: IPropsObserver) {
        super(props);

        // Use the GameResult class to get default team data
        this.state = {
            dispose: null,
            result: undefined,
            roundState: '',
            isAnimationResult: false,
            isLoading: true,
            error: undefined,
            isFinish: false,
            isFinishShowResult: false,
            teamData: GameResult.getDefaultTeamData()
        };
    }

    @render(gc.Settlements.SettlementStore, (store) => store.isFinishedShowResult)
    finishShowResult(isFinishedShowResult: boolean) {
        this.setState({ isFinishShowResult: isFinishedShowResult });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => ({ teamData: store.teamData, roundState: store.roundState }))
    renderTeamDataState(data: { teamData: any, roundState: string }) {
        if (data.roundState === ROUND_STATE.PLACING_BET) {
            const { home, away } = data.teamData;
            const teamData = GameResult.updateTeamData({
                home: home,
                away: away
            });

            this.setState({ teamData: teamData});
        }
    }

    @render(RoundTimeStore, (store) => store.roundState)
    private handleRoundState(roundState: string): void {
        try {
            if (
                roundState === ROUND_STATE.PLACING_BET ||
                roundState === ROUND_STATE.LOCKING_BET
            ) {
                this.setState({ isFinish: false });
            }
            gameStateService.handleRoundState(roundState);
            this.setState({ roundState, isLoading: false });
        } catch (error) {
            this.setState({ error: error as Error });
        }
    }

    @render(SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    private handleCurrentFinish(currentFinish: gc.GameServiceMessage.Finish): void {
        try {
            console.log('RNGSoccerSettlementResult handleCurrentFinish', currentFinish);
            // Get the result from the game state service
            const result = gameStateService.handleSettlement(currentFinish);

            // Only update state if we have a valid result
            if (result && gameStateService.validateResult(result)) {
                // Show cards with animation
                this.setState({
                    result,
                    isAnimationResult: true,
                    isLoading: false,
                    isFinish: true,
                });

                // Optional: Add timer to trigger any card flip animations
                setTimeout(() => {
                    this.setState({ isAnimationResult: false });
                }, 2000); // Animation duration in ms
            } else {
                // If we don't have a valid result, ensure we're not showing loading
                this.setState({
                    isLoading: false
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
            // Get the result from the game state service
            const result = gameStateService.handleGameHistory(firstJoinGameHistory);

            // Only update state if we have a valid result
            if (result && gameStateService.validateResult(result)) {

                this.setState({
                    result,
                    isLoading: false,
                    isFinish: true,
                    isFinishShowResult: true
                });
            } else {
                // If we don't have a valid result, ensure we're not showing loading
                this.setState({
                    isLoading: false
                });
            }
        } catch (error) {
            this.setState({ error: error as Error });
        }
    }

    render(): JSX.Element {
        const {
            result,
            teamData,
            roundState,
            isFinish,
            isAnimationResult,
            isFinishShowResult,
            isLoading,
            error,
        } = this.state;

        return (
            <ErrorBoundary>
                {error ? (
                    // If there's an error, let ErrorBoundary handle it
                    (() => { throw error; })()
                ) : (
                    // Otherwise, render the game display
                    <GameDisplay
                        result={result}
                        teamData={teamData}
                        roundState={roundState}
                        isFinish={isFinish}
                        isAnimationResult={isAnimationResult}
                        isFinishShowResult={isFinishShowResult}
                        isLoading={isLoading}
                    />
                )}
            </ErrorBoundary>
        );
    }
} 