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
    private _hasDisconnected: boolean = false;

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
        // Fallback disconnect in case early detection didn't work
        this.directDisconnectGateway();
    }

    componentDidUpdate(prevProps: P, prevState: S) {
        super.componentDidUpdate?.(prevProps, prevState);

        // Detect unmount conditions and disconnect early
        this.detectAndHandleUnmountConditions(prevProps);
    }

    private detectAndHandleUnmountConditions(prevProps: P) {
        // Temporarily disable early disconnect detection to fix connection issues
        // The connection should be handled by the proper lifecycle methods

        // Check if we're about to unmount by looking for unmount indicators
        const isAboutToUnmount = this.checkUnmountIndicators(prevProps);

        if (isAboutToUnmount && !this._hasDisconnected) {
            console.log('Early disconnect detected - but DISABLED for now');
            console.log('Unmount indicators:', {
                propsChanged: this.hasUnmountPropsChanged(prevProps),
                invalidState: this.isComponentInInvalidState(),
                state: {
                    isConnected: this.state.isConnected,
                    isAuthorized: this.state.isAuthorized,
                    isSignedIn: this.state.isSignedIn,
                    isConnectFailed: this.state.isConnectFailed
                }
            });
            // Temporarily disabled: this.terminateGatewayConnection();
            // this._hasDisconnected = true;
        }
    }

    private checkUnmountIndicators(prevProps: P): boolean {
        // Check various conditions that might indicate the component is about to unmount

        // 1. Check for specific props changes that indicate unmount
        if (this.hasUnmountPropsChanged(prevProps)) {
            return true;
        }

        // 2. Check if the component is still in a valid state
        if (this.isComponentInInvalidState()) {
            return true;
        }

        return false;
    }

    private hasUnmountPropsChanged(prevProps: P): boolean {
        // Check for specific prop changes that indicate the component should unmount
        // Override this in your specific implementation based on your props

        // Example: Check if critical props have changed
        if (prevProps.namespace !== this.props.namespace) {
            return true;
        }

        // Add more specific checks based on your component's props
        return false;
    }

    private isComponentInInvalidState(): boolean {
        // Check if the component is in an invalid state that suggests it should unmount
        // This is a heuristic - customize based on your specific case

        // Add detailed logging to understand the state
        console.log('Checking component state validity:', {
            isConnected: this.state.isConnected,
            isAuthorized: this.state.isAuthorized,
            isSignedIn: this.state.isSignedIn,
            isConnectFailed: this.state.isConnectFailed,
            stateKeys: Object.keys(this.state)
        });

        // Don't trigger disconnect during initial mount when auth state is still loading
        // Only trigger if we've been mounted for a while and still don't have auth

        // Check if we have a connection but no auth (this would be invalid)
        // BUT only if we're not in the middle of the connection process
        if (this.state.isConnected && !this.state.isAuthorized && !this.state.isSignedIn) {
            // Give some time for auth to complete after connection
            console.log('Connected but not authorized - this might be normal during connection process');
            return false; // Don't disconnect during connection process
        }

        // Check if we have auth failure indicators
        if (this.state.isConnectFailed) {
            console.log('Invalid state detected: Connection failed');
            return true;
        }

        console.log('Component state is valid');
        return false;
    }

    protected configureUIRenderer(): UIExtensionOptions {
        return {};
    }


    // Disabled onVisibilityChange disconnect - connection should stay active when switching tabs
    // override onVisibilityChange = () => {
    //     if (document.hidden) {
    //         console.log('Tab hidden - disconnecting gateway connection');
    //         this.terminateGatewayConnection();
    //     }
    // }

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
        if (isConnected) this.connectLiveGateway();
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler, (handler) => handler.disconnect())
    terminateGatewayConnection() {
        console.log('terminate Gateway Connection');
        // The decorator will handle the disconnect call automatically
    }

    // Direct disconnect method for unmount scenarios where decorator might not work
    private directDisconnectGateway() {
        console.log('directDisconnectGateway called');
        // During unmount, the decorator system might not work properly
        // So we call the decorated method directly and hope the decorator still works
        this.terminateGatewayConnection();
    }

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
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
    override closeConnect(): void {
        console.log('closeConnect called - terminating all connections');
        this.terminateGatewayConnection();
        this.terminateConnection();
    }

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
