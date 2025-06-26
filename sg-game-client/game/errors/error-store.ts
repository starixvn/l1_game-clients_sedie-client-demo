import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { GameServiceMessage } from "../../shared";
@injectable()
export class ErrorStore {
    apiError: GameServiceMessage.ApiError = null;
    constructor() {
        makeAutoObservable(this);
    }
}
