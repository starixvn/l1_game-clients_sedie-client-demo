export enum RNGSoccerChoices {
    home = 'home',
    away = 'away',
    draw = 'draw'
}

export type RNGSoccerSymbolType = keyof typeof RNGSoccerChoices;

export interface RNGSoccerResult {
    homeScore: number;
    awayScore: number;
    home: {
        rank: number;
        suit: number;
    };
    away: {
        rank: number;
        suit: number;
    };
}

export interface RNGSoccerSettlementResult {
    result: RNGSoccerResult;
    roundId: number;
    roundState: string;
}

export interface RNGSoccerSettlementItemResult {
    home: boolean;
    away: boolean;
    draw: boolean;
}
export interface RNGSoccerBet {
    symbol: RNGSoccerSymbolType;
    amount: number;
}

export interface RNGSoccerRound {
    roundId: string;
    status: 'placingBets' | 'lockingBet' | 'showingResult' | 'finished';
    startTime: number;
    endTime: number;
    result?: RNGSoccerResult;
    bets?: RNGSoccerBet[];
}

export interface RNGSoccerRoundHistory {
    roundId: number;
    settlementResult: RNGSoccerSettlementItemResult;
    result: RNGSoccerResult;
}