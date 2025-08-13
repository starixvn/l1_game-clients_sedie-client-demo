import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useCallback, useEffect, useState } from 'react';
import IframeContainer from './components/iframe-container';
import { MessageProvider } from './_shared/contexts/message-context';
import { createMessageHandlerConfig } from './_shared/utils/message-handler-manager';
import { appSettings } from './_shared/app-settings';
import { MessageEncryption } from './utils/encryption';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: () => Promise<void>;
    updateBalanceCallback?: ((totalStake?: number, winBet?: number) => void) | null;
    useRawToken?: boolean;
}

interface AppContentProps {
    token: string;
    language: string;
    theme: string;
    isDarkMode: boolean;
    updateBalanceCallback?: ((totalStake?: number, winBet?: number) => void) | null;
}

const App = ({ appEnv, token, language, theme, isDarkMode, siteId, renewToken, updateBalanceCallback, useRawToken }: AppProps) => {
    return (
        <MessageProvider config={createMessageHandlerConfig(appEnv)} options={{}} renewToken={renewToken}>
            <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
                <AppContent
                    token={token}
                    language={language}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    updateBalanceCallback={updateBalanceCallback}
                    siteId={siteId}
                    useRawToken={useRawToken}
                />
            </AppProvider>
        </MessageProvider>
    );
};

const AppContent = ({ token, language, theme, isDarkMode, updateBalanceCallback, siteId, useRawToken }: AppContentProps & { siteId: string; useRawToken?: boolean }) => {
    const { appEnv } = useAppContext();
    const gameSrc = appSettings.standaloneUrl;
    const [iframeSrc, setIframeSrc] = useState<string>('');

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    const buildIframeSrc = useCallback(() => {
        if (!token) return gameSrc;
        const url = new URL(gameSrc);

        if (useRawToken) {
            url.searchParams.set('token', token);
            url.searchParams.set('rawToken', '1');
        } else {
            try {
                const encryptionKey = appSettings.encryptionKey || 'development-key';
                const messageEncryption = new MessageEncryption(encryptionKey);
                const encryptedToken = messageEncryption.encrypt({ token });
                url.searchParams.set('token', JSON.stringify(encryptedToken));
                console.log('Encrypted token URL built successfully');
            } catch (error) {
                console.error('Failed to encrypt token:', error);
                url.searchParams.set('token', token);
                url.searchParams.set('rawToken', '1');
            }
        }

        return url.toString();
    }, [gameSrc, token, useRawToken]);

    useEffect(() => {
        const src = buildIframeSrc();
        setIframeSrc(src);
    }, [buildIframeSrc]);

    loadI18n(language);
    return (
        <>
            <IframeContainer
                src={iframeSrc}
                token={token}
                language={language}
                theme={theme}
                isDarkMode={isDarkMode}
                siteId={siteId}
                appEnv={appEnv}
            />
        </>
    );
};

export default App;
