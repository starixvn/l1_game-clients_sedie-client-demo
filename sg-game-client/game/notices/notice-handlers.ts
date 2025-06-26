import { inject, injectable } from "inversify";
import { AuthStore } from "../../auth/auth-store";
import { GameServiceMessage, IMultipleHandlers, utils } from "../../shared";
import { RoundStore } from "../rounds";
import { AppTypes } from "./../../shared/constants/app-type";
import { NoticeStore } from "./notice-store";
import { GameSetting } from "../game-configs";

const { ErrorUtils } = utils;

@injectable()
export class NoticeHandlers implements IMultipleHandlers {
    constructor(
        @inject(RoundStore)
        protected readonly roundStore: RoundStore,
        @inject(NoticeStore)
        protected readonly noticeStore: NoticeStore,
        @inject(AuthStore)
        protected readonly authStore: AuthStore,
        @inject(GameSetting) protected readonly gameSetting: GameSetting
    ) {}

    getSystem = () => {
        return this.authStore?.system || AppTypes.Club;
    };

    handleNotice(notice: GameServiceMessage.Notice) {
        const { gameRoundId } = notice;
        if (gameRoundId && gameRoundId !== this.roundStore.roundId) {
            return;
        }

        const text = ErrorUtils.getErrorMessage(notice, this.getSystem(), this.gameSetting.name);
        this.noticeStore.addWarning(text);
    }

    eventHandleList = [
        {
            name: GameServiceMessage.Notice.eventName,
            handle: this.handleNotice,
        },
    ];
}
