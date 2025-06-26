import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
@injectable()
export class DisabledGameStore {
    disabled = false;
    showPopup = false;
    um = false;

    constructor() {
        makeAutoObservable(this);
    }

    setGameStatus(disabled: boolean) {
        this.disabled = disabled;
    }

    setShowPopup(showPopup: boolean) {
        this.showPopup = showPopup;
    }
}
