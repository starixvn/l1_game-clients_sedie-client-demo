import * as gc from '@sg/sg-game-client';

export type BetResultType<T extends string> = {
    [K in T]: boolean;
};

export type BetCountsType<T extends string> = {
    [K in T]: number;
};

export interface BetStatisticsConfig<T extends string> {
    initialCounts: BetCountsType<T>;
    getResultFromSettlement: (settlement: gc.RoundHistories.RoundHistory) => BetResultType<T> | null;
} 