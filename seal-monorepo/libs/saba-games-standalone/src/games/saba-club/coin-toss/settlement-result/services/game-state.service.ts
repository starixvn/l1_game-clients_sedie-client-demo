import * as gc from '@sg/sg-game-client';
import { CoinTossResult } from '../../type';

class GameStateService {
    handleGameHistory(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory): CoinTossResult | null {
        if (!firstJoinGameHistory?.roundHistory?.result) {
            return null;
        }
        return firstJoinGameHistory.roundHistory.result as unknown as CoinTossResult;
    }

    validateResult(result: CoinTossResult): boolean {
        if (!result) {
            return false;
        }
        return Object.keys(result).length > 0;
    }
}

export const gameStateService = new GameStateService(); 