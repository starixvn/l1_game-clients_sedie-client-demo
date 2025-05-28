import * as gc from '@sg/sg-game-client';
import { BetCounts, BetResult } from './types';

/**
 * Counts the occurrence of each result value from round histories
 */
export const countResult = (roundHistory: gc.RoundHistories.RoundHistory[]) => {
    return roundHistory.reduce((resultCount, { result }) => {
        Object.values(result).forEach((character: number) => {
            resultCount[character] = (resultCount[character] ?? 0) + 1;
        });
        return resultCount;
    }, {} as Record<number, number>);
};

/**
 * Calculates bet statistics from round histories
 */
export const calculateBetStatistics = (data: gc.RoundHistories.RoundHistory[]): BetCounts => {
    const initialCounts: BetCounts = {
        fish: 0,
        prawn: 0,
        crab: 0,
        rooster: 0,
        gourd: 0,
        stag: 0
    };

    return data.reduce((counts, item) => {
        if (!item.settlementResult) return counts;

        const result = item.settlementResult as unknown as BetResult;
        return {
            fish: counts.fish + (result.fish ? 1 : 0),
            prawn: counts.prawn + (result.prawn ? 1 : 0),
            crab: counts.crab + (result.crab ? 1 : 0),
            rooster: counts.rooster + (result.rooster ? 1 : 0),
            gourd: counts.gourd + (result.gourd ? 1 : 0),
            stag: counts.stag + (result.stag ? 1 : 0)
        };
    }, initialCounts);
}; 