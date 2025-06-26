import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { GameServiceMessage } from "../../shared";

@injectable()
export class RoundPFStore {
    constructor() {
        makeAutoObservable(this);
    }
    pf: GameServiceMessage.RoundPFResult = null;
    intervalPF: GameServiceMessage.RoundPFResult = null;

    currentPF: GameServiceMessage.RoundPFResult = null;
}
