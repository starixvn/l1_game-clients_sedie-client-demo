import * as gc from "@sg/sg-game-client";
import type { Result } from "../../baccarat";

export interface GameState {
    result?: Result;
    roundState: string;
    isAnimationResult: boolean;
}

class GameStateService {
    public handleRoundState(roundState: string): void {
        if (!roundState) {
            throw new Error('Round state cannot be empty');
        }
    }

    public handleSettlement(currentFinish: gc.GameServiceMessage.Finish): Result | undefined {
        if (!currentFinish?.result) {
            return undefined;
        }
        return currentFinish.result as Result;
    }

    public handleGameHistory(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory): Result | undefined {
        if (!firstJoinGameHistory?.roundHistory?.result) {
            return undefined;
        }
        return firstJoinGameHistory.roundHistory.result as Result;
    }

    public validateResult(result: Result): boolean {
        return !!(
            result?.banker?.card1 &&
            result?.banker?.card2 &&
            result?.player?.card1 &&
            result?.player?.card2
        );
    }
}

export const gameStateService = new GameStateService(); 