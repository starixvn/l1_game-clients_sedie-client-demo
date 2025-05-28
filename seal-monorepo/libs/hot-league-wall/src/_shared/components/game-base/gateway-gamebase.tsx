import * as gc from '@sg/sg-game-client';
import GameBase, { IGameBaseState } from '.';
import { GameBaseProps } from './type';
import { handle, render } from '@sg/sg-observer';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { StorageManager, localStorageKeys } from '../../utils/storage-manager';
import { ILatestBetRecord } from '../../types/betting';
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
    }

    private isRoundIdMatching(currentRoundId: number): boolean {
        const betHistory = StorageManager.get(localStorageKeys.betHistory) as ILatestBetRecord[] | null;
        if (!betHistory || !Array.isArray(betHistory)) return false;
        const storedGame = betHistory.find((bet) => bet.namespace === this.props.namespace);
        return storedGame ? currentRoundId === storedGame.roundId : false;
    }

    processAuthorizationIfRoundMatches(roundId: number) {
        if (!this.isRoundIdMatching(roundId)) {
            return;
        }
        this.authHandler = new AuthorizationHandler(
            this.state.isAuthorized,
            this.state.isSignedIn,
            () => this.signIn(),
            () => this.autoCreateNickname(),
        );
        this.authHandler.handleWaitForAuthorize();
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthorized)
    protected handleAuthorized(isAuthorized: boolean) {
        this.setState({ isAuthorized });
    }

    @handle(gc.Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    protected autoCreateNickname() { }

    @render(gc.GatewayConnection.GatewayConnectionStore, (store) => store.isConnected)
    handleConnectLiveGatewayForGame(isConnected: boolean) {
        if (isConnected) {
            this.connectLiveGateway();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
    connectLiveGateway() { }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleJoinGame(isConnected: boolean) {
        if (isConnected) {
            this.joinGame();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.JoinGameHandler)
    joinGame() {
        this.processAuthorizationIfRoundMatches(this.state.roundId);
    }

    @handle(gc.Connection.ConnectionHandlers.SignInHandler)
    signIn() { }

    override handleConnected(signedIn: boolean) {
        signedIn && this.inGameLiveGateway();
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler, (handler) => handler.handleGateway())
    inGameLiveGateway() { }
}
