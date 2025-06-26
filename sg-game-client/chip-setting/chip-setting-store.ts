import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import { ChipInfo } from "@sg/sg-user-service-client/dist/setting";

export type TChipSetting = {
    [value: number]: string;
};
@injectable()
export class ChipSettingStore {
    constructor() {
        makeAutoObservable(this);
    }

    private _chipSetting: TChipSetting = {
        0: "#9ec6d3",
        1: "#848484",
        2: "#a335a7",
        5: "#2cb400",
        10: "#ff930d",
        20: "#962bfa",
        50: "#ff48e4",
        100: "#1477ff",
        200: "#10e3ff",
        500: "#ff3818",
        1000: "#193c66",
        2000: "#8c6f01",
        3000: "#222222",
        5000: "#be000b",
        10000: "#7b004b",
        20000: "#007866",
    };

    get chipSetting() {
        return this._chipSetting;
    }

    updateChipColor(chips: ChipInfo[]) {
        chips.forEach((chip) => {
            this._chipSetting[chip.value] = chip.color;
        });
    }
}
