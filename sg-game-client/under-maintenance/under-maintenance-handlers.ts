import { inject, injectable } from "inversify";
import { AppStore } from "../app";
import { SiteConfigs } from "../configs";
import { ConnectionHandlers, ConnectionStore } from "../game/connection";
import { NotificationStore } from "../notification";
import { IHandler, NotificationServiceMessage } from "../shared";
import { StorageManager, localStorageKeys } from "../shared/utils/storage-manager";

@injectable()
export class UnderMaintenanceHandler implements IHandler<NotificationServiceMessage.UnderMaintenanceInfo> {
    name = NotificationServiceMessage.UnderMaintenanceInfo.eventName;
    constructor(
        @inject(AppStore) protected readonly appStore: AppStore,
        @inject(ConnectionStore) protected readonly connectionStore: ConnectionStore,
        @inject(NotificationStore) protected readonly notificationStore: NotificationStore,
        @inject(SiteConfigs) protected readonly siteConfigs: SiteConfigs,
        @inject(ConnectionHandlers.RetryGameHandler) protected readonly retryGameHandler: ConnectionHandlers.RetryGameHandler
    ) {}

    handle(underMaintenanceInfo: NotificationServiceMessage.UnderMaintenanceInfo) {
        this.appStore.setUM(underMaintenanceInfo.umInfo);
        this.notificationStore.onDisconnected();
        this.connectionStore.onDisconnected();
        this.retryGameHandler.clearInterval();
        StorageManager.remove(localStorageKeys.session);
    }
}
