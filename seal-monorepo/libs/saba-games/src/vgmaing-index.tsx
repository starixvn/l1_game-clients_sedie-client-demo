import 'reflect-metadata';
import { configureSentryManager, SentryLogLevel } from './_shared/utils/sentry-manager';
import { appSettings } from './_shared/app-settings/vgaming-index';
import { useEffect } from 'react';
import './style.module.scss';
import App from './app';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER } from '../constant/app';

export const useSentryInit = () => {
    useEffect(() => {
        try {
            const settings = appSettings;
            configureSentryManager({
                dsn: settings.sentry.dsn,
                environment: settings.sentry.environment,
                componentName: 'SabaGames',
                logLevel: SentryLogLevel.INFO,
                enableWorkflowTracking: true,
                enablePerformanceTracking: true,
                enableConsoleOverride: true,
            });
        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
        }
    }, []);
};

const SabaGamesGroup = ({
    isDarkMode = false,
    platformType = PLATFORM_TYPE_NUMBER.DESKTOP,
    token = '',
    renewToken = () => { },
    appEnv = '',
    siteId = '',
    language = 'en',
}) => {
    const platform = PLATFORM_TYPE_MAPPING[platformType] || '';
    useSentryInit();

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            <App appEnv={appEnv} token={token} language={language} siteId={siteId} renewToken={renewToken} />
        </div>
    );
};

export default SabaGamesGroup;
