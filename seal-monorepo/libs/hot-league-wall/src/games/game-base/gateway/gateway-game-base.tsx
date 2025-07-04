import * as gc from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import React from 'react';
import { StorageManager, localStorageKeys } from '../../../_shared/utils/storage-manager';
import { ILatestBetRecord } from '../../../_shared/components/bet-panel/bet-panel';
import AuthorizationHandler from '../../../_shared/handlers/authorization-handler';
import GameBase from '../core/game-base.core';
import GameUIRenderer, { UIExtensionOptions } from '../ui/game-ui-renderer';
import { IGatewayGameBaseState } from '../interfaces/gateway-types';
import { GameBaseProps } from '../type';
import { SyncMemberSiteBalance } from '../../../_shared/utils/callback-singleton/sync-member-site-balance';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds/round-time-store';
import { Settlements } from '@sg/sg-game-client';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';

class GatewayGameBase<P extends GameBaseProps, S extends IGatewayGameBaseState> extends GameBase<P, S> {
    private authHandler: AuthorizationHandler;
    protected uiRenderer: GameUIRenderer<P, S>;

    constructor(props: P) {
        super(props);
        this.state = {
            ...this.state,
            isAuthorized: false,
            isSignedIn: false,
        } as S;

        this.authHandler = new AuthorizationHandler(
            this.state.isAuthorized,
            this.state.isSignedIn,
            () => this.signIn(),
            () => this.autoCreateNickname(),
        );

        this.uiRenderer = new GameUIRenderer<P, S>();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.terminateGatewayConnection();
    }

    override onVisibilityChange = () => {
        if (document.hidden) {
            this.terminateGatewayConnection();
        }
    }

    protected configureUIRenderer(): UIExtensionOptions {
        return {};
    }

    protected initializeUIRenderer(): void {
        const options = this.configureUIRenderer();
        if (Object.keys(options).length > 0) {
            this.uiRenderer.setExtensionOptions(options);
        }
    }

    // AUTHORIZATION METHODS
    private isRoundIdMatching(currentRoundId: number): boolean {
        const betHistory = StorageManager.get(localStorageKeys.betHistory) as ILatestBetRecord[] | null;
        if (!betHistory || !Array.isArray(betHistory)) return false;
        const storedGame = betHistory.find((bet) => bet.namespace === this.props.namespace);
        return storedGame ? currentRoundId === storedGame.roundId : false;
    }

    override processAuthorizationIfRoundMatches(roundId: number): void {
        if (!this.isRoundIdMatching(roundId)) return;

        this.authHandler = new AuthorizationHandler(
            this.state.isAuthorized,
            this.state.isSignedIn,
            () => this.signIn(),
            () => this.autoCreateNickname(),
        );
        this.authHandler.handleWaitForAuthorize();
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthorized)
    protected handleAuthorized(isAuthorized: boolean): void {
        this.setState({ isAuthorized } as Pick<S, keyof S>);
    }

    @handle(gc.Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    protected autoCreateNickname(): void { }

    // CONNECTION METHODS
    @render(gc.GatewayConnection.GatewayConnectionStore, (store) => store.isConnected)
    handleConnectLiveGatewayForGame(isConnected: boolean): void {
        // this.terminateConnection();
        if (isConnected) this.connectLiveGateway();
    }

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => {
        console.log('connectLiveGateway');
        handler.handleGateway();
    })
    override connectLiveGateway(): void { }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleJoinGame(isConnected: boolean): void {
        if (isConnected) this.joinGame();
    }

    @handle(gc.Connection.ConnectionHandlers.JoinGameHandler)
    override joinGame(): void {
        this.processAuthorizationIfRoundMatches(this.state.roundId);
    }

    @handle(gc.Connection.ConnectionHandlers.SignInHandler)
    signIn(): void { }

    override handleConnected(signedIn: boolean): void {
        if (signedIn) this.inGameLiveGateway();
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler, (handler) => handler.handleGateway())
    inGameLiveGateway(): void { }

    // ABSTRACT METHOD IMPLEMENTATIONS
    override closeConnect(): void { }

    override showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ): Promise<void> {
        return Promise.resolve();
    }

    // UI AND STATE HANDLING
    @render(gc.Bet.BetStore, (store) => store.validBet)
    setIsValidBet(validBet: gc.Bet.IValidBet): void {
        if (validBet?.value) {
            SyncMemberSiteBalance.getInstance().executeSyncBalance();
        }
    }

    @render(Settlements.SettlementStatusStore, (store) => store.settlementStatus, {
        fireImmediately: false,
    })
    assignStatus(settlementStatus: any): void {
        this.setState({ statusSettlement: settlementStatus } as Pick<S, keyof S>);
    }

    @render(Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    async renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        const { result, settlementResult } = currentFinish;

        if (!this.isValidResult(result, settlementResult)) {
            return;
        }
        this.setState({ isFinishShowResult: false } as Pick<S, keyof S>);

        await FunctionUtils.delay(this.state.settlementResultDuration * 1000);

        this.showResult(true, result, settlementResult).then(() => {
            this.finishShowResult();
        });
    }

    @handle(Settlements.SettlementUIHandlers.FinishedShowResult)
    finishShowResult(): void {
        this.setState({ isFinishShowResult: true } as Pick<S, keyof S>);
    }

    private isValidResult(result?: gc.GameServiceMessage.TResult, settlementResult?: gc.GameServiceMessage.TSettlementResult): boolean {
        return !!result && !!settlementResult;
    }

    // Round Handler Logic
    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string): void {
        if (roundState === ROUND_STATE.PLACING_BET) {
            this.setState({ isShowNextRoundMessage: false } as Pick<S, keyof S>);
        }

        if (roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_RESULT) {
            this.resetBettingPanel();
        }

        this.setState({ roundState } as Pick<S, keyof S>);
    }

    @render(gc.Rounds.RoundStore, (store) => store.clientRoundId)
    handleRoundIdChange(roundId: number): void {
        if (this.state.roundState !== ROUND_STATE.NONE) {
            this.setState({ roundId } as Pick<S, keyof S>);
        }
        this.processAuthorizationIfRoundMatches(roundId);
    }

    handleBetOption(): void {
        this.resetBettingPanel();
        this.setState({ isShowNextRoundMessage: true } as Pick<S, keyof S>);
        setTimeout(() => {
            this.setState({ isShowNextRoundMessage: false } as Pick<S, keyof S>);
        }, 3000);
    }

    override renderNotice(): JSX.Element {
        return this.uiRenderer.renderNotice(this.props, this.state);
    }

    override renderGameLayout(): JSX.Element {
        const customHeaderSection = this.getGameHeaderSection();
        const customContentSection = this.getGameContentSection();
        const customFooterSection = this.getGameFooterSection();
        const customRoundHistorySection = this.getGameRoundHistorySection();
        const customHistorySection = this.getGameHistorySection();
        const backgroundImage = this.getGameBackgroundImage();

        return this.uiRenderer.renderGameLayout(
            this.props,
            this.state,
            (state) => this.setState(state as Pick<S, keyof S>),
            this.overrideClasses,
            backgroundImage || undefined,
            customHeaderSection,
            customContentSection,
            customFooterSection,
            customHistorySection,
            customRoundHistorySection,
        );
    }
}

export default GatewayGameBase;
