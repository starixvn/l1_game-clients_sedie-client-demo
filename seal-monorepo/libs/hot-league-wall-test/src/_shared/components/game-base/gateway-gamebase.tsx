import * as gc from '@sg/sg-game-client';
import GameBase, { IGameBaseState } from '.';
import { GameBaseProps } from './type';
import { handle, render } from '@sg/sg-observer';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { StorageManager, localStorageKeys } from '../../utils/storage-manager';
import { ILatestBetRecord } from '../bet-panel/bet-panel';
import AuthorizationHandler from '../../handlers/authorization-handler';

export interface IGatewayGameBaseState extends IGameBaseState {
    isAuthorized: boolean;
    isSignedIn: boolean;
}

export default abstract class GatewayGameBase<P extends GameBaseProps, S extends IGatewayGameBaseState> extends GameBase<P, S> {
    private authHandler: AuthorizationHandler;

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
        console.log('[GatewayGameBase] Constructor initialized', { namespace: this.props.namespace });
    }

    private isRoundIdMatching(currentRoundId: number): boolean {
        const betHistory = StorageManager.get(localStorageKeys.betHistory) as ILatestBetRecord[] | null;
        if (!betHistory || !Array.isArray(betHistory)) return false;
        const storedGame = betHistory.find((bet) => bet.namespace === this.props.namespace);
        const isMatching = storedGame ? currentRoundId === storedGame.roundId : false;
        console.log('[GatewayGameBase] isRoundIdMatching', { currentRoundId, storedGameRoundId: storedGame?.roundId, isMatching });
        return isMatching;
    }

    processAuthorizationIfRoundMatches(roundId: number) {
        console.log('[GatewayGameBase] processAuthorizationIfRoundMatches', { roundId });
        if (!this.isRoundIdMatching(roundId)) {
            console.log('[GatewayGameBase] Round ID does not match, skipping authorization');
            return;
        }
        this.authHandler = new AuthorizationHandler(
            this.state.isAuthorized,
            this.state.isSignedIn,
            () => this.signIn(),
            () => this.autoCreateNickname(),
        );
        console.log('[GatewayGameBase] Handling wait for authorization');
        this.authHandler.handleWaitForAuthorize();
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthorized)
    protected handleAuthorized(isAuthorized: boolean) {
        console.log('[GatewayGameBase] handleAuthorized', { isAuthorized });
        this.setState({ isAuthorized });
    }

    @handle(gc.Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    protected autoCreateNickname() {
        console.log('[GatewayGameBase] autoCreateNickname called');
    }

    @render(gc.GatewayConnection.GatewayConnectionStore, (store) => store.isConnected)
    handleConnectLiveGatewayForGame(isConnected: boolean) {
        console.log('[GatewayGameBase] handleConnectLiveGatewayForGame', { isConnected });
        if (isConnected) {
            this.connectLiveGateway();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
    connectLiveGateway() {
        console.log('[GatewayGameBase] connectLiveGateway called');
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleJoinGame(isConnected: boolean) {
        console.log('[GatewayGameBase] handleJoinGame', { isConnected });
        if (isConnected) {
            this.joinGame();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.JoinGameHandler)
    joinGame() {
        console.log('[GatewayGameBase] joinGame called', { roundId: this.state.roundId });
        this.processAuthorizationIfRoundMatches(this.state.roundId);
    }

    @handle(gc.Connection.ConnectionHandlers.SignInHandler)
    signIn() {
        console.log('[GatewayGameBase] signIn called');
    }

    override handleConnected(signedIn: boolean) {
        console.log('[GatewayGameBase] handleConnected', { signedIn });
        signedIn && this.inGameLiveGateway();
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler, (handler) => handler.handleGateway())
    inGameLiveGateway() {
        console.log('[GatewayGameBase] inGameLiveGateway called');
    }
}
