import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

export enum Orientation {
    Landscape = 0,
    Portrait,
}

@injectable()
export class OrientationStore {
    constructor() {
        makeAutoObservable(this);
    }

    orientation = Orientation.Landscape;

    get m() {
        return this.orientation + 1;
    }
}
