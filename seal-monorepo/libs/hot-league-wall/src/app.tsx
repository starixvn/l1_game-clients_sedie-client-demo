import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useEffect } from 'react';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
}

interface AppContentProps {
    token: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
}

const App = ({ appEnv, token, language, siteId, renewToken, updateBalanceCallback }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent token={token} renewToken={renewToken} updateBalanceCallback={updateBalanceCallback} />
        </AppProvider>
    );
};

const AppContent = ({ token, renewToken, updateBalanceCallback }: AppContentProps) => {
    const { language } = useAppContext();

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    loadI18n(language);
    return (
        <div data-react="true" style={{ width: '100%' }}>
            {token && <Lobby token={token} language={language} renewToken={renewToken} />}
        </div>
    );
};

export default App;
