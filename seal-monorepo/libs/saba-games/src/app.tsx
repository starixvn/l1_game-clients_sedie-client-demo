import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useEffect } from 'react';
import IframeContainer from './components/iframe-container';
import { appSettings } from './_shared/app-settings/vgaming-index';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    iframeSrc?: string;
    encryptionKey: string;
}

interface AppContentProps {
    token: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    iframeSrc?: string;
    encryptionKey: string;
}

const App = ({ appEnv, token, language, siteId, renewToken, updateBalanceCallback, iframeSrc, encryptionKey }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                token={token}
                renewToken={renewToken}
                updateBalanceCallback={updateBalanceCallback}
                iframeSrc={iframeSrc}
                encryptionKey={encryptionKey}
            />
        </AppProvider>
    );
};

const AppContent = ({ token, renewToken, updateBalanceCallback, iframeSrc, encryptionKey }: AppContentProps) => {
    const { language } = useAppContext();

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    loadI18n(language);
    return (
        <>
            <IframeContainer
                src={appSettings.standaloneUrl}
                token={token}
                language={language}
                renewToken={renewToken}
                encryptionKey={encryptionKey}
            />
        </>
    );
};

export default App;
