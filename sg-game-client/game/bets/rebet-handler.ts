import { inject, injectable } from "inversify";
import { IRuleShowReBet, ReBetStore } from "./rebet-store";

import { StorageManager } from "../../exports";
import { GameClientEmitMessage, IHandler } from "../../shared";
import { ConnectionStore } from "../connection";
import { OrientationStore } from "../orientation";
import { BetHandler } from "./bet-handler";
import { BetStore } from "./bet-store";

export namespace ReBetHandlers {
    @injectable()
    export class ReBetHandler {
        constructor(
            @inject(ConnectionStore) private readonly connectionStore: ConnectionStore,
            @inject(BetStore) private readonly betStore: BetStore,
            @inject(OrientationStore) private readonly orientationStore: OrientationStore,
            @inject(BetHandler) private readonly betHandler: BetHandler
        ) {}

        handle() {
            if (this.betHandler.isInPhasePreventBet()) {
                return;
            }

            if (this.betStore?.isProcessingBet) {
                this.betHandler.showWarningProcessingBet();
                return;
            }

            this.betStore.isProcessingBet = true;
            this.connectionStore.send(GameClientEmitMessage.reBet, { m: this.orientationStore.m });
        }
    }

    @injectable()
    export class LoadRuleReBetStorage implements IHandler<void> {
        constructor(@inject(ReBetStore) private readonly reBetStore: ReBetStore) {}

        handle() {
            const storageReBet = StorageManager.get(this.reBetStore.keyStorageReBet) as IRuleShowReBet;
            if (storageReBet?.roundId) {
                this.reBetStore.ruleShowReBet = storageReBet;
            }
        }
    }
}
