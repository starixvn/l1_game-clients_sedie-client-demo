import { useEffect } from 'react';
import { useSentryInit } from '../../saba-games-index';
import { usePreviewContext } from '../../previewProvider';
import { PLATFORM_TYPE_MAPPING, PLATFORM_TYPE_NUMBER, VIVA88_SITE_ID } from '../../../constant/app';
import { shouldShowSSOControls, logSSOControlsConfig } from '../../_shared/utils/sso-controls-config';
import { AppConfiguration } from '../types';

export const useAppConfiguration = (): AppConfiguration => {
    const { theme, isDarkMode, language } = usePreviewContext();
    const showSSOControls = shouldShowSSOControls();

    const appEnv = '';
    const siteId = VIVA88_SITE_ID;
    const platformType = PLATFORM_TYPE_NUMBER.DESKTOP;
    const platform = PLATFORM_TYPE_MAPPING[platformType];

    useEffect(() => {
        logSSOControlsConfig();
    }, [showSSOControls]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-darkmode', isDarkMode.toString());
    }, [theme, isDarkMode]);

    useSentryInit();

    return {
        theme,
        isDarkMode,
        language,
        showSSOControls,
        appEnv,
        siteId,
        platform
    };
}; 