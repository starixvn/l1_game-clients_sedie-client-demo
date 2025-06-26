import { inject, injectable } from "inversify";
import { ISessionInfo } from "../../auth/auth-store";
import { SiteConfigs } from "../../configs";
import { IHandler } from "../../shared";
import { StorageManager, Translator, UrlUtils, localStorageKeys } from "../../shared/utils";
import { GameSetting } from "../game-configs";
import { WebViewPFVerificationStore } from "./web-vew-verification-store";

export namespace WebViewPFVerificationHandlers {
    @injectable()
    export class VerificationPopupHandler implements IHandler<boolean> {
        constructor(@inject(WebViewPFVerificationStore) private readonly webViewPFStore: WebViewPFVerificationStore) {}

        handle(openPopup: boolean) {
            this.webViewPFStore.openVerificationPopup = openPopup ? {} : null;
        }
    }
    @injectable()
    export class GetVerificationURL implements IHandler<{ theme: string; specialDirection: string }> {
        constructor(
            @inject(SiteConfigs) private readonly siteConfigs: SiteConfigs,
            @inject(GameSetting) private readonly gameSetting: GameSetting,
            @inject(WebViewPFVerificationStore) private readonly webViewPFStore: WebViewPFVerificationStore
        ) {}

        handle({ theme, specialDirection, scrollToId }: { theme: string; specialDirection: string; scrollToId: string }) {
            const domain = UrlUtils.buildGameGuideUrl(this.siteConfigs);
            const params = {
                gId: this.gameSetting.id,
                displayName: Translator.translate(`${this.gameSetting.name}.game_name`),
                t: "pf",
                v: Date.now(),
            };
            const queryString = Object.keys(params)
                .map((key) => `${key}=${params[key]}`)
                .join("&");
            this.webViewPFStore.url = `${domain}/${this.getLanguage()}/pf?${queryString}${specialDirection}`;
        }

        private getLanguage(): string {
            const languages = {
                "vi-VN": "vi",
                "en-US": "en",
                "en-UK": "en",
                "th-TH": "th",
                "id-ID": "id",
                "zh-CN": "zh_cn",
                "zh-TW": "zh_tw",
            };
            const session = StorageManager.get(localStorageKeys.session) as ISessionInfo;

            return languages[session.language] || "en";
        }
    }
}
