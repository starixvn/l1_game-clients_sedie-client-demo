import * as gc from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import React from 'react';
import { GameContextProvider } from '../../../_shared/react-contexts/game-context/game-context';
import GameContainer from '../game-container';
import { GameConnectionService } from '../services';
import { GameDisconnectView, GameLoadingView } from '../components';
import { IGameBaseState, GameStyleOverrides } from '../interfaces';
import { GameBaseProps } from '../type';

/**
 * GameBase - Abstract base class for all game implementations
 * Handles common game functionality like connection, UI structure, state management
 */
abstract class GameBase<P extends GameBaseProps, S extends IGameBaseState> extends React.PureComponent<P, S> {
    protected overrideClasses?: GameStyleOverrides;

    constructor(props: P) {
        super(props);
        this.state = {
            isConnectFailed: false,
            isConnected: false,
            initialized: false,
            showDisabledPopup: false,
            isOpenStatistic: false,
            isFinishShowResult: false,
            activePanelId: null,
            showBetPanel: false,
            isShowNextRoundMessage: false,
            roundId: 0,
            isAllowedBet: false,
            isPopupVisible: false,
            gameId: 0,
            roundState: '',
            settlementResultDuration: 2,
        } as S;

        this.toggleStatistic = this.toggleStatistic.bind(this);
    }

    // -------------------------------------------------------------------------
    // LIFECYCLE METHODS
    // -------------------------------------------------------------------------

    componentDidMount() {
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    componentWillUnmount() {
        this.onDestroy();
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

    onDestroy() {
        this.closeConnect();
    }

    // -------------------------------------------------------------------------
    // ABSTRACT METHODS - Must be implemented by child classes
    // -------------------------------------------------------------------------

    abstract closeConnect(): void;
    abstract joinGame(): void;
    abstract connectLiveGateway(): void;
    abstract processAuthorizationIfRoundMatches(roundId: number): void;
    abstract showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ): Promise<void>;

    // To be implemented by child class to provide custom layout if needed
    protected getGameLayout(): JSX.Element | null {
        return null;
    }

    // -------------------------------------------------------------------------
    // EVENT HANDLERS
    // -------------------------------------------------------------------------

    onVisibilityChange = () => { };

    // -------------------------------------------------------------------------
    // CONNECTION HANDLERS
    // -------------------------------------------------------------------------

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler, (handler) => handler.handle())
    connectToServiceGateway() { }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handle())
    terminateConnection() { }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler)
    inGame() {
        return this.props.namespace;
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isSignedIn)
    handleConnected(isSignedIn: boolean) {
        isSignedIn && this.inGame();
    }

    createConnection() {
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.connectToServiceGateway();
    }

    // @handle(gc.GatewayConnection.GatewayConnectionStore, (store) => store.connection?.close())
    // terminateGatewayConnection() {
    //     console.log('Close Gateway Connection');
    // }

    handleReconnect = () => {
        // this.terminateGatewayConnection();
        GameConnectionService.handleReconnect(this);
    };

    resetStateWhenReconnect() {
        this.setState({
            isOpenStatistic: false,
        });
        this.resetBettingPanel();
    }

    // -------------------------------------------------------------------------
    // CORE STORE RENDER HANDLERS
    // -------------------------------------------------------------------------

    @render(gc.Connection.ConnectionStore, (store) => store.isConnectFailed)
    handleConnectFail(isConnectFailed: boolean) {
        if (isConnectFailed === null) {
            return;
        }
        this.setState({ isConnectFailed });
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleDisconnected(isConnected: boolean) {
        if (isConnected === null) {
            return;
        }
        this.setState({ isConnected });
    }

    @render(gc.GameConfigs.GameConfigStore, (store) => store.initialized)
    handleGameConfigInitialized(initialized: boolean) {
        this.setState({ initialized } as IGameBaseState);
    }

    @render(gc.DisabledGame.DisabledGameStore, (store) => store.showPopup)
    handleDisabledGame(showPopup: boolean) {
        if (!showPopup && this.state.showDisabledPopup) {
            this.joinGame();
        }
        this.setState({ showDisabledPopup: showPopup } as IGameBaseState);
    }

    // -------------------------------------------------------------------------
    // MAIN RENDER METHODS
    // -------------------------------------------------------------------------

    render() {
        return (
            <GameContainer>
                <GameContextProvider value={{ ...this.props }}>{this.getRenderTemplate()}</GameContextProvider>
            </GameContainer>
        );
    }

    getRenderTemplate() {
        const { isConnected, isConnectFailed, initialized: isGameConfigInitialized, showDisabledPopup } = this.state;

        if (isConnectFailed) {
            return <GameDisconnectView onReconnect={this.handleReconnect} backgroundImage={this.getDisconnectViewBackground()} />;
        }

        const isFirstInit = !isGameConfigInitialized && !showDisabledPopup;
        if (isFirstInit || showDisabledPopup) {
            return showDisabledPopup ? this.renderNotice() : <GameLoadingView />;
        }

        if (!isConnected) {
            return <GameDisconnectView onReconnect={this.handleReconnect} />;
        }

        // Allow games to override the entire layout structure if needed
        const customLayout = this.getGameLayout();
        if (customLayout) {
            return customLayout;
        }

        // Standard layout template will be implemented by renderGameLayout
        return this.renderGameLayout();
    }

    // This method should be implemented by UI renderer mixin
    abstract renderGameLayout(): JSX.Element;

    // Required by UI renderer
    abstract renderNotice(): JSX.Element;

    // Protected methods that subclasses can override to customize game sections
    protected getGameHeaderSection(): JSX.Element | null {
        return null;
    }

    protected getGameContentSection(): JSX.Element | null {
        return null;
    }

    protected getGameFooterSection(): JSX.Element | null {
        return null;
    }

    protected getGameRoundHistorySection(): JSX.Element | null {
        return null;
    }

    protected getGameHistorySection(): JSX.Element | null {
        return null;
    }

    protected getGameBackgroundImage(): string | null {
        return null;
    }

    protected getDisconnectViewBackground(): string | null {
        return null;
    }

    // UI state management
    resetBettingPanel = () => {
        this.setState({
            activePanelId: null,
            showBetPanel: false,
        });
    };

    toggleStatistic = () => {
        this.setState({ isOpenStatistic: !this.state.isOpenStatistic });
    };
}

export default GameBase;
