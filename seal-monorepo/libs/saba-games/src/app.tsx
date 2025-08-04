import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import { AppProvider } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useEffect } from 'react';
import IframeContainer from './components/iframe-container';
import { MessageProvider } from './_shared/contexts/message-context';
import { createMessageHandlerConfig } from './_shared/utils/message-handler-manager';
import { appSettings } from './_shared/app-settings';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    redirectUrl?: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    encryptionKey: string;
}

interface AppContentProps {
    token: string;
    language: string;
    redirectUrl?: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    encryptionKey: string;
}

const App = ({ appEnv, token, language, siteId, redirectUrl, renewToken, updateBalanceCallback, encryptionKey }: AppProps) => {
    return (
        <MessageProvider config={createMessageHandlerConfig(appEnv, encryptionKey)} options={{}}>
            <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
                <AppContent
                    token={token}
                    language={language}
                    redirectUrl={redirectUrl}
                    renewToken={renewToken}
                    updateBalanceCallback={updateBalanceCallback}
                    encryptionKey={encryptionKey}
                />
            </AppProvider>
        </MessageProvider>
    );
};

const AppContent = ({ token, language, redirectUrl, renewToken, updateBalanceCallback, encryptionKey }: AppContentProps) => {
    // Use dynamic redirectUrl if provided, otherwise fall back to standaloneUrl
    const iframeSrc = redirectUrl || appSettings.standaloneUrl;

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    loadI18n(language);
    return (
        <>
            <IframeContainer
                src={iframeSrc || 'http://localhost:4551/'}
                token={token}
                language={language}
                renewToken={renewToken}
                encryptionKey={encryptionKey}
            />
        </>
    );
};

export default App;
