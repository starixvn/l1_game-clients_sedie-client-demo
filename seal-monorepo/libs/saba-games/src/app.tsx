import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import { AppProvider, useAppContext } from './appProvider';
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
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    encryptionKey: string;
}

interface AppContentProps {
    token: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    encryptionKey: string;
}

const App = ({ appEnv, token, language, siteId, renewToken, updateBalanceCallback, encryptionKey }: AppProps) => {
    return (
        <MessageProvider config={createMessageHandlerConfig(appEnv, encryptionKey)} options={{}}>
            <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
                <AppContent
                    token={token}
                    language={language}
                    renewToken={renewToken}
                    updateBalanceCallback={updateBalanceCallback}
                    encryptionKey={encryptionKey}
                />
            </AppProvider>
        </MessageProvider>
    );
};

const AppContent = ({ token, language, renewToken, updateBalanceCallback, encryptionKey }: AppContentProps) => {
    const { appEnv } = useAppContext();
    const iframeSrc = appSettings.standaloneUrl;
    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    loadI18n(language);
    return (
        <>
            <IframeContainer
                src={iframeSrc}
                token={token}
                language={language}
                renewToken={renewToken}
                encryptionKey={encryptionKey}
            />
        </>
    );
};

export default App;
