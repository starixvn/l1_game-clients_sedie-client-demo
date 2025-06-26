import { injectable } from "inversify";
import { computed, makeObservable, observable } from "mobx";

export class BaseBoostedOddsModel {
    gameId: number;
}
export class PromotionModel extends BaseBoostedOddsModel {
    _id: string;
    time: string;
    message: string;
    messages: object;
    title: object;
    startTime: string;
    endTime: string;
    promotionId: string;
    enabled: boolean;
    isActive: boolean;
    displayKind: number;
    gameName: string;
}

export class BoostedOddsModel extends BaseBoostedOddsModel {
    _id: string;
    endDateTime: string;
    isDaily: boolean;
    odds: any;
    startDateTime: string;
    status: string;
    time: string;
}

export const BoostedOddsConstant = {
    timeOutIconDesktop: 10,
    timeOutIconInstant: 15,
    loadPrefabIndex: 1,
};

@injectable()
export class BoostedOddsStore {
    promotions: Array<PromotionModel> = [];
    popupCounter = 0;
    boostedOddsCounter = 0;
    isLoadingIcon = false;
    boostedOddsIconShowedTimeInMiliseconds = BoostedOddsConstant.timeOutIconDesktop;
    isLoadedPrefab = false;

    boostedOddses: Array<BoostedOddsModel> = [];
    isAllowShowBoostedOddIcon = true;
    isInstantVersion = false;

    constructor() {
        makeObservable(this, {
            isLoadedPrefab: observable,
            isLoadingIcon: observable,
            promotions: observable,
            popupCounter: observable,
            boostedOddsCounter: observable,
            shouldAddBoostedOddPrefab: computed,
        });
    }

    setPromotionModels(promotions: Array<PromotionModel>) {
        this.promotions = promotions;
    }

    setBoostedOddsModels(boostedOddses: Array<BoostedOddsModel>) {
        this.boostedOddses = boostedOddses;
    }

    increasePopupCounter() {
        this.popupCounter++;
    }

    increaseBoostedOddCounter() {
        this.boostedOddsCounter++;
    }

    setIsLoadingIcon(isLoadingIcon: boolean) {
        this.isLoadingIcon = isLoadingIcon;
    }

    setIsAllowShowBoostedOddIcon(isAllowShowBoostedOddIcon: boolean) {
        this.isAllowShowBoostedOddIcon = isAllowShowBoostedOddIcon;
    }

    resetBoostedOddsData(isInstantVersion: boolean) {
        this.boostedOddses = [];
        this.isAllowShowBoostedOddIcon = true;
        this.isInstantVersion = isInstantVersion;

        const { timeOutIconDesktop, timeOutIconInstant } = BoostedOddsConstant;
        this.boostedOddsIconShowedTimeInMiliseconds = isInstantVersion ? timeOutIconInstant : timeOutIconDesktop;
    }

    setIsLoadedPrefab(isLoadedPrefab: boolean) {
        this.isLoadedPrefab = isLoadedPrefab;
    }

    get shouldAddBoostedOddPrefab() {
        return this.boostedOddsCounter === BoostedOddsConstant.loadPrefabIndex;
    }
}
