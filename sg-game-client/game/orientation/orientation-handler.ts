import { inject, injectable } from "inversify";
import { toJS } from "mobx";
import { ChipStore } from "../chips";
import { RoundHistoryStore } from "../round-histories/round-history-store";
import { SettlementStore } from "../settlements/settlement-store";
import { Orientation, OrientationStore } from "./orientation-store";

@injectable()
export class OrientationHandler {
    constructor(
        @inject(OrientationStore) private readonly orientationStore: OrientationStore,
        @inject(SettlementStore) private readonly settlementStore: SettlementStore,
        @inject(RoundHistoryStore) private readonly roundHistoryStore: RoundHistoryStore,
        @inject(ChipStore) private readonly chipStore: ChipStore
    ) {}

    changeOrientation() {
        this.handleLastSettlement();
        this.orientationStore.orientation =
            this.orientationStore.orientation === Orientation.Landscape ? Orientation.Portrait : Orientation.Landscape;
        this.reactiveClientChips();
    }

    handleLastSettlement() {
        if (this.settlementStore.currentFinish && !this.settlementStore.isFinishedShowResult) {
            this.roundHistoryStore.insertNewRound(this.settlementStore.currentFinish);
        }
    }

    reactiveClientChips() {
        this.chipStore.clientChips = { ...toJS(this.chipStore.clientChips) };
    }
}
