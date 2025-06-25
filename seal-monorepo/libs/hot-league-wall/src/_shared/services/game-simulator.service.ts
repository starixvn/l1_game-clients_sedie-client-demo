import * as gc from '@sg/sg-game-client';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds/round-time-store';

/**
 * Game Simulator Service
 * 
 * This service provides a complete simulation environment for game prototyping
 * without requiring real service connections or internet access.
 * 
 * Features:
 * - Simulates all game client stores and handlers
 * - Provides realistic fake data for all game states
 * - Supports multiple game types (RNG Soccer, Baccarat, etc.)
 * - Real-time data updates with configurable intervals
 * - Error simulation for testing edge cases
 */
export class GameSimulatorService {
    private static instance: GameSimulatorService;
    private isSimulationMode: boolean = false;
    private simulationInterval: NodeJS.Timeout | null = null;
    private currentRoundId: number = 12345;
    private roundState: string = ROUND_STATE.PLACING_BET;
    private countdownTimer: number = 30;
    private isConnected: boolean = true;
    private isAuthorized: boolean = true;
    private isSignedIn: boolean = true;
    private gameConfig: any = null;
    private fakeData: any = {};
    private errorSimulation: boolean = false;
    private failureCount: number = 0;
    private maxFailures: number = 3;

    // Singleton pattern
    public static getInstance(): GameSimulatorService {
        if (!GameSimulatorService.instance) {
            GameSimulatorService.instance = new GameSimulatorService();
        }
        return GameSimulatorService.instance;
    }

    /**
     * Initialize the simulator with configuration
     */
    public initialize(config: {
        gameType: string;
        enableErrorSimulation?: boolean;
        updateInterval?: number;
        customData?: any;
    }): void {
        console.log('🎮 [GAME_SIMULATOR] Initializing simulator with config:', config);

        this.isSimulationMode = true;
        this.errorSimulation = config.enableErrorSimulation || false;
        this.gameConfig = config;

        // Initialize fake data based on game type
        this.initializeFakeData(config.gameType, config.customData);

        // Start simulation loop
        this.startSimulationLoop(config.updateInterval || 1000);

        // Initialize game client stores with fake data
        this.initializeGameStores();

        console.log('🎮 [GAME_SIMULATOR] Simulator initialized successfully');
    }

    /**
     * Start the simulation loop
     */
    private startSimulationLoop(interval: number): void {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }

        this.simulationInterval = setInterval(() => {
            this.updateSimulation();
        }, interval);

        console.log(`🎮 [GAME_SIMULATOR] Simulation loop started with ${interval}ms interval`);
    }

    /**
     * Update simulation state
     */
    private updateSimulation(): void {
        if (!this.isSimulationMode) return;

        // Update countdown timer
        this.countdownTimer = Math.max(0, this.countdownTimer - 1);

        // Update round state based on countdown
        this.updateRoundState();

        // Update fake data
        this.updateFakeData();

        // Simulate errors if enabled
        if (this.errorSimulation) {
            this.simulateErrors();
        }

        // Emit store updates
        this.emitStoreUpdates();
    }

    /**
     * Update round state based on countdown timer
     */
    private updateRoundState(): void {
        const placingBetDuration = this.fakeData.gameSettings?.durations?.placingBet || 30;
        const lockingBetDuration = this.fakeData.gameSettings?.durations?.lockingBet || 10;
        const showingResultDuration = this.fakeData.gameSettings?.durations?.showingResult || 15;

        if (this.countdownTimer > placingBetDuration) {
            this.roundState = ROUND_STATE.PLACING_BET;
        } else if (this.countdownTimer > placingBetDuration - lockingBetDuration) {
            this.roundState = ROUND_STATE.LOCKING_BET;
        } else if (this.countdownTimer > 0) {
            this.roundState = ROUND_STATE.SHOW_RESULT;
        } else {
            this.roundState = ROUND_STATE.NONE;
            this.startNewRound();
        }
    }

    /**
     * Start a new round
     */
    private startNewRound(): void {
        this.currentRoundId++;
        this.countdownTimer = this.fakeData.gameSettings?.durations?.placingBet || 30;
        this.roundState = ROUND_STATE.PLACING_BET;

        // Generate new fake data for the round
        this.generateNewRoundData();

        console.log(`🎮 [GAME_SIMULATOR] New round started: ${this.currentRoundId}`);
    }

    /**
     * Initialize fake data based on game type
     */
    private initializeFakeData(gameType: string, customData?: any): void {
        switch (gameType.toLowerCase()) {
            case 'rng-soccer':
                this.fakeData = this.getRNGSoccerFakeData();
                break;
            case 'baccarat':
                this.fakeData = this.getBaccaratFakeData();
                break;
            case 'fish-prawn-crab':
                this.fakeData = this.getFishPrawnCrabFakeData();
                break;
            default:
                this.fakeData = this.getDefaultFakeData();
        }

        // Merge custom data if provided
        if (customData) {
            this.fakeData = { ...this.fakeData, ...customData };
        }

        console.log(`🎮 [GAME_SIMULATOR] Fake data initialized for ${gameType}`);
    }

    /**
     * Get RNG Soccer fake data
     */
    private getRNGSoccerFakeData(): any {
        return {
            gameSettings: {
                id: 'rng-soccer',
                name: 'RNGSoccer',
                durations: {
                    placingBet: 30,
                    lockingBet: 10,
                    showingResult: 15,
                    finished: 5
                }
            },
            currentRound: {
                roundId: this.currentRoundId,
                roundState: this.roundState,
                countdownTimer: this.countdownTimer,
                isAllowedBet: true,
                isLocking: false
            },
            teamData: {
                home: { name: 'Arsenal', rank: 1, suit: 2, score: 2 },
                away: { name: 'Liverpool', rank: 3, suit: 1, score: 1 }
            },
            roundOdds: {
                odds: { home: 1.85, draw: 3.20, away: 2.10 },
                boostedChoices: ['home']
            },
            ownBets: {
                bets: [{ symbol: 'home', amount: 100 }],
                totalStake: 100
            },
            totalBets: {
                home: 5000,
                draw: 2000,
                away: 3000
            },
            settlementResult: {
                home: true,
                away: false,
                draw: false
            },
            roundHistory: this.generateRoundHistory(10)
        };
    }

    /**
     * Get Baccarat fake data
     */
    private getBaccaratFakeData(): any {
        return {
            gameSettings: {
                id: 'baccarat',
                name: 'Baccarat',
                durations: {
                    placingBet: 25,
                    lockingBet: 8,
                    showingResult: 12,
                    finished: 3
                }
            },
            currentRound: {
                roundId: this.currentRoundId,
                roundState: this.roundState,
                countdownTimer: this.countdownTimer,
                isAllowedBet: true,
                isLocking: false
            },
            cards: {
                player: ['♠A', '♥K'],
                banker: ['♦Q', '♣J']
            },
            roundOdds: {
                odds: { player: 1.95, banker: 1.95, tie: 8.0 },
                boostedChoices: ['player']
            },
            ownBets: {
                bets: [{ symbol: 'player', amount: 50 }],
                totalStake: 50
            },
            totalBets: {
                player: 3000,
                banker: 2500,
                tie: 500
            },
            settlementResult: {
                player: true,
                banker: false,
                tie: false
            },
            roundHistory: this.generateBaccaratHistory(10)
        };
    }

    /**
     * Get Fish Prawn Crab fake data
     */
    private getFishPrawnCrabFakeData(): any {
        return {
            gameSettings: {
                id: 'fish-prawn-crab',
                name: 'FishPrawnCrab',
                durations: {
                    placingBet: 20,
                    lockingBet: 5,
                    showingResult: 10,
                    finished: 3
                }
            },
            currentRound: {
                roundId: this.currentRoundId,
                roundState: this.roundState,
                countdownTimer: this.countdownTimer,
                isAllowedBet: true,
                isLocking: false
            },
            dice: [1, 2, 3], // Fish, Prawn, Crab
            roundOdds: {
                odds: { fish: 1.5, prawn: 1.5, crab: 1.5, rooster: 2.0, gourd: 2.0, stag: 2.0 },
                boostedChoices: ['fish']
            },
            ownBets: {
                bets: [{ symbol: 'fish', amount: 25 }],
                totalStake: 25
            },
            totalBets: {
                fish: 2000,
                prawn: 1800,
                crab: 1900,
                rooster: 800,
                gourd: 750,
                stag: 850
            },
            settlementResult: {
                fish: true,
                prawn: false,
                crab: false,
                rooster: false,
                gourd: false,
                stag: false
            },
            roundHistory: this.generateFishPrawnCrabHistory(10)
        };
    }

    /**
     * Get default fake data
     */
    private getDefaultFakeData(): any {
        return {
            gameSettings: {
                id: 'default-game',
                name: 'DefaultGame',
                durations: {
                    placingBet: 30,
                    lockingBet: 10,
                    showingResult: 15,
                    finished: 5
                }
            },
            currentRound: {
                roundId: this.currentRoundId,
                roundState: this.roundState,
                countdownTimer: this.countdownTimer,
                isAllowedBet: true,
                isLocking: false
            },
            roundOdds: {
                odds: { option1: 1.5, option2: 2.0, option3: 3.0 },
                boostedChoices: ['option1']
            },
            ownBets: {
                bets: [{ symbol: 'option1', amount: 100 }],
                totalStake: 100
            },
            totalBets: {
                option1: 5000,
                option2: 3000,
                option3: 2000
            },
            settlementResult: {
                option1: true,
                option2: false,
                option3: false
            },
            roundHistory: this.generateDefaultHistory(10)
        };
    }

    /**
     * Generate round history
     */
    private generateRoundHistory(count: number): any[] {
        const history: any[] = [];
        for (let i = 0; i < count; i++) {
            history.push({
                roundId: this.currentRoundId - i - 1,
                settlementResult: {
                    home: Math.random() > 0.5,
                    away: Math.random() > 0.5,
                    draw: Math.random() > 0.7
                },
                result: {
                    homeScore: Math.floor(Math.random() * 4),
                    awayScore: Math.floor(Math.random() * 4)
                }
            });
        }
        return history;
    }

    /**
     * Generate Baccarat history
     */
    private generateBaccaratHistory(count: number): any[] {
        const history: any[] = [];
        for (let i = 0; i < count; i++) {
            history.push({
                roundId: this.currentRoundId - i - 1,
                settlementResult: {
                    player: Math.random() > 0.5,
                    banker: Math.random() > 0.5,
                    tie: Math.random() > 0.8
                },
                result: {
                    playerScore: Math.floor(Math.random() * 10),
                    bankerScore: Math.floor(Math.random() * 10)
                }
            });
        }
        return history;
    }

    /**
     * Generate Fish Prawn Crab history
     */
    private generateFishPrawnCrabHistory(count: number): any[] {
        const history: any[] = [];
        for (let i = 0; i < count; i++) {
            history.push({
                roundId: this.currentRoundId - i - 1,
                settlementResult: {
                    fish: Math.random() > 0.8,
                    prawn: Math.random() > 0.8,
                    crab: Math.random() > 0.8,
                    rooster: Math.random() > 0.9,
                    gourd: Math.random() > 0.9,
                    stag: Math.random() > 0.9
                },
                result: {
                    dice: [
                        Math.floor(Math.random() * 6) + 1,
                        Math.floor(Math.random() * 6) + 1,
                        Math.floor(Math.random() * 6) + 1
                    ]
                }
            });
        }
        return history;
    }

    /**
     * Generate default history
     */
    private generateDefaultHistory(count: number): any[] {
        const history: any[] = [];
        for (let i = 0; i < count; i++) {
            history.push({
                roundId: this.currentRoundId - i - 1,
                settlementResult: {
                    option1: Math.random() > 0.5,
                    option2: Math.random() > 0.5,
                    option3: Math.random() > 0.5
                },
                result: {
                    winner: Math.floor(Math.random() * 3) + 1
                }
            });
        }
        return history;
    }

    /**
     * Update fake data with new values
     */
    private updateFakeData(): void {
        // Update current round data
        this.fakeData.currentRound = {
            ...this.fakeData.currentRound,
            roundId: this.currentRoundId,
            roundState: this.roundState,
            countdownTimer: this.countdownTimer,
            isLocking: this.roundState === ROUND_STATE.LOCKING_BET
        };

        // Update odds with small variations
        if (this.fakeData.roundOdds?.odds) {
            Object.keys(this.fakeData.roundOdds.odds).forEach(key => {
                const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
                this.fakeData.roundOdds.odds[key] = Math.max(1.01,
                    this.fakeData.roundOdds.odds[key] * (1 + variation));
            });
        }

        // Update total bets with small increments
        if (this.fakeData.totalBets) {
            Object.keys(this.fakeData.totalBets).forEach(key => {
                const increment = Math.floor(Math.random() * 50);
                this.fakeData.totalBets[key] += increment;
            });
        }
    }

    /**
     * Generate new round data
     */
    private generateNewRoundData(): void {
        // Generate new settlement result
        if (this.fakeData.settlementResult) {
            Object.keys(this.fakeData.settlementResult).forEach(key => {
                this.fakeData.settlementResult[key] = Math.random() > 0.7;
            });
        }

        // Update round history
        if (this.fakeData.roundHistory) {
            const newHistoryEntry = this.createHistoryEntry();
            this.fakeData.roundHistory.unshift(newHistoryEntry);
            this.fakeData.roundHistory = this.fakeData.roundHistory.slice(0, 10); // Keep only last 10
        }
    }

    /**
     * Create a new history entry
     */
    private createHistoryEntry(): any {
        const gameType = this.gameConfig?.gameType?.toLowerCase();

        switch (gameType) {
            case 'rng-soccer':
                return {
                    roundId: this.currentRoundId - 1,
                    settlementResult: {
                        home: Math.random() > 0.5,
                        away: Math.random() > 0.5,
                        draw: Math.random() > 0.7
                    },
                    result: {
                        homeScore: Math.floor(Math.random() * 4),
                        awayScore: Math.floor(Math.random() * 4)
                    }
                };
            case 'baccarat':
                return {
                    roundId: this.currentRoundId - 1,
                    settlementResult: {
                        player: Math.random() > 0.5,
                        banker: Math.random() > 0.5,
                        tie: Math.random() > 0.8
                    },
                    result: {
                        playerScore: Math.floor(Math.random() * 10),
                        bankerScore: Math.floor(Math.random() * 10)
                    }
                };
            default:
                return {
                    roundId: this.currentRoundId - 1,
                    settlementResult: {
                        option1: Math.random() > 0.5,
                        option2: Math.random() > 0.5,
                        option3: Math.random() > 0.5
                    },
                    result: {
                        winner: Math.floor(Math.random() * 3) + 1
                    }
                };
        }
    }

    /**
     * Simulate errors for testing
     */
    private simulateErrors(): void {
        if (this.failureCount >= this.maxFailures) {
            this.failureCount = 0;
            return;
        }

        const errorChance = 0.1; // 10% chance of error
        if (Math.random() < errorChance) {
            this.failureCount++;
            this.simulateConnectionError();
        }
    }

    /**
     * Simulate connection error
     */
    private simulateConnectionError(): void {
        console.log(`🎮 [GAME_SIMULATOR] 💥 Simulating connection error #${this.failureCount}`);

        // Temporarily set connection to false
        this.isConnected = false;

        // Restore connection after 3 seconds
        setTimeout(() => {
            this.isConnected = true;
            console.log('🎮 [GAME_SIMULATOR] ✅ Connection restored');
        }, 3000);
    }

    /**
     * Initialize game client stores with fake data
     */
    private initializeGameStores(): void {
        // This would typically interact with the actual game client stores
        // For now, we'll just log the initialization
        console.log('🎮 [GAME_SIMULATOR] Game stores initialized with fake data');
    }

    /**
     * Emit store updates to trigger re-renders
     */
    private emitStoreUpdates(): void {
        // This would typically emit events to update the game client stores
        // For now, we'll just log the updates
        if (this.countdownTimer % 5 === 0) { // Log every 5 seconds
            console.log(`🎮 [GAME_SIMULATOR] Round ${this.currentRoundId} - ${this.roundState} - ${this.countdownTimer}s remaining`);
        }
    }

    /**
     * Get current fake data
     */
    public getFakeData(): any {
        return this.fakeData;
    }

    /**
     * Get current simulation state
     */
    public getSimulationState(): any {
        return {
            isSimulationMode: this.isSimulationMode,
            currentRoundId: this.currentRoundId,
            roundState: this.roundState,
            countdownTimer: this.countdownTimer,
            isConnected: this.isConnected,
            isAuthorized: this.isAuthorized,
            isSignedIn: this.isSignedIn
        };
    }

    /**
     * Toggle error simulation
     */
    public toggleErrorSimulation(): void {
        this.errorSimulation = !this.errorSimulation;
        console.log(`🎮 [GAME_SIMULATOR] Error simulation ${this.errorSimulation ? 'enabled' : 'disabled'}`);
    }

    /**
     * Reset failure count
     */
    public resetFailureCount(): void {
        this.failureCount = 0;
        console.log('🎮 [GAME_SIMULATOR] Failure count reset');
    }

    /**
     * Stop the simulator
     */
    public stop(): void {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        this.isSimulationMode = false;
        console.log('🎮 [GAME_SIMULATOR] Simulator stopped');
    }

    /**
     * Check if simulator is active
     */
    public isActive(): boolean {
        return this.isSimulationMode;
    }
}

export default GameSimulatorService; 