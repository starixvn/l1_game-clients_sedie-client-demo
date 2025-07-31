import * as gc from '@sg/sg-game-client';
import * as Observer from '@sg/sg-observer';
import * as mobx from 'mobx';
import { reaction } from 'mobx';
import 'reflect-metadata';
import { getSiteConfig, appSettings } from '../../_shared/app-settings';
import { Lobby } from '../../_shared/states';
import { LobbyStore } from '../../_shared/states/lobby';
import {
    logInfo,
    logError,
    logWarning,
    logDebug,
    logTrace
} from '../../sentry';

interface Languages {
    [key: string]: any;
}

declare global {
    interface Window {
        languages: Languages;
    }
}

function getSharedContainer(siteConfigs: gc.Configs.SiteConfigs) {
    const componentName = 'GameBaseStartup';

    logInfo(componentName, 'Creating shared container', {
        siteConfigs: Object.keys(siteConfigs),
        timestamp: Date.now()
    });

    const containerOptions: gc.IContainerOptions = {
        onContainerCreated: (container) => {
            logInfo(componentName, 'Container created callback executed', {
                timestamp: Date.now()
            });
            container.bind(gc.Configs.SiteConfigs).toConstantValue(siteConfigs);
        },

        enabledFeatures: [
            gc.Player.FEATURE_NAME,
            gc.Auth.FEATURE_NAME,
            gc.App.FEATURE_NAME,
            gc.Notification.FEATURE_NAME,
            gc.ConnectSite.FEATURE_NAME,
            gc.ChipSetting.FEATURE_NAME,
            gc.GatewayConnection.FEATURE_NAME,
            gc.RoundBasePF.FEATURE_NAME,
            Lobby.FEATURE_NAME,
        ],
        features: [...gc.defaultFeatures, Lobby],
    };

    logInfo(componentName, 'Shared container options configured', {
        enabledFeatures: containerOptions.enabledFeatures,
        featuresCount: containerOptions.features?.length || 0,
        timestamp: Date.now()
    });

    const container = gc.getContainer(containerOptions);

    logInfo(componentName, 'Shared container created successfully', {
        timestamp: Date.now()
    });

    return container;
}

export const sharedContainer = (() => {
    try {
        const componentName = 'GameBaseStartup';

        logInfo(componentName, 'Initializing shared container', {
            defaultGameId: appSettings.defaultGameId,
            timestamp: Date.now()
        });

        if (!appSettings.defaultGameId) {
            const error = 'defaultGameId is not defined in appSettings';
            logError(componentName, error, {
                appSettingsKeys: Object.keys(appSettings),
                timestamp: Date.now()
            });
            throw new Error(error);
        }

        const siteConfig = getSiteConfig(appSettings.defaultGameId);
        const container = getSharedContainer(siteConfig);

        logInfo(componentName, 'Shared container initialization completed', {
            defaultGameId: appSettings.defaultGameId,
            timestamp: Date.now()
        });

        return container;
    } catch (error) {
        logError('GameBaseStartup', 'Failed to initialize shared container', {
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now()
        });

        // Return a minimal container as fallback
        console.error('Failed to initialize shared container, using fallback:', error);
        return getSharedContainer({
            isDev: false,
            systemType: 'development',
            serverDomain: 'localhost',
            ssl: false,
            subDomain: '',
            env: 'development',
            enableMsgpackParserAllGames: false,
            enableMsgpackParserOnNotification: false,
            websocket: { proxyPath: '', route: '' },
            mainObserverNamespace: '',
            subGuideDomain: '',
            subDirectory: '',
            userServicePath: '/user'
        });
    }
})();

// Make the shared container available globally for external access
if (typeof window !== 'undefined') {
    logInfo('GameBaseStartup', 'Making shared container available globally', {
        timestamp: Date.now()
    });
    (window as any).hot_league_wall_shared_container = sharedContainer;
}

export function configSharedContainer() {
    const componentName = 'GameBaseStartup';

    logInfo(componentName, 'Configuring shared container', {
        timestamp: Date.now()
    });

    Observer.configure({ default: { mobx, container: gc.buildObserverContainer(sharedContainer) } });
    Observer.configure({ default: { mobx, container: gc.buildObserverContainer(sharedContainer) } });

    logInfo(componentName, 'Shared container configured successfully', {
        timestamp: Date.now()
    });

    return sharedContainer;
}

export function configGameContainer(gameName: string, containerOptions: gc.IContainerOptions) {
    const componentName = 'GameBaseStartup';

    logInfo(componentName, 'Configuring game container', {
        gameName,
        containerOptions: Object.keys(containerOptions),
        timestamp: Date.now()
    });

    const container = gc.getContainer(containerOptions);

    const lobbyStore = sharedContainer.get(LobbyStore);
    container.bind(LobbyStore).toConstantValue(lobbyStore);

    const observerContainer = gc.buildObserverContainer(container);

    Observer.configure({ [gameName]: { mobx: { reaction }, container: observerContainer } });

    logInfo(componentName, 'Game container configured successfully', {
        gameName,
        timestamp: Date.now()
    });

    return container;
}
