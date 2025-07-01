import { RNGSoccerChoices, RNGSoccerResult, RNGSoccerSettlementItemResult, RNGSoccerRoundHistory } from '../type';
import { TeamUtils } from '../settlement-result/utils/team-utils';

// Fake data for RNG Soccer game
export const FAKE_RNG_SOCCER_DATA = {
    // Game settings
    gameSettings: {
        id: 'rng-soccer',
        name: 'RNGSoccer',
        gameName: 'RNGSoccer',
        mainObserverNamespace: 'rng-soccer',
    },

    // Current round state
    currentRound: {
        roundId: 12345,
        roundState: 'placingBets',
        startTime: Date.now() - 15000,
        endTime: Date.now() + 15000,
        countdownTimer: 15,
        isAllowedBet: true,
        isLocking: false,
        isTimerActive: true,
    },

    // Team data - using TeamUtils for consistency
    teamData: {
        home: {
            name: TeamUtils.getTeamFullName('ARS'),
            rank: 1,
            suit: 2,
            score: 2,
        },
        away: {
            name: TeamUtils.getTeamFullName('LIV'),
            rank: 3,
            suit: 1,
            score: 1,
        },
    },

    // Current result
    currentResult: {
        homeScore: 2,
        awayScore: 1,
        home: { rank: 1, suit: 2 },
        away: { rank: 3, suit: 1 },
    },

    // Betting odds
    roundOdds: {
        odds: {
            [RNGSoccerChoices.home]: 1.85,
            [RNGSoccerChoices.draw]: 3.2,
            [RNGSoccerChoices.away]: 2.1,
        },
        boostedChoices: [RNGSoccerChoices.home],
    },

    // User bets
    ownBets: {
        bets: [{ symbol: RNGSoccerChoices.home, amount: 100 }],
        totalStake: 100,
    },

    // Total bets
    totalBets: {
        [RNGSoccerChoices.home]: 5000,
        [RNGSoccerChoices.draw]: 2000,
        [RNGSoccerChoices.away]: 3000,
    },

    // Bet percentages
    betPercentage: {
        [RNGSoccerChoices.home]: 50,
        [RNGSoccerChoices.draw]: 20,
        [RNGSoccerChoices.away]: 30,
    },

    // User bet percentage
    userBetPercentage: {
        [RNGSoccerChoices.home]: 2,
        [RNGSoccerChoices.draw]: 0,
        [RNGSoccerChoices.away]: 0,
    },

    // Settlement result
    settlementResult: {
        home: true,
        away: false,
        draw: false,
    },

    // Round history (last 10 rounds) - using TeamUtils for team names
    roundHistory: [
        {
            roundId: 12344,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 2, awayScore: 0, home: { rank: 1, suit: 2 }, away: { rank: 4, suit: 3 } },
        },
        {
            roundId: 12343,
            settlementResult: { home: false, away: true, draw: false },
            result: { homeScore: 0, awayScore: 1, home: { rank: 2, suit: 1 }, away: { rank: 1, suit: 4 } },
        },
        {
            roundId: 12342,
            settlementResult: { home: false, away: false, draw: true },
            result: { homeScore: 1, awayScore: 1, home: { rank: 3, suit: 2 }, away: { rank: 3, suit: 1 } },
        },
        {
            roundId: 12341,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 3, awayScore: 1, home: { rank: 1, suit: 3 }, away: { rank: 2, suit: 4 } },
        },
        {
            roundId: 12340,
            settlementResult: { home: false, away: true, draw: false },
            result: { homeScore: 0, awayScore: 2, home: { rank: 4, suit: 1 }, away: { rank: 1, suit: 2 } },
        },
        {
            roundId: 12339,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 2, awayScore: 0, home: { rank: 1, suit: 4 }, away: { rank: 3, suit: 1 } },
        },
        {
            roundId: 12338,
            settlementResult: { home: false, away: false, draw: true },
            result: { homeScore: 1, awayScore: 1, home: { rank: 2, suit: 3 }, away: { rank: 2, suit: 1 } },
        },
        {
            roundId: 12337,
            settlementResult: { home: false, away: true, draw: false },
            result: { homeScore: 0, awayScore: 1, home: { rank: 3, suit: 2 }, away: { rank: 1, suit: 3 } },
        },
        {
            roundId: 12336,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 2, awayScore: 1, home: { rank: 1, suit: 1 }, away: { rank: 2, suit: 4 } },
        },
        {
            roundId: 12335,
            settlementResult: { home: false, away: false, draw: true },
            result: { homeScore: 0, awayScore: 0, home: { rank: 4, suit: 2 }, away: { rank: 4, suit: 1 } },
        },
        {
            roundId: 12334,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 3, awayScore: 0, home: { rank: 1, suit: 3 }, away: { rank: 2, suit: 1 } },
        },
        {
            roundId: 12333,
            settlementResult: { home: false, away: true, draw: false },
            result: { homeScore: 1, awayScore: 2, home: { rank: 3, suit: 4 }, away: { rank: 1, suit: 2 } },
        },
        {
            roundId: 12332,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 2, awayScore: 1, home: { rank: 1, suit: 1 }, away: { rank: 4, suit: 3 } },
        },
        {
            roundId: 12331,
            settlementResult: { home: false, away: false, draw: true },
            result: { homeScore: 1, awayScore: 1, home: { rank: 2, suit: 2 }, away: { rank: 2, suit: 4 } },
        },
        {
            roundId: 12330,
            settlementResult: { home: false, away: true, draw: false },
            result: { homeScore: 0, awayScore: 3, home: { rank: 4, suit: 1 }, away: { rank: 1, suit: 3 } },
        },
        {
            roundId: 12329,
            settlementResult: { home: true, away: false, draw: false },
            result: { homeScore: 2, awayScore: 0, home: { rank: 1, suit: 4 }, away: { rank: 3, suit: 2 } },
        },
    ] as RNGSoccerRoundHistory[],

    // UI state
    uiState: {
        isPopupVisible: false,
        showBetPanel: false,
        activePanelId: null,
        isShowNextRoundMessage: false,
        isAnimationResult: false,
        isFinishShowResult: false,
        isLoading: false,
        isFinish: false,
    },

    // Connection state
    connectionState: {
        isConnected: true,
        isReconnecting: false,
        showDisabledPopup: false,
    },

    // Settlement status
    statusSettlement: {
        win: 185,
        bet: 100,
        symbol: RNGSoccerChoices.home,
    },
};

// Helper functions to simulate real-time data updates
export const FakeDataHelpers = {
    // Simulate countdown timer
    getCountdownTimer: () => {
        const now = Date.now();
        const endTime = FAKE_RNG_SOCCER_DATA.currentRound.endTime;
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        return remaining;
    },

    // Simulate odds changes
    getUpdatedOdds: () => {
        const baseOdds = { ...FAKE_RNG_SOCCER_DATA.roundOdds.odds };
        // Add some random variation to simulate real-time odds changes
        Object.keys(baseOdds).forEach((key) => {
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            baseOdds[key] = Math.max(1.01, baseOdds[key] * (1 + variation));
        });
        return baseOdds;
    },

    // Simulate bet amount changes
    getUpdatedTotalBets: () => {
        const baseBets = { ...FAKE_RNG_SOCCER_DATA.totalBets };
        // Add some random variation to simulate real-time bet changes
        Object.keys(baseBets).forEach((key) => {
            const variation = Math.floor(Math.random() * 100);
            baseBets[key] += variation;
        });
        return baseBets;
    },

    // Get random team pair for variety
    getRandomTeamPair: () => {
        const teams = TeamUtils.TEAMS.filter((team) => team !== 'DEFAULT_HOME' && team !== 'DEFAULT_AWAY');
        const homeTeam = teams[Math.floor(Math.random() * teams.length)];
        const awayTeam = teams.filter((team) => team !== homeTeam)[Math.floor(Math.random() * (teams.length - 1))];

        return {
            home: {
                name: TeamUtils.getTeamFullName(homeTeam),
                abbreviation: homeTeam,
                rank: Math.floor(Math.random() * 4) + 1,
                suit: Math.floor(Math.random() * 4) + 1,
                score: Math.floor(Math.random() * 4),
            },
            away: {
                name: TeamUtils.getTeamFullName(awayTeam),
                abbreviation: awayTeam,
                rank: Math.floor(Math.random() * 4) + 1,
                suit: Math.floor(Math.random() * 4) + 1,
                score: Math.floor(Math.random() * 4),
            },
        };
    },

    // Generate random round history with proper team names
    generateRandomRoundHistory: (count: number = 10): RNGSoccerRoundHistory[] => {
        const history: RNGSoccerRoundHistory[] = [];
        for (let i = 0; i < count; i++) {
            const teamPair = FakeDataHelpers.getRandomTeamPair();
            const homeScore = Math.floor(Math.random() * 4);
            const awayScore = Math.floor(Math.random() * 4);
            const homeWins = homeScore > awayScore;
            const awayWins = awayScore > homeScore;
            const isDraw = homeScore === awayScore;

            history.push({
                roundId: 12345 - i,
                settlementResult: {
                    home: homeWins,
                    away: awayWins,
                    draw: isDraw,
                },
                result: {
                    homeScore,
                    awayScore,
                    home: { rank: teamPair.home.rank, suit: teamPair.home.suit },
                    away: { rank: teamPair.away.rank, suit: teamPair.away.suit },
                },
            });
        }
        return history;
    },
};

// Mock game client stores for testing
export const MockGameStores = {
    RoundTimeStore: {
        roundState: FAKE_RNG_SOCCER_DATA.currentRound.roundState,
        isLocking: FAKE_RNG_SOCCER_DATA.currentRound.isLocking,
        teamData: FAKE_RNG_SOCCER_DATA.teamData,
    },

    RoundOddsStore: {
        odds: FAKE_RNG_SOCCER_DATA.roundOdds.odds,
        boostedChoices: FAKE_RNG_SOCCER_DATA.roundOdds.boostedChoices,
    },

    RoundHistoryStore: {
        histories: FAKE_RNG_SOCCER_DATA.roundHistory,
        firstJoinGameHistory: FAKE_RNG_SOCCER_DATA.roundHistory[0],
    },

    SettlementStore: {
        currentFinish: {
            result: FAKE_RNG_SOCCER_DATA.currentResult,
            settlementResult: FAKE_RNG_SOCCER_DATA.settlementResult,
        },
        isFinishedShowResult: FAKE_RNG_SOCCER_DATA.uiState.isFinishShowResult,
    },

    OwnBetsStore: {
        bets: FAKE_RNG_SOCCER_DATA.ownBets.bets,
        totalStake: FAKE_RNG_SOCCER_DATA.ownBets.totalStake,
    },

    TotalBetsStore: {
        bets: FAKE_RNG_SOCCER_DATA.totalBets,
    },

    BetPercentageStore: {
        percentages: FAKE_RNG_SOCCER_DATA.betPercentage,
    },

    UserBetPercentageStore: {
        percentages: FAKE_RNG_SOCCER_DATA.userBetPercentage,
    },
};
