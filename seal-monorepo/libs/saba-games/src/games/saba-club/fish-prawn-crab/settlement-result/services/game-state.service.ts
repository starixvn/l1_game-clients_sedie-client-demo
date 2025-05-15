import * as gc from '@sg/sg-game-client';
import { FishPrawnCrabResult } from '../../type';

class GameStateService {
    handleGameHistory(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory): FishPrawnCrabResult | null {
        if (!firstJoinGameHistory?.roundHistory?.result) {
            return null;
        }
        return firstJoinGameHistory.roundHistory.result as unknown as FishPrawnCrabResult;
    }

    validateResult(result: FishPrawnCrabResult): boolean {
        if (!result) {
            return false;
        }
        return Object.keys(result).length > 0;
    }
}

export const gameStateService = new GameStateService(); 