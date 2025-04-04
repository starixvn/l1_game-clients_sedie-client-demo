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

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private reRenderGameTimeout?: NodeJS.Timeout;

    constructor(props: { token: string }) {
        super(props);
        console.log('[LobbyComponent] Constructor called with props:', props);
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
        console.log('[LobbyComponent] Initial state:', this.state);
    }
    clearReRenderGameTimeout = () => {
        if (!this.reRenderGameTimeout) {
            return;
        }
        console.log('[LobbyComponent] Clearing reRenderGameTimeout');
        clearTimeout(this.reRenderGameTimeout);
    };

    componentWillUnmount() {
        console.log('[LobbyComponent] Component will unmount');
        this.clearReRenderGameTimeout();
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<ILobbyState>, snapshot?: any): void {
        console.log('[LobbyComponent] Component did update', {
            prevProps,
            prevState,
            currentProps: this.props,
            currentState: this.state
        });

        if (prevProps.token !== this.props.token) {
            console.log('[LobbyComponent] Token changed, calling sso with new token');
            this.sso({ token: this.props.token });
        }
    }

    componentDidMount() {
        console.log('[LobbyComponent] Component did mount');
        const { token } = this.props;
        console.log('[LobbyComponent] Calling sso with token:', token);
        this.sso({ token });
    }

    @handle(gc.Auth.AuthHandlers.SSO)
    sso(ssoInfo: gc.Auth.ISSOInfo) {
        console.log('[LobbyComponent] SSO handler called with info:', ssoInfo);
        return ssoInfo;
    }

    @render(gc.App.AppStore, (store) => store.isSessionTimeout)
    redirectToSessionTimeoutPage(isSessionTimeout: boolean) {
        console.log('[LobbyComponent] Session timeout state changed:', isSessionTimeout);
        this.setState({ isSessionTimeout });
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthenticated)
    handleIsAuthenticated(isAuthenticated: boolean) {
        console.log('[LobbyComponent] Authentication state changed:', isAuthenticated);
        this.setState({ isAuthenticated });
        if (isAuthenticated) {
            console.log('[LobbyComponent] User is authenticated, connecting to live gateway');
            this.connectLiveGateway();
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        console.log('[LobbyComponent] Connecting to live gateway');
    }

    @render(gc.Player.MainPlayerStore, (store) => store.offerGames)
    handleOfferGames(offerGames: IOfferGame[]) {
        console.log('[LobbyComponent] Offer games updated:', offerGames);

        if (offerGames?.length > 0) {
            const filteredOfferGames = lobbyUtils.getFilteredGames(offerGames);
            console.log('[LobbyComponent] Filtered offer games:', filteredOfferGames);

            const expandedGames = filteredOfferGames.reduce(
                (acc, game) => {
                    acc[game.gameId] = true;
                    return acc;
                },
                {} as { [key: number]: boolean },
            );
            console.log('[LobbyComponent] Setting expanded games:', expandedGames);

            this.setState({ offerGames: filteredOfferGames, expandedGames } as ILobbyState);

            if (!this.state.selectedGameId) {
                console.log('[LobbyComponent] No selected game ID, setting to first game:', filteredOfferGames[0].gameId);
                this.setState({ selectedGameId: filteredOfferGames[0].gameId });
            }
        }
    }

    @render(LobbyStore, (store) => store.tryToConnectCount)
    updateTryToConnectCount(tryToConnectCount: number) {
        console.log('[LobbyComponent] Try to connect count updated:', tryToConnectCount);
        const isDisconnect = tryToConnectCount > 0;
        if (isDisconnect) {
            console.log('[LobbyComponent] Disconnected, setting isRenderGame to false');
            this.setState({ isRenderGame: false });
            this.reRenderGameTimeout = setTimeout(() => {
                console.log('[LobbyComponent] Re-rendering game after timeout');
                this.setState({ isRenderGame: true });
            }, 500);
        }
    }

    @render(gc.Auth.AuthStore, (store) => store.username)
    private handleUsername(username: string) {
        console.log('[LobbyComponent] Username updated:', username);
        username && this.setState({ username });
    }

    updateLeagueToogle = (leagueToogle: boolean) => {
        console.log('[LobbyComponent] League toggle updated:', leagueToogle);
        this.setState({ leagueToogle });
    };

    handleTabClick = (gameId: number) => {
        console.log('[LobbyComponent] Tab clicked, game ID:', gameId);
        this.setState({ selectedGameId: gameId });
    };

    private renderGames(context) {
        console.log('[LobbyComponent] Rendering games with context:', context);
        const { offerGames, leagueToogle, selectedGameId, isSessionTimeout, isAuthenticated, username } = this.state;
        console.log('[LobbyComponent] Current state for rendering:', {
            offerGamesCount: offerGames.length,
            leagueToogle,
            selectedGameId,
            isSessionTimeout,
            isAuthenticated,
            username
        });

        const renderGameContent = () => {
            if (isSessionTimeout) {
                console.log('[LobbyComponent] Rendering session timeout component');
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
                console.log('[LobbyComponent] No games or not authenticated, rendering loading component');
                return <Loading />;
            }

            const selectedGame = offerGames.find((game) => game.gameId === selectedGameId) || offerGames[0];
            console.log('[LobbyComponent] Selected game for rendering:', selectedGame);

            return (
                <>
                    <GameListTab
                        offerGames={offerGames}
                        selectedGameId={selectedGameId}
                        onTabClick={this.handleTabClick}
                    />
                    <GameMatchTab gameId={selectedGame.gameId} className={styles['lobby-tabs']} leagueToogle={leagueToogle} />
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
        console.log('[LobbyComponent] Main render method called');
        return (
            <div className={styles['lobby']}>
                <AppContextConsumer>{(context) => this.renderGames(context)}</AppContextConsumer>
            </div>
        );
    }
}

export default LobbyComponent;
