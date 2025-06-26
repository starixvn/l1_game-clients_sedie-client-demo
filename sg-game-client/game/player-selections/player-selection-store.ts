import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";


export interface PlayerSelection {
    _chip: number;
}

@injectable()
export class PlayerSelectionStore implements PlayerSelection {
    constructor() {
        makeAutoObservable(this);
        this.setDefaultValues();
    }

    _chip: number;

    public set chip(chipValue: number){
        this._chip = chipValue;
    }

    public get chip(){
        return this._chip;
    }

    setDefaultValues(){
        this.chip = 0;
    }    

    clear(){
        this.setDefaultValues();
    }
}
