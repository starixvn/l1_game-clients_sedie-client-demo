import { inject, injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";
import { RoundTimeStore } from "../../game/rounds/round-time-store";
import { MultiplierData } from "./multipliers-define";

@injectable()
export class MultipliersStore<T> {
    constructor(@inject(RoundTimeStore) private readonly roundTimeStore: RoundTimeStore) {
        makeAutoObservable(this);
        reaction(
            () => this.roundTimeStore.isStartRound,
            (isStartRound) => {
                if (isStartRound) {
                    this.clearMultipliers();
                }
            }
        );
    }

    multipliers: MultiplierData<T>[] = [];

    _renderMultipliers: { animated: boolean; multipliers: MultiplierData<T>[] } = null;

    get renderMultipliers() {
        return this._renderMultipliers;
    }

    generateRenderMultipliers(animated: boolean) {
        if (this._renderMultipliers) {
            return;
        }
        this._renderMultipliers = { animated, multipliers: this.multipliers };
    }

    clearMultipliers() {
        this.multipliers = [];
        this._renderMultipliers = null;
    }
}
