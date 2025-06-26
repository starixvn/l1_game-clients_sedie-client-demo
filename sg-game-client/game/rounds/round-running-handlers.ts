import { inject, injectable } from "inversify";
import { GameSetting } from "../game-configs";
import { RoundTimeStore } from "./round-time-store";

@injectable()
export class RoundRunningHandlers {
    runnerId;

    constructor(
        @inject(RoundTimeStore) protected readonly roundTimeStore: RoundTimeStore,
        @inject(GameSetting) protected readonly gameSetting: GameSetting
    ) {}

    startRunner() {
        this.runnerId = setInterval(() => {
            this.roundTimeStore.countdown();
        }, 1000);
    }

    stopRunner() {
        clearInterval(this.runnerId);
        this.roundTimeStore.resetRoundTimeStore();
    }
}
