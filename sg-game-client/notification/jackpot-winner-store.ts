import { injectable, inject } from "inversify";
import { makeAutoObservable } from "mobx";
import { NotificationServiceMessage } from "../shared/models/game-messages";
import { MainPlayerStore } from "../players/main-player-store";
import { NumberUtils } from "../shared/utils";

@injectable()
export class JackpotWinnerStore {
    constructor(@inject(MainPlayerStore) private readonly mainPlayerStore: MainPlayerStore) {
        makeAutoObservable(this);
    }

    private _jackpotWinner: NotificationServiceMessage.JackpotWinner = null;

    setJackpotWinner(jackpotWinner: NotificationServiceMessage.JackpotWinner) {
        if (this.isInvalidJackpotNotification(jackpotWinner)) {
            return;
        }
        this._jackpotWinner = jackpotWinner;
    }

    get jackpotWinner() {
        if (this._jackpotWinner) {
            const data = { ...this._jackpotWinner };
            data.amount = NumberUtils.getValueByCurrency(data.amount, this.mainPlayerStore.rate);
            return data;
        }
        return this._jackpotWinner;
    }

    private isInvalidJackpotNotification(jackpotWinner: NotificationServiceMessage.JackpotWinner) {
        return (
            this.mainPlayerStore.disableJackpotGames ||
            !this.mainPlayerStore.offerGames?.some((game) => game.gameId === jackpotWinner.gameId) ||
            this.mainPlayerStore.name === jackpotWinner.winnerName
        );
    }
}
