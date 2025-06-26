import { inject, injectable } from "inversify";
import { AuthStore } from "../auth/auth-store";
import { Translator } from "../exports";
import { NoticeInfo, NoticeStore, NoticeType } from "../game/notices";
import { IHandler, NotificationServiceMessage } from "../shared";

export namespace NotificationReloadHandlers {
    @injectable()
    export class NotificationReload implements IHandler<void> {
        constructor(
            @inject(NoticeStore) private readonly noticeStore: NoticeStore,
            @inject(AuthStore)
            protected readonly authStore: AuthStore
        ) {}

        name = NotificationServiceMessage.reloadEventName;

        handle() {
            const reload = () => {
                globalThis.location.reload();
            };
            this.noticeStore.addNotice({
                message: Translator.getMessageFollowSystem(this.authStore.system, "message_new_update_available"),
                title: Translator.commonTranslate("notice"),
                type: NoticeType.Info,
                onClose: reload,
                noticeInfo: NoticeInfo.NotificationReload,
            });
        }
    }
}
