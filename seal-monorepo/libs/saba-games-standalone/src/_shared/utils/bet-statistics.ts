import * as gc from '@sg/sg-game-client';
import { BetCountsType, BetResultType, BetStatisticsConfig } from '../types/bet-statistics';

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
 * Calculates bet statistics from round histories using a generic configuration
 */
export const calculateBetStatistics = <T extends string>(
    data: gc.RoundHistories.RoundHistory[],
    config: BetStatisticsConfig<T>
): BetCountsType<T> => {
    return data.reduce((counts, item) => {
        const result = config.getResultFromSettlement(item);
        if (!result) return counts;

        return Object.keys(config.initialCounts).reduce((acc, key) => ({
            ...acc,
            [key]: counts[key as T] + (result[key as T] ? 1 : 0)
        }), counts);
    }, config.initialCounts);
}; 