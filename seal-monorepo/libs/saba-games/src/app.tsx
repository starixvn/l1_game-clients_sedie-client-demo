import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useEffect } from 'react';
import IframeContainer from './components/iframe-container';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    iframeSrc?: string;
}

interface AppContentProps {
    token: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    iframeSrc?: string;
}

const App = ({ appEnv, token, language, siteId, renewToken, updateBalanceCallback, iframeSrc }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                token={token}
                renewToken={renewToken}
                updateBalanceCallback={updateBalanceCallback}
                iframeSrc={iframeSrc}
            />
        </AppProvider>
    );
};

const AppContent = ({ token, renewToken, updateBalanceCallback, iframeSrc }: AppContentProps) => {
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
                src={iframeSrc || 'http://localhost:4551'}
                // src={iframeSrc || 'https://l1-standalone-live-page-local1.lumigame.com'}
                token={token}
                language={language}
                renewToken={renewToken}
            />
        </>
    );
};

export default App;
