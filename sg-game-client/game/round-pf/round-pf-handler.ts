import { inject, injectable } from "inversify";
import { reaction, when } from "mobx";
import { GameClientEmitMessage, GameServiceMessage, IMultipleHandlers } from "../../shared";
import { ConnectionStore } from "../connection/connection-store";
import { RoundStore } from "../rounds/round-store";
import { RoundPFStore } from "./round-pf-store";

@injectable()
export class RoundPFHandler implements IMultipleHandlers {
    constructor(
        @inject(RoundPFStore) protected readonly roundPFStore: RoundPFStore,
        @inject(ConnectionStore) protected readonly connectionStore: ConnectionStore,
        @inject(RoundStore) protected readonly roundStore: RoundStore
    ) {
        when(
            () => this.roundStore.clientRoundId > 0 && this.roundStore.roundId > 0,
            () => {
                this.requestRoundPF(this.roundStore.clientRoundId, true);
            }
        );

        reaction(
            () => this.roundPFStore.intervalPF,
            () => {
                if (this.roundPFStore.intervalPF) {
                    const { roundId, serverSeedHash, result, serverSeed, clientSeeds, mergeClientSeed, mergeSeed, finalHash } =
                        this.roundPFStore.intervalPF;
                    this.roundPFStore.currentPF = {
                        roundId,
                        serverSeedHash,
                        result,
                        serverSeed,
                        clientSeeds,
                        mergeClientSeed,
                        mergeSeed,
                        finalHash,
                    };
                }
            }
        );
    }

    requestForCurrentRound = false;

    eventHandleList = [
        {
            name: GameServiceMessage.RoundPFResult.eventName,
            handle: this.handleReceiveRoundPF,
        },
        {
            name: GameServiceMessage.ProvablyFair.eventName,
            handle: this.handleIntervalPF,
        },
    ];

    handleIntervalPF(pf: GameServiceMessage.ProvablyFair) {
        this.roundPFStore.intervalPF = pf;
    }

    requestRoundPF(roundId: number, requestForCurrentRound = false) {
        this.requestForCurrentRound = requestForCurrentRound;
        this.connectionStore.send(GameClientEmitMessage.RoundPF.eventName, { roundId });
    }

    handleReceiveRoundPF(roundPFResult: GameServiceMessage.RoundPFResult) {
        if (!roundPFResult) {
            return;
        }
        if (this.requestForCurrentRound) {
            this.roundPFStore.currentPF = roundPFResult;
        } else {
            this.roundPFStore.pf = roundPFResult;
        }
    }
}
