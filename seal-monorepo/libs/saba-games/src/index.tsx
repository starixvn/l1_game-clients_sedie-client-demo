import 'reflect-metadata';
import * as gc from '@sg/sg-game-client';
import { appSettings } from './_shared/app-settings';
import { useEffect, useState } from 'react';
import './style.module.scss';
import App from './app';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER } from '../constant/app';
import { dataTheme } from './_shared/components/provider-set-dropdown';
import { createMessageHandler, MessageType } from './_shared/utils/window-message-util';

export const useSentryInit = ({ siteId, appEnv }) => {
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
    renewToken = () => { },
    appEnv = '',
    siteId = '',
    language = 'en',
    updateBalanceCallback = null
}) => {
    const platform = PLATFORM_TYPE_MAPPING[platformType] || '';
    const [currentTheme, setCurrentTheme] = useState('light-01');
    const [currentIsDarkMode, setIsDarkMode] = useState(isDarkMode);
    const [currentLanguage, setLanguage] = useState(language);

    useSentryInit({ siteId, appEnv });

    // Handle messages from parent window
    useEffect(() => {
        const handleMessage = createMessageHandler({
            [MessageType.UPDATE_SETTINGS]: (data) => {
                console.log('UPDATE_SETTINGS received:', data);
                const { theme, isDarkMode, language } = data.settings;

                console.log('Current state before update:', {
                    theme: currentTheme,
                    isDarkMode: currentIsDarkMode,
                    language: currentLanguage
                });

                setCurrentTheme(theme || 'light-01');
                setIsDarkMode(isDarkMode);
                setLanguage(language || 'en');

                // Update data attributes immediately
                document.documentElement.setAttribute('data-theme', theme || 'light-01');
                document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());

                console.log('State updated to:', {
                    theme,
                    isDarkMode,
                    language
                });
            }
        });

        console.log('Setting up message listener in SabaGamesGroup');
        window.addEventListener('message', handleMessage);
        return () => {
            console.log('Cleaning up message listener in SabaGamesGroup');
            window.removeEventListener('message', handleMessage);
        };
    }, []); // Remove dependencies to prevent recreation of listener

    // Log state changes
    useEffect(() => {
        console.log('State changed:', {
            theme: currentTheme,
            isDarkMode: currentIsDarkMode,
            language: currentLanguage
        });
    }, [currentTheme, currentIsDarkMode, currentLanguage]);

    return (
        <div
            data-platform={platform}
            data-version={process.env.TAG_VERSION}
            className={'seal-vg-sg-index'}
            data-theme={currentTheme}
            data-darkmode={currentIsDarkMode.toString()}
        >
            <App
                appEnv={appEnv}
                token={token}
                language={currentLanguage}
                siteId={siteId}
                renewToken={renewToken}
                updateBalanceCallback={updateBalanceCallback}
            />
        </div>
    );
};

export default SabaGamesGroup;
