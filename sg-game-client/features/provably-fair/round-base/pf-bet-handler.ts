import { inject, injectable } from "inversify";
import { BetHandlerBase } from "../../../game/bets/bet-handler-base";
import { BetStore } from "../../../game/bets/bet-store";
import { ConnectionHandlers, ConnectionStore } from "../../../game/connection";
import { GameSetting } from "../../../game/game-configs/game-setting";
import { NoticeStore } from "../../../game/notices";
import { OrientationStore } from "../../../game/orientation";
import { RoundStore, RoundTimeStore } from "../../../game/rounds";
import { MainPlayerStore } from "../../../players";
import { ProvablyFairStore } from "./provably-fair-store";

@injectable()
export class PFBetHandler extends BetHandlerBase {
    constructor(
        @inject(ConnectionStore) protected readonly connectionStore: ConnectionStore,
        @inject(BetStore) protected readonly betStore: BetStore,
        @inject(MainPlayerStore) protected readonly mainPlayerStore: MainPlayerStore,
        @inject(OrientationStore) protected readonly orientationStore: OrientationStore,
        @inject(RoundTimeStore) protected readonly roundTimeStore: RoundTimeStore,
        @inject(NoticeStore) protected readonly noticeStore: NoticeStore,
        @inject(ConnectionHandlers.RetryGameHandler) protected readonly retryGameHandler: ConnectionHandlers.RetryGameHandler,
        @inject(GameSetting) protected readonly gameSetting: GameSetting,
        @inject(RoundStore) private readonly roundStore: RoundStore,
        @inject(ProvablyFairStore) private readonly pfStore: ProvablyFairStore
    ) {
        super(connectionStore, betStore, mainPlayerStore, orientationStore, roundTimeStore, noticeStore, retryGameHandler, gameSetting);
    }

    handle(betChoice: string) {
        const betData = this.createBetData({ betChoice });
        this.handleBetData(betData);
    }

    override getBetAmount(): number {
        return this.betStore.amount;
    }

    override createBetData(data: any) {
        const betData = super.createBetData(data);
        return Object.assign(betData, {
            roundId: this.roundStore.clientRoundId,
            clientSeed: this.pfStore.clientSeed,
        });
    }
}
