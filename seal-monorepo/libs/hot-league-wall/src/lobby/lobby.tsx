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

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private reRenderGameTimeout?: NodeJS.Timeout;
    private connectionManager: GatewayConnectionManager;

    constructor(props: { token: string; onSSORetry?: () => Promise<void>; isReconnecting?: boolean }) {
        super(props);
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
    }
    clearReRenderGameTimeout = () => {
        if (!this.reRenderGameTimeout) {
            return;
        }
        clearTimeout(this.reRenderGameTimeout);
    };

    componentWillUnmount() {
        this.clearReRenderGameTimeout();

        // Remove visibility change listener
        document.removeEventListener('visibilitychange', this.onVisibilityChange);

        // Cleanup connections at lobby level
        this.cleanupConnections();
    }

    /**
     * Clean up all connections properly when lobby unmounts
     */
    private async cleanupConnections() {
        try {
            // Disconnect using the manager (handles both handler.disconnect() and connection.close())
            await this.connectionManager.disconnect('lobby_unmount');

            // Close all remaining connections as a safety measure
            await this.connectionManager.closeAllConnections('lobby_unmount');
        } catch (error) {
            // Error during connection cleanup
        }
    }

    componentDidMount() {
        const { token } = this.props;

        // Set up visibility change listener
        document.addEventListener('visibilitychange', this.onVisibilityChange);

        this.sso({ token });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<ILobbyState>, snapshot?: any): void {
        if (prevProps.token !== this.props.token) {
            this.sso({ token: this.props.token });
        }
    }

    @handle(gc.Auth.AuthHandlers.SSO)
    sso(ssoInfo: gc.Auth.ISSOInfo) {
        return ssoInfo;
    }

    @render(gc.App.AppStore, (store) => store.isSessionTimeout)
    redirectToSessionTimeoutPage(isSessionTimeout: boolean) {
        this.setState({ isSessionTimeout });
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthenticated)
    handleIsAuthenticated(isAuthenticated: boolean) {
        this.setState({ isAuthenticated });
        if (isAuthenticated) {
            this.connectLiveGateway();
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        // Register the connection when it's established
        const handler = this.getConnectionHandler();
        if (handler && handler.connection) {
            this.registerConnection(handler.connection);
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
        try {
            const container = this.connectionManager['getSharedContainer']();
            if (!container) {
                return null;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            return handler;
        } catch (error) {
            return null;
        }
    }

    /**
     * Register a connection when it's created
     */
    private registerConnection(connection: any): void {
        if (connection) {
            this.connectionManager.registerConnection(connection);
        }
    }

    /**
     * Enhanced visibility change handling
     */
    onVisibilityChange = async () => {
        if (document.hidden) {
            await this.connectionManager.disconnect('visibility_change');
        } else {
            this.connectLiveGateway();
        }
    };

    private checkMainPlayerStore() {
        // This method will be called after connection to ensure games are loaded
    }

    @render(gc.Player.MainPlayerStore, (store) => store.offerGames)
    handleOfferGames(offerGames: IOfferGame[]) {
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
        username && this.setState({ username });
    }

    updateLeagueToogle = (leagueToogle: boolean) => {
        this.setState({ leagueToogle });
    };

    handleTabClick = (gameId: number) => {
        this.setState({ selectedGameId: gameId });
    };

    handleSessionReconnect = async () => {
        // Call parent's onSSORetry callback if provided
        if (this.props.onSSORetry) {
            try {
                await this.props.onSSORetry();
            } catch (error) {
            }
        }
    };

    private renderGames(context) {
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
                    <div>
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
        return (
            <div className={styles['lobby']}>
                <AppContextConsumer>{(context) => this.renderGames(context)}</AppContextConsumer>
            </div>
        );
    }
}

export default LobbyComponent;
