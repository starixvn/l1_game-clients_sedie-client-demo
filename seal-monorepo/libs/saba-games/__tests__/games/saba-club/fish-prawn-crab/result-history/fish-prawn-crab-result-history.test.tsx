import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FishPrawnCrabResultHistory } from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/result-history/fish-prawn-crab-result-history';
import * as gc from '@sg/sg-game-client';
import { FishPrawnCrabChoices } from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/type';
import { Size } from 'libs/saba-games/src/_shared/constants';

// Mock dependencies
jest.mock('@sg/sg-game-client', () => ({
    RoundHistories: {
        RoundHistoryStore: {
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
        },
        RoundHistory: jest.fn(),
    },
    Translator: {
        translate: jest.fn((key) => {
            // Handle different translation key formats
            if (key === 'Common.result_title') {
                return 'Result History';
            }
            if (key.startsWith('FishPrawnCrab.glossary_')) {
                const choice = key.replace('FishPrawnCrab.glossary_', '');
                return `Translated_${choice}`;
            }
            return `Translated_${key}`;
        }),
        getCurrentLanguageId: jest.fn(() => 'en'),
    },
    GameServiceMessage: {
        TSettlementResult: {}
    }
}));

// Fix the render decorator mock
jest.mock('@sg/sg-observer', () => ({
    // Mock the render decorator to be a function that returns a method decorator
    render: jest.fn((store, selector) => {
        return function (target, propertyKey, descriptor) {
            // Return the original method 
            return descriptor;
        };
    }),
    useObserver: jest.fn(),
}));

jest.mock('libs/saba-games/src/games/saba-club/fish-prawn-crab/dot/fish-prawn-crab-dot', () =>
    function MockFishPrawnCrabDot(props) {
        return <div data-testid={`dot-${props.choice}`} className={props.size || 'medium'}>{props.choice}</div>;
    }
);

jest.mock('libs/saba-games/src/_shared/components/fish-prawn-crab-dice', () =>
    function MockFishPrawnCrabDice(props) {
        return (
            <div
                data-testid={`dice-${props.symbol}`}
                data-size={props.size || 'medium'}
                className={`dice-symbol-${props.symbol}`}
            >
                {props.symbol}
            </div>
        );
    }
);

// Define the FishPrawnCrabResult type for testing
interface FishPrawnCrabResult {
    dice1: number;
    dice2: number;
    dice3: number;
}

describe('FishPrawnCrabResultHistory', () => {
    // Sample round history data for testing
    const mockRoundHistories = [
        {
            roundId: 1001,
            settlementResult: {
                fish: true,
                prawn: false,
                crab: false,
                rooster: false,
                gourd: false,
                stag: false
            },
            result: {
                dice1: 1,
                dice2: 1,
                dice3: 3
            }
        },
        {
            roundId: 1002,
            settlementResult: {
                fish: false,
                prawn: true,
                crab: false,
                rooster: true,
                gourd: false,
                stag: false
            },
            result: {
                dice1: 2,
                dice2: 2,
                dice3: 4
            }
        }
    ] as gc.RoundHistories.RoundHistory[];

    beforeEach(() => {
        jest.clearAllMocks();
    });


    // Edge Cases
    it('should handle empty rounds array gracefully', () => {
        // Arrange
        const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });

        // Act
        component.setState({ rounds: [] });
        const { container } = render(component.render());

        // Assert
        expect(container.innerHTML).toBe('');
    });

    it('should handle null rounds gracefully', () => {
        // Arrange
        const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });

        // Act
        // @ts-ignore - Intentionally testing incorrect type for edge case
        component.setState({ rounds: null });
        const { container } = render(component.render());

        // Assert
        expect(container.innerHTML).toBe('');
    });

    // Testing specific methods
    describe('renderSymbols', () => {
        it('should return null when result is missing', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1003,
                settlementResult: {
                    fish: true
                },
                // result is missing
            } as unknown as gc.RoundHistories.RoundHistory;

            // Act
            const result = component.renderSymbols(roundHistory);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when settlementResult is missing', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1003,
                // settlementResult is missing
                result: {
                    dice1: 1,
                    dice2: 2,
                    dice3: 3
                }
            } as unknown as gc.RoundHistories.RoundHistory;

            // Act
            const result = component.renderSymbols(roundHistory);

            // Assert
            expect(result).toBeNull();
        });

        it('should correctly format dice results', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1004,
                settlementResult: {
                    fish: true
                },
                result: {
                    dice1: 1,
                    dice2: 2,
                    dice3: 3
                }
            } as gc.RoundHistories.RoundHistory;

            // Act - instead of checking rendered output, validate the method behavior
            const result = component.renderSymbols(roundHistory);

            // Assert
            expect(result).not.toBeNull();
            // Check that the result contains a div with the dice-container class
            const { container } = render(<>{result}</>);
            expect(container.querySelector('.dice-container')).not.toBeNull();
        });
    });

    describe('renderWinningSymbols', () => {
        it('should return null when settlement result is missing', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1005,
                // settlementResult is missing
                result: {}
            } as gc.RoundHistories.RoundHistory;

            // Act
            const result = component.renderWinningSymbols(roundHistory);

            // Assert
            expect(result).toBeNull();
        });

        it('should create elements for winning choices', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1006,
                settlementResult: {
                    fish: true,
                    prawn: true,
                    crab: false
                },
                result: {}
            } as gc.RoundHistories.RoundHistory;

            // Act - just validate the method returns the expected number of elements
            const result = component.renderWinningSymbols(roundHistory);

            // Assert that the method returns an array with 2 elements
            expect(result).toHaveLength(2);
        });
    });

    describe('getWinningTextList', () => {
        it('should return empty string when settlement result is missing', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1007,
                // settlementResult is missing
                result: {}
            } as gc.RoundHistories.RoundHistory;

            // Act
            const result = component.getWinningTextList(roundHistory);

            // Assert
            expect(result).toBe("");
        });

        it('should return comma-separated translated winner names', () => {
            // Arrange
            const component = new FishPrawnCrabResultHistory({ language: 'en', namespace: 'test' });
            const roundHistory = {
                roundId: 1008,
                settlementResult: {
                    gourd: true,
                    crab: true,
                    stag: true
                },
                result: {}
            } as gc.RoundHistories.RoundHistory;

            // Act
            const result = component.getWinningTextList(roundHistory);

            // Assert - using our mock translator, this should return the actual format
            expect(result).toContain('Translated_crab');
            expect(result).toContain('Translated_gourd');
            expect(result).toContain('Translated_stag');
        });
    });
}); 