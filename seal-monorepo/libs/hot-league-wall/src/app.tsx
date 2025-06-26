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
import SimulatorTestPage from './pages/simulator-test';
import RNGSoccerSimulator from './games/saba-club/rng-soccer/rng-soccer-simulator';

interface AppProps {
    appEnv: string;
    siteId: string;
    language: string;
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
}

interface AppContentProps {
    updateBalanceCallback?: void | null;
    onPlayButtonTokenRequest?: () => Promise<string | null>;
}

const App = ({ appEnv, language, siteId, updateBalanceCallback, onPlayButtonTokenRequest }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent updateBalanceCallback={updateBalanceCallback} onPlayButtonTokenRequest={onPlayButtonTokenRequest} />
        </AppProvider>
    );
};

const AppContent = ({ updateBalanceCallback, onPlayButtonTokenRequest }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [ssoFailure, setSsoFailure] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check URL parameters for page routing
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');

    const handlePlayButtonClick = useCallback(async () => {
        const appStartTime = performance.now();
        console.log('🎮 [APP_TIMING] Play button clicked in PROTOTYPE - App component handling at:', new Date().toISOString());

        setIsLoading(true);
        setSsoFailure(false);

        // Use TokenRequestManager to get a fresh token
        const tokenManager = TokenRequestManager.getInstance();
        console.log('🔄 [APP_TIMING] Using TokenRequestManager for REAL APP...');
        const tokenStartTime = performance.now();

        try {
            const newToken = await tokenManager.executeTokenRequest();
            console.log('🔄 [APP_TIMING] TokenRequestManager returned token:', newToken);
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
    }, []);

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

    // Show simulator test page if requested
    if (pageParam === 'simulator') {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                <SimulatorTestPage />
            </div>
        );
    }

    // Show RNG Soccer simulator if requested
    if (pageParam === 'rng-soccer-simulator') {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                {/* Development Navigation Bar */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: '#333',
                        color: 'white',
                        padding: '10px',
                        zIndex: 9999,
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>🎮 RNG Soccer Simulator</span>
                        <a
                            href="/"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '5px 10px',
                                background: '#28a745',
                                borderRadius: '4px'
                            }}
                        >
                            ← Back to Main App
                        </a>
                        <a
                            href="/?page=simulator"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '5px 10px',
                                background: '#007bff',
                                borderRadius: '4px'
                            }}
                        >
                            Simulator Test
                        </a>
                    </div>
                )}
                <RNGSoccerSimulator
                    namespace="rng-soccer-simulator"
                    language={language}
                />
            </div>
        );
    }

    // Show SSO failure view if token request failed
    if (ssoFailure) {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                <GameDisconnectView
                    onReconnect={handleSSORetry}
                    isSSOFailure={true}
                    customMessage="Login failed. Please check your connection and try again."
                    customButtonText="Retry Login"
                    backgroundImage={blurBgGame}
                />
            </div>
        );
    }

    // Show RNG Soccer prototype first, then main app after play button click
    if (!hasClickedPlay) {
        return (
            <div data-react="true" style={{ width: '100%' }}>
                {/* Development Navigation Bar */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        background: '#333',
                        color: 'white',
                        padding: '10px',
                        zIndex: 9999,
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>🎮 Development Mode</span>
                        <a
                            href="/?page=simulator"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '5px 10px',
                                background: '#007bff',
                                borderRadius: '4px'
                            }}
                        >
                            Simulator Test
                        </a>
                        <a
                            href="/?page=rng-soccer-simulator"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '5px 10px',
                                background: '#ff6b35',
                                borderRadius: '4px'
                            }}
                        >
                            RNG Soccer Simulator
                        </a>
                        <a
                            href="/"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '5px 10px',
                                background: '#28a745',
                                borderRadius: '4px'
                            }}
                        >
                            Main App
                        </a>
                    </div>
                )}
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
