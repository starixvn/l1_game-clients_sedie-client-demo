import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { calculateBetStatistics } from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/bet-percentages';
import * as gc from '@sg/sg-game-client';

// Mock the translator
jest.mock('@sg/sg-game-client', () => ({
    ...jest.requireActual('@sg/sg-game-client'),
    Translator: {
        t: jest.fn((key) => key)
    },
    RoundHistories: {}
}));

describe('FishPrawnCrabBetPercentages', () => {
    // Define the type for our mock rounds
    interface MockRoundHistory {
        roundId: any;
        result: any;
        settlementResult?: any;
    }

    // Test data
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

    describe('calculateBetStatistics', () => {
        test('should correctly calculate statistics from round history', () => {
            // Arrange
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
            const roundsWithMissingResults = [
                { roundId: '1', result: {} } as MockRoundHistory,
                ...mockRounds
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
            const result = calculateBetStatistics(roundsWithMissingResults as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual(expected);
        });
    });
}); 