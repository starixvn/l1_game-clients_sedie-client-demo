import { inject, injectable } from "inversify";

import { IHandler } from "../../shared";
import { BetDetailHistoryStore } from "./bet-details-history-store";
import { BetHistoryLog } from "./bet-history-store";

@injectable()
export class BetDetailsHandlers implements IHandler<BetHistoryLog> {
    constructor(
        @inject(BetDetailHistoryStore)
        private readonly betDetailStore: BetDetailHistoryStore
    ) {}

    handle(betHistoryLog: BetHistoryLog) {
        this.betDetailStore.setData(betHistoryLog);
    }
}
