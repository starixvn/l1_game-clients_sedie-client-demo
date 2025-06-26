import { inject, injectable } from "inversify";
import { GameServiceMessage, IMultipleHandlers } from "../../shared";
import { Translator } from "../../shared/utils";
import { NoticeStore } from "../notices/notice-store";
import { SettlementStatusStore } from "./settlement-status-store";
import { SettlementStore } from "./settlement-store";

@injectable()
export class SettlementHandlers implements IMultipleHandlers {
    constructor(
        @inject(SettlementStore) protected readonly settlementStore: SettlementStore,
        @inject(SettlementStatusStore) protected readonly statusStore: SettlementStatusStore,
        @inject(NoticeStore) protected readonly noticeStore: NoticeStore
    ) {}

    handleFinish(finish: GameServiceMessage.Finish | undefined) {
        this.settlementStore.setSettlementStore(finish);
    }

    handleStatus(status: GameServiceMessage.Status) {
        this.statusStore.setStatusStore(status);
    }

    handleWinners(winners: GameServiceMessage.Winners) {
        this.settlementStore.winningPlayers = winners.winningPlayers;
    }

    handleReachMaxWin() {
        this.noticeStore.addWarning(Translator.commonTranslate("you_reach_max_win"));
    }

    eventHandleList = [
        {
            name: GameServiceMessage.Finish.eventName,
            handle: this.handleFinish,
        },
        {
            name: GameServiceMessage.Status.eventName,
            handle: this.handleStatus,
        },
        {
            name: GameServiceMessage.Winners.eventName,
            handle: this.handleWinners,
        },
    ];
}
