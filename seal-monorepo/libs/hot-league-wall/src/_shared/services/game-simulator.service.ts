import { makeAutoObservable } from 'mobx';
import * as gc from '@sg/sg-game-client';

// Constants for round states
const ROUND_STATE = {
    PLACING_BET: 'placing_bet',
    LOCKING_BET: 'locking_bet',
    COUNTDOWN: 'countdown',
    RUNNING: 'running',
    SETTLEMENT: 'settlement',
    FINISHED: 'finished'
} as const;

type RoundStateType = typeof ROUND_STATE[keyof typeof ROUND_STATE];

// Constants for game types
const GAME_TYPE = {
    RNG_SOCCER: 'rng-soccer',
    RNG_BASKETBALL: 'rng-basketball',
    RNG_TENNIS: 'rng-tennis'
} as const;

// Create a mock RoundTimeStore for simulator mode
class MockRoundTimeStore {
    countdownTimer = 0;
    roundState = 'none';
    roundTime = 0;
    remaining = 0;
    isLocking = false;

    constructor() {
        makeAutoObservable(this);
        // Make it globally accessible
        (window as any).__ROUND_TIME_STORE__ = this;
        console.log('🎮 [GAME_SIMULATOR] Mock RoundTimeStore created and made globally accessible');
    }

    setCountdownTimer(value: number) {
        this.countdownTimer = value;
    }

    setRoundState(value: string) {
        this.roundState = value;
    }

    setRoundTime(value: number) {
        this.roundTime = value;
    }

    setRemaining(value: number) {
        this.remaining = value;
    }

    setIsLocking(value: boolean) {
        this.isLocking = value;
    }

    // Add methods that components expect
    calculateRoundStatus() {
        // Simulate the real store's calculateRoundStatus method
        console.log('🎮 [GAME_SIMULATOR] Mock calculateRoundStatus called');
    }
}

// Global mock store instance
export const mockRoundTimeStore = new MockRoundTimeStore();

/**
 * Game Simulator Service
 * Provides fake data and real-time updates for development and testing
 */
export class GameSimulatorService {
    // Simulator state
    private isInitialized = false;
    private isRunning = false;
    private intervalId: NodeJS.Timeout | null = null;

    // Game state
    private countdownTimer = 30;
    private roundState: RoundStateType = ROUND_STATE.PLACING_BET;
    private currentRoundId = '';
    private isConnected = true;
    private isSignedIn = true;
    private isAuthorized = true;

    // Simulator config
    private isSimulationMode: boolean = false;
    private simulationInterval: NodeJS.Timeout | null = null;
    private errorSimulation: boolean = false;
    private gameConfig: any = null;
    private maxFailures: number = 3;
    private gameContainer: any = null;

    // Fake data
    private fakeData = {
        teamData: {
            home: { name: 'Home Team', score: 0, odds: 1.85 },
            away: { name: 'Away Team', score: 0, odds: 2.10 },
            draw: { name: 'Draw', odds: 3.25 }
        },
        totalBets: {
            home: 1250.50,
            away: 890.25,
            draw: 320.75
        },
        ownBets: {
            home: 50.00,
            away: 0,
            draw: 0,
            totalStake: 50.00
        },
        roundHistory: [
            { roundId: 'RND001', result: 'home', homeScore: 2, awayScore: 1 },
            { roundId: 'RND002', result: 'away', homeScore: 0, awayScore: 1 },
            { roundId: 'RND003', result: 'draw', homeScore: 1, awayScore: 1 }
        ],
        gameSettings: {
            durations: {
                placingBet: 30,
                lockingBet: 10,
                showingResult: 15,
                wholeRound: 60,
                generatingResult: 5,
                startRound: 1,
                wholeShoe: 120
            }
        }
    };

    constructor() {
        makeAutoObservable(this);
        console.log('🎮 [GAME_SIMULATOR] Service created');
    }

    /**
     * Initialize the simulator
     */
    public initialize(config: {
        gameType?: string;
        enableErrorSimulation?: boolean;
        gameContainer?: any;
    }): void {
        if (this.isInitialized) {
            console.log('🎮 [GAME_SIMULATOR] Already initialized');
            return;
        }

        try {
            console.log('🎮 [GAME_SIMULATOR] Initializing...');

            this.isSimulationMode = true;
            this.errorSimulation = config.enableErrorSimulation || false;
            this.gameConfig = config;
            this.gameContainer = config.gameContainer;

            // Generate initial round ID
            this.currentRoundId = this.generateRoundId();

            // Initialize fake data based on game type
            this.initializeFakeData();

            // Initialize game stores
            this.initializeGameStores();

            this.isInitialized = true;
            console.log('🎮 [GAME_SIMULATOR] Initialized successfully');

        } catch (error) {
            console.error('🎮 [GAME_SIMULATOR] Error initializing:', error);
        }
    }

    /**
     * Generate a unique round ID
     */
    private generateRoundId(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `RND${timestamp}${random}`;
    }

    /**
     * Initialize fake data based on game type
     */
    private initializeFakeData(): void {
        const gameType = this.gameConfig?.gameType || 'rng-soccer';

        // Update team data based on game type
        switch (gameType.toLowerCase()) {
            case 'rng-soccer':
                this.fakeData.teamData = {
                    home: { name: 'Manchester United', score: 0, odds: 1.85 },
                    away: { name: 'Liverpool', score: 0, odds: 2.10 },
                    draw: { name: 'Draw', odds: 3.25 }
                };
                break;
            case 'rng-basketball':
                this.fakeData.teamData = {
                    home: { name: 'Lakers', score: 0, odds: 1.95 },
                    away: { name: 'Warriors', score: 0, odds: 1.85 },
                    draw: { name: 'Draw', odds: 15.00 }
                };
                break;
            case 'rng-tennis':
                this.fakeData.teamData = {
                    home: { name: 'Federer', score: 0, odds: 1.75 },
                    away: { name: 'Nadal', score: 0, odds: 2.15 },
                    draw: { name: 'Draw', odds: 25.00 }
                };
                break;
        }

        console.log('🎮 [GAME_SIMULATOR] Fake data initialized for game type:', gameType);
    }

    /**
     * Initialize game stores (simplified version)
     */
    private initializeGameStores(): void {
        try {
            console.log('🎮 [GAME_SIMULATOR] Initializing game stores...');

            // For now, we'll just log that stores would be initialized
            // In a real implementation, this would create and configure the actual stores
            console.log('🎮 [GAME_SIMULATOR] Game stores initialization completed');

        } catch (error) {
            console.error('🎮 [GAME_SIMULATOR] Error initializing game stores:', error);
        }
    }

    /**
     * Start the simulation
     */
    public start(): void {
        if (!this.isInitialized) {
            console.warn('🎮 [GAME_SIMULATOR] Cannot start - not initialized');
            return;
        }

        if (this.isRunning) {
            console.warn('🎮 [GAME_SIMULATOR] Already running');
            return;
        }

        console.log('🎮 [GAME_SIMULATOR] Starting simulation...');
        this.isRunning = true;

        // Start the simulation loop
        this.startSimulationLoop();

        console.log('🎮 [GAME_SIMULATOR] Simulation started');
    }

    /**
     * Stop the simulation
     */
    public stop(): void {
        if (!this.isRunning) {
            console.warn('🎮 [GAME_SIMULATOR] Not running');
            return;
        }

        console.log('🎮 [GAME_SIMULATOR] Stopping simulation...');
        this.isRunning = false;

        // Clear intervals
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }

        console.log('🎮 [GAME_SIMULATOR] Simulation stopped');
    }

    /**
     * Start the simulation loop
     */
    private startSimulationLoop(): void {
        // Update every 100ms for smoother real-time updates
        this.intervalId = setInterval(() => {
            if (!this.isRunning) return;

            this.updateGameState();
        }, 100);
    }

    /**
     * Update the game state
     */
    private updateGameState(): void {
        try {
            // Update countdown timer
            if (this.countdownTimer > 0) {
                this.countdownTimer--;
            } else {
                this.transitionToNextState();
            }

            // Update stores with current state
            this.updateStores();

        } catch (error) {
            console.error('🎮 [GAME_SIMULATOR] Error updating game state:', error);
        }
    }

    /**
     * Transition to the next round state
     */
    private transitionToNextState(): void {
        switch (this.roundState) {
            case ROUND_STATE.PLACING_BET:
                this.roundState = ROUND_STATE.LOCKING_BET;
                this.countdownTimer = this.fakeData.gameSettings.durations.lockingBet;
                console.log('🎮 [GAME_SIMULATOR] Transitioned to LOCKING_BET');
                break;

            case ROUND_STATE.LOCKING_BET:
                this.roundState = ROUND_STATE.COUNTDOWN;
                this.countdownTimer = this.fakeData.gameSettings.durations.startRound;
                console.log('🎮 [GAME_SIMULATOR] Transitioned to COUNTDOWN');
                break;

            case ROUND_STATE.COUNTDOWN:
                this.roundState = ROUND_STATE.RUNNING;
                this.countdownTimer = this.fakeData.gameSettings.durations.generatingResult;
                console.log('🎮 [GAME_SIMULATOR] Transitioned to RUNNING');
                break;

            case ROUND_STATE.RUNNING:
                this.roundState = ROUND_STATE.SETTLEMENT;
                this.countdownTimer = this.fakeData.gameSettings.durations.showingResult;
                this.generateRoundResult();
                console.log('🎮 [GAME_SIMULATOR] Transitioned to SETTLEMENT');
                break;

            case ROUND_STATE.SETTLEMENT:
                this.roundState = ROUND_STATE.FINISHED;
                this.countdownTimer = 5;
                console.log('🎮 [GAME_SIMULATOR] Transitioned to FINISHED');
                break;

            case ROUND_STATE.FINISHED:
                this.startNewRound();
                break;
        }
    }

    /**
     * Generate a random round result
     */
    private generateRoundResult(): void {
        const results = ['home', 'away', 'draw'];
        const randomResult = results[Math.floor(Math.random() * results.length)];

        // Update team scores based on result
        if (randomResult === 'home') {
            this.fakeData.teamData.home.score++;
        } else if (randomResult === 'away') {
            this.fakeData.teamData.away.score++;
        }

        // Add to round history
        this.fakeData.roundHistory.unshift({
            roundId: this.currentRoundId,
            result: randomResult,
            homeScore: this.fakeData.teamData.home.score,
            awayScore: this.fakeData.teamData.away.score
        });

        // Keep only last 10 rounds
        if (this.fakeData.roundHistory.length > 10) {
            this.fakeData.roundHistory = this.fakeData.roundHistory.slice(0, 10);
        }

        console.log('🎮 [GAME_SIMULATOR] Round result generated:', randomResult);
    }

    /**
     * Start a new round
     */
    private startNewRound(): void {
        this.currentRoundId = this.generateRoundId();
        this.countdownTimer = this.fakeData.gameSettings.durations.placingBet;
        this.roundState = ROUND_STATE.PLACING_BET;

        // Reset team scores
        this.fakeData.teamData.home.score = 0;
        this.fakeData.teamData.away.score = 0;

        console.log('🎮 [GAME_SIMULATOR] New round started:', this.currentRoundId);
    }

    /**
     * Update stores with current state
     */
    private updateStores(): void {
        try {
            // Update RoundTimeStore for countdown timer through the container
            if (this.gameContainer) {
                try {
                    const roundTimeStore = this.gameContainer.get(gc.Rounds.RoundTimeStore);
                    if (roundTimeStore) {
                        // Update the observable properties directly
                        roundTimeStore.countdownTimer = this.countdownTimer;
                        roundTimeStore.roundState = this.mapRoundState(this.roundState);
                        roundTimeStore.roundTime = this.countdownTimer; // This triggers calculateRoundStatus
                    }
                } catch (error) {
                    console.warn('🎮 [GAME_SIMULATOR] Could not access RoundTimeStore:', error);
                }
            } else {
                // If no container, update the mock store for simulator mode
                mockRoundTimeStore.setCountdownTimer(this.countdownTimer);
                mockRoundTimeStore.setRoundState(this.mapRoundState(this.roundState));
                mockRoundTimeStore.setRoundTime(this.countdownTimer);
                mockRoundTimeStore.setRemaining(this.countdownTimer);
                mockRoundTimeStore.setIsLocking(this.roundState === ROUND_STATE.LOCKING_BET);
                console.log('🎮 [GAME_SIMULATOR] Updated mock RoundTimeStore:', {
                    countdownTimer: this.countdownTimer,
                    roundState: this.mapRoundState(this.roundState),
                    isLocking: this.roundState === ROUND_STATE.LOCKING_BET
                });
            }

            // Try to update the real RoundTimeStore globally if available
            try {
                // Access the global RoundTimeStore instance if it exists
                const globalRoundTimeStore = (window as any).__ROUND_TIME_STORE__;
                if (globalRoundTimeStore) {
                    globalRoundTimeStore.countdownTimer = this.countdownTimer;
                    globalRoundTimeStore.roundState = this.mapRoundState(this.roundState);
                    globalRoundTimeStore.roundTime = this.countdownTimer;
                    globalRoundTimeStore.remaining = this.countdownTimer;
                }
            } catch (error) {
                console.warn('🎮 [GAME_SIMULATOR] Could not update global RoundTimeStore:', error);
            }

            // Update other stores as needed
            console.log('🎮 [GAME_SIMULATOR] Updated stores:', {
                roundId: this.currentRoundId,
                roundState: this.roundState,
                countdownTimer: this.countdownTimer,
                isConnected: this.isConnected,
                isSignedIn: this.isSignedIn,
                isAuthorized: this.isAuthorized
            });

        } catch (error) {
            console.error('🎮 [GAME_SIMULATOR] Error updating stores:', error);
        }
    }

    /**
     * Map simulator round states to game client round states
     */
    private mapRoundState(simulatorState: RoundStateType): string {
        switch (simulatorState) {
            case ROUND_STATE.PLACING_BET:
                return gc.Rounds.ROUND_STATE.PLACING_BET;
            case ROUND_STATE.LOCKING_BET:
                return gc.Rounds.ROUND_STATE.LOCKING_BET;
            case ROUND_STATE.COUNTDOWN:
                return gc.Rounds.ROUND_STATE.STARTING_ROUND;
            case ROUND_STATE.RUNNING:
                return gc.Rounds.ROUND_STATE.SHOW_ANIMATION_RESULT;
            case ROUND_STATE.SETTLEMENT:
                return gc.Rounds.ROUND_STATE.SHOW_RESULT;
            case ROUND_STATE.FINISHED:
                return gc.Rounds.ROUND_STATE.STOP_GAME_LOOP;
            default:
                return gc.Rounds.ROUND_STATE.PLACING_BET;
        }
    }

    /**
     * Get current simulator state
     */
    public getState(): any {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            isSimulationMode: this.isSimulationMode,
            currentRoundId: this.currentRoundId,
            roundState: this.roundState,
            countdownTimer: this.countdownTimer,
            isConnected: this.isConnected,
            isSignedIn: this.isSignedIn,
            isAuthorized: this.isAuthorized,
            fakeData: this.fakeData
        };
    }

    /**
     * Get fake data
     */
    public getFakeData(): any {
        return this.fakeData;
    }

    /**
     * Check if simulator is running
     */
    public isSimulatorRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Check if simulator is initialized
     */
    public isSimulatorInitialized(): boolean {
        return this.isInitialized;
    }
}

// Export singleton instance
export const gameSimulatorService = new GameSimulatorService();

// Export default for compatibility
export default GameSimulatorService; 