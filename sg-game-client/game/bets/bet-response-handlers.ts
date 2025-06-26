import { inject, injectable } from "inversify";
import { reaction } from "mobx";

import { GameServiceMessage, IMultipleHandlers } from "../../shared";
import { ConnectionHandlers } from "../connection";
import { RoundTimeStore } from "../rounds";
import { BetStore } from "./bet-store";

@injectable()
export class BetResponseHandlers implements IMultipleHandlers {
    constructor(
        @inject(BetStore) protected readonly betStore: BetStore,
        @inject(RoundTimeStore) protected readonly roundTimeStore: RoundTimeStore,
        @inject(ConnectionHandlers.RetryGameHandler) protected readonly retryGameHandler: ConnectionHandlers.RetryGameHandler
    ) {
        reaction(
            () => this.roundTimeStore.isWaiting,
            (isWaiting) => isWaiting && this.stopProcessingBetAndClearInterval()
        );
    }

    handleBetResponse(endBet: number) {
        this.stopProcessingBetAndClearInterval();
        this.betStore.lastReceivedBet = { value: endBet, isAnimated: true };
        endBet > 0 && (this.betStore.validBet = { value: true });
    }

    stopProcessingBetAndClearInterval() {
        this.betStore.isProcessingBet = false;
        this.betStore.validBet = { value: false };
        this.retryGameHandler.clearInterval();
    }

    handleBetChoice(betChoice: string) {
        this.betStore.betChoice = betChoice;
    }

    eventHandleList = [
        {
            name: GameServiceMessage.BetResponse.eventName,
            handle: this.handleBetResponse,
        },
        {
            name: GameServiceMessage.betChoice,
            handle: this.handleBetChoice,
        },
    ];
}
