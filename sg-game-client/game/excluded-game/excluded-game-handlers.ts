import { inject, injectable } from "inversify";
import { AppHandlers } from "../../app/app-handlers";
import { AuthStore } from "../../auth/auth-store";
import { GameServiceMessage, IHandler } from "../../shared";
import { Translator } from "../../shared/utils/localization-manager";
import { GameSetting } from "../game-configs";
import { NoticeInfo, NoticeStore, NoticeType } from "../notices";

@injectable()
export class NoPermissionHandlers implements IHandler<void> {
    name = GameServiceMessage.notPermittedToPlay;

    constructor(
        @inject(NoticeStore) protected readonly noticeStore: NoticeStore,
        @inject(GameSetting) protected readonly gameSetting: GameSetting,
        @inject(AppHandlers.BackToOperatorLobby) protected readonly backToOperatorLobby: AppHandlers.BackToOperatorLobby,
        @inject(AuthStore) protected readonly authStore: AuthStore
    ) {}

    handle() {
        const goToLobby = () => {
            this.backToOperatorLobby.handle();
        };
        const gameName = Translator.translate(`${this.gameSetting.name}.game_name`);
        this.noticeStore.addNotice({
            message: Translator.getMessageFollowSystem(this.authStore.system, "game_excluded", { gameName }),
            title: Translator.commonTranslate("notice"),
            type: NoticeType.Info,
            onClose: goToLobby,
            noticeInfo: NoticeInfo.ExcludedGame,
        });
    }
}
