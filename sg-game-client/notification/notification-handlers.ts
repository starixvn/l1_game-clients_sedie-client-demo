import { inject, injectable } from "inversify";
import { SiteConfigs } from "../configs";
import { UrlUtils } from "../shared/utils";
import { io } from "socket.io-client/dist/socket.io.js";
import * as MsgpackParser from "socket.io-msgpack-parser";
import { ISessionInfo } from "../auth";
import { NotificationStore } from "./notification-store";
import { ISocketOption } from "../game/connection";

@injectable()
export class NotificationHandlers {
    constructor(
        @inject(NotificationStore) readonly notificationStore: NotificationStore,
        @inject(SiteConfigs) protected readonly siteConfigs: SiteConfigs
    ) {}

    handle(sessionInfo: ISessionInfo) {
        const { isDev, enableMsgpackParserOnNotification, subDirectory } = this.siteConfigs;
        const socketUri = isDev ? this.siteConfigs.notificationServiceUrlDev : UrlUtils.buildUrl("http", "/", this.siteConfigs);

        const options: ISocketOption = {
            path: `/${UrlUtils.getSubDirectory(subDirectory)}${isDev ? "" : "notification/"}socket.io`,
            socketUri,
            transports: ["websocket"],
            upgrade: false,
            forceNew: true,
            auth: {
                ss: sessionInfo.session,
                username: sessionInfo.username,
            },
        };
        if (enableMsgpackParserOnNotification) {
            options.parser = MsgpackParser;
            this.notificationStore.connection = io(options.socketUri, options);
        } else {
            this.notificationStore.connection = io(options.socketUri, options);
        }
        this.notificationStore.initListener();
    }
}
