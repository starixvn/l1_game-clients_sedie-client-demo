import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

export interface Warning {
    message: string;
}

export enum NoticeType {
    Info = 0,
    Error = 1,
}

export enum NoticeInfo {
    None = "",
    DisabledAccount = "DisabledAccount",
    DisabledGame = "DisabledGame",
    ExcludedGame = "ExcludedGame",
    NotificationReload = "NotificationReload",
    LostGameConnection = "LostGameConnection",
    SessionTimeout = "SessionTimeout",
    ApiError = "ApiError",
    SignName = "SignName",
}

export interface Notice extends Warning {
    title: string;

    type: NoticeType;

    onClose: () => void;

    showBtnConfirmButton?: boolean;

    noticeInfo?: NoticeInfo;
}

@injectable()
export class NoticeStore {
    constructor() {
        makeAutoObservable(this);
    }

    warning: Warning = null;

    notice: Notice = null;

    processingWarning: Warning = null;

    addWarning(message: string) {
        this.warning = { message };
    }

    addNotice(notice: Notice) {
        this.notice = notice;
    }

    hideNotice() {
        this.notice = null;
    }

    addProcessWarning(message: string) {
        this.processingWarning = { message };
    }
}
