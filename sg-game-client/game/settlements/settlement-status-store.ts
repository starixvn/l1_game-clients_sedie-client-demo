import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { GameServiceMessage } from "../../shared";

@injectable()
export class SettlementStatusStore {
    win = false;
    bet = 0;
    winningByChoices: GameServiceMessage.WinningByChoices = {};
    reachMaxWin = false;

    constructor() {
        makeAutoObservable(this);
    }

    setStatusStore(status: GameServiceMessage.Status) {
        this.win = status.win;
        this.bet = status.bet;
        this.winningByChoices = status.winningByChoices;
        this.reachMaxWin = status.reachMaxWin ?? false;
    }

    resetSettlementStatus() {
        this.win = false;
        this.bet = 0;
        this.reachMaxWin = false;
    }

    get settlementStatus(): GameServiceMessage.Status {
        return {
            win: this.win,
            bet: this.bet,
            winningByChoices: this.winningByChoices,
            reachMaxWin: this.reachMaxWin,
        };
    }
}
