import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

export type DynamicObject<T> = {
    [key: string]: T;
};

export type BetHistoryLog = {
    time: string;
    roundId: number;
    win: number;
    betwin: number;
    totalAmount: number;
    freeBet: boolean;
    winLoss?: number;
    odds: DynamicObject<number>;
    result: DynamicObject<object>;
    settlementResult: DynamicObject<boolean>;
    betLogDetails?: Array<DynamicObject<object>>;
    verifiable?: boolean;
};

export type BetHistoryModel = {
    page: number;
    pageSize: number;
    total: number;
    betLogs: Array<BetHistoryLog>;
};

@injectable()
export class BetHistoryStore {
    constructor() {
        makeAutoObservable(this);
    }

    betHistoryModel: BetHistoryModel = null;

    setData(betHistoryModel: BetHistoryModel) {
        this.betHistoryModel = betHistoryModel;
    }
}
