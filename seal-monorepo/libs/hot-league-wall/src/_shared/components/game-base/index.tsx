import * as gc from '@sg/sg-game-client';
import { Settlements } from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import React from 'react';
import { GameContextProvider } from '../../react-contexts/game-context/game-context';
import { Lobby } from '../../states';
import AnimationBalance from '../anim-balance';
import { ConfirmBet } from '../bet-option/confirm-bet';
import GameContainer from '../game-container';
import Loading from '../loading';
import Notice from '../notices/notice';
import Warning from '../notices/warning';
import StatisticButton from '../statistic-button/statistic-button';
import Styles from './game-base.module.scss';
import { GameBaseProps } from './type';
import RoundId from '../round-id';
import CountDownTimer from '../count-down-timer';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds/round-time-store';
import WarningDialog from '../notices/warning-dialog';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import classNames from 'classnames';

export interface IGameBaseState {
    isConnected: boolean;
    isConnectFailed: boolean;
    initialized: boolean;
    showDisabledPopup: boolean;
    isOpenStatistic: boolean;
    statusSettlement?: gc.GameServiceMessage.Status;
    roundState: string;
    isFinishShowResult: boolean;
    gameId: number;
    activePanelId: any;
    showBetPanel: boolean;
    isShowNextRoundMessage: boolean;
    roundId: number;
    isAllowedBet: boolean;
}
interface GameStyleOverrides {
    [key: string]: string;
}

abstract class GameBase<P extends GameBaseProps, S extends IGameBaseState> extends React.PureComponent<P, S> {
    protected overrideClasses?: GameStyleOverrides;

    constructor(props: P) {
        super(props);
        this.state = {
            isConnectFailed: false,
            isOpenStatistic: false,
            isFinishShowResult: false,
            activePanelId: null,
            showBetPanel: false,
            isShowNextRoundMessage: false,
            roundId: 0,
            isAllowedBet: false,
        } as S;
        this.toggleStatistic = this.toggleStatistic.bind(this);
        console.log(`[GameBase] Initialized with namespace: ${props.namespace}`);
    }

    componentDidMount() {
        console.log(`[GameBase] Component mounted`);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    componentWillUnmount() {
        console.log(`[GameBase] Component will unmount`);
        this.onDestroy();
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

    onDestroy() {
        console.log(`[GameBase] Destroying component, closing connection`);
        this.closeConnect();
    }

    abstract closeConnect(): void;

    abstract joinGame(): void;

    abstract connectLiveGateway(): void;

    abstract processAuthorizationIfRoundMatches(roundId: number): void;

    onVisibilityChange = () => {
        console.log(`[GameBase] Visibility changed: ${document.visibilityState}`);
    };
    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler, (handler) => handler.handle())
    connectToServiceGateway() {
        console.log(`[GameBase] Connecting to service gateway`);
    }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handle())
    terminateConnection() {
        console.log(`[GameBase] Terminating connection`);
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isSignedIn)
    handleConnected(isSignedIn: boolean) {
        console.log(`[GameBase] Sign-in status changed: ${isSignedIn}`);
        isSignedIn && this.inGame();
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler)
    inGame() {
        console.log(`[GameBase] Joining game with namespace: ${this.props.namespace}`);
        return this.props.namespace;
    }

    renderNotice(): JSX.Element {
        console.log(`[GameBase] Rendering notice, disabled: ${this.state.showDisabledPopup}`);
        return (
            <Notice namespace={this.props.namespace} isDisableGame={this.state.showDisabledPopup} language={this.props.language}></Notice>
        );
    }

    renderWarning(): JSX.Element {
        return <Warning namespace={this.props.namespace}></Warning>;
    }

    renderRoundIdSection() {
        return <RoundId namespace={this.props.namespace} language={this.props.language} />;
    }

    renderCountDownTimer() {
        return (
            <CountDownTimer
                namespace={this.props.namespace}
                onComplete={() => {
                    console.log(`[GameBase] CountDownTimer completed, allowing bets`);
                    this.setState({ isAllowedBet: true });
                }}
            />
        );
    }

    renderResultBlock() {
        return <></>;
    }

    renderBettingBlock() {
        return <></>;
    }

    renderRoundHistory() {
        return <></>;
    }

    renderStatistic() {
        return <>Statistic</>;
    }

    renderHeader() {
        return <></>;
    }

    setPanelId = (id: string) => {
        console.log(`[GameBase] Setting panel ID: ${id}`);
        this.setState({ activePanelId: id });
    };

    setShowBetPanel = (show: boolean) => {
        console.log(`[GameBase] Setting bet panel visibility: ${show}`);
        this.setState({ showBetPanel: show });
    };

    @render(Settlements.SettlementStatusStore, (store) => store.settlementStatus, {
        fireImmediately: false,
    })
    assignStatus(settlementStatus: any) {
        console.log(`[GameBase] New settlement status received`, settlementStatus);
        this.setState({ statusSettlement: settlementStatus });
    }

    @render(Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        console.log(`[GameBase] Render current finish:`, currentFinish);
        if (!currentFinish) {
            return;
        }
        const { result, settlementResult } = currentFinish;

        if (!this.isValidResult(result, settlementResult)) {
            console.log(`[GameBase] Invalid result or settlement result`);
            return;
        }
        this.setState({ isFinishShowResult: false });
        console.log(`[GameBase] Showing result with animation`);
        this.showResult(true, result, settlementResult).then(() => {
            this.finishShowResult();
        });
    }

    abstract showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ): Promise<void>;

    isValidResult(result?: gc.GameServiceMessage.TResult, settlementResult?: gc.GameServiceMessage.TSettlementResult) {
        return !!result && !!settlementResult;
    }

    @handle(Settlements.SettlementUIHandlers.FinishedShowResult)
    finishShowResult() {
        console.log(`[GameBase] Finished showing result`);
        this.setState({ isFinishShowResult: true });
    }

    @handle(Lobby.LobbyHandlers.TryToConnectHandler)
    tryToConnectHandler() {
        console.log(`[GameBase] Trying to connect`);
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnectFailed)
    handleConnectFail(isConnectFailed: boolean) {
        if (isConnectFailed === null) {
            return;
        }
        console.log(`[GameBase] Connection failure status: ${isConnectFailed}`);
        this.setState({ isConnectFailed: isConnectFailed });
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleDisconnected(isConnected: boolean) {
        if (isConnected === null) {
            return;
        }
        console.log(`[GameBase] Connection status changed: ${isConnected}`);
        this.setState({ isConnected });
    }

    @render(gc.GameConfigs.GameConfigStore, (store) => store.initialized)
    handleGameConfigInitialized(initialized: boolean) {
        console.log(`[GameBase] Game config initialized: ${initialized}`);
        this.setState({ initialized } as IGameBaseState);
    }

    @render(gc.DisabledGame.DisabledGameStore, (store) => store.showPopup)
    handleDisabledGame(showPopup: boolean) {
        console.log(`[GameBase] Disabled game popup status: ${showPopup}`);
        if (!showPopup && this.state.showDisabledPopup) {
            console.log(`[GameBase] Game enabled, joining game`);
            this.joinGame();
        }
        this.setState({ showDisabledPopup: showPopup } as IGameBaseState);
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string) {
        console.log(`[GameBase] Round state changed: ${roundState}`);
        if (roundState === ROUND_STATE.PLACING_BET) {
            this.setState({ isShowNextRoundMessage: false });
        }

        if (roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_RESULT) {
            console.log(`[GameBase] Locking bets or showing result, resetting betting panel`);
            this.resetBettingPanel();
        }
    }

    @render(RoundStore, (store) => store.clientRoundId)
    handleRoundIdChange(roundId: number) {
        console.log(`[GameBase] Round ID changed: ${roundId}`);
        this.setState({ roundId });
        this.processAuthorizationIfRoundMatches(roundId);
    }

    toggleStatistic() {
        const newState = !this.state.isOpenStatistic;
        console.log(`[GameBase] Toggling statistics: ${newState}`);
        this.setState({ isOpenStatistic: newState });
    }

    renderWaitingForNextRound() {
        if (!this.state.isShowNextRoundMessage) {
            return <></>;
        }
        console.log(`[GameBase] Showing wait for next round message`);
        return (
            <WarningDialog key={`warning-bet`}>
                <div className={Styles['title-white']}>{gc.Translator.t('Common.message_placebet_next_round')}</div>
            </WarningDialog>
        );
    }

    resetBettingPanel = () => {
        console.log(`[GameBase] Resetting betting panel`);
        this.setState({
            activePanelId: null,
            showBetPanel: false,
        });
    };

    handleBetOption = () => {
        console.log(`[GameBase] Handling bet option`);
        this.resetBettingPanel();
        this.setState({ isShowNextRoundMessage: true });
        setTimeout(() => {
            console.log(`[GameBase] Hiding next round message`);
            this.setState({ isShowNextRoundMessage: false });
        }, 3000);
    };

    getRenderTemplate() {
        const { isConnected, isConnectFailed, initialized: isGameConfigInitialized, showDisabledPopup, isAllowedBet } = this.state;
        console.log(`[GameBase] Rendering template with state:`, {
            isConnected,
            isConnectFailed,
            isGameConfigInitialized,
            showDisabledPopup,
            isAllowedBet
        });

        if (isConnectFailed) {
            return this.renderDisconnect();
        }

        const isFirstInit = !isGameConfigInitialized && !showDisabledPopup;
        if (isFirstInit || showDisabledPopup) {
            return showDisabledPopup ? this.renderNotice() : this.renderLoading();
        }

        return !isConnected ? (
            this.renderDisconnect()
        ) : (
            <>
                {this.renderHeader()}
                <div className={`${Styles['block-wrapper']} ${this.overrideClasses?.blockWrapper}`}>
                    <div className={`${Styles['info']} ${this.overrideClasses?.info}`}>
                        {this.renderRoundIdSection()}
                        {this.renderCountDownTimer()}
                    </div>
                    <div className={`${Styles['result']} ${this.overrideClasses?.result}`}>{this.renderResultBlock()}</div>
                    <div
                        className={classNames(
                            Styles['bet-options'],
                            {
                                [Styles['disabled']]: !isAllowedBet,
                            },
                            this.overrideClasses?.betOptions,
                        )}
                    >
                        {this.renderBettingBlock()}
                        <ConfirmBet namespace={this.props.namespace} />
                        <div className={`${Styles['animation-balance']} ${Styles[`game-${this.state.gameId}`]}`}>
                            {this.renderAnimationBalance()}
                        </div>
                    </div>
                </div>

                <div className={Styles['history-block']}>
                    <div className={Styles['previous-round']}>{this.renderRoundHistory()}</div>
                    <div className={Styles['statistic-btn']}>
                        <StatisticButton isOpenStatistic={this.state.isOpenStatistic} handleToggle={this.toggleStatistic} />
                    </div>
                    {this.renderNotice()}
                    {this.renderWarning()}
                    {this.renderWaitingForNextRound()}
                </div>
                {this.state.isOpenStatistic && this.renderStatistic()}
            </>
        );
    }

    private renderAnimationBalance() {
        const { statusSettlement, isFinishShowResult } = this.state;
        if (!statusSettlement || !statusSettlement.win) {
            return <></>;
        }
        console.log(`[GameBase] Rendering animation balance, finished: ${isFinishShowResult}, win: ${statusSettlement.win}`);
        if (isFinishShowResult) {
            return <AnimationBalance winBet={statusSettlement?.bet} />;
        }
    }

    private renderLoading() {
        console.log(`[GameBase] Rendering loading state`);
        return (
            <div className="col-md-1 mx-auto mt-5">
                <Loading />
            </div>
        );
    }

    resetStateWhenReconnect() {
        console.log(`[GameBase] Resetting state during reconnect`);
        this.setState({
            isOpenStatistic: false,
        });
        this.resetBettingPanel();
    }

    createConnection() {
        console.log(`[GameBase] Creating new connection`);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.connectToServiceGateway();
    }

    handleReconnect = () => {
        console.log(`[GameBase] Handling reconnect request`);
        this.terminateConnection();
        this.createConnection();
        this.resetStateWhenReconnect();
    };

    private renderDisconnect() {
        console.log(`[GameBase] Rendering disconnect state`);
        const reconnectText = gc.Translator.translate('Common.reconnect');
        return (
            <div className={`${Styles['block-wrapper']} ${this.props.overrideClasses}`}>
                <div className={Styles['reconnect-btn-container']}>
                    <p className={Styles['reconnect-text']}>{gc.Translator.t('Common.connect_failed')}</p>
                    <button
                        className={`${'c-btn'} ${'c-btn--bet'} ${Styles['reconnect-btn']}`}
                        data-disabled={false}
                        onClick={this.handleReconnect}
                    >
                        <span className="c-text">{reconnectText}</span>
                    </button>
                </div>
            </div>
        );
    }

    render() {
        console.log(`[GameBase] Rendering component for namespace: ${this.props.namespace}`);
        return (
            <GameContainer>
                <GameContextProvider value={{ ...this.props }}>{this.getRenderTemplate()}</GameContextProvider>
            </GameContainer>
        );
    }
}

export default GameBase;
