import * as gc from '@sg/sg-game-client';
import * as Observer from '@sg/sg-observer';
import * as mobx from 'mobx';
import { reaction } from 'mobx';
import 'reflect-metadata';
import { getSiteConfig, appSettings } from '../../app-settings';
import { Lobby } from '../../states';
import { LobbyStore } from '../../states/lobby';
interface Languages {
    [key: string]: any;
}

declare global {
    interface Window {
        languages: Languages;
    }
}

function getSharedContainer(siteConfigs: gc.Configs.SiteConfigs) {
    console.log('[Startup] Creating shared container with site configs:', siteConfigs);

    const containerOptions: gc.IContainerOptions = {
        onContainerCreated: (container) => {
            console.log('[Startup] Container created, binding site configs');
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
            Lobby.FEATURE_NAME,
        ],
        features: [...gc.defaultFeatures, Lobby],
    };

    console.log('[Startup] Container options:', {
        enabledFeatures: containerOptions.enabledFeatures,
        featuresCount: containerOptions.features ? containerOptions.features.length : 0
    });

    const container = gc.getContainer(containerOptions);
    console.log('[Startup] Shared container created successfully');
    return container;
}

export const sharedContainer = getSharedContainer(getSiteConfig(appSettings.defaultGameId));
console.log('[Startup] Default game ID:', appSettings.defaultGameId);

export function configSharedContainer() {
    console.log('[Startup] Configuring shared container with Observer');
    Observer.configure({ default: { mobx, container: gc.buildObserverContainer(sharedContainer) } });
    console.log('[Startup] Shared container configured successfully');
    return sharedContainer;
}

export function configGameContainer(gameName: string, containerOptions: gc.IContainerOptions) {
    console.log(`[Startup] Configuring game container for: ${gameName}`);
    console.log('[Startup] Container options:', {
        enabledFeatures: containerOptions.enabledFeatures,
        featuresCount: containerOptions.features ? containerOptions.features.length : 0
    });

    const container = gc.getContainer(containerOptions);
    console.log(`[Startup] Game container created for: ${gameName}`);

    const lobbyStore = sharedContainer.get(LobbyStore);
    console.log('[Startup] Retrieved LobbyStore from shared container');
    container.bind(LobbyStore).toConstantValue(lobbyStore);
    console.log('[Startup] Bound LobbyStore to game container');

    const observerContainer = gc.buildObserverContainer(container);
    console.log('[Startup] Built observer container');

    Observer.configure({ [gameName]: { mobx: { reaction }, container: observerContainer } });
    console.log(`[Startup] Game container configured successfully for: ${gameName}`);
    return container;
}
