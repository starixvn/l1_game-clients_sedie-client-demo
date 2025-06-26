import { inject, injectable } from "inversify";
import { IHandler, NotificationServiceMessage } from "../../shared";
import { BaseBoostedOddsModel, BoostedOddsModel, BoostedOddsStore, PromotionModel } from "./boosted-odds-store";
import { MainPlayerStore } from "../../players/main-player-store";
import { AppStore } from "../../app";
import { SiteConfigs } from "../../configs";
import { AuthStore } from "../../auth";
import { AppTypes } from "../../shared/constants/app-type";
import { StorageManager, localStorageKeys } from "../../shared/utils/storage-manager";

export namespace BoostedOddsPromotionsHandlers {
    @injectable()
    export class PromotionHelperHandlers implements IHandler<Array<BaseBoostedOddsModel>> {
        constructor(
            @inject(MainPlayerStore) private readonly mainPlayerStore: MainPlayerStore,
            @inject(AuthStore) private readonly authStore: AuthStore
        ) {}

        handle(data: Array<BaseBoostedOddsModel>) {
            return this.authStore.system === AppTypes.Instant
                ? this.getPromotionsByOfferGamesForInstantVersion(data)
                : this.getPromotionsByOfferGames(data);
        }

        getPromotionsByOfferGames(data: Array<BaseBoostedOddsModel>) {
            return data.filter((promotion) => this.mainPlayerStore.offerGames?.some((game) => game.gameId === promotion.gameId));
        }

        getPromotionsByOfferGamesForInstantVersion(data: Array<BaseBoostedOddsModel>) {
            const gameIdsSupportBoostedOddsForInstantSite = StorageManager.get(localStorageKeys.gameIdsSupportBoostedOddsForInstantSite)
                ?.toString()
                .split(",");

            return this.getPromotionsByOfferGames(data).filter((promotion) =>
                gameIdsSupportBoostedOddsForInstantSite.some((gameId) => parseInt(gameId) === promotion.gameId)
            );
        }
    }

    @injectable()
    export class BoostedOddsPopupHandlers implements IHandler<Array<BoostedOddsModel>> {
        name = NotificationServiceMessage.BoostedOdd.eventName;
        timeout: NodeJS.Timeout;
        minutesToMillisecond = 60 * 1000;
        defaultDelayTimeByMinutes = 15;

        constructor(
            @inject(BoostedOddsStore) private readonly boostedOddsStore: BoostedOddsStore,
            @inject(AppStore) private readonly appStore: AppStore,
            @inject(AuthStore) private readonly authStore: AuthStore,
            @inject(SiteConfigs) private readonly siteConfigs: SiteConfigs,
            @inject(PromotionHelperHandlers) private readonly promotionHelperHandlers: PromotionHelperHandlers
        ) {
            this.boostedOddsStore.resetBoostedOddsData(this.authStore.system === AppTypes.Instant);
        }

        handle(data: Array<BoostedOddsModel>) {
            const newPromotions = this.promotionHelperHandlers.handle(data) as Array<BoostedOddsModel>;

            if (newPromotions?.length > 0) {
                const { boostedOddses, promotions, isAllowShowBoostedOddIcon } = this.boostedOddsStore;
                if (
                    (this.checkIfReceiveNewPromotions(newPromotions, boostedOddses) || isAllowShowBoostedOddIcon) &&
                    !this.appStore.isDirectMode
                ) {
                    promotions?.length > 0 && this.boostedOddsStore.increaseBoostedOddCounter();
                    this.setTimeoutShowBoostedOdds();
                }

                this.boostedOddsStore.setIsAllowShowBoostedOddIcon(false);
                this.boostedOddsStore.setBoostedOddsModels(newPromotions);
            }
        }

        checkIfReceiveNewPromotions(newPromotions: Array<BoostedOddsModel>, boostedOddses: Array<BoostedOddsModel>) {
            if (newPromotions?.length > boostedOddses?.length) {
                return true;
            }

            return (
                newPromotions.filter(
                    (newPromotion) => !boostedOddses.some((currentPromotion) => this.arePromotionsEqual(newPromotion, currentPromotion))
                ).length > 0
            );
        }

        arePromotionsEqual(promotion1: BoostedOddsModel, promotion2: BoostedOddsModel): boolean {
            const startTimeEqual = new Date(promotion1.startDateTime).getTime() === new Date(promotion2.startDateTime).getTime();
            const endTimeEqual = new Date(promotion1.endDateTime).getTime() === new Date(promotion2.endDateTime).getTime();
            return promotion1._id === promotion2._id && startTimeEqual && endTimeEqual;
        }

        setTimeoutShowBoostedOdds(): void {
            this.clearTimeout();

            this.timeout = setTimeout(() => {
                this.boostedOddsStore.setIsAllowShowBoostedOddIcon(true);
            }, this.getDelayTime());
        }

        getDelayTime() {
            return (this.siteConfigs.boostedOddsDelayTimeByMinutes || this.defaultDelayTimeByMinutes) * this.minutesToMillisecond;
        }

        clearTimeout() {
            this.timeout && clearTimeout(this.timeout);
        }

        setIsLoadedPrefab(isLoadedPrefab: boolean) {
            this.boostedOddsStore.setIsLoadedPrefab(isLoadedPrefab);
        }
    }

    @injectable()
    export class PromotionHandlers implements IHandler<Array<PromotionModel>> {
        name = NotificationServiceMessage.PromotionNotifications.eventName;
        constructor(
            @inject(BoostedOddsStore) private readonly boostedOddsStore: BoostedOddsStore,
            @inject(PromotionHelperHandlers) private readonly promotionHelperHandlers: PromotionHelperHandlers
        ) {}

        handle(data: Array<PromotionModel>) {
            const newPromotions = this.promotionHelperHandlers.handle(data) as Array<PromotionModel>;
            newPromotions.length > 0 && this.boostedOddsStore.setPromotionModels(newPromotions);
        }
    }
}
