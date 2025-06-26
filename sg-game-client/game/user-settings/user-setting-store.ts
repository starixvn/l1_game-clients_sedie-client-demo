import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

export interface UserSettingData {
    musicEnable: boolean;
    sfxEnable: boolean;
}

@injectable()
export class UserSettingStore implements UserSettingData {
    constructor() {
        makeAutoObservable(this);
    }

    private _musicEnable = true;
    public get musicEnable() {
        return this._musicEnable;
    }
    public set musicEnable(value) {
        this._musicEnable = value;
    }
    private _sfxEnable = true;
    public get sfxEnable() {
        return this._sfxEnable;
    }
    public set sfxEnable(value) {
        this._sfxEnable = value;
    }
}
