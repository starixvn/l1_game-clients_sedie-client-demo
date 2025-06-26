import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

@injectable()
export class DialogsStore {
    constructor() {
        makeAutoObservable(this);
    }
    forceClosed = null;
}
