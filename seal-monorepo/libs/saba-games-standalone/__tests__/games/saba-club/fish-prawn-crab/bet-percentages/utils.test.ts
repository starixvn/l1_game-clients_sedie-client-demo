import * as gc from '@sg/sg-game-client';
import { countResult, calculateBetStatistics } from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/bet-percentages/utils';
import { BetResult } from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/bet-percentages/types';

describe('Bet Percentages Utils', () => {
    // Define the type for our mock rounds
    interface MockRoundHistory {
        roundId: string;
        result: Record<string, number>;
        settlementResult?: BetResult;
    }

    describe('countResult', () => {
        test('should count occurrences of each result value', () => {
            // Arrange
            const mockRounds: MockRoundHistory[] = [
                {
                    roundId: '1',
                    result: { dice1: 3, dice2: 4, dice3: 5 } // fish, crab, prawn
                },
                {
                    roundId: '2',
                    result: { dice1: 3, dice2: 3, dice3: 4 } // fish, fish, crab
                }
            ];

            // Act
            const result = countResult(mockRounds as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual({
                3: 3, // fish appears 3 times
                4: 2, // crab appears 2 times
                5: 1  // prawn appears 1 time
            });
        });

        test('should return empty object for empty round history', () => {
            // Act
            const result = countResult([]);

            // Assert
            expect(result).toEqual({});
        });

        test('should handle rounds with no result values', () => {
            // Arrange
            const mockRounds: MockRoundHistory[] = [
                {
                    roundId: '1',
                    result: {}
                }
            ];

            // Act
            const result = countResult(mockRounds as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual({});
        });
    });

    describe('calculateBetStatistics', () => {
        test('should correctly calculate statistics from round history', () => {
            // Arrange
            const mockRounds: MockRoundHistory[] = [
                {
                    roundId: '1',
                    result: {},
                    settlementResult: {
                        fish: true,
                        prawn: false,
                        crab: false,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                },
                {
                    roundId: '2',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: true,
                        crab: false,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                },
                {
                    roundId: '3',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: false,
                        crab: true,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                }
            ];

            const expected = {
                fish: 1,
                prawn: 1,
                crab: 1,
                rooster: 0,
                gourd: 0,
                stag: 0
            };

            // Act
            const result = calculateBetStatistics(mockRounds as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual(expected);
        });

        test('should return zeros for empty round history', () => {
            // Arrange
            const expected = {
                fish: 0,
                prawn: 0,
                crab: 0,
                rooster: 0,
                gourd: 0,
                stag: 0
            };

            // Act
            const result = calculateBetStatistics([]);

            // Assert
            expect(result).toEqual(expected);
        });

        test('should handle rounds without settlementResult', () => {
            // Arrange
            const mockRounds: MockRoundHistory[] = [
                {
                    roundId: '1',
                    result: {}
                },
                {
                    roundId: '2',
                    result: {},
                    settlementResult: {
                        fish: true,
                        prawn: false,
                        crab: false,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                }
            ] as unknown as MockRoundHistory[];

            const expected = {
                fish: 1,
                prawn: 0,
                crab: 0,
                rooster: 0,
                gourd: 0,
                stag: 0
            };

            // Act
            const result = calculateBetStatistics(mockRounds as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual(expected);
        });

        test('should handle all possible bet combinations', () => {
            // Arrange
            const mockRounds: MockRoundHistory[] = [
                {
                    roundId: '1',
                    result: {},
                    settlementResult: {
                        fish: true,
                        prawn: false,
                        crab: false,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                },
                {
                    roundId: '2',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: true,
                        crab: false,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                },
                {
                    roundId: '3',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: false,
                        crab: true,
                        rooster: false,
                        gourd: false,
                        stag: false
                    }
                },
                {
                    roundId: '4',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: false,
                        crab: false,
                        rooster: true,
                        gourd: false,
                        stag: false
                    }
                },
                {
                    roundId: '5',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: false,
                        crab: false,
                        rooster: false,
                        gourd: true,
                        stag: false
                    }
                },
                {
                    roundId: '6',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: false,
                        crab: false,
                        rooster: false,
                        gourd: false,
                        stag: true
                    }
                }
            ];

            const expected = {
                fish: 1,
                prawn: 1,
                crab: 1,
                rooster: 1,
                gourd: 1,
                stag: 1
            };

            // Act
            const result = calculateBetStatistics(mockRounds as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual(expected);
        });
    });
}); 