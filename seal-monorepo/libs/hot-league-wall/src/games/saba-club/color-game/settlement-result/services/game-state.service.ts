import * as gc from '@sg/sg-game-client';
import { ColorGameResult } from '../../type';

class GameStateService {
    handleGameHistory(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory): ColorGameResult | null {
        if (!firstJoinGameHistory?.roundHistory?.result) {
            return null;
        }
        return firstJoinGameHistory.roundHistory.result as unknown as ColorGameResult;
    }

    validateResult(result: ColorGameResult): boolean {
        if (!result) {
            return false;
        }
        return Object.keys(result).length > 0;
    }
}

export const gameStateService = new GameStateService(); 