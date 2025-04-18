import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    calculateBetStatistics,
    FishPrawnCrabBetPercentages,
    BetPercentageItem,
    BetCounts,
    BetResult,
    countResult
} from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/bet-percentages';
import * as gc from '@sg/sg-game-client';
import { FishPrawnCrabChoices } from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/type';
import { Size } from 'libs/saba-games/src/_shared/constants';

// Mock the required components
jest.mock('libs/saba-games/src/_shared/components/fish-prawn-crab-dice', () => {
    return function MockFishPrawnCrabDice(props) {
        return (
            <div
                data-testid={`dice-${props.symbol}`}
                data-size={props.size || 'large'}
                className={`dice-symbol-${props.symbol}`}
            >
                {props.symbol}
            </div>
        );
    };
});

// Mock the translator
jest.mock('@sg/sg-game-client', () => ({
    ...jest.requireActual('@sg/sg-game-client'),
    Translator: {
        t: jest.fn((key) => key)
    },
    RoundHistories: {}
}));

// Mock the dot component
jest.mock('libs/saba-games/src/games/saba-club/fish-prawn-crab/dot/fish-prawn-crab-dot', () => {
    return function MockFishPrawnCrabDot() {
        return <div data-testid="fish-prawn-crab-dot" />;
    };
});

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

        test('should handle rounds with multiple winning choices', () => {
            // Arrange
            const roundsWithMultipleWinners = [
                {
                    roundId: '4',
                    result: {},
                    settlementResult: {
                        fish: true,
                        prawn: true,
                        crab: true,
                        rooster: true,
                        gourd: true,
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
            const result = calculateBetStatistics(roundsWithMultipleWinners as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual(expected);
        });

        test('should ignore falsy values in settlementResult', () => {
            // Arrange
            const roundsWithFalsyValues = [
                {
                    roundId: '5',
                    result: {},
                    settlementResult: {
                        fish: false,
                        prawn: undefined,
                        crab: null,
                        rooster: 0,
                        gourd: '',
                        stag: NaN
                    } as unknown as BetResult
                }
            ];

            const expected = {
                fish: 0,
                prawn: 0,
                crab: 0,
                rooster: 0,
                gourd: 0,
                stag: 0
            };

            // Act
            const result = calculateBetStatistics(roundsWithFalsyValues as unknown as gc.RoundHistories.RoundHistory[]);

            // Assert
            expect(result).toEqual(expected);
        });
    });

    describe('countResult', () => {
        test('should count occurrences of result values', () => {
            // Arrange
            const mockRoundsWithDice = [
                {
                    roundId: '1',
                    result: {
                        dice1: 3, // fish
                        dice2: 5, // prawn
                        dice3: 4  // crab
                    }
                },
                {
                    roundId: '2',
                    result: {
                        dice1: 3, // fish
                        dice2: 3, // fish
                        dice3: 5  // prawn
                    }
                }
            ] as unknown as gc.RoundHistories.RoundHistory[];

            // Act
            const result = countResult(mockRoundsWithDice);

            // Assert
            expect(result).toEqual({
                3: 3, // fish appears 3 times
                4: 1, // crab appears 1 time
                5: 2  // prawn appears 2 times
            });
        });

        test('should return empty object for empty rounds', () => {
            // Arrange
            const emptyRounds: gc.RoundHistories.RoundHistory[] = [];

            // Act
            const result = countResult(emptyRounds);

            // Assert
            expect(result).toEqual({});
        });

        test('should handle rounds with empty result objects', () => {
            // Arrange
            const roundsWithEmptyResults = [
                {
                    roundId: '1',
                    result: {}
                }
            ] as unknown as gc.RoundHistories.RoundHistory[];

            // Act
            const result = countResult(roundsWithEmptyResults);

            // Assert
            expect(result).toEqual({});
        });
    });

    describe('FishPrawnCrabBetPercentages Component', () => {
        test('should render all bet options with correct counts', () => {
            // Arrange
            const gameName = 'FishPrawnCrab';

            // Act
            render(
                <FishPrawnCrabBetPercentages
                    gameName={gameName}
                    rounds={mockRounds as unknown as gc.RoundHistories.RoundHistory[]}
                />
            );

            // Assert - check that all symbols are rendered with correct counts
            const choices = Object.values(FishPrawnCrabChoices);
            choices.forEach(choice => {
                const expectedCount = choice === 'fish' || choice === 'prawn' || choice === 'crab' ? 1 : 0;
                const diceElement = screen.getByTestId(`dice-${choice === 'fish' ? 3 : choice === 'prawn' ? 5 : choice === 'crab' ? 4 : choice === 'rooster' ? 2 : choice === 'gourd' ? 1 : 0}`);

                expect(diceElement).toBeInTheDocument();

                // Find the parent element (percentage item) and check if it contains the correct count
                const parentElement = diceElement.closest('div');
                expect(parentElement).not.toBeNull();
                const countElement = parentElement?.querySelector('.count');
                expect(countElement).not.toBeNull();
                expect(countElement?.textContent).toBe(expectedCount.toString());
            });
        });

        test('should render with custom translator function', () => {
            // Arrange
            const gameName = 'FishPrawnCrab';
            const customTranslator = jest.fn(key => `Translated_${key}`);

            // Act
            render(
                <FishPrawnCrabBetPercentages
                    gameName={gameName}
                    rounds={mockRounds as unknown as gc.RoundHistories.RoundHistory[]}
                    translator={customTranslator}
                />
            );

            // Assert
            // Just check that component rendered
            const percentageItems = document.querySelectorAll('.percentage-item');
            expect(percentageItems.length).toBe(6); // One for each choice
        });

        test('should handle empty rounds', () => {
            // Arrange
            const gameName = 'FishPrawnCrab';

            // Act
            render(
                <FishPrawnCrabBetPercentages
                    gameName={gameName}
                    rounds={[]}
                />
            );

            // Assert - check that all counts are zero
            const choices = Object.values(FishPrawnCrabChoices);
            choices.forEach(choice => {
                const diceElement = screen.getByTestId(`dice-${choice === 'fish' ? 3 : choice === 'prawn' ? 5 : choice === 'crab' ? 4 : choice === 'rooster' ? 2 : choice === 'gourd' ? 1 : 0}`);

                expect(diceElement).toBeInTheDocument();

                // Find the parent element (percentage item) and check if it contains zero count
                const parentElement = diceElement.closest('div');
                expect(parentElement).not.toBeNull();
                const countElement = parentElement?.querySelector('.count');
                expect(countElement).not.toBeNull();
                expect(countElement?.textContent).toBe('0');
            });
        });

        test('should log bet counts to console', () => {
            // Arrange
            const gameName = 'FishPrawnCrab';
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // Act
            render(
                <FishPrawnCrabBetPercentages
                    gameName={gameName}
                    rounds={mockRounds as unknown as gc.RoundHistories.RoundHistory[]}
                />
            );

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('betCounts', expect.any(Object));
            consoleSpy.mockRestore();
        });
    });

    describe('BetPercentageItem', () => {
        test('should render correctly with given props', () => {
            // Arrange
            const gameName = 'FishPrawnCrab';
            const choice = FishPrawnCrabChoices.fish;
            const count = 5;
            const translateBetOption = jest.fn(key => `Translated_${key}`);

            // Act
            render(
                <BetPercentageItem
                    gameName={gameName}
                    choice={choice}
                    count={count}
                    translateBetOption={translateBetOption}
                />
            );

            // Assert
            const diceElement = screen.getByTestId(`dice-3`); // 3 is the symbol for fish
            expect(diceElement).toBeInTheDocument();

            const countElement = screen.getByText('5');
            expect(countElement).toBeInTheDocument();
            expect(countElement).toHaveClass('count');
        });

        test('should render each choice with the correct symbol', () => {
            // Arrange
            const gameName = 'FishPrawnCrab';
            const translateBetOption = jest.fn(key => `Translated_${key}`);

            // Test all choices
            const choiceToSymbolMapping = [
                { choice: FishPrawnCrabChoices.fish, symbol: 3 },
                { choice: FishPrawnCrabChoices.prawn, symbol: 5 },
                { choice: FishPrawnCrabChoices.crab, symbol: 4 },
                { choice: FishPrawnCrabChoices.rooster, symbol: 2 },
                { choice: FishPrawnCrabChoices.gourd, symbol: 1 },
                { choice: FishPrawnCrabChoices.stag, symbol: 0 }
            ];

            // Test each choice
            choiceToSymbolMapping.forEach(({ choice, symbol }) => {
                // Act
                const { unmount } = render(
                    <BetPercentageItem
                        gameName={gameName}
                        choice={choice}
                        count={1}
                        translateBetOption={translateBetOption}
                    />
                );

                // Assert
                const diceElement = screen.getByTestId(`dice-${symbol}`);
                expect(diceElement).toBeInTheDocument();

                // Clean up before testing next choice
                unmount();
            });
        });
    });
}); 