import { inject, injectable } from "inversify";
import { ISessionInfo } from "../../auth/auth-store";
import { SiteConfigs } from "../../configs/site-configs";
import { StorageManager, Translator, localStorageKeys } from "../../shared/utils";
import { UrlUtils } from "../../shared/utils/url-utils";
import { GameSetting } from "../game-configs/game-setting";
import { GuidePFStore } from "./guide-pf-store";
@injectable()
export class GuidePFHandlers {
    constructor(
        @inject(SiteConfigs) private readonly siteConfigs: SiteConfigs,
        @inject(GameSetting) private readonly gameSetting: GameSetting,
        @inject(GuidePFStore) private readonly guidePFStore: GuidePFStore
    ) {}
    handle() {
        const domain = UrlUtils.buildGameGuideUrl(this.siteConfigs);
        const term = "pf";
        const params = {
            gId: this.gameSetting.id,
            t: term,
            f: term,
            c: 0,
            v: Date.now(),
            displayName: Translator.translate(`${this.gameSetting.name}.game_name`),
        };
        const queryString = Object.keys(params)
            .map((key) => `${key}=${params[key]}`)
            .join("&");
        this.guidePFStore.url = `${domain}/${this.getLanguage()}?${queryString}`;
    }

    resetUrl() {
        this.guidePFStore.url = "";
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
