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
    isSSOFailureMode?: boolean;
    onSSORetry?: () => void;
}

interface AppContentProps {
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
    FailedToken?: string | null;
    isSSOFailureMode?: boolean;
    onSSORetry?: () => void;
}

const App = ({ appEnv, language, siteId, updateBalanceCallback, onPlayButtonTokenRequest, FailedToken, isSSOFailureMode, onSSORetry }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                updateBalanceCallback={updateBalanceCallback}
                onPlayButtonTokenRequest={onPlayButtonTokenRequest}
                FailedToken={FailedToken}
                isSSOFailureMode={isSSOFailureMode}
                onSSORetry={onSSORetry}
            />
        </AppProvider>
    );
};

const AppContent = ({ updateBalanceCallback, onPlayButtonTokenRequest, FailedToken, isSSOFailureMode, onSSORetry }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check if SSO controls are enabled for testing
    const ssoControlsEnabled = shouldShowSSOControls();

    // Use isSSOFailureMode directly for ssoFailure state when SSO controls are enabled
    const ssoFailure = ssoControlsEnabled && isSSOFailureMode;

    // Effect to log when ssoFailure state changes
    useEffect(() => {
        if (ssoControlsEnabled) {
            console.log(`🔄 [APP_TIMING] SSO Failure Mode changed: ${isSSOFailureMode ? 'ENABLED' : 'DISABLED'}`);
            console.log(`🔄 [APP_TIMING] ssoFailure state: ${ssoFailure ? 'true' : 'false'}`);
        }
    }, [isSSOFailureMode, ssoFailure, ssoControlsEnabled]);

    const handlePlayButtonClick = useCallback(async () => {
        const appStartTime = performance.now();
        console.log('🎮 [APP_TIMING] Play button clicked in PROTOTYPE - App component handling at:', new Date().toISOString());

        setIsLoading(true);

        // Always use TokenRequestManager to get a fresh token (real flow)
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
                // ssoFailure is now controlled by isSSOFailureMode prop
                if (ssoControlsEnabled) {
                    console.log('🔄 [APP_TIMING] SSO controls enabled - ssoFailure will be controlled by isSSOFailureMode');
                } else {
                    console.log('🚫 [APP_TIMING] SSO controls disabled - using normal error handling instead of ssoFailure');
                }
            }
        } catch (error) {
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;
            console.log(`💥 [APP_TIMING] TokenRequestManager failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
            console.error('[APP_TIMING] TokenRequestManager error:', error);
            // ssoFailure is now controlled by isSSOFailureMode prop
            if (ssoControlsEnabled) {
                console.log('🔄 [APP_TIMING] SSO controls enabled - ssoFailure will be controlled by isSSOFailureMode');
            } else {
                console.log('🚫 [APP_TIMING] SSO controls disabled - using normal error handling instead of ssoFailure');
            }
        } finally {
            setIsLoading(false);
        }

        const appEndTime = performance.now();
        const appDuration = appEndTime - appStartTime;
        console.log(`🏁 [APP_TIMING] PROTOTYPE to REAL APP transition completed - Total duration: ${appDuration.toFixed(2)}ms`);
    }, [ssoControlsEnabled]);

    const handleSSORetry = useCallback(async () => {
        console.log('🔄 [SSO_RETRY] User clicked retry button for SSO');

        // Reset SSO failure mode to false when retry is clicked
        if (ssoControlsEnabled && onSSORetry) {
            console.log('🔄 [SSO_RETRY] Calling onSSORetry callback to reset SSO failure mode');
            onSSORetry();
        }

        // Always use TokenRequestManager to get a fresh token (real flow)
        const tokenManager = TokenRequestManager.getInstance();
        console.log('🔄 [SSO_RETRY] Using TokenRequestManager for REAL APP...');
        const tokenStartTime = performance.now();

        try {
            const newToken = await tokenManager.executeTokenRequest();
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;

            if (newToken) {
                console.log(`✅ [SSO_RETRY] TokenRequestManager completed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                console.log('🔄 [SSO_RETRY] Token request successful, transitioning to real game');
                setCurrentToken(newToken);
                setHasClickedPlay(true);
            } else {
                console.log(`⚠️ [SSO_RETRY] TokenRequestManager returned null for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                console.log('🔄 [SSO_RETRY] Token request failed, staying in SSO failure mode');
                // Stay in SSO failure mode - the ssoFailure state will remain true
            }
        } catch (error) {
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;
            console.log(`💥 [SSO_RETRY] TokenRequestManager failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
            console.error('[SSO_RETRY] TokenRequestManager error:', error);
            console.log('🔄 [SSO_RETRY] Token request failed, staying in SSO failure mode');
            // Stay in SSO failure mode - the ssoFailure state will remain true
        }
    }, [ssoControlsEnabled, onSSORetry]);

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

    // Show SSO failure view if ssoFailure is true (controlled by isSSOFailureMode when SSO controls are enabled)
    if (ssoFailure) {
        console.log('🔄 [APP_TIMING] Showing SSO failure view - ssoFailure is true');
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
