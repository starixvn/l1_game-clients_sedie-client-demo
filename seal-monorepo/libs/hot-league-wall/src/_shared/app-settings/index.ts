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
    console.log('[getEnvironmentConfig] Input:', { appEnv, siteId });
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
    console.log('[getEnvironmentConfig] Selected environment config:', { siteId, appEnv, environmentsConfig });

    const gameSettingsMap = {
        [NOVA88_SITE_ID]: VG_GAME_SETTINGS,
        [VIVA88_SITE_ID]: SG_GAME_SETTINGS
    }
    const gameSettings = gameSettingsMap[siteId];
    console.log('[getEnvironmentConfig] Selected game settings for site:', { siteId, gameSettingsCount: Object.keys(gameSettings).length });

    const result = {
        ...environmentsConfig,
        gameSettings
    };
    console.log('[getEnvironmentConfig] Final merged config keys:', Object.keys(result));
    return result;
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
console.log('[appSettings] Initialized with:', { appEnv: APP_ENV.LOCAL, siteId: VIVA88_SITE_ID });

export const getSiteConfig = (gameId: number) => {
    console.log('[getSiteConfig] Called with gameId:', gameId);
    const gameSetting = appSettings.gameSettings[gameId];

    if (!gameSetting) {
        console.warn('[getSiteConfig] No game setting found for gameId:', gameId);
    }

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
    console.log('[getSiteConfig] Created SiteConfigs object with websocket:', gameSetting?.websocket, 'and mainObserverNamespace:', gameSetting?.mainObserverNamespace);

    console.log('[getSiteConfig] Generated config:', { gameId, config });
    return config;
};

export const getGameSetting = (gameId: number) => {
    console.log('[getGameSetting] Called with gameId:', gameId);
    const settings = appSettings.gameSettings[gameId];

    if (!settings) {
        console.warn('[getGameSetting] No settings found for gameId:', gameId);
        return null;
    }

    console.log('[getGameSetting] Found settings for gameId:', { gameId, settings });
    return settings;
};

export const getGameSettingIds = (visibleOnly: boolean = true) => {
    console.log('[getGameSettingIds] Called with visibleOnly:', visibleOnly);
    const gameSettings = Object.keys(appSettings.gameSettings).map((value) => {
        return appSettings.gameSettings[value];
    });
    console.log('[getGameSettingIds] Total game settings loaded:', gameSettings.length);

    const filteredSettings = visibleOnly
        ? gameSettings.filter(setting => setting.isVisible)
        : gameSettings;
    console.log('[getGameSettingIds] Filtered settings count:', filteredSettings.length);

    const orderedGameSettings = filteredSettings.sort((a, b) => a.order - b.order);
    console.log('[getGameSettingIds] Settings after ordering:', orderedGameSettings.map(s => ({ id: s.id, order: s.order })));

    const ids = orderedGameSettings.map((value) => value.id);
    console.log('[getGameSettingIds] Final result - ids:', ids);
    return ids;
};

export const getVisibleGameSettings = () => {
    console.log('[getVisibleGameSettings] Called');
    const gameSettings = Object.keys(appSettings.gameSettings).map((value) => {
        return appSettings.gameSettings[value];
    });
    console.log('[getVisibleGameSettings] Total game settings loaded:', gameSettings.length);

    const result = gameSettings
        .filter(setting => setting.isVisible)
        .sort((a, b) => a.order - b.order);

    console.log('[getVisibleGameSettings] Filtered and ordered visible settings:',
        result.map(s => ({ id: s.id, name: s.name, order: s.order })));
    return result;
};

