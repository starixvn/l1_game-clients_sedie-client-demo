import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

@injectable()
export class GuidePFStore {
    url = "";

    constructor() {
        makeAutoObservable(this);
    }
}
