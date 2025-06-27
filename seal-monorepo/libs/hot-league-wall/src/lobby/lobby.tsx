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

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private reRenderGameTimeout?: NodeJS.Timeout;

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
    }
    clearReRenderGameTimeout = () => {
        if (!this.reRenderGameTimeout) {
            return;
        }
        clearTimeout(this.reRenderGameTimeout);
    };

    componentWillUnmount() {
        this.clearReRenderGameTimeout();
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
    connectLiveGateway() { }

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
        console.log('🔄 [LOBBY] Session reconnect requested');

        // Call parent's onSSORetry callback if provided
        if (this.props.onSSORetry) {
            console.log('🔄 [LOBBY] Calling parent onSSORetry callback');
            try {
                await this.props.onSSORetry();
                console.log('🔄 [LOBBY] Session reconnect completed successfully');
            } catch (error) {
                console.error('🔄 [LOBBY] Session reconnect failed:', error);
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
        return (
            <div className={styles['lobby']}>
                <AppContextConsumer>{(context) => this.renderGames(context)}</AppContextConsumer>
            </div>
        );
    }
}

export default LobbyComponent;
