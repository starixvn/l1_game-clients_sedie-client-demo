import { inject, injectable } from "inversify";
import { GameServiceMessage, IMultipleHandlers } from "../../shared";
import { RoundHistory, RoundHistoryStore } from "./round-history-store";

@injectable()
export class RoundHistoryHandlers implements IMultipleHandlers {
    constructor(@inject(RoundHistoryStore) protected readonly roundHistoryStore: RoundHistoryStore) {}

    eventHandleList = [
        {
            name: GameServiceMessage.roundHistory,
            handle: this.handleRoundHistory,
        },
    ];

    handleRoundHistory(roundHistories: RoundHistory[]) {
        this.roundHistoryStore.updateHistoriesInGame(roundHistories);
    }
}
