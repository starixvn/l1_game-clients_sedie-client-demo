import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

export enum GameUserSettingAction {
    Clear,
    Load,
    Save,
}

export interface GameUserSettingTrigger {
    action?: GameUserSettingAction;
}

@injectable()
export class GameUserSettingStore {
    constructor() {
        makeAutoObservable(this);
    }

    tempStorage: GameUserSettingTrigger = {};
    permanentStorage: GameUserSettingTrigger = {};
}
