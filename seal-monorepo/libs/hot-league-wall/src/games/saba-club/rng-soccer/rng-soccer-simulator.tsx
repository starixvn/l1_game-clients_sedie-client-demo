import { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import GatewayGameSimulator from '../../../games/game-base/gateway/gateway-game-simulator';
import { IGatewayGameBaseState } from '../../../games/game-base/interfaces/gateway-types';
import { configGameContainer } from '../../../games/game-base/startup';
import type { GameBaseProps } from '../../../games/game-base/type';
import { UIExtensionOptions } from '../../../games/game-base/ui/game-ui-renderer';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { gameSimulatorService } from '../../../_shared/services/game-simulator.service';
import styles from './rng-soccer.module.scss';
import { containerOptions, setting } from './game-settings';
import RNGSoccerBetOptions from './bet-option/rng-soccer-bet-options';
import liveIcon from '../../../assets/rng-soccer/live-icon.svg';
import historyBtnIcon from '../../../assets/rng-soccer/history-btn.svg';
import bgGame from '../../../assets/rng-soccer/bg-game.webp';
import blurBgGame from '../../../assets/rng-soccer/blur-bg-game.png';
import RNGSoccerSettlementResult from './settlement-result/rng-soccer-settlement-result';
import RNGSoccerStatistic from './statistic/rng-soccer-statistic';
import { autorun } from 'mobx';

interface IRNGSoccerSimulatorState extends IGatewayGameBaseState {
    isTimerActive: boolean;
    isPopupVisible: boolean;
    // Simulator props for countdown timer
    simulatorMode?: boolean;
    simulatorCountdownTimer?: number;
    simulatorRoundState?: string;
}

/**
 * RNG Soccer Simulator Page
 * 
 * This is the simulator version of the RNG Soccer game that uses GatewayGameSimulator
 * instead of GatewayGameBase. It provides a complete offline simulation environment
 * with realistic fake data and real-time updates.
 * 
 * Features:
 * - No real network connections required
 * - Realistic fake data simulation
 * - Real-time countdown timer
 * - Automatic round progression
 * - Simulated betting and settlement
 * - Team data with proper names and rankings
 * - Round history with varied results
 */
@observer(setting.mainObserverNamespace)
export default class RNGSoccerSimulator extends GatewayGameSimulator<GameBaseProps, IRNGSoccerSimulatorState> {
    private updateInterval: NodeJS.Timeout | null = null;
    private simulatorDisposer: (() => void) | null = null;

    constructor(props: GameBaseProps) {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: Constructor called with props:', props);
        super(props);

        const { placingBet } = setting.durations;
        this.state = {
            ...this.state,
            gameId: setting.id,
            isTimerActive: true,
            isPopupVisible: false,
            roundId: 0,
            placingBetStartTime: placingBet,
        } as IRNGSoccerSimulatorState;

        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: Initial state set:', this.state);

        this.uiRenderer.setExtensionOptions(this.getUIExtensionOptions());

        try {
            configGameContainer(setting.name, containerOptions);
            console.log('🎮 [SIMULATOR] RNGSoccerSimulator: Game container configured successfully');
        } catch (error) {
            console.error('🎮 [SIMULATOR] RNGSoccerSimulator: Error configuring game container:', error);
            // Silent fail on initialization error
        }
    }

    componentDidMount() {
        console.log('🎮 [RNG_SOCCER_SIMULATOR] Component mounted, starting simulator');
        this.startSimulator();
    }

    componentWillUnmount() {
        console.log('🎮 [RNG_SOCCER_SIMULATOR] Component unmounting, stopping simulator');
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        gameSimulatorService.stop();
        if (this.simulatorDisposer) this.simulatorDisposer();
    }

    private startSimulator() {
        console.log('🎮 [RNG_SOCCER_SIMULATOR] Starting simulator with initial state:', this.state);

        // Initialize and start the real simulator service
        gameSimulatorService.initialize({
            gameType: 'rng-soccer',
            gameContainer: null // For now, pass null - we'll handle store updates differently
        });
        gameSimulatorService.start();
        console.log('🎮 [RNG_SOCCER_SIMULATOR] Game simulator service started');

        // Update state every 100ms for real-time updates
        this.updateInterval = setInterval(() => {
            const simState = gameSimulatorService.getState();
            const mappedRoundState = this.mapRoundState(simState.roundState);

            // Log state updates every second
            if (simState.countdownTimer % 1 === 0) {
                console.log('🎮 [RNG_SOCCER_SIMULATOR] === STATE UPDATE ===', {
                    countdownTimer: simState.countdownTimer,
                    roundState: simState.roundState,
                    mappedRoundState: mappedRoundState,
                    currentRoundId: simState.currentRoundId,
                    timestamp: new Date().toISOString()
                });
            }

            // Update component state with all required properties
            this.setState({
                roundId: parseInt(simState.currentRoundId.replace('RND', '')),
                roundState: mappedRoundState,
                isAllowedBet: simState.roundState === 'placing_bet',
                isTimerActive: simState.isRunning,
                placingBetStartTime: simState.countdownTimer,
                // Connection state properties to prevent reconnecting container
                isConnected: simState.isConnected,
                isSignedIn: simState.isSignedIn,
                isAuthorized: simState.isAuthorized,
                initialized: simState.isInitialized,
                // Simulator props for countdown timer
                simulatorMode: true,
                simulatorCountdownTimer: simState.countdownTimer,
                simulatorRoundState: mappedRoundState,
            } as IRNGSoccerSimulatorState);

            // Update global store for countdown timer
            if (typeof window !== 'undefined') {
                (window as any).__ROUND_TIME_STORE__ = {
                    countdownTimer: simState.countdownTimer,
                    roundState: mappedRoundState,
                    currentRoundId: simState.currentRoundId
                };
            }
        }, 100);
    }

    private mapRoundState(simulatorState: string): string {
        // Map simulator states to game client states
        switch (simulatorState) {
            case 'placing_bet':
                return 'placingBets';
            case 'locking_bet':
                return 'lockingBet';
            case 'countdown':
                return 'countdown';
            case 'running':
                return 'running';
            case 'settlement':
                return 'settlement';
            case 'finished':
                return 'finished';
            default:
                return 'placingBets';
        }
    }

    // State management methods
    togglePopup = () => {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: togglePopup called, current isPopupVisible:', this.state.isPopupVisible);
        this.setState({
            isPopupVisible: !this.state.isPopupVisible
        });
    }

    setShowBetPanel = (show: boolean) => {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: setShowBetPanel called with:', show);
        this.setState({ showBetPanel: show });
    };

    setPanelId = (id: string) => {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: setPanelId called with:', id);
        this.setState({ activePanelId: id });
    };

    // Game lifecycle and event handlers
    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    override closeConnect() {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: closeConnect called');
    }

    // Override connection methods to ensure simulator always shows as connected
    isConnected(): boolean {
        return true; // Simulator is always connected
    }

    isSignedIn(): boolean {
        return true; // Simulator is always signed in
    }

    isAuthorized(): boolean {
        return true; // Simulator is always authorized
    }

    isInitialized(): boolean {
        return gameSimulatorService.isSimulatorInitialized();
    }

    override getGameBackgroundImage(): string {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: getGameBackgroundImage called, returning:', bgGame);
        return bgGame;
    }

    override getDisconnectViewBackground(): string {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: getDisconnectViewBackground called, returning:', blurBgGame);
        return blurBgGame;
    }

    // UI configuration and rendering methods
    getUIExtensionOptions(): UIExtensionOptions {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: getUIExtensionOptions called');
        return {
            classes: {
                gameContainer: styles['sport-item'],
                header: styles['wrapper-sport-top'],
                content: styles['wrapper-sport-content'],
                footer: styles['wrapper-sport-bottom'],
                popup: styles['statistic-popup'],
                gameNameText: styles['game-name-text'],
                gameNameRound: styles['game-name-round'],
                liveIcon: styles['live-icon'],
                timer: styles['timer'],
                statsIcon: styles['score-board-img']
            },
            components: {
                customContent: () => this.renderCustomContent(),
                customFooter: () => this.renderCustomFooter(),
                customHistory: (props, state) => this.renderCustomHistory(state as IRNGSoccerSimulatorState),
                customBetting: () => this.renderCustomBetting()
            },
            config: {
                gameName: 'RNGSoccer (Simulator)',
                liveIconUrl: liveIcon,
                statsIconUrl: historyBtnIcon,
                onStatsIconClick: this.togglePopup
            }
        };
    }

    renderCustomContent(): JSX.Element {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: renderCustomContent called');

        return (
            <Suspense fallback={<div>Loading Simulator...</div>}>
                <RNGSoccerSettlementResult
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                />
            </Suspense>
        );
    }

    renderCustomFooter(): JSX.Element {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: renderCustomFooter called');
        return (
            <div className={styles['wrapper-sport-bottom']}>
                {this.renderCustomBetting()}
            </div>
        );
    }

    renderCustomBetting(): JSX.Element {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: renderCustomBetting called');
        return (
            <GameBettingOptionsContext.Provider
                value={{
                    panelId: this.state.activePanelId,
                    setPanelId: this.setPanelId,
                    show: this.state.showBetPanel,
                    setShow: this.setShowBetPanel,
                }}
            >
                <RNGSoccerBetOptions
                    gameName={setting.gameName}
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                    onBet={() => {
                        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: onBet callback triggered');
                        this.resetBettingPanel();
                        this.setState({ isShowNextRoundMessage: true } as Pick<IRNGSoccerSimulatorState, keyof IRNGSoccerSimulatorState>);
                        setTimeout(() => {
                            this.setState({ isShowNextRoundMessage: false } as Pick<IRNGSoccerSimulatorState, keyof IRNGSoccerSimulatorState>);
                        }, 3000);
                    }}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderCustomHistory(state: IRNGSoccerSimulatorState): JSX.Element {
        console.log('🎮 [SIMULATOR] RNGSoccerSimulator: renderCustomHistory called with state:', state);
        return (
            <Suspense fallback={<div>Loading Simulator History...</div>}>
                <RNGSoccerStatistic
                    namespace={this.props.namespace}
                    language={this.props.language}
                    isPopupVisible={state.isPopupVisible ?? false}
                    togglePopup={this.togglePopup}
                />
            </Suspense>
        );
    }

    // Public method to get current simulator state for UI components
    public getSimulatorState() {
        const simState = gameSimulatorService.getState();
        return {
            countdownTimer: simState.countdownTimer,
            roundState: simState.roundState,
            isRunning: simState.isRunning,
            currentRoundId: simState.currentRoundId,
            teamData: simState.fakeData.teamData
        };
    }
} 