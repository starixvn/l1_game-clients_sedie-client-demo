import 'reflect-metadata';
import * as gc from '@sg/sg-game-client';
import { appSettings } from './_shared/app-settings';
import { useEffect } from 'react';
import './style.module.scss';
import App from './app';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER } from '../constant/app';
import { configureSentryManager, SentryLogLevel } from 'sg-sentry';

// Component-specific Sentry is now handled by useComponentSentry hook
// This function is kept for backward compatibility but does nothing
export const useSentryInit = ({ siteId, appEnv }) => {
    // Sentry is now initialized within the component using useComponentSentry hook
    // This prevents global Sentry from capturing logs from other components
};

const SabaGamesGroup = ({
    isDarkMode = false,
    platformType = PLATFORM_TYPE_NUMBER.DESKTOP,
    token = '',
    appEnv = '',
    siteId = '',
    language = 'en',
    updateBalanceCallback = null,
    onRequestSSOToken = undefined
}) => {
    const platform = PLATFORM_TYPE_MAPPING[platformType] || '';
    useSentryInit({ siteId, appEnv });

    return (
        <div data-platform={platform} data-version={process.env.TAG_VERSION} className={'seal-vg-sg-index'}>
            <App
                appEnv={appEnv}
                language={language}
                siteId={siteId}
                updateBalanceCallback={updateBalanceCallback}
                onRequestSSOToken={onRequestSSOToken}
            />
        </div>
    );
};

export default SabaGamesGroup;
