import { inject, injectable } from "inversify";
import { IHandler } from "../../shared";
import { RoundHistoryStore } from "../round-histories";
import { SettlementStore } from "./settlement-store";

export namespace SettlementUIHandlers {
    @injectable()
    export class FinishedShowResult implements IHandler<void> {
        constructor(
            @inject(SettlementStore) protected readonly settlementStore: SettlementStore,
            @inject(RoundHistoryStore) protected readonly roundHistoryStore: RoundHistoryStore
        ) { }
        handle() {
            this.handleFinishedShowResult();
            const { roundId, result, settlementResult, md5Result } = this.settlementStore;
            this.roundHistoryStore.insertNewRound({ roundId, result, settlementResult, md5Result });
        }

        handleFinishedShowResult() {
            this.settlementStore.isFinishedShowResult = true;
        }
    }
}
