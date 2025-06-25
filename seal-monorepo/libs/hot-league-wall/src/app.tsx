import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useEffect, useState, useCallback } from 'react';
import RNGSoccerStaticPrototype from './games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
}

interface AppContentProps {
    token: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
}

const App = ({ appEnv, token, language, siteId, renewToken, updateBalanceCallback, onPlayButtonTokenRequest }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                token={token}
                renewToken={renewToken}
                updateBalanceCallback={updateBalanceCallback}
                onPlayButtonTokenRequest={onPlayButtonTokenRequest}
            />
        </AppProvider>
    );
};

const AppContent = ({ token, renewToken, updateBalanceCallback, onPlayButtonTokenRequest }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState(token);

    const handlePlayButtonClick = useCallback(async () => {
        // If we have a token request callback, use it to get a fresh token
        if (onPlayButtonTokenRequest) {
            const newToken = await onPlayButtonTokenRequest();
            if (newToken) {
                setCurrentToken(newToken);
            }
        }
        setHasClickedPlay(true);
    }, [onPlayButtonTokenRequest]);

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    // Update current token when prop changes
    useEffect(() => {
        setCurrentToken(token);
    }, [token]);

    loadI18n(language);

    // Show RNG Soccer prototype first, then main app after play button click
    if (!hasClickedPlay) {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                <RNGSoccerStaticPrototype onPlayButtonClick={handlePlayButtonClick} />
            </div>
        );
    }

    return (
        <div data-react="true" style={{ width: '100%' }}>
            {currentToken && <Lobby token={currentToken} language={language} renewToken={renewToken} />}
        </div>
    );
};

export default App;
