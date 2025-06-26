import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

@injectable()
export class GameGuideStore {
    url = "";

    constructor() {
        makeAutoObservable(this);
    }
}
