import React, { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import GatewayGameBase, { IGatewayGameBaseState } from '../../../_shared/components/game-base/gateway-gamebase';
import { configGameContainer } from '../../../_shared/components/game-base/startup';
import type { GameBaseProps } from '../../../_shared/components/game-base/type';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';
import ColorGameBetOptions from './bet-option/color-game-bet-options';
import styles from './color-game.module.scss';
import { containerOptions, setting } from './game-settings';
import ColorGameSettlementResult from './settlement-result';
import { ANIMATION_DURATION_MS } from './constants';
import ColorGameRoundHistory from './round-history/color-game-round-history';

const ColorGameStatistic = React.lazy(() => import('./statistic/color-game-statistic'));

interface IColorGamePageState extends IGatewayGameBaseState {
    activePanelId: any;
    roundState: string;
    showBetPanel: boolean;
    gameId: number;
    connectionStatus: {
        activeConnections: number;
        isShuttingDown: boolean;
        hasActiveConnections: boolean;
    };
}

interface IColorGamePageProps extends GameBaseProps {
    language: string;
}

/**
 * Enhanced Color Game with proper connection management
 * Demonstrates how to use registerConnection and ConnectionManager
 */
@observer(setting.mainObserverNamespace)
export default class ColorGameWithConnectionManagement extends GatewayGameBase<IColorGamePageProps, IColorGamePageState> {
    override overrideClasses = {
        blockWrapper: styles['block-wrapper'],
        betOptions: styles['bet-options-block'],
        info: styles['info-block'],
        result: styles['result-block'],
    };

    constructor(props: IColorGamePageProps) {
        super(props);
        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
            console.error('Failed to config game container:', error);
        }

        this.state = {
            ...this.state,
            gameId: setting.id,
            connectionStatus: {
                activeConnections: 0,
                isShuttingDown: false,
                hasActiveConnections: false,
            }
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.updateConnectionStatus();
    }

    /**
     * Enhanced closeConnect method using ConnectionManager
     */
    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() {
        console.log('ColorGame: Closing connections using ConnectionManager');
        this.connectionManager.disconnect('close_connect_handler');
    }

    /**
     * Enhanced connectLiveGateway with connection registration
     */
    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
    connectLiveGateway() {
        console.log('ColorGame: Connecting to live gateway');

        // Get the connection handler and register the connection
        const handler = this.getConnectionHandler();
        if (handler && handler.connection) {
            this.registerConnection(handler.connection);
            console.log('ColorGame: Connection registered for tracking');
        }

        // Update connection status
        this.updateConnectionStatus();
    }

    /**
     * Handle connection state changes
     */
    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    handleConnectionStateChange(isConnected: boolean) {
        this.setState({ isConnected });

        if (!isConnected) {
            console.log('ColorGame: Connection lost, cleaning up');
            this.connectionManager.closeAllConnections('connection_lost');
        }

        this.updateConnectionStatus();
    }

    /**
     * Handle connection failures
     */
    @render(gc.Connection.ConnectionStore, (store) => store.isConnectFailed)
    handleConnectionFailure(isConnectFailed: boolean) {
        if (isConnectFailed) {
            console.error('ColorGame: Connection failed, cleaning up');
            this.connectionManager.closeAllConnections('connection_failed');
        }
    }

    /**
     * Enhanced visibility change handling
     */
    onVisibilityChange = async () => {
        if (document.hidden) {
            console.log('ColorGame: Page hidden, disconnecting connections');
            await this.connectionManager.disconnect('visibility_change');
        } else {
            console.log('ColorGame: Page visible, reconnecting if needed');
            this.connectLiveGateway();
        }
        this.updateConnectionStatus();
    };

    /**
     * Update connection status for monitoring
     */
    private updateConnectionStatus() {
        const connectionInfo = this.getConnectionInfo();
        this.setState({
            connectionStatus: {
                activeConnections: connectionInfo.activeConnections,
                isShuttingDown: connectionInfo.isShuttingDown,
                hasActiveConnections: connectionInfo.hasActiveConnections,
            }
        });
    }

    /**
     * Handle reconnection with proper cleanup
     */
    handleReconnect = async () => {
        try {
            console.log('ColorGame: Attempting reconnection');

            // 1. Clean up existing connections
            await this.connectionManager.closeAllConnections('reconnect');

            // 2. Reset connection state
            await this.connectionManager.reset();

            // 3. Create new connection
            this.connectLiveGateway();

            console.log('ColorGame: Reconnection completed');
        } catch (error) {
            console.error('ColorGame: Reconnection failed:', error);
        } finally {
            this.updateConnectionStatus();
        }
    };

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    handleRoundStateChange(roundState: string) {
        this.setState({ roundState });
    }

    renderRoundHistory() {
        return (
            <Suspense>
                <ColorGameRoundHistory namespace={this.props.namespace} language={this.props.language} />
            </Suspense>
        );
    }

    renderBettingBlock() {
        return (
            <GameBettingOptionsContext.Provider
                value={{
                    panelId: this.state.activePanelId,
                    setPanelId: this.setPanelId,
                    show: this.state.showBetPanel,
                    setShow: this.setShowBetPanel,
                }}
            >
                <ColorGameBetOptions
                    gameName={setting.gameName}
                    namespace={this.props.namespace}
                    language={this.props.language}
                    onBet={this.handleBetOption}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderResultBlock() {
        return <ColorGameSettlementResult namespace={this.props.namespace} language={this.props.language} />;
    }

    renderStatistic() {
        return (
            <Suspense>
                <ColorGameStatistic namespace={this.props.namespace} gameName={setting.gameName} language={this.props.language} />
            </Suspense>
        );
    }

    /**
     * Render connection status for debugging
     */
    renderConnectionStatus() {
        const { connectionStatus } = this.state;

        return (
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 1000
            }}>
                <div>Active Connections: {connectionStatus.activeConnections}</div>
                <div>Shutting Down: {connectionStatus.isShuttingDown ? 'Yes' : 'No'}</div>
                <div>Has Active: {connectionStatus.hasActiveConnections ? 'Yes' : 'No'}</div>
                <button
                    onClick={this.handleReconnect}
                    style={{
                        marginTop: '5px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    Reconnect
                </button>
            </div>
        );
    }

    async showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ) {
        if (!this.isValidResult(result, settlementResult)) {
            return;
        }

        await FunctionUtils.delay(ANIMATION_DURATION_MS);
        this.finishShowResult();
    }

    render() {
        return (
            <>
                {this.renderConnectionStatus()}
                {super.render()}
            </>
        );
    }
} 