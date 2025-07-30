import * as gc from '@sg/sg-game-client';
import * as Observer from '@sg/sg-observer';
import * as mobx from 'mobx';
import { reaction } from 'mobx';
import 'reflect-metadata';
import { getSiteConfig, appSettings } from '../../_shared/app-settings';
import { Lobby } from '../../_shared/states';
import { LobbyStore } from '../../_shared/states/lobby';
import { sentryHelper } from '../../_shared/utils/sentry-helper';

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

    sentryHelper.logInfo(componentName, 'Creating shared container', {
        siteConfigs: Object.keys(siteConfigs),
        timestamp: Date.now()
    });

    const containerOptions: gc.IContainerOptions = {
        onContainerCreated: (container) => {
            sentryHelper.logInfo(componentName, 'Container created callback executed', {
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

    sentryHelper.logInfo(componentName, 'Shared container options configured', {
        enabledFeatures: containerOptions.enabledFeatures,
        featuresCount: containerOptions.features?.length || 0,
        timestamp: Date.now()
    });

    const container = gc.getContainer(containerOptions);

    sentryHelper.logInfo(componentName, 'Shared container created successfully', {
        timestamp: Date.now()
    });

    return container;
}

export const sharedContainer = getSharedContainer(getSiteConfig(appSettings.defaultGameId));

// Make the shared container available globally for external access
if (typeof window !== 'undefined') {
    sentryHelper.logInfo('GameBaseStartup', 'Making shared container available globally', {
        timestamp: Date.now()
    });
    (window as any).hot_league_wall_shared_container = sharedContainer;
}

export function configSharedContainer() {
    const componentName = 'GameBaseStartup';

    sentryHelper.logInfo(componentName, 'Configuring shared container', {
        timestamp: Date.now()
    });

    Observer.configure({ default: { mobx, container: gc.buildObserverContainer(sharedContainer) } });
    Observer.configure({ default: { mobx, container: gc.buildObserverContainer(sharedContainer) } });

    sentryHelper.logInfo(componentName, 'Shared container configured successfully', {
        timestamp: Date.now()
    });

    return sharedContainer;
}

export function configGameContainer(gameName: string, containerOptions: gc.IContainerOptions) {
    const componentName = 'GameBaseStartup';

    sentryHelper.logInfo(componentName, 'Configuring game container', {
        gameName,
        containerOptions: Object.keys(containerOptions),
        timestamp: Date.now()
    });

    const container = gc.getContainer(containerOptions);

    const lobbyStore = sharedContainer.get(LobbyStore);
    container.bind(LobbyStore).toConstantValue(lobbyStore);

    const observerContainer = gc.buildObserverContainer(container);

    Observer.configure({ [gameName]: { mobx: { reaction }, container: observerContainer } });

    sentryHelper.logInfo(componentName, 'Game container configured successfully', {
        gameName,
        timestamp: Date.now()
    });

    return container;
}
