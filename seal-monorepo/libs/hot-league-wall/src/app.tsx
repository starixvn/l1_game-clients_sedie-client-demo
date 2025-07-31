import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/callback-singleton/sync-member-site-balance';
import { TokenRequestManager } from './_shared/utils/callback-singleton/token-request-manager';
import React, { useEffect, useState, useCallback } from 'react';
import RNGSoccerStaticPrototype from './games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';

import { appSettingsWithSentry } from './_shared/app-settings';
import { useSentryHelper, SentryLogLevel, initializeSentryForProject, configureSentryForEnvironment, initializeSentryWithSessionReplay, configureSessionReplayForEnvironment, useSessionReplay, sentryGameCronBatchManager } from './sentry';

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
    // Initialize SentryHelper and Session Replay for the entire project
    React.useEffect(() => {
        const environment = process.env.NODE_ENV || 'development';

        try {
            console.log('Initializing Sentry with environment:', environment);
            console.log('App settings loaded:', {
                sentryDsn: appSettingsWithSentry.sentryDsn,
                sentryEnvironment: appSettingsWithSentry.sentryEnvironment,
                environment
            });

            // Initialize Sentry with Session Replay (this will handle all Sentry initialization)
            const sessionReplayConfig = configureSessionReplayForEnvironment(environment);
            console.log('Session replay config:', sessionReplayConfig);
            initializeSentryWithSessionReplay(sessionReplayConfig);

            // Configure SentryHelper after initialization
            configureSentryForEnvironment(environment);
            initializeSentryForProject();

            // Initialize Game Cron Batch Manager
            sentryGameCronBatchManager.initialize();
            console.log('Game Cron Batch Manager initialized');

            console.log('Sentry initialization completed successfully');
        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
        }
    }, []);

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

    // Initialize SentryHelper with workflow tracking
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'HotLeagueWall',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Initialize Session Replay for the main application
    const {
        startReplay,
        trackInteraction,
        trackError,
        trackPerformance,
        setUser,
        setTags
    } = useSessionReplay('HotLeagueWall');

    // Shared token request logic with Sentry tracking
    const executeTokenRequest = useCallback(async (context: 'FIRST_SSO' | 'SSO_RETRY') => {
        const workflowId = workflow.start(`Token Request - ${context}`, {
            context,
            timestamp: Date.now()
        });

        // Start Session Replay for token request
        startReplay(`Token Request Session - ${context}`, {
            context,
            timestamp: Date.now()
        });

        try {
            logInfo(`Starting token request`, { context, timestamp: Date.now() });
            trackInteraction('token_request_started', { context });

            let newToken: string | null = null;
            if (onRequestSSOToken) {
                newToken = await workflow.track('SSO Token Request', async () => {
                    try {
                        const startTime = performance.now();
                        const result = await onRequestSSOToken();
                        const duration = performance.now() - startTime;
                        trackPerformance('sso_token_request', duration, { context });
                        return result;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        logError(`SSO Token Request failed: ${errorMessage}`, {
                            context,
                            error,
                            operation: 'sso_token_request'
                        });
                        throw error;
                    }
                });
            } else {
                newToken = await workflow.track('Token Manager Request', async () => {
                    try {
                        const startTime = performance.now();
                        const result = await TokenRequestManager.getInstance().executeTokenRequest();
                        const duration = performance.now() - startTime;
                        trackPerformance('token_manager_request', duration, { context });
                        return result;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        logError(`Token Manager Request failed: ${errorMessage}`, {
                            context,
                            error,
                            operation: 'token_manager_request'
                        });
                        throw error;
                    }
                });
            }

            if (newToken) {
                setCurrentToken(newToken);
                workflow.complete(workflowId, true, {
                    tokenReceived: true,
                    tokenLength: newToken.length,
                    context
                });
                logInfo(`Token request successful`, { context, tokenLength: newToken.length });
                trackInteraction('token_request_success', { context, tokenLength: newToken.length });
                return { success: true, token: newToken };
            } else {
                workflow.complete(workflowId, false, {
                    tokenReceived: false,
                    context,
                    reason: 'no_token_returned'
                });
                logError(`Token request returned null`, {
                    context,
                    reason: 'no_token_returned',
                    operation: 'token_request'
                });
                trackError('Token request returned null', { context });
                return { success: false, token: null };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            workflow.complete(workflowId, false, {
                error: errorMessage,
                context,
                reason: 'token_request_failed'
            });
            logError(`Token request failed: ${errorMessage}`, {
                context,
                error,
                operation: 'token_request',
                reason: 'token_request_failed'
            });
            trackError(errorMessage, { context });
            return { success: false, token: null, error };
        }
    }, [onRequestSSOToken, workflow, logError, logWarning, logInfo, startReplay, trackInteraction, trackError, trackPerformance]);

    // Effect to handle tab visibility changes and reset game state
    useEffect(() => {
        const handleVisibilityChange = () => {
            try {
                if (!document.hidden) {
                    // Only reset game state if we're not currently in a game session
                    // This prevents unmounting the game component when switching tabs
                    if (!currentToken) {
                        // Tab became visible, reset game state to show prototype again
                        logInfo('Tab became visible, resetting game state', {
                            hasToken: !!currentToken,
                            hasClickedPlay,
                            timestamp: Date.now()
                        });
                        setHasClickedPlay(false);
                        setCurrentToken(null);
                        setIsLoading(false);
                        setIsReconnecting(false);
                    } else {
                        logInfo('Tab became visible, keeping game session active', {
                            hasToken: !!currentToken,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    logInfo('Tab became hidden', { timestamp: Date.now() });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logError(`Tab visibility change handler failed: ${errorMessage}`, {
                    error,
                    operation: 'visibility_change_handler',
                    documentHidden: document.hidden,
                    hasToken: !!currentToken
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentToken, hasClickedPlay, logInfo, logError]);

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
            try {
                logInfo('Play button clicked, initiating first SSO request', {
                    timestamp: Date.now()
                });
                const result = await performTokenRequest({ context: 'FIRST_SSO', showLoading: true, triggerPlayTransition: true });

                if (result.success) {
                    logInfo('Play button flow completed successfully', {
                        hasToken: !!result.token,
                        timestamp: Date.now()
                    });
                } else {
                    logError('Play button flow failed', {
                        error: result.error,
                        timestamp: Date.now(),
                        operation: 'play_button_flow'
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logError(`Play button click handler failed: ${errorMessage}`, {
                    error,
                    operation: 'play_button_click_handler'
                });
            }
        },
        [performTokenRequest, logInfo, logError]
    );

    const handleSessionReconnect = useCallback(
        async () => {
            try {
                logInfo('Session reconnect initiated', {
                    timestamp: Date.now()
                });
                const result = await performTokenRequest({ context: 'SSO_RETRY', showReconnectLoading: true });

                if (result.success) {
                    logInfo('Session reconnect completed successfully', {
                        hasToken: !!result.token,
                        timestamp: Date.now()
                    });
                } else {
                    logError('Session reconnect failed', {
                        error: result.error,
                        timestamp: Date.now(),
                        operation: 'session_reconnect'
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logError(`Session reconnect handler failed: ${errorMessage}`, {
                    error,
                    operation: 'session_reconnect_handler'
                });
            }
        },
        [performTokenRequest, logInfo, logError]
    );

    useEffect(() => {
        if (updateBalanceCallback) {
            logInfo('Setting up balance callback', { timestamp: Date.now() });
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback, logInfo]);

    useEffect(() => {
        if (onRequestSSOToken) {
            logInfo('Setting up SSO token callback', { timestamp: Date.now() });
            TokenRequestManager.getInstance().setTokenRequestCallback(() => onRequestSSOToken());
        }
    }, [onRequestSSOToken, logInfo]);

    // // Cleanup effect to reset state when component unmounts
    // useEffect(() => {
    //     return () => {
    //         setHasClickedPlay(false);
    //         setCurrentToken(null);
    //         setIsLoading(false);
    //         setIsReconnecting(false);
    //         console.log('AppContent component unmounted');
    //     };
    // }, []);

    loadI18n(language);

    // Show RNG Soccer prototype first, then main app after play button click
    if (!hasClickedPlay) {
        logInfo('Rendering RNG Soccer prototype', {
            hasClickedPlay,
            isLoading,
            timestamp: Date.now()
        });
        return (
            <div data-react="true" style={{ width: '100%' }}>
                <RNGSoccerStaticPrototype onPlayButtonClick={handlePlayButtonClick} isLoading={isLoading} />
            </div>
        );
    }

    logInfo('Rendering main lobby', {
        hasClickedPlay,
        hasToken: !!currentToken,
        isReconnecting,
        timestamp: Date.now()
    });
    return (
        <div data-react="true" style={{ width: '100%' }}>
            {currentToken && <Lobby token={currentToken} language={language} onSSORetry={handleSessionReconnect} isReconnecting={isReconnecting} />}
        </div>
    );
};

export default App;
