import { inject, injectable } from "inversify";
import { GameServiceMessage, IMultipleHandlers } from "../../shared";
import { ChipStore } from "./chip-store";

@injectable()
export class ChipHandlers implements IMultipleHandlers {
    constructor(@inject(ChipStore) protected readonly store: ChipStore) {}

    eventHandleList = [
        {
            name: GameServiceMessage.Chips.eventName,
            handle: this.handleChips,
        },
        {
            name: GameServiceMessage.PlayerChip.eventName,
            handle: this.handlePlayerChip,
        },
        {
            name: GameServiceMessage.OwnChip.eventName,
            handle: this.handleOwnChip,
        },
        {
            name: GameServiceMessage.ReBet.eventName,
            handle: this.handleReBet,
        },
    ];

    handleChips(chips: GameServiceMessage.Chips) {
        this.store.chips = chips;
        this.store.convertChips();
    }

    handlePlayerChip(playerChip: GameServiceMessage.PlayerChip) {
        this.store.playerChip = playerChip;
        if (this.store.playerChip) {
            const { betChoice, amount } = this.store.playerChip;
            this.addChipToClientChips({ betChoice, amount });
        }
    }

    handleOwnChip(ownChip: GameServiceMessage.OwnChip) {
        this.store.ownChip = ownChip;
        this.addChipToClientChips(this.store.ownChip);
    }

    addChipToClientChips(chip: GameServiceMessage.OwnChip) {
        const { betChoice, amount } = chip;
        const betChoiceData = this.store.clientChips[betChoice] || {};
        const current = betChoiceData[amount] || 0;
        betChoiceData[amount] = current + 1;
        this.store.clientChips[betChoice] = betChoiceData;
    }

    handleReBet(reBet: GameServiceMessage.ReBet) {
        this.store.reBet = reBet;
    }
}
