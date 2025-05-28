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
import { SyncMemberSiteBalance } from '../../utils/sync-member-site-balance';

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
    }

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

    abstract closeConnect(): void;

    abstract joinGame(): void;

    abstract connectLiveGateway(): void;

    abstract processAuthorizationIfRoundMatches(roundId: number): void;

    onVisibilityChange = () => { };
    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler, (handler) => handler.handle())
    connectToServiceGateway() { }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handle())
    terminateConnection() { }

    @render(gc.Connection.ConnectionStore, (store) => store.isSignedIn)
    handleConnected(isSignedIn: boolean) {
        isSignedIn && this.inGame();
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler)
    inGame() {
        return this.props.namespace;
    }

    @render(gc.Bet.BetStore, (store) => store.validBet)
    setIsValidBet(validBet: gc.Bet.IValidBet) {
        if (validBet?.value) {
            SyncMemberSiteBalance.getInstance().executeSyncBalance();
        }
    }

    renderNotice(): JSX.Element {
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
        // this.setState({ activePanelId: id });
    };

    setShowBetPanel = (show: boolean) => {
        // this.setState({ showBetPanel: show });
    };

    @render(Settlements.SettlementStatusStore, (store) => store.settlementStatus, {
        fireImmediately: false,
    })
    assignStatus(settlementStatus: any) {
        this.setState({ statusSettlement: settlementStatus });
    }

    @render(Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        const { result, settlementResult } = currentFinish;

        if (!this.isValidResult(result, settlementResult)) {
            return;
        }
        this.setState({ isFinishShowResult: false });
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
        this.setState({ isFinishShowResult: true });
    }

    @handle(Lobby.LobbyHandlers.TryToConnectHandler)
    tryToConnectHandler() { }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnectFailed)
    handleConnectFail(isConnectFailed: boolean) {
        if (isConnectFailed === null) {
            return;
        }
        this.setState({ isConnectFailed: isConnectFailed });
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

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string) {
        if (roundState === ROUND_STATE.PLACING_BET) {
            this.setState({ isShowNextRoundMessage: false });
        }

        if (roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_RESULT) {
            this.resetBettingPanel();
        }
    }

    @render(RoundStore, (store) => store.clientRoundId)
    handleRoundIdChange(roundId: number) {
        this.setState({ roundId });
        this.processAuthorizationIfRoundMatches(roundId);
    }

    toggleStatistic() {
        const newState = !this.state.isOpenStatistic;
        this.setState({ isOpenStatistic: newState });

        // Notify parent window about statistic toggle
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'TOGGLE_STATISTIC',
                isOpen: newState
            }, '*');
        }
    }

    renderWaitingForNextRound() {
        if (!this.state.isShowNextRoundMessage) {
            return <></>;
        }
        return (
            <WarningDialog key={`warning-bet`}>
                <div className={Styles['title-white']}>{gc.Translator.t('Common.message_placebet_next_round')}</div>
            </WarningDialog>
        );
    }

    resetBettingPanel = () => {
        // this.setState({
        //     activePanelId: null,
        //     showBetPanel: false,
        // });
    };

    handleBetOption = () => {
        // this.resetBettingPanel();
        this.setState({ isShowNextRoundMessage: true });
        setTimeout(() => {
            this.setState({ isShowNextRoundMessage: false });
        }, 3000);
    };

    getRenderTemplate() {
        const { isConnected, isConnectFailed, initialized: isGameConfigInitialized, showDisabledPopup, isAllowedBet } = this.state;

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

    protected renderAnimationBalance() {
        const { statusSettlement, isFinishShowResult } = this.state;


        if (!statusSettlement || !statusSettlement.win) {
            return <></>;
        }

        if (isFinishShowResult) {
            return <AnimationBalance winBet={statusSettlement?.bet} />;
        }

        return null;
    }

    private renderLoading() {
        return (
            <div className="col-md-1 mx-auto mt-5">
                <Loading />
            </div>
        );
    }

    resetStateWhenReconnect() {
        this.setState({
            isOpenStatistic: false,
        });
        this.resetBettingPanel();
    }

    createConnection() {
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.connectToServiceGateway();
    }

    handleReconnect = () => {
        this.terminateConnection();
        this.createConnection();
        this.resetStateWhenReconnect();
    };

    private renderDisconnect() {
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
        return (
            <GameContainer>
                <GameContextProvider value={{ ...this.props }}>{this.getRenderTemplate()}</GameContextProvider>
            </GameContainer>
        );
    }
}

export default GameBase;
