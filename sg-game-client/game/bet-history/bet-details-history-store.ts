import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";

import { MainPlayerStore } from "../../players";
import { BetHistoryLog } from "./bet-history-store";

export type BetDetailModel = {
    fractionalOddsFormat: boolean;
    betHistoryLog: BetHistoryLog;
};

@injectable()
export class BetDetailHistoryStore {
    constructor(@inject(MainPlayerStore) protected readonly mainPlayerStore: MainPlayerStore) {
        makeAutoObservable(this);
    }

    model: BetDetailModel = null;

    setData(betHistoryLog: BetHistoryLog) {
        this.model = {
            fractionalOddsFormat: this.mainPlayerStore.fractionalOddsFormat,
            betHistoryLog: betHistoryLog,
        };
    }
}
