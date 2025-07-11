import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import React from 'react';
import { configSharedContainer } from '../_shared/components/game-base/startup';
import { LobbyStore } from '../_shared/states/lobby';
import * as lobbyUtils from './utils';
import styles from './lobby.module.scss';
import { DropdownType, LeagueTabDropdown } from '../_shared/components/all-tab-components/league-tab-dropdown';
import { AppContextConsumer } from '../appProvider';
import Loading from '../_shared/components/loading';
import { GameMatchTab } from '../_shared/components/all-tab-components/game-match-tab';
import { IOfferGame, ILobbyState } from './type';
import { GameListTab } from '../_shared/components/all-tab-components/game-list-tab';
import SessionTimeout from '../_shared/components/timeout';
import { ConnectionManager } from '../_shared/components/game-base/connection-manager';
import { sharedContainer } from '../_shared/components/game-base/startup';

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private reRenderGameTimeout?: NodeJS.Timeout;
    private connectionManager: ConnectionManager;

    constructor(props: { token: string }) {
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
        this.connectionManager = ConnectionManager.getInstance();
    }

    clearReRenderGameTimeout = () => {
        if (!this.reRenderGameTimeout) {
            return;
        }
        clearTimeout(this.reRenderGameTimeout);
    };

    componentWillUnmount() {
        this.clearReRenderGameTimeout();
        // Clean up connections when lobby unmounts
        this.cleanupLobbyConnections();
    }

    /**
     * Clean up all connections when lobby unmounts
     */
    private async cleanupLobbyConnections() {
        try {
            // Disconnect using the manager (handles both handler.disconnect() and connection.close())
            await this.connectionManager.disconnect('lobby_unmount');

            // Close all remaining connections as a safety measure (sends WebSocket close frames)
            await this.connectionManager.closeAllGatewayConnections('lobby_unmount');
        } catch (error) {
            // Error during connection cleanup
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<ILobbyState>, snapshot?: any): void {
        if (prevProps.token !== this.props.token) {
            this.sso({ token: this.props.token });
        }
    }

    componentDidMount() {
        const { token } = this.props;
        this.sso({ token });
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

        if (handler && (handler as any).connection) {
            this.connectionManager.registerGatewayConnection((handler as any).connection);
        }
    }

    /**
     * Get connection handler from the container
     */
    private getConnectionHandler(): any {
        try {
            const container = sharedContainer;

            if (!container) {
                return null;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);

            return handler;
        } catch (error) {
            return null;
        }
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

    private renderGames(context) {
        const { offerGames, leagueToogle, selectedGameId, isSessionTimeout, isAuthenticated, username } = this.state;

        const renderGameContent = () => {
            if (isSessionTimeout) {
                return (
                    <SessionTimeout
                        token={this.props.token}
                        renewToken={this.props.renewToken}
                        language={this.props.language}
                        username={username}
                    />
                );
            }

            const hasGames = offerGames.length > 0;
            if (!hasGames || !isAuthenticated) {
                return <Loading />;
            }

            const selectedGame = offerGames.find((game) => game.gameId === selectedGameId) || offerGames[0];

            return (
                <>
                    <GameListTab
                        offerGames={offerGames}
                        selectedGameId={selectedGameId}
                        onTabClick={this.handleTabClick}
                    />
                    {/* Use the same pattern as preview.tsx - single component with key-based rendering */}
                    <div key={selectedGameId} style={{ height: '100%' }}>
                        <GameMatchTab
                            gameId={selectedGame.gameId}
                            className={styles['lobby-tabs']}
                            leagueToogle={leagueToogle}
                            language={this.props.language}
                        />
                    </div>
                </>
            );
        };

        return (
            <>
                <LeagueTabDropdown
                    dropdownType={DropdownType.LEAGUE}
                    leagueToogle={leagueToogle}
                    updateLeagueToogle={this.updateLeagueToogle}
                />
                {renderGameContent()}
            </>
        );
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
