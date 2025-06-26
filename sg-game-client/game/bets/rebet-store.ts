import { inject, injectable } from "inversify";
import * as _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import { StorageManager, localStorageKeys } from "../../exports";
import { GameServiceMessage } from "../../shared";
import { GameSetting } from "../game-configs";
import { RoundStore, RoundTimeStore } from "../rounds";

export type Bets = {
    [betChoice: string]: number;
};

export type RoundOdds = {
    odds: GameServiceMessage.Odds;
    fractional: boolean;
};

export type IRuleShowReBet = {
    roundId: number;
};

@injectable()
export class ReBetStore {
    constructor(
        @inject(RoundStore) protected readonly roundStore: RoundStore,
        @inject(GameSetting) protected readonly gameSetting: GameSetting,
        @inject(RoundTimeStore) protected readonly roundTimeStore: RoundTimeStore
    ) {
        makeAutoObservable(this);

        reaction(
            () => this.roundStore.ownBets,
            (ownBets) => !_.isEmpty(ownBets) && this.updateStorageBetBet()
        );
    }

    ruleShowReBet: IRuleShowReBet = {
        roundId: 0,
    };

    get keyStorageReBet() {
        return `${localStorageKeys.ruleReBet}_${this.gameSetting.id}`;
    }

    get isShowBtnReBet() {
        if (!this.ruleShowReBet?.roundId || !this.roundTimeStore.isPlacingBet) {
            return false;
        }

        const { roundId } = this.ruleShowReBet;
        return roundId === this.roundStore.clientRoundId - 1;
    }

    updateStorageBetBet() {
        if (this.roundStore.clientRoundId > 0 && this.roundTimeStore.isPlacingBet) {
            const ruleReBet = { roundId: this.roundStore.clientRoundId };
            this.ruleShowReBet = ruleReBet;

            StorageManager.set(this.keyStorageReBet, ruleReBet);
        }
    }
}
