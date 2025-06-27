import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { TokenRequestManager } from './_shared/utils/token-request-manager';
import { useEffect, useState, useCallback } from 'react';
import RNGSoccerStaticPrototype from './games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';
import { GameDisconnectView } from './games/game-base/components/game-disconnect-view';
import blurBgGame from './assets/rng-soccer/blur-bg-game.png';

interface AppProps {
    appEnv: string;
    siteId: string;
    language: string;
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
    onSSORetry?: () => void;
}

interface AppContentProps {
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
    onSSORetry?: () => void;
}

const App = ({ appEnv, language, siteId, updateBalanceCallback, onPlayButtonTokenRequest, onSSORetry }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                updateBalanceCallback={updateBalanceCallback}
                onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                onSSORetry={onSSORetry}
            />
        </AppProvider>
    );
};

const AppContent = ({ updateBalanceCallback, onPlayButtonTokenRequest, onSSORetry }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [ssoFailure, setSsoFailure] = useState(false);

    // Shared token request logic
    const executeTokenRequest = useCallback(async (context: 'APP_TIMING' | 'SSO_RETRY', setLoading = false) => {
        console.log(`🔄 [${context}] Using TokenRequestManager for REAL APP...`);
        const tokenStartTime = performance.now();

        try {
            const newToken = await TokenRequestManager.getInstance().executeTokenRequest();
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;

            if (newToken) {
                console.log(`✅ [${context}] TokenRequestManager completed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                setCurrentToken(newToken);
                setHasClickedPlay(true);
                setSsoFailure(false); // Clear SSO failure state
                return { success: true, token: newToken, duration: tokenDuration };
            } else {
                console.log(`⚠️ [${context}] TokenRequestManager returned null for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                setSsoFailure(true); // Set SSO failure state
                return { success: false, token: null, duration: tokenDuration };
            }
        } catch (error) {
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;
            console.log(`💥 [${context}] TokenRequestManager failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
            console.error(`[${context}] TokenRequestManager error:`, error);
            setSsoFailure(true); // Set SSO failure state
            return { success: false, token: null, duration: tokenDuration, error };
        }
    }, []);

    const handlePlayButtonClick = useCallback(async () => {
        const appStartTime = performance.now();
        console.log('🎮 [APP_TIMING] Play button clicked in PROTOTYPE - App component handling at:', new Date().toISOString());

        setIsLoading(true);

        const result = await executeTokenRequest('APP_TIMING');

        setIsLoading(false);

        const appEndTime = performance.now();
        const appDuration = appEndTime - appStartTime;
        console.log(`🏁 [APP_TIMING] PROTOTYPE to REAL APP transition completed - Total duration: ${appDuration.toFixed(2)}ms`);
    }, [executeTokenRequest]);

    const handleSSORetry = useCallback(async () => {
        console.log('🔄 [SSO_RETRY] User clicked retry button for SSO');

        const result = await executeTokenRequest('SSO_RETRY');

        if (result.success) {
            console.log('🔄 [SSO_RETRY] Token request successful, transitioning to real game');

            // Call parent's onSSORetry callback only after successful token request (for SSO control simulator)
            if (onSSORetry) {
                console.log('🔄 [SSO_RETRY] Calling parent onSSORetry callback after successful token request');
                onSSORetry();
            }
        } else {
            console.log('🔄 [SSO_RETRY] Token request failed, staying in SSO failure mode');
            // Keep SSO failure state
        }
    }, [executeTokenRequest, onSSORetry]);

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    useEffect(() => {
        if (onPlayButtonTokenRequest) {
            TokenRequestManager.getInstance().setTokenRequestCallback(onPlayButtonTokenRequest);
        }
    }, [onPlayButtonTokenRequest]);

    loadI18n(language);

    // Show RNG Soccer prototype first, then main app after play button click
    if (!hasClickedPlay) {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                <RNGSoccerStaticPrototype onPlayButtonClick={handlePlayButtonClick} isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div data-react="true" style={{ width: '100%' }}>
            {currentToken && <Lobby token={currentToken} language={language} onSSORetry={handleSSORetry} />}
        </div>
    );
};

export default App;
