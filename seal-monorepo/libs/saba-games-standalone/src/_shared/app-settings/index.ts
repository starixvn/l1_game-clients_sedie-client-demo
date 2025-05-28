import * as gc from '@sg/sg-game-client';

import SG_LOCAL_CONFIG from '../../../configs/sg/configs.LOCAL_1.json';
import SG_SIT_CONFIG from '../../../configs/sg/configs.SIT.json';
import SG_UAT_CONFIG from '../../../configs/sg/configs.UAT.json';
import SG_PROD_CONFIG from '../../../configs/sg/configs.PROD.json';
import VG_LOCAL_CONFIG from '../../../configs/vg/configs.LOCAL_1.json';
import VG_SIT_CONFIG from '../../../configs/vg/configs.SIT.json';
import VG_UAT_CONFIG from '../../../configs/vg/configs.UAT.json';
import VG_PROD_CONFIG from '../../../configs/vg/configs.PROD.json';

// custom game settings (order)
import SG_GAME_SETTINGS from '../../../configs/saba-game-settings.json';
import VG_GAME_SETTINGS from '../../../configs/vg-game-settings.json';
import { NOVA88_SITE_ID, VIVA88_SITE_ID } from '../../../constant/app';

// LOCAL development
export const reuqestSSO_APP_ENV = 'LOCAL';
export const requestSSO_SITE_ID = VIVA88_SITE_ID;
export enum APP_ENV {
    LOCAL = 'LOCAL',
    SIT = 'SIT',
    UAT = 'UAT',
    PROD = 'PROD'
}

export const getEnvironmentConfig = ({ appEnv, siteId }) => {
    const configMaps = {
        [NOVA88_SITE_ID]: {
            LOCAL: VG_LOCAL_CONFIG,
            SIT: VG_SIT_CONFIG,
            UAT: VG_UAT_CONFIG,
            PROD: VG_PROD_CONFIG
        },
        [VIVA88_SITE_ID]: {
            LOCAL: SG_LOCAL_CONFIG,
            SIT: SG_SIT_CONFIG,
            UAT: SG_UAT_CONFIG,
            PROD: SG_PROD_CONFIG
        }
    }
    const environmentsConfig = configMaps[siteId][appEnv];

    const gameSettingsMap = {
        [NOVA88_SITE_ID]: VG_GAME_SETTINGS,
        [VIVA88_SITE_ID]: SG_GAME_SETTINGS
    }
    const gameSettings = gameSettingsMap[siteId];

    return {
        ...environmentsConfig,
        gameSettings
    };
}

// TODO refactor
// 所有設定相關函數都接收 AppConfig：
// getEnvironmentConfig({ siteId, appEnv })
// getSiteConfig(gameId, { siteId, appEnv })
// getGameSetting(gameId, { siteId, appEnv })
export const appSettings = getEnvironmentConfig({
    appEnv: APP_ENV.LOCAL,
    siteId: VIVA88_SITE_ID
});

export const getSiteConfig = (gameId: number) => {
    const gameSetting = appSettings.gameSettings[gameId];
    const config: gc.Configs.SiteConfigs = {
        isDev: false,
        systemType: appSettings.systemType,
        serverDomain: appSettings.serverDomain,
        ssl: appSettings.ssl,
        subDomain: appSettings.subDomain,
        env: appSettings.env,
        enableMsgpackParserAllGames: appSettings.enableMsgpackParserAllGames,
        enableMsgpackParserOnNotification: appSettings.enableMsgpackParserOnNotification,
        websocket: gameSetting.websocket,
        mainObserverNamespace: gameSetting.mainObserverNamespace,
        subGuideDomain: '',
        subDirectory: appSettings.subDirectory,
        userServicePath: appSettings.userServicePath,
    };

    return config;
};

export const getGameSetting = (gameId: number) => {
    const settings = appSettings.gameSettings[gameId];

    if (!settings) {
        return null;
    }

    return settings;
};

export const getGameSettingIds = (visibleOnly: boolean = true) => {
    const gameSettings = Object.keys(appSettings.gameSettings).map((value) => {
        return appSettings.gameSettings[value];
    });

    const filteredSettings = visibleOnly
        ? gameSettings.filter(setting => setting.isVisible)
        : gameSettings;

    const orderedGameSettings = filteredSettings.sort((a, b) => a.order - b.order);

    const ids = orderedGameSettings.map((value) => value.id);
    return ids;
};

export const getVisibleGameSettings = () => {
    const gameSettings = Object.keys(appSettings.gameSettings).map((value) => {
        return appSettings.gameSettings[value];
    });

    return gameSettings
        .filter(setting => setting.isVisible)
        .sort((a, b) => a.order - b.order);
};

