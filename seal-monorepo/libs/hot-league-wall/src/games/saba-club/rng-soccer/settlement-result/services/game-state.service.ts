import * as gc from "@sg/sg-game-client";
import { ROUND_STATE } from "@sg/sg-game-client/dist/game/rounds";
import type { RNGSoccerResult } from "../../type";

class GameStateService {
    private currentRoundState: string = '';

    handleRoundState(roundState: string): void {
        this.currentRoundState = roundState;
    }

    handleSettlement(currentFinish: any): RNGSoccerResult | null {
        if (!currentFinish || !currentFinish.result) {
            return null;
        }

        try {
            // Map the incoming data structure to our expected RNGSoccerResult format
            const result: RNGSoccerResult = {
                // Set scores based on settlement result
                homeScore: currentFinish.settlementResult?.home ? 1 : 0,
                awayScore: currentFinish.settlementResult?.away ? 1 : 0,

                // Map card values from the incoming format
                home: {
                    rank: currentFinish.result.home.rank || 0,  // Card value (1-13)
                    suit: currentFinish.result.home.suit % 2    // Even suits (0,2) are black, odd suits (1,3) are red
                },

                away: {
                    rank: currentFinish.result.away.rank || 0,
                    suit: currentFinish.result.away.suit % 2
                }
            };

            return result;
        } catch (error) {
            // Handle any mapping errors
            return null;
        }
    }

    handleGameHistory(history: gc.RoundHistories.IFirstJoinGameHistory): RNGSoccerResult | null {
        if (!history || !history.roundHistory || !history.roundHistory.result) {
            return null;
        }

        try {
            // Parse the history result
            const historyData = typeof history.roundHistory.result === 'string'
                ? JSON.parse(history.roundHistory.result)
                : history.roundHistory.result;

            // Check if we have the new format directly in the result
            if (historyData.result && historyData.settlementResult) {
                return this.handleSettlement(historyData);
            }

            // Check if the data is wrapped inside a finish property
            else if (historyData.finish && historyData.finish.result && historyData.finish.settlementResult) {
                return this.handleSettlement(historyData.finish);
            }

            // Default fallback for legacy format
            return null;
        } catch (error) {
            // Handle any parsing errors
            return null;
        }
    }

    validateResult(result: RNGSoccerResult): boolean {
        return (
            result !== undefined &&
            typeof result.homeScore === 'number' &&
            typeof result.awayScore === 'number' &&
            result.home !== undefined &&
            result.away !== undefined
        );
    }

    async showResult(hasAnimation: boolean,
        result?: RNGSoccerResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ) {
        if (!result) return;

        // Update the previous winning bet based on the settlement result
        if (settlementResult && this.currentRoundState == ROUND_STATE.LOCKING_BET) {
            // Find the winning bet choice (home, away, or draw)
            const winningBet = Object.entries(settlementResult).find(([_, value]) => Boolean(value))?.[0];
            // No setState here as it's not available on this service
        }
    }
}

export const gameStateService = new GameStateService(); 