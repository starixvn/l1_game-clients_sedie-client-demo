import * as gc from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import React from 'react';
import { StorageManager, localStorageKeys } from '../../../_shared/utils/storage-manager';
import { ILatestBetRecord } from '../../../_shared/components/bet-panel/bet-panel';
import AuthorizationHandler from '../../../_shared/handlers/authorization-handler';
// import { gameSimulatorService } from '../../../_shared/services/game-simulator.service';
import GatewayGameBase from './gateway-game-base';
import { IGatewayGameBaseState } from '../interfaces/gateway-types';
import { GameBaseProps } from '../type';
import { SyncMemberSiteBalance } from '../../../_shared/utils/sync-member-site-balance';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds/round-time-store';
import { Settlements } from '@sg/sg-game-client';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';

// Mock simulator service for now
const mockSimulatorService = {
    initialize: (config: any) => console.log('🎮 [MOCK_SIMULATOR] Initialized with config:', config),
    getState: () => ({
        currentRoundId: 'MOCK_RND_001',
        roundState: 'placing_bet',
        isInitialized: true,
        isRunning: false,
        isSimulationMode: true,
        countdownTimer: 30,
        isConnected: true,
        isSignedIn: true,
        isAuthorized: true,
        fakeData: {
            teamData: { home: { name: 'Home' }, away: { name: 'Away' } }
        }
    }),
    getFakeData: () => ({
        teamData: { home: { name: 'Home' }, away: { name: 'Away' } },
        currentResult: { winner: 'home', score: '2-1' },
        settlementResult: { win: 185, bet: 100, symbol: 'home' }
    }),
    start: () => console.log('🎮 [MOCK_SIMULATOR] Started'),
    stop: () => console.log('🎮 [MOCK_SIMULATOR] Stopped'),
    isSimulatorRunning: () => false,
    isSimulatorInitialized: () => true,
    toggleErrorSimulation: () => console.log('🎮 [MOCK_SIMULATOR] Toggle error simulation'),
    resetFailureCount: () => console.log('🎮 [MOCK_SIMULATOR] Reset failure count')
};

/**
 * GatewayGameSimulator - Simulator version of GatewayGameBase
 * 
 * This class extends GatewayGameBase but replaces real service connections
 * with the GameSimulatorService for offline prototyping.
 * 
 * Features:
 * - No real network connections required
 * - Realistic fake data simulation
 * - Configurable game types and scenarios
 * - Error simulation for testing
 * - Real-time data updates
 */
class GatewayGameSimulator<P extends GameBaseProps, S extends IGatewayGameBaseState> extends GatewayGameBase<P, S> {
    private simulatorService = mockSimulatorService;
    private isSimulatorMode: boolean = false;

    constructor(props: P) {
        super(props);

        // Check if simulator mode is enabled
        this.isSimulatorMode = this.checkSimulatorMode();

        if (this.isSimulatorMode) {
            this.initializeSimulator();
        }
    }

    /**
     * Check if simulator mode should be enabled
     */
    private checkSimulatorMode(): boolean {
        // Check environment variables or configuration
        const env = process.env.NODE_ENV;
        const isLocalDevelopment = env === 'development' || env === 'test';

        // Check if simulator config is enabled
        const simulatorConfig = this.getSimulatorConfig();
        const isSimulatorEnabled = simulatorConfig?.simulationMode?.enabled || false;

        // Check if we're in a simulator environment
        const isSimulatorEnv = window.location.hostname === 'localhost' ||
            window.location.hostname.includes('simulator');

        return isLocalDevelopment && (isSimulatorEnabled || isSimulatorEnv);
    }

    /**
     * Get simulator configuration
     */
    private getSimulatorConfig(): any {
        try {
            // Try to get config from window object or environment
            return (window as any).__SIMULATOR_CONFIG__ ||
                process.env.SIMULATOR_CONFIG ||
            {
                simulationMode: {
                    enabled: true,
                    autoConnect: true,
                    autoAuthorize: true,
                    realTimeUpdates: true,
                    fakeDataGeneration: true
                }
            };
        } catch (error) {
            console.warn('🎮 [SIMULATOR] Could not load simulator config:', error);
            return { simulationMode: { enabled: false } };
        }
    }

    /**
     * Initialize the simulator
     */
    private initializeSimulator(): void {
        console.log('🎮 [SIMULATOR] Initializing game simulator...');

        const config = this.getSimulatorConfig();
        const gameType = this.determineGameType();

        // Initialize simulator service
        this.simulatorService.initialize({
            gameType,
            enableErrorSimulation: config.simulatorConfigs?.enableErrorSimulation || false,
            gameContainer: null
        });

        // Set initial state for simulator mode
        this.setState({
            isConnected: true,
            isAuthorized: true,
            isSignedIn: true,
            initialized: true,
            roundId: this.simulatorService.getState().currentRoundId,
            roundState: ROUND_STATE.PLACING_BET,
            isAllowedBet: true
        } as any);

        console.log('🎮 [SIMULATOR] Simulator initialized successfully');
    }

    /**
     * Determine game type from props or configuration
     */
    private determineGameType(): string {
        // Try to determine from namespace
        const namespace = this.props.namespace;
        if (namespace) {
            if (namespace.includes('rng-soccer')) return 'rng-soccer';
            if (namespace.includes('baccarat')) return 'baccarat';
            if (namespace.includes('fish-prawn-crab')) return 'fish-prawn-crab';
        }

        // Try to determine from gameId (if it exists on extended props)
        const gameId = (this.props as any).gameId;
        if (gameId) {
            // Map game IDs to game types (you can customize this mapping)
            const gameTypeMap: { [key: number]: string } = {
                118: 'rng-soccer',
                119: 'baccarat',
                120: 'fish-prawn-crab'
            };
            return gameTypeMap[gameId] || 'rng-soccer';
        }

        // Default to rng-soccer
        return 'rng-soccer';
    }

    /**
     * Get custom simulator data based on game type
     */
    private getCustomSimulatorData(): any {
        const gameType = this.determineGameType();

        switch (gameType) {
            case 'rng-soccer':
                return {
                    teamData: {
                        home: { name: 'Arsenal', rank: 1, suit: 2, score: 2 },
                        away: { name: 'Liverpool', rank: 3, suit: 1, score: 1 }
                    },
                    roundOdds: {
                        odds: { home: 1.85, draw: 3.20, away: 2.10 },
                        boostedChoices: ['home']
                    }
                };
            case 'baccarat':
                return {
                    cards: {
                        player: ['♠A', '♥K'],
                        banker: ['♦Q', '♣J']
                    },
                    roundOdds: {
                        odds: { player: 1.95, banker: 1.95, tie: 8.0 },
                        boostedChoices: ['player']
                    }
                };
            case 'fish-prawn-crab':
                return {
                    dice: [1, 2, 3], // Fish, Prawn, Crab
                    roundOdds: {
                        odds: { fish: 1.5, prawn: 1.5, crab: 1.5, rooster: 2.0, gourd: 2.0, stag: 2.0 },
                        boostedChoices: ['fish']
                    }
                };
            default:
                return {};
        }
    }

    // -------------------------------------------------------------------------
    // OVERRIDE CONNECTION METHODS FOR SIMULATOR
    // -------------------------------------------------------------------------

    /**
     * Override connection methods to use simulator instead of real connections
     */
    @render(gc.GatewayConnection.GatewayConnectionStore, (store) => store.isConnected)
    override handleConnectLiveGatewayForGame(isConnected: boolean): void {
        if (this.isSimulatorMode) {
            // In simulator mode, always show as connected
            this.setState({ isConnected: true } as Pick<S, keyof S>);
            console.log('🎮 [SIMULATOR] Simulated connection established');
        } else {
            // Use original behavior for real connections
            super.handleConnectLiveGatewayForGame(isConnected);
        }
    }

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler, (handler) => handler.handleGateway())
    override connectLiveGateway(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating gateway connection...');
            // Simulate connection delay
            setTimeout(() => {
                this.setState({ isConnected: true } as Pick<S, keyof S>);
                console.log('🎮 [SIMULATOR] Gateway connection simulated successfully');
            }, 500);
        } else {
            super.connectLiveGateway();
        }
    }

    @render(gc.Connection.ConnectionStore, (store) => store.isConnected)
    override handleJoinGame(isConnected: boolean): void {
        if (this.isSimulatorMode) {
            // In simulator mode, always show as connected
            this.setState({ isConnected: true } as Pick<S, keyof S>);
            console.log('🎮 [SIMULATOR] Simulated game join');
        } else {
            super.handleJoinGame(isConnected);
        }
    }

    @handle(gc.Connection.ConnectionHandlers.JoinGameHandler)
    override joinGame(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating game join...');
            // Simulate join delay
            setTimeout(() => {
                this.setState({
                    isConnected: true,
                    initialized: true,
                    roundId: this.simulatorService.getState().currentRoundId
                } as any);
                console.log('🎮 [SIMULATOR] Game join simulated successfully');
            }, 300);
        } else {
            super.joinGame();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.SignInHandler)
    override signIn(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating sign in...');
            // Simulate sign in delay
            setTimeout(() => {
                this.setState({
                    isSignedIn: true,
                    isAuthorized: true
                } as Pick<S, keyof S>);
                console.log('🎮 [SIMULATOR] Sign in simulated successfully');
            }, 200);
        } else {
            super.signIn();
        }
    }

    @handle(gc.Connection.ConnectionHandlers.InGameHandler, (handler) => handler.handleGateway())
    override inGameLiveGateway(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating in-game gateway...');
            // Simulate in-game state
            setTimeout(() => {
                this.setState({
                    isConnected: true,
                    isSignedIn: true,
                    isAuthorized: true,
                    initialized: true
                } as Pick<S, keyof S>);
                console.log('🎮 [SIMULATOR] In-game gateway simulated successfully');
            }, 100);
        } else {
            super.inGameLiveGateway();
        }
    }

    // -------------------------------------------------------------------------
    // OVERRIDE AUTHORIZATION METHODS FOR SIMULATOR
    // -------------------------------------------------------------------------

    @render(gc.Auth.AuthStore, (store) => store.isAuthorized)
    override handleAuthorized(isAuthorized: boolean): void {
        if (this.isSimulatorMode) {
            // In simulator mode, always show as authorized
            this.setState({ isAuthorized: true } as Pick<S, keyof S>);
            console.log('🎮 [SIMULATOR] Authorization simulated');
        } else {
            super.handleAuthorized(isAuthorized);
        }
    }

    @handle(gc.Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    override autoCreateNickname(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating auto nickname creation...');
            // Simulate nickname creation
            setTimeout(() => {
                console.log('🎮 [SIMULATOR] Nickname "SimulatorUser" created');
            }, 150);
        } else {
            super.autoCreateNickname();
        }
    }

    // -------------------------------------------------------------------------
    // OVERRIDE ROUND HANDLERS FOR SIMULATOR
    // -------------------------------------------------------------------------

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    override renderCountDownTimerState(roundState: string): void {
        if (this.isSimulatorMode) {
            // Get round state from simulator service
            const simulationState = this.simulatorService.getState();
            const simulatorRoundState = simulationState.roundState;

            this.setState({ roundState: simulatorRoundState } as Pick<S, keyof S>);

            if (simulatorRoundState === ROUND_STATE.PLACING_BET) {
                this.setState({ isShowNextRoundMessage: false } as Pick<S, keyof S>);
            }

            if (simulatorRoundState === ROUND_STATE.LOCKING_BET || simulatorRoundState === ROUND_STATE.SHOW_RESULT) {
                this.resetBettingPanel();
            }

            console.log(`🎮 [SIMULATOR] Round state updated: ${simulatorRoundState}`);
        } else {
            super.renderCountDownTimerState(roundState);
        }
    }

    @render(gc.Rounds.RoundStore, (store) => store.clientRoundId)
    override handleRoundIdChange(roundId: number): void {
        if (this.isSimulatorMode) {
            const simulationState = this.simulatorService.getState();
            const simulatorRoundId = simulationState.currentRoundId;

            if (this.state.roundState !== ROUND_STATE.NONE) {
                this.setState({ roundId: simulatorRoundId } as any);
            }

            console.log(`🎮 [SIMULATOR] Round ID updated: ${simulatorRoundId}`);
        } else {
            super.handleRoundIdChange(roundId);
        }
    }

    // -------------------------------------------------------------------------
    // OVERRIDE BETTING METHODS FOR SIMULATOR
    // -------------------------------------------------------------------------

    @render(gc.Bet.BetStore, (store) => store.validBet)
    override setIsValidBet(validBet: gc.Bet.IValidBet): void {
        if (this.isSimulatorMode) {
            if (validBet?.value) {
                console.log('🎮 [SIMULATOR] Simulating balance sync...');
                // Simulate balance sync
                setTimeout(() => {
                    console.log('🎮 [SIMULATOR] Balance sync simulated');
                }, 100);
            }
        } else {
            super.setIsValidBet(validBet);
        }
    }

    // -------------------------------------------------------------------------
    // OVERRIDE SETTLEMENT METHODS FOR SIMULATOR
    // -------------------------------------------------------------------------

    @render(Settlements.SettlementStatusStore, (store) => store.settlementStatus, {
        fireImmediately: false,
    })
    override assignStatus(settlementStatus: any): void {
        if (this.isSimulatorMode) {
            // Get settlement status from simulator data
            const fakeData = this.simulatorService.getFakeData();
            const simulatorStatus = {
                win: 185,
                bet: 100,
                symbol: 'home'
            };

            this.setState({ statusSettlement: simulatorStatus } as unknown as Pick<S, keyof S>);
            console.log('🎮 [SIMULATOR] Settlement status simulated:', simulatorStatus);
        } else {
            super.assignStatus(settlementStatus);
        }
    }

    @render(Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    override async renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish): Promise<void> {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating current finish...');

            const fakeData = this.simulatorService.getFakeData();
            const simulationState = this.simulatorService.getState();

            if (simulationState.roundState === ROUND_STATE.SHOW_RESULT) {
                this.setState({ isFinishShowResult: false } as Pick<S, keyof S>);

                await FunctionUtils.delay(this.state.settlementResultDuration * 1000);

                // Simulate result display
                const simulatedResult = {
                    result: fakeData.currentResult,
                    settlementResult: fakeData.settlementResult
                };

                this.showResult(true, simulatedResult.result, simulatedResult.settlementResult as any).then(() => {
                    this.finishShowResult();
                });

                console.log('🎮 [SIMULATOR] Current finish simulated successfully');
            }
        } else {
            super.renderCurrentFinish(currentFinish);
        }
    }

    @handle(Settlements.SettlementUIHandlers.FinishedShowResult)
    override finishShowResult(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating finish show result...');
            this.setState({ isFinishShowResult: true } as Pick<S, keyof S>);
        } else {
            super.finishShowResult();
        }
    }

    // -------------------------------------------------------------------------
    // OVERRIDE ABSTRACT METHODS FOR SIMULATOR
    // -------------------------------------------------------------------------

    override closeConnect(): void {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating connection close...');
            this.simulatorService.stop();
            this.setState({
                isConnected: false,
                isSignedIn: false,
                isAuthorized: false
            } as Pick<S, keyof S>);
        } else {
            super.closeConnect();
        }
    }

    override showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ): Promise<void> {
        if (this.isSimulatorMode) {
            console.log('🎮 [SIMULATOR] Simulating result display...', { hasAnimation, result, settlementResult });
            return Promise.resolve();
        } else {
            return super.showResult(hasAnimation, result, settlementResult);
        }
    }

    // -------------------------------------------------------------------------
    // SIMULATOR-SPECIFIC METHODS
    // -------------------------------------------------------------------------

    /**
     * Get current simulator data
     */
    public getSimulatorData(): any {
        if (this.isSimulatorMode) {
            return this.simulatorService.getFakeData();
        }
        return null;
    }

    /**
     * Get current simulator state
     */
    public getSimulatorState(): any {
        if (this.isSimulatorMode) {
            return this.simulatorService.getState();
        }
        return null;
    }

    /**
     * Toggle error simulation
     */
    public toggleErrorSimulation(): void {
        if (this.isSimulatorMode) {
            this.simulatorService.toggleErrorSimulation();
        }
    }

    /**
     * Reset simulator failure count
     */
    public resetSimulatorFailures(): void {
        if (this.isSimulatorMode) {
            this.simulatorService.resetFailureCount();
        }
    }

    /**
     * Check if simulator mode is active
     */
    public isSimulatorModeActive(): boolean {
        return this.isSimulatorMode;
    }

    // -------------------------------------------------------------------------
    // LIFECYCLE METHODS
    // -------------------------------------------------------------------------

    componentWillUnmount(): void {
        if (this.isSimulatorMode) {
            this.simulatorService.stop();
            console.log('🎮 [SIMULATOR] Simulator stopped');
        }
        super.componentWillUnmount();
    }
}

export default GatewayGameSimulator; 