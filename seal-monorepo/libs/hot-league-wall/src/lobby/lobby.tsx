import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import React from 'react';
import { configSharedContainer } from '../games/game-base/startup';
import { LobbyStore } from '../_shared/states/lobby';
import * as lobbyUtils from './utils';
import styles from './lobby.module.scss';
import { AppContextConsumer } from '../appProvider';
import Loading from '../_shared/components/loading';
import { IOfferGame, ILobbyState } from './type';
import { gamePageMap } from '../_shared/utils/component-util';
import { GameDisconnectView } from '../games/game-base/components/game-disconnect-view';
import blurBgGame from '../assets/rng-soccer/blur-bg-game.png';
import { GatewayConnectionManager } from '../games/game-base/gateway/gateway-connection-manager';
import { useSentryHelper, SentryLogLevel, logInfo, logError, logWarning } from '../sentry';

// Wrapper component to provide SentryHelper to the class component
const LobbyWithSentry = (props: { token: string; onSSORetry?: () => Promise<void>; isReconnecting?: boolean; language: string }) => {
    const { logError, logWarning, logInfo, workflowTracker } = useSentryHelper({
        componentName: 'Lobby',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Memoize the log data to prevent infinite re-renders
    const logData = React.useMemo(() => ({
        hasToken: !!props.token,
        isReconnecting: props.isReconnecting,
        language: props.language,
        timestamp: Date.now()
    }), [props.token, props.isReconnecting, props.language]);

    // Log component render in useEffect to prevent infinite re-renders
    React.useEffect(() => {
        logInfo('LobbyWithSentry component rendering', logData);
    }, [logData]);

    return (
        <LobbyComponent
            {...props}
            sentryHelper={{ logError, logWarning, logInfo, workflow: workflowTracker }}
        />
    );
};

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private reRenderGameTimeout?: NodeJS.Timeout;
    private connectionManager: GatewayConnectionManager;

    constructor(props: { token: string; onSSORetry?: () => Promise<void>; isReconnecting?: boolean; sentryHelper?: any }) {
        super(props);

        const { sentryHelper } = props;

        if (sentryHelper) {
            sentryHelper.logInfo('LobbyComponent constructor called', {
                hasToken: !!props.token,
                isReconnecting: props.isReconnecting,
                timestamp: Date.now()
            });
        }

        configSharedContainer();
        this.state = {
            offerGames: [],
            isRenderGame: true,
            leagueToogle: true,
            expandedGames: {},
            selectedGameId: null,
            isSessionTimeout: false,
            isAuthenticated: false,
            username: '',
        };

        // Initialize connection manager at lobby level
        this.connectionManager = GatewayConnectionManager.getInstance();

        if (sentryHelper) {
            sentryHelper.logInfo('LobbyComponent initialized successfully', {
                state: this.state,
                timestamp: Date.now()
            });
        }
    }

    clearReRenderGameTimeout = () => {
        if (!this.reRenderGameTimeout) {
            return;
        }
        clearTimeout(this.reRenderGameTimeout);
    };

    componentWillUnmount() {
        const { sentryHelper } = this.props;

        this.clearReRenderGameTimeout();

        // Remove visibility change listener
        document.removeEventListener('visibilitychange', this.onVisibilityChange);

        if (sentryHelper) {
            sentryHelper.logInfo('Lobby component unmounting', {
                timestamp: Date.now()
            });
        }

        // Cleanup connections at lobby level
        this.cleanupConnections();
    }

    /**
     * Clean up all connections properly when lobby unmounts
     */
    private async cleanupConnections() {
        const { sentryHelper } = this.props;

        try {
            if (sentryHelper) {
                sentryHelper.logInfo('Starting connection cleanup', {
                    timestamp: Date.now()
                });
            }

            // Disconnect using the manager (handles both handler.disconnect() and connection.close())
            await this.connectionManager.disconnect('lobby_unmount');

            // Close all remaining connections as a safety measure
            await this.connectionManager.closeAllConnections('lobby_unmount');

            if (sentryHelper) {
                sentryHelper.logInfo('Connection cleanup completed successfully', {
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            if (sentryHelper) {
                sentryHelper.logError('Connection cleanup failed', {
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: Date.now()
                });
            }
        }
    }

    componentDidMount() {
        const { token, sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Lobby component mounted', {
                hasToken: !!token,
                tokenLength: token?.length,
                timestamp: Date.now()
            });
        }

        // Add visibility change listener
        document.addEventListener('visibilitychange', this.onVisibilityChange);

        // Initialize SSO with token
        this.sso({ token });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<ILobbyState>, snapshot?: any): void {
        const { token, sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Lobby component updated', {
                prevState: prevState,
                currentState: this.state,
                prevToken: prevProps.token,
                currentToken: token,
                timestamp: Date.now()
            });
        }

        // Handle token changes
        if (prevProps.token !== token) {
            if (sentryHelper) {
                sentryHelper.logInfo('Token changed, reinitializing SSO', {
                    prevToken: prevProps.token,
                    currentToken: token,
                    timestamp: Date.now()
                });
            }
            this.sso({ token });
        }
    }

    @handle(gc.Auth.AuthHandlers.SSO)
    sso(ssoInfo: gc.Auth.ISSOInfo) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('SSO authentication initiated', {
                ssoInfo,
                timestamp: Date.now()
            });
        }
        return ssoInfo;
    }

    @render(gc.App.AppStore, (store) => store.isSessionTimeout)
    redirectToSessionTimeoutPage(isSessionTimeout: boolean) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Redirecting to session timeout page', {
                isSessionTimeout,
                timestamp: Date.now()
            });
        }
        this.setState({ isSessionTimeout });
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthenticated)
    handleIsAuthenticated(isAuthenticated: boolean) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Authentication status changed', {
                isAuthenticated,
                timestamp: Date.now()
            });
        }
        this.setState({ isAuthenticated });
        if (isAuthenticated) {
            this.connectLiveGateway();
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Connecting to live gateway', {
                timestamp: Date.now()
            });
        }

        // Register the connection when it's established
        const handler = this.getConnectionHandler();
        if (handler && handler.connection) {
            this.registerConnection(handler.connection);

            if (sentryHelper) {
                sentryHelper.logInfo('Live gateway connection initiated', {
                    timestamp: Date.now()
                });
            }
        }

        // The decorator will handle the connection automatically
        // Add a timeout to check for offer games after connection
        setTimeout(() => {
            this.checkMainPlayerStore();
        }, 1000);
    }

    /**
     * Get connection handler and register its connection
     */
    private getConnectionHandler(): any {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Getting connection handler', {
                timestamp: Date.now()
            });
        }

        try {
            const container = this.connectionManager['getSharedContainer']();
            if (!container) {
                return null;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            return handler;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (sentryHelper) {
                sentryHelper.logError(`Failed to get connection handler: ${errorMessage}`, {
                    error,
                    operation: 'get_connection_handler'
                });
            }
            return null;
        }
    }

    /**
     * Register a connection when it's created
     */
    private registerConnection(connection: any): void {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Registering connection', {
                connectionType: connection?.constructor?.name,
                timestamp: Date.now()
            });
        }

        if (connection) {
            this.connectionManager.registerConnection(connection);
        }
    }

    /**
     * Enhanced visibility change handling
     */
    onVisibilityChange = async () => {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Page visibility changed', {
                isVisible: !document.hidden,
                timestamp: Date.now()
            });
        }

        if (document.hidden) {
            await this.connectionManager.disconnect('visibility_change');
        } else {
            this.connectLiveGateway();
        }
    };

    private checkMainPlayerStore() {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Checking main player store', {
                timestamp: Date.now()
            });
        }
        // This method will be called after connection to ensure games are loaded
    }

    @render(gc.Player.MainPlayerStore, (store) => store.offerGames)
    handleOfferGames(offerGames: IOfferGame[]) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Handling offer games', {
                offerGamesCount: offerGames.length,
                gameIds: offerGames.map(game => game.gameId),
                timestamp: Date.now()
            });
        }

        if (offerGames?.length > 0) {
            const filteredOfferGames = lobbyUtils.getFilteredGames(offerGames);
            const expandedGames = filteredOfferGames.reduce(
                (acc, game) => {
                    acc[game.gameId] = true;
                    return acc;
                },
                {} as { [key: number]: boolean },
            );
            this.setState({ offerGames: filteredOfferGames, expandedGames } as ILobbyState);

            if (!this.state.selectedGameId) {
                this.setState({ selectedGameId: filteredOfferGames[0].gameId });
            }
        }
    }

    @render(LobbyStore, (store) => store.tryToConnectCount)
    updateTryToConnectCount(tryToConnectCount: number) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Updating try to connect count', {
                tryToConnectCount,
                timestamp: Date.now()
            });
        }

        const isDisconnect = tryToConnectCount > 0;
        if (isDisconnect) {
            this.setState({ isRenderGame: false });
            this.reRenderGameTimeout = setTimeout(() => {
                this.setState({ isRenderGame: true });
            }, 500);
        }
    }

    @render(gc.Auth.AuthStore, (store) => store.username)
    private handleUsername(username: string) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Handling username', {
                username,
                timestamp: Date.now()
            });
        }

        username && this.setState({ username });
    }

    updateLeagueToogle = (leagueToogle: boolean) => {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Updating league toggle', {
                leagueToogle,
                timestamp: Date.now()
            });
        }

        this.setState({ leagueToogle });
    };

    handleTabClick = (gameId: number) => {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Tab clicked', {
                gameId,
                timestamp: Date.now()
            });
        }

        this.setState({ selectedGameId: gameId });
    };

    handleSessionReconnect = async () => {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Session reconnect initiated', {
                timestamp: Date.now()
            });
        }

        // Call parent's onSSORetry callback if provided
        if (this.props.onSSORetry) {
            try {
                await this.props.onSSORetry();

                if (sentryHelper) {
                    sentryHelper.logInfo('Session reconnect completed successfully', {
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (sentryHelper) {
                    sentryHelper.logError(`Session reconnect failed: ${errorMessage}`, {
                        error,
                        operation: 'session_reconnect'
                    });
                }
            }
        }
    };

    private renderGames(context) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Rendering games', {
                offerGamesCount: this.state.offerGames.length,
                selectedGameId: this.state.selectedGameId,
                timestamp: Date.now()
            });
        }

        const { offerGames, selectedGameId, isSessionTimeout, isAuthenticated } = this.state;

        const renderGameContent = () => {
            if (isSessionTimeout) {
                return (
                    <GameDisconnectView
                        onReconnect={this.handleSessionReconnect}
                        isSSOFailure={true}
                        isLoading={this.props.isReconnecting}
                        language={context.language}
                        backgroundImage={blurBgGame}
                    />
                );
            }

            const hasGames = offerGames.length > 0;
            if (!hasGames || !isAuthenticated) {
                return <Loading />;
            }

            const selectedGame = offerGames.find((game) => game.gameId === selectedGameId) || offerGames[0];
            const gameMapInfo = gamePageMap[selectedGame.gameId];
            const namespace = gameMapInfo?.namespace;
            const GamePageComponent = gameMapInfo?.component || null;

            return (
                <>
                    <div className="c-match c-in-play">
                        <AppContextConsumer>
                            {({ language }) => GamePageComponent && <GamePageComponent namespace={namespace} language={language} />}
                        </AppContextConsumer>
                    </div>
                </>
            );
        };

        const content = renderGameContent();

        return <>{content}</>;
    }

    render() {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logInfo('Lobby component rendering', {
                state: this.state,
                timestamp: Date.now()
            });
        }

        return (
            <div className={styles['lobby']}>
                <AppContextConsumer>{(context) => this.renderGames(context)}</AppContextConsumer>
            </div>
        );
    }
}

export default LobbyWithSentry;
