import * as gc from '@sg/sg-game-client';

import { SedieResult } from '../../type';

export interface GameState {
    result?: SedieResult;
    roundState: string;
    isAnimationResult: boolean;
}

class GameStateService {
    public handleRoundState(roundState: string): void {
        if (!roundState) {
            throw new Error('Round state cannot be empty');
        }
    }

    public handleSettlement(currentFinish: gc.GameServiceMessage.Finish): SedieResult | undefined {
        if (!currentFinish?.result) {
            return undefined;
        }
        return currentFinish.result as SedieResult;
    }

    public handleGameHistory(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory): SedieResult | undefined {
        if (!firstJoinGameHistory?.roundHistory?.result) {
            return undefined;
        }
        return firstJoinGameHistory.roundHistory.result as SedieResult;
    }

    public validateResult(result: SedieResult): boolean {
        Object.keys(result).forEach((key) => {
            if ((key as keyof SedieResult) === undefined) {
                return false;
            }
        });
        return true;
    }
}

export const gameStateService = new GameStateService();
