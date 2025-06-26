import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { RoundPFStore } from "../../../game/round-pf";
import { SettlementStore } from "../../../game/settlements/settlement-store";
import { GameServiceMessage } from "../../../shared/models/game-messages";
import { ProvablyFairStore } from "./provably-fair-store";

@injectable()
export class PFVerificationStore {
    get verification(): GameServiceMessage.ProvablyFair {
        if (
            this.provablyFairStore.openVerification &&
            this.roundPFStore.pf &&
            this.roundPFStore.pf.roundId === this.provablyFairStore.openVerification.roundId
        ) {
            if (this.settlementStore.pf && this.settlementStore.pf.roundId === this.roundPFStore.pf.roundId) {
                const { roundId, serverSeedHash } = this.roundPFStore.pf;
                const { result, serverSeed, clientSeeds, mergeClientSeed, mergeSeed, finalHash } = this.settlementStore.pf;
                const pf = {
                    roundId,
                    serverSeedHash,
                    result,
                    serverSeed,
                    clientSeeds,
                    mergeClientSeed,
                    mergeSeed,
                    finalHash,
                };
                this.roundPFStore.pf = pf;
            }

            return this.roundPFStore.pf;
        }

        return null;
    }

    constructor(
        @inject(ProvablyFairStore) private readonly provablyFairStore: ProvablyFairStore,
        @inject(RoundPFStore) private readonly roundPFStore: RoundPFStore,
        @inject(SettlementStore) private readonly settlementStore: SettlementStore
    ) {
        makeAutoObservable(this);
    }
}
