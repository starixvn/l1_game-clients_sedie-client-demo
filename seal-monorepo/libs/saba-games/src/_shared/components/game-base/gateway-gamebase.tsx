import * as gc from '@sg/sg-game-client';
import GameBase, { IGameBaseState } from '.';
import { GameBaseProps } from './type';
import { handle, render } from '@sg/sg-observer';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { StorageManager, localStorageKeys } from '../../utils/storage-manager';
import { ILatestBetRecord } from '../bet-panel/bet-panel';
import AuthorizationHandler from '../../handlers/authorization-handler';
import { ConnectionManager } from './connection-manager';

export interface IGatewayGameBaseState extends IGameBaseState {
    isAuthorized: boolean;
    isSignedIn: boolean;
}

export default abstract class GatewayGameBase<P extends GameBaseProps, S extends IGatewayGameBaseState> extends GameBase<P, S> {
    private authHandler: AuthorizationHandler;
    protected connectionManager: ConnectionManager;

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

        // Initialize connection manager
        this.connectionManager = ConnectionManager.getInstance();
    }

    componentWillUnmount() {
        // Proper cleanup using ConnectionManager
        this.cleanupGatewayConnections();
        super.componentWillUnmount();
    }

    /**
 * Clean up all connections properly
 */
    private async cleanupGatewayConnections() {
        try {
            console.log('GatewayGameBase: Starting connection cleanup');

            // Disconnect using the manager (handles both handler.disconnect() and connection.close())
            await this.connectionManager.disconnect('component_unmount');

            // Close all remaining connections as a safety measure
            await this.connectionManager.closeAllConnections('component_unmount');

            console.log('GatewayGameBase: Connection cleanup completed');
        } catch (error) {
            console.error('GatewayGameBase: Error during connection cleanup:', error);
        }
    }

    /**
     * Register a connection when it's created
     */
    protected registerConnection(connection: any): void {
        if (connection) {
            this.connectionManager.registerConnection(connection);
            console.log('GatewayGameBase: Connection registered for tracking');
        }
    }

    /**
     * Unregister a connection when it's closed
     */
    protected unregisterConnection(connection: any): void {
        if (connection) {
            this.connectionManager.unregisterConnection(connection);
            console.log('GatewayGameBase: Connection unregistered from tracking');
        }
    }

    /**
     * Get connection handler and register its connection
     */
    protected getConnectionHandler(): any {
        try {
            const container = this.connectionManager['getSharedContainer']();
            if (!container) {
                return null;
            }

            const handler = container.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);

            // Register the connection if it exists
            if (handler && handler.connection) {
                this.registerConnection(handler.connection);
            }

            return handler;
        } catch (error) {
            console.error('GatewayGameBase: Failed to get connection handler:', error);
            return null;
        }
    }

    private isRoundIdMatching(currentRoundId: number): boolean {
        const betHistory = StorageManager.get(localStorageKeys.betHistory) as ILatestBetRecord[] | null;
        if (!betHistory || !Array.isArray(betHistory)) return false;
        const storedGame = betHistory.find((bet) => bet.namespace === this.props.namespace);
        const isMatching = storedGame ? currentRoundId === storedGame.roundId : false;
        return isMatching;
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
    protected autoCreateNickname() {
    }

    @render(gc.GatewayConnection.GatewayConnectionStore, (store) => store.isConnected)
    handleConnectLiveGatewayForGame(isConnected: boolean) {
        if (isConnected) {
            this.connectLiveGateway();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
    connectLiveGateway() {
        // Register the connection when it's established
        const handler = this.getConnectionHandler();
        if (handler && handler.connection) {
            this.registerConnection(handler.connection);
        }
    }

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
    signIn() {
    }

    override handleConnected(signedIn: boolean) {
        signedIn && this.inGameLiveGateway();
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler, (handler) => handler.handleGateway())
    inGameLiveGateway() {
    }

    /**
     * Enhanced closeConnect method that uses ConnectionManager
     */
    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() {
        // Use ConnectionManager instead of direct handler calls
        this.connectionManager.disconnect('close_connect_handler');
    }

    /**
     * Handle visibility changes to manage connections
     */
    onVisibilityChange = async () => {
        if (document.hidden) {
            // Page is hidden - disconnect to save resources
            console.log('GatewayGameBase: Page hidden, disconnecting connections');
            await this.connectionManager.disconnect('visibility_change');
        } else {
            // Page is visible - reconnect if needed
            console.log('GatewayGameBase: Page visible, reconnecting if needed');
            this.connectLiveGateway();
        }
    };

    /**
     * Get connection status information
     */
    getConnectionInfo() {
        return {
            activeConnections: this.connectionManager.getActiveConnectionCount(),
            isShuttingDown: this.connectionManager.isShutdownInProgress(),
            hasActiveConnections: this.connectionManager.hasActiveConnections(),
        };
    }
}
