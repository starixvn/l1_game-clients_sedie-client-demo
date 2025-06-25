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
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
}

interface AppContentProps {
    token: string;
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
}

const App = ({ appEnv, token, language, siteId, updateBalanceCallback, onPlayButtonTokenRequest }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                token={token}
                updateBalanceCallback={updateBalanceCallback}
                onPlayButtonTokenRequest={onPlayButtonTokenRequest}
            />
        </AppProvider>
    );
};

const AppContent = ({ token, updateBalanceCallback, onPlayButtonTokenRequest }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState(token);

    const handlePlayButtonClick = useCallback(async () => {
        const appStartTime = performance.now();
        console.log('🎮 [APP_TIMING] Play button clicked in PROTOTYPE - App component handling at:', new Date().toISOString());

        // If we have a token request callback, use it to get a fresh token
        if (onPlayButtonTokenRequest) {
            console.log('🔄 [APP_TIMING] Calling token request callback for REAL APP...');
            const tokenStartTime = performance.now();

            try {
                const newToken = await onPlayButtonTokenRequest();
                const tokenEndTime = performance.now();
                const tokenDuration = tokenEndTime - tokenStartTime;

                if (newToken) {
                    console.log(`✅ [APP_TIMING] Token callback completed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                    console.log(`🔄 [APP_TIMING] Updating current token for REAL APP...`);
                    setCurrentToken(newToken);
                } else {
                    console.log(`⚠️ [APP_TIMING] Token callback returned null for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                }
            } catch (error) {
                const tokenEndTime = performance.now();
                const tokenDuration = tokenEndTime - tokenStartTime;
                console.log(`💥 [APP_TIMING] Token callback failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                console.error('[APP_TIMING] Token callback error:', error);
            }
        } else {
            console.log('⚠️ [APP_TIMING] No token request callback provided for REAL APP');
        }

        console.log('🎯 [APP_TIMING] Setting hasClickedPlay to true - Transitioning from PROTOTYPE to REAL APP...');
        setHasClickedPlay(true);

        const appEndTime = performance.now();
        const appDuration = appEndTime - appStartTime;
        console.log(`🏁 [APP_TIMING] PROTOTYPE to REAL APP transition completed - Total duration: ${appDuration.toFixed(2)}ms`);
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
            {currentToken && <Lobby token={currentToken} language={language} />}
        </div>
    );
};

export default App;
