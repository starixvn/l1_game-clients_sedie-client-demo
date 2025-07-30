import * as gc from '@sg/sg-game-client';
import { sentryHelper } from '../utils/sentry-helper';

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
    const componentName = 'AppSettings';

    sentryHelper.logInfo(componentName, 'Loading environment configuration', {
        appEnv,
        siteId,
        timestamp: Date.now()
    });

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

    const result = {
        ...environmentsConfig,
        gameSettings
    };

    sentryHelper.logInfo(componentName, 'Environment configuration loaded successfully', {
        appEnv,
        siteId,
        configKeys: Object.keys(result),
        gameSettingsCount: Object.keys(gameSettings).length,
        timestamp: Date.now()
    });

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

// Add Sentry DSN to appSettings
export const appSettingsWithSentry = {
    ...appSettings,
    sentryDsn: appSettings.sentry?.dsn || 'YOUR_DSN_HERE',
    sentryEnvironment: appSettings.sentry?.environment || 'development'
};

export const getSiteConfig = (gameId: number) => {
    const componentName = 'AppSettings';

    sentryHelper.logInfo(componentName, 'Getting site configuration', {
        gameId,
        timestamp: Date.now()
    });

    const gameSetting = appSettings.gameSettings[gameId];

    if (!gameSetting) {
        sentryHelper.logWarning(componentName, 'No game setting found for gameId', {
            gameId,
            availableGameIds: Object.keys(appSettings.gameSettings),
            timestamp: Date.now()
        });
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
        userServicePath: appSettings.userServicePath
    };

    sentryHelper.logInfo(componentName, 'Site configuration retrieved successfully', {
        gameId,
        configKeys: Object.keys(config),
        websocketEnabled: !!gameSetting?.websocket,
        timestamp: Date.now()
    });

    return config;
};

export const getGameSetting = (gameId: number) => {
    const componentName = 'AppSettings';

    sentryHelper.logInfo(componentName, 'Getting game setting', {
        gameId,
        timestamp: Date.now()
    });

    const settings = appSettings.gameSettings[gameId];

    if (!settings) {
        sentryHelper.logWarning(componentName, 'No settings found for gameId', {
            gameId,
            availableGameIds: Object.keys(appSettings.gameSettings),
            timestamp: Date.now()
        });
        console.warn('[getGameSetting] No settings found for gameId:', gameId);
        return null;
    }

    sentryHelper.logInfo(componentName, 'Game setting retrieved successfully', {
        gameId,
        gameName: settings.name,
        isVisible: settings.isVisible,
        order: settings.order,
        timestamp: Date.now()
    });

    return settings;
};

export const getGameSettingIds = (visibleOnly: boolean = true) => {
    const componentName = 'AppSettings';

    sentryHelper.logInfo(componentName, 'Getting game setting IDs', {
        visibleOnly,
        timestamp: Date.now()
    });

    const gameSettings = Object.keys(appSettings.gameSettings).map((value) => {
        return appSettings.gameSettings[value];
    });

    const filteredSettings = visibleOnly
        ? gameSettings.filter(setting => setting.isVisible)
        : gameSettings;

    const orderedGameSettings = filteredSettings.sort((a, b) => a.order - b.order);

    const ids = orderedGameSettings.map((value) => value.id);

    sentryHelper.logInfo(componentName, 'Game setting IDs retrieved successfully', {
        visibleOnly,
        totalSettings: gameSettings.length,
        filteredSettings: filteredSettings.length,
        returnedIds: ids,
        timestamp: Date.now()
    });

    return ids;
};

export const getVisibleGameSettings = () => {
    const componentName = 'AppSettings';

    sentryHelper.logInfo(componentName, 'Getting visible game settings', {
        timestamp: Date.now()
    });

    const gameSettings = Object.keys(appSettings.gameSettings).map((value) => {
        return appSettings.gameSettings[value];
    });

    const result = gameSettings
        .filter(setting => setting.isVisible)
        .sort((a, b) => a.order - b.order);

    sentryHelper.logInfo(componentName, 'Visible game settings retrieved successfully', {
        totalSettings: gameSettings.length,
        visibleSettings: result.length,
        gameNames: result.map(setting => setting.name),
        timestamp: Date.now()
    });

    return result;
};

