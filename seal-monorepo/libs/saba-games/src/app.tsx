import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useCallback, useEffect } from 'react';
import IframeContainer from './components/iframe-container';
import { MessageProvider } from './_shared/contexts/message-context';
import { createMessageHandlerConfig } from './_shared/utils/message-handler-manager';
import { appSettings } from './_shared/app-settings';
import { MessageEncryption } from './utils/encryption';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
}

interface AppContentProps {
    token: string;
    language: string;
    theme: string;
    isDarkMode: boolean;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
}

const App = ({ appEnv, token, language, theme, isDarkMode, siteId, renewToken, updateBalanceCallback }: AppProps) => {
    return (
        <MessageProvider config={createMessageHandlerConfig(appEnv)} options={{}}>
            <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
                <AppContent
                    token={token}
                    language={language}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    renewToken={renewToken}
                    updateBalanceCallback={updateBalanceCallback}
                />
            </AppProvider>
        </MessageProvider>
    );
};

const AppContent = ({ token, language, theme, isDarkMode, renewToken, updateBalanceCallback }: AppContentProps) => {
    const { appEnv } = useAppContext();
    const gameSrc = appSettings.standaloneUrl;
    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    const buildIframeSrc = useCallback(() => {
        if (!token) return gameSrc;
        const url = new URL(gameSrc);

        try {
            const encryptionKey = appSettings.encryptionKey || 'development-key';
            const messageEncryption = new MessageEncryption(encryptionKey);
            const encryptedToken = messageEncryption.encrypt({ token });

            url.searchParams.set('token', JSON.stringify(encryptedToken));

            console.log('Encrypted token URL built successfully');
        } catch (error) {
            console.error('Failed to encrypt token:', error);

            if (process.env.NODE_ENV === 'development') {
                url.searchParams.set('token', token);
            }
        }

        return url.toString();
    }, [gameSrc, token]);

    const iframeSrc = buildIframeSrc();

    loadI18n(language);
    return (
        <>
            <IframeContainer
                src={iframeSrc}
                token={token}
                language={language}
                theme={theme}
                isDarkMode={isDarkMode}
                renewToken={renewToken}
            />
        </>
    );
};

export default App;
