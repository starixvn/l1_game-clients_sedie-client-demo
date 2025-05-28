import * as gc from '@sg/sg-game-client';
import { BetCounts, BetResult } from './types';
import { calculateBetStatistics as calculateGenericBetStatistics } from '../../../../_shared/utils/bet-statistics';

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
        yellow: 0,
        red: 0,
        pink: 0,
        white: 0,
        blue: 0,
        green: 0
    };

    return calculateGenericBetStatistics(data, {
        initialCounts,
        getResultFromSettlement: (item) => item.settlementResult as unknown as BetResult
    });
}; 