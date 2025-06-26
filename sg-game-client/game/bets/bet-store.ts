import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { MainPlayerStore } from "../../players";

export interface IStakeLevel {
    minBet: number;
    maxBet: number;
}

export interface ILastReceivedBet {
    value: number;
    isAnimated: boolean;
}

export interface IValidBet {
    value: boolean;
}

@injectable()
export class BetStore {
    constructor(@inject(MainPlayerStore) private readonly mainPlayerStore: MainPlayerStore) {
        makeAutoObservable(this);
    }

    private _amount = 1;
    private _isProcessingBet: boolean = false;
    freebetEnabled = false;

    get availableBalance() {
        return this.freebetEnabled ? this.mainPlayerStore.scoin : this.mainPlayerStore.balance;
    }

    get amount() {
        return this._amount;
    }

    set amount(amount: number) {
        this._amount = amount;
    }

    private _lastReceivedBet: ILastReceivedBet = null;

    get isProcessingBet() {
        return this._isProcessingBet;
    }

    set isProcessingBet(isProcessingBet: boolean) {
        this._isProcessingBet = isProcessingBet;
    }

    get lastReceivedBet() {
        return this._lastReceivedBet;
    }

    set lastReceivedBet(lastReceivedBet: ILastReceivedBet) {
        this._lastReceivedBet = lastReceivedBet;
    }

    private _validBet = null;
    get validBet() {
        return this._validBet;
    }

    set validBet(validBet: IValidBet) {
        this._validBet = validBet;
    }

    private _betChoice = null;

    get betChoice() {
        return this._betChoice;
    }

    set betChoice(betChoice: string) {
        this._betChoice = betChoice;
    }
}
