export enum CoinTossChoices {
    head = 'head',
    tail = 'tail'
}

export type CoinTossSymbolType = keyof typeof CoinTossChoices;

export type CoinTossResult = {
    [key in CoinTossSymbolType]?: boolean;
};

export type CoinTossSettlementResult = {
    [key in CoinTossSymbolType]?: boolean;
};

export interface CoinTossBet {
    symbol: CoinTossSymbolType;
    amount: number;
}

export interface CoinTossRound {
    roundId: string;
    status: 'placingBets' | 'lockingBet' | 'showingResult' | 'finished';
    startTime: number;
    endTime: number;
    result?: CoinTossResult;
    bets?: CoinTossBet[];
} 

export interface CoinTossRoundHistory {
    roundId: number;
    settlementResult: CoinTossSettlementResult;
    result: CoinTossResult;
}