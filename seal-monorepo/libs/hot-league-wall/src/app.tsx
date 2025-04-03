import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
}

interface AppContentProps {
    token: string;
    renewToken?: Function;
}

const App = ({ appEnv, token, language, siteId, renewToken }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent token={token} renewToken={renewToken} />
        </AppProvider>
    );
};

const AppContent = ({ token, renewToken }: AppContentProps) => {
    const { language } = useAppContext();

    loadI18n(language);
    return (
        <div data-react="true" style={{ width: '100%' }}>
            {token && <Lobby token={token} language={language} renewToken={renewToken} />}
        </div>
    );
};

export default App;
