import 'reflect-metadata';
import * as gc from '@sg/sg-game-client';
import { appSettings } from './_shared/app-settings';
import { useEffect } from 'react';
import './style.module.scss';
import App from './app';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER } from '../constant/app';

export const useSentryInit = () => {
    useEffect(() => {
        try {
            const settings = appSettings;
            gc.sentryLogger.start(settings.sentry.dsn, settings.sentry.environment, 'live-page-client');
        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
        }
    }, []);
};

const SabaGamesGroup = ({
    isDarkMode = false,
    platformType = PLATFORM_TYPE_NUMBER.DESKTOP,
    token = '',
    // renewToken = () => { },
    appEnv = '',
    siteId = '',
    language = 'en',
    encryptionKey = appSettings.encryptionKey || 'development-key'
}) => {
    const platform = PLATFORM_TYPE_MAPPING[platformType] || '';
    useSentryInit();

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            <App
                appEnv={appEnv}
                token={token}
                language={language}
                siteId={siteId}
                // renewToken={renewToken}
                encryptionKey={encryptionKey}
            />
        </div>
    );
};

export default SabaGamesGroup;
