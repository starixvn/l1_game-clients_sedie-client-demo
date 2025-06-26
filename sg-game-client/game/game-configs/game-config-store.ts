import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { GameServiceMessage } from "../../shared";
import { GameTurnBaseServiceMessage } from "../../game-turn-base/game-turn-base-messages";

@injectable()
export class GameConfigStore {
    minBet = 0;
    maxBet = 0;
    maxBetPerChoices: GameServiceMessage.MaxBetPerChoices = {};
    chips: string[] = [];
    stakeLevels: string[] = [];
    odds: GameServiceMessage.Odds = {};
    enableFreeBet = false;
    originalOdds?: GameServiceMessage.Odds = null;
    boostedChoices?: string[] = [];
    oddsRange?: GameTurnBaseServiceMessage.OddsRange = null;
    initialized = false;

    constructor() {
        makeAutoObservable(this);
    }

    setGameConfigs(gameConfigs: GameServiceMessage.GameConfigs) {
        if (gameConfigs) {
            this.initialized = true;
            if (gameConfigs.enableFreeBet === undefined) {
                gameConfigs.enableFreeBet = false;
            }
            Object.assign(this, gameConfigs);
        }
    }
}
