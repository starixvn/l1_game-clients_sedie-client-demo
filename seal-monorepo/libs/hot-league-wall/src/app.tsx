import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/callback-singleton/sync-member-site-balance';
import { TokenRequestManager } from './_shared/utils/callback-singleton/token-request-manager';
import { useEffect, useState, useCallback } from 'react';
import RNGSoccerStaticPrototype from './games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';

interface AppProps {
    appEnv: string;
    siteId: string;
    language: string;
    updateBalanceCallback?: void | null;
    onRequestSSOToken?: () => Promise<string | null>;
}

interface AppContentProps {
    updateBalanceCallback?: void | null;
    onRequestSSOToken?: () => Promise<string | null>;
}

const App = ({ appEnv, language, siteId, updateBalanceCallback, onRequestSSOToken }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent
                updateBalanceCallback={updateBalanceCallback}
                onRequestSSOToken={onRequestSSOToken}
            />
        </AppProvider>
    );
};

const AppContent = ({ updateBalanceCallback, onRequestSSOToken }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Shared token request logic
    const executeTokenRequest = useCallback(async (context: 'FIRST_SSO' | 'SSO_RETRY') => {
        const tokenStartTime = performance.now();

        try {
            let newToken: string | null = null;
            if (onRequestSSOToken) {
                newToken = await onRequestSSOToken();
            } else {
                newToken = await TokenRequestManager.getInstance().executeTokenRequest();
            }
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;

            if (newToken) {
                setCurrentToken(newToken);
                return { success: true, token: newToken, duration: tokenDuration };
            } else {
                return { success: false, token: null, duration: tokenDuration };
            }
        } catch (error) {
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;
            return { success: false, token: null, duration: tokenDuration, error };
        }
    }, [onRequestSSOToken]);

    // Unified token request handler
    const performTokenRequest = useCallback(
        async ({
            context,
            showLoading = false,
            triggerPlayTransition = false,
            showReconnectLoading = false,
        }: {
            context: 'FIRST_SSO' | 'SSO_RETRY';
            showLoading?: boolean;
            triggerPlayTransition?: boolean;
            showReconnectLoading?: boolean;
        }) => {
            if (showLoading) setIsLoading(true);
            if (showReconnectLoading) setIsReconnecting(true);
            const startTime = performance.now();
            const result = await executeTokenRequest(context);
            if (showLoading) setIsLoading(false);
            if (showReconnectLoading) setIsReconnecting(false);
            if (triggerPlayTransition && result.success) setHasClickedPlay(true);
            const endTime = performance.now();
            const duration = endTime - startTime;
            return result;
        },
        [executeTokenRequest]
    );

    const handlePlayButtonClick = useCallback(
        async () => {
            console.log('Play button clicked - starting token request and connection flow');
            const result = await performTokenRequest({ context: 'FIRST_SSO', showLoading: true, triggerPlayTransition: true });
            console.log('Token request completed:', { success: result.success, hasToken: !!result.token });
        },
        [performTokenRequest]
    );

    const handleSessionReconnect = useCallback(
        async () => {
            await performTokenRequest({ context: 'SSO_RETRY', showReconnectLoading: true });
        },
        [performTokenRequest]
    );

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    useEffect(() => {
        if (onRequestSSOToken) {
            TokenRequestManager.getInstance().setTokenRequestCallback(() => onRequestSSOToken());
        }
    }, [onRequestSSOToken]);

    // Cleanup effect to reset state when component unmounts
    useEffect(() => {
        return () => {
            setHasClickedPlay(false);
            setCurrentToken(null);
            setIsLoading(false);
            setIsReconnecting(false);
            console.log('AppContent component unmounted');
        };
    }, []);

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
            {currentToken && <Lobby token={currentToken} language={language} onSSORetry={handleSessionReconnect} isReconnecting={isReconnecting} />}
        </div>
    );
};

export default App;
