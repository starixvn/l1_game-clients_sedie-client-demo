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
import { shouldShowSSOControls } from './_shared/utils/sso-controls-config';

interface AppProps {
    appEnv: string;
    siteId: string;
    language: string;
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
    FailedToken?: string | null;
}

interface AppContentProps {
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
    FailedToken?: string | null;
}

const App = ({ appEnv, language, siteId, updateBalanceCallback, onPlayButtonTokenRequest, FailedToken }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                updateBalanceCallback={updateBalanceCallback}
                onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                FailedToken={FailedToken}
            />
        </AppProvider>
    );
};

const AppContent = ({ updateBalanceCallback, onPlayButtonTokenRequest, FailedToken }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [ssoFailure, setSsoFailure] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if SSO controls are enabled for testing
    const ssoControlsEnabled = shouldShowSSOControls();

    // Effect to handle FailedToken changes and trigger rerender (only when SSO controls are enabled)
    useEffect(() => {
        if (FailedToken && hasClickedPlay && ssoControlsEnabled) {
            console.log(`🔄 [APP_TIMING] FailedToken changed, updating current token to: ${FailedToken}`);
            setCurrentToken(FailedToken);
        } else if (FailedToken && !ssoControlsEnabled) {
            console.log(`🚫 [APP_TIMING] FailedToken provided but SSO controls are disabled - ignoring FailedToken: ${FailedToken}`);
        }
    }, [FailedToken, hasClickedPlay, ssoControlsEnabled]);

    const handlePlayButtonClick = useCallback(async () => {
        const appStartTime = performance.now();
        console.log('🎮 [APP_TIMING] Play button clicked in PROTOTYPE - App component handling at:', new Date().toISOString());

        setIsLoading(true);
        setSsoFailure(false);

        // Check if we should use a failed token for simulation (only when SSO controls are enabled)
        if (FailedToken && ssoControlsEnabled) {
            console.log('🔄 [APP_TIMING] Using FailedToken for SSO failure simulation (SSO controls enabled)...');
            const tokenStartTime = performance.now();

            // Simulate a delay to make it feel realistic
            await new Promise(resolve => setTimeout(resolve, 500));

            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;

            console.log(`💥 [APP_TIMING] FailedToken simulation completed - Duration: ${tokenDuration.toFixed(2)}ms`);
            console.log(`🚫 [APP_TIMING] Setting current token to FailedToken: ${FailedToken}`);

            setCurrentToken(FailedToken);
            setHasClickedPlay(true);
            setIsLoading(false);

            const appEndTime = performance.now();
            const appDuration = appEndTime - appStartTime;
            console.log(`🏁 [APP_TIMING] FailedToken simulation completed - Total duration: ${appDuration.toFixed(2)}ms`);
            return;
        } else if (FailedToken && !ssoControlsEnabled) {
            console.log('🚫 [APP_TIMING] FailedToken provided but SSO controls are disabled - using normal token flow instead');
        }

        // Use TokenRequestManager to get a fresh token (normal flow)
        const tokenManager = TokenRequestManager.getInstance();
        console.log('🔄 [APP_TIMING] Using TokenRequestManager for REAL APP...');
        const tokenStartTime = performance.now();

        try {
            const newToken = await tokenManager.executeTokenRequest();
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;

            if (newToken) {
                console.log(`✅ [APP_TIMING] TokenRequestManager completed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                console.log(`🔄 [APP_TIMING] Updating current token for REAL APP...`);
                setCurrentToken(newToken);
                setHasClickedPlay(true);
            } else {
                console.log(`⚠️ [APP_TIMING] TokenRequestManager returned null for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                setSsoFailure(true);
            }
        } catch (error) {
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;
            console.log(`💥 [APP_TIMING] TokenRequestManager failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
            console.error('[APP_TIMING] TokenRequestManager error:', error);
            setSsoFailure(true);
        } finally {
            setIsLoading(false);
        }

        const appEndTime = performance.now();
        const appDuration = appEndTime - appStartTime;
        console.log(`🏁 [APP_TIMING] PROTOTYPE to REAL APP transition completed - Total duration: ${appDuration.toFixed(2)}ms`);
    }, [FailedToken, ssoControlsEnabled]);

    const handleSSORetry = useCallback(async () => {
        console.log('🔄 [SSO_RETRY] User clicked retry button for SSO');
        await handlePlayButtonClick();
    }, [handlePlayButtonClick]);

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

    // Show SSO failure view if token request failed
    if (ssoFailure) {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                <GameDisconnectView
                    onReconnect={handleSSORetry}
                    isSSOFailure={true}
                    // customMessage="Login failed. Please check your connection and try again."
                    // customButtonText="Retry Login"
                    backgroundImage={blurBgGame}
                />
            </div>
        );
    }

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
            {currentToken && <Lobby token={currentToken} language={language} />}
        </div>
    );
};

export default App;
