import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { TokenRequestManager } from './_shared/utils/token-request-manager';
import { useEffect, useState, useCallback } from 'react';
import RNGSoccerStaticPrototype from './games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';

interface AppProps {
    appEnv: string;
    siteId: string;
    language: string;
    updateBalanceCallback?: void | null;
    onRequestSSOToken?: (context: 'FIRST_SSO' | 'SSO_RETRY') => Promise<string | null>;
}

interface AppContentProps {
    updateBalanceCallback?: void | null;
    onRequestSSOToken?: (context: 'FIRST_SSO' | 'SSO_RETRY') => Promise<string | null>;
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

    // Shared token request logic
    const executeTokenRequest = useCallback(async (context: 'FIRST_SSO' | 'SSO_RETRY') => {
        console.log(`🔄 [${context}] Using TokenRequestManager for REAL APP...`);
        const tokenStartTime = performance.now();

        try {
            let newToken: string | null = null;
            if (onRequestSSOToken) {
                newToken = await onRequestSSOToken(context);
            } else {
                newToken = await TokenRequestManager.getInstance().executeTokenRequest();
            }
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;

            if (newToken) {
                console.log(`✅ [${context}] TokenRequestManager completed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                setCurrentToken(newToken);
                return { success: true, token: newToken, duration: tokenDuration };
            } else {
                console.log(`⚠️ [${context}] TokenRequestManager returned null for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                return { success: false, token: null, duration: tokenDuration };
            }
        } catch (error) {
            const tokenEndTime = performance.now();
            const tokenDuration = tokenEndTime - tokenStartTime;
            console.log(`💥 [${context}] TokenRequestManager failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
            console.error(`[${context}] TokenRequestManager error:`, error);
            return { success: false, token: null, duration: tokenDuration, error };
        }
    }, [onRequestSSOToken]);

    // Unified token request handler
    const performTokenRequest = useCallback(
        async ({
            context,
            showLoading = false,
            triggerPlayTransition = false,
        }: {
            context: 'FIRST_SSO' | 'SSO_RETRY';
            showLoading?: boolean;
            triggerPlayTransition?: boolean;
        }) => {
            if (showLoading) setIsLoading(true);
            const startTime = performance.now();
            const result = await executeTokenRequest(context);
            if (showLoading) setIsLoading(false);
            if (triggerPlayTransition && result.success) setHasClickedPlay(true);
            const endTime = performance.now();
            const duration = endTime - startTime;
            if (context === 'FIRST_SSO') {
                console.log(`🏁 [FIRST_SSO] PROTOTYPE to REAL APP transition completed - Total duration: ${duration.toFixed(2)}ms`);
            } else if (context === 'SSO_RETRY') {
                if (result.success) {
                    console.log('🔄 [SESSION_RECONNECT] New token obtained, Lobby should reconnect automatically');
                } else {
                    console.log('🔄 [SESSION_RECONNECT] Failed to get new token');
                }
            }
            return result;
        },
        [executeTokenRequest]
    );

    const handlePlayButtonClick = useCallback(
        async () => {
            await performTokenRequest({ context: 'FIRST_SSO', showLoading: true, triggerPlayTransition: true });
        },
        [performTokenRequest]
    );

    const handleSessionReconnect = useCallback(
        async () => {
            await performTokenRequest({ context: 'SSO_RETRY' });
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
            TokenRequestManager.getInstance().setTokenRequestCallback(() => onRequestSSOToken('FIRST_SSO'));
        }
    }, [onRequestSSOToken]);

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
            {currentToken && <Lobby token={currentToken} language={language} onSSORetry={handleSessionReconnect} />}
        </div>
    );
};

export default App;
