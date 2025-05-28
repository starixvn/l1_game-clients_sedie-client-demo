import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as gc from '@sg/sg-game-client';
import { ResultHistory } from '../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/components';
import { FishPrawnCrabChoices, FishPrawnCrabSymbol } from '../../../../../src/games/saba-club/fish-prawn-crab/type';

// Mock the DiceColumn component
jest.mock('../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/components/dice-column', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(({ result, hasBlink }) => (
            <div data-testid="mock-dice-column" data-result={JSON.stringify(result)} data-hasblink={hasBlink}>
                Mock Dice Column
            </div>
        ))
    };
});

describe('ResultHistory', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render empty state when no rounds provided', () => {
        // Arrange
        const props = {
            rounds: [],
            hasBlink: false
        };

        // Act
        render(<ResultHistory {...props} />);

        // Assert
        expect(screen.getByTestId('scoreboard-dice-container')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-dice-column')).not.toBeInTheDocument();
    });

    it('should render blinking dice column when hasBlink is true and no rounds', () => {
        // Arrange
        const props = {
            rounds: [],
            hasBlink: true
        };

        // Act
        render(<ResultHistory {...props} />);

        // Assert
        expect(screen.getByTestId('scoreboard-dice-container')).toBeInTheDocument();
        expect(screen.getByTestId('empty-result')).toBeInTheDocument();
        const mockDiceColumn = screen.getByTestId('mock-dice-column');
        expect(mockDiceColumn).toBeInTheDocument();
        expect(mockDiceColumn.getAttribute('data-result')).toBe('null');
        expect(mockDiceColumn.getAttribute('data-hasblink')).toBe('true');
    });

    it('should render dice columns for each round in reverse order', () => {
        // Arrange
        const mockRounds = [
            {
                roundId: '1',
                result: {
                    dice1: FishPrawnCrabChoices.fish as FishPrawnCrabSymbol,
                    dice2: FishPrawnCrabChoices.prawn as FishPrawnCrabSymbol,
                    dice3: FishPrawnCrabChoices.crab as FishPrawnCrabSymbol
                },
                settlementResult: {}, // Required field for RoundHistory
                date: new Date().toISOString(), // Required field for RoundHistory
                gameId: 'game1' // Required field for RoundHistory
            },
            {
                roundId: '2',
                result: {
                    dice1: FishPrawnCrabChoices.rooster as FishPrawnCrabSymbol,
                    dice2: FishPrawnCrabChoices.gourd as FishPrawnCrabSymbol,
                    dice3: FishPrawnCrabChoices.stag as FishPrawnCrabSymbol
                },
                settlementResult: {}, // Required field for RoundHistory
                date: new Date().toISOString(), // Required field for RoundHistory
                gameId: 'game1' // Required field for RoundHistory
            }
        ] as unknown as gc.RoundHistories.RoundHistory[];

        const props = {
            rounds: mockRounds,
            hasBlink: false
        };

        // Act
        render(<ResultHistory {...props} />);

        // Assert
        expect(screen.getByTestId('scoreboard-dice-container')).toBeInTheDocument();
        const diceColumns = screen.getAllByTestId('mock-dice-column');
        expect(diceColumns).toHaveLength(2);

        // Check that the rounds are rendered in reverse order
        expect(screen.getByTestId('result-2')).toBeInTheDocument();
        expect(screen.getByTestId('result-1')).toBeInTheDocument();

        // The closest element with a data-testid attribute is the mock-dice-column itself
        const firstColumnOrder = screen.getAllByTestId('mock-dice-column')[0];
        expect(firstColumnOrder).toBeInTheDocument();
        // Check the parent element directly
        expect(firstColumnOrder.parentElement).not.toBeNull();
        expect(firstColumnOrder.parentElement?.getAttribute('data-testid')).toBe('result-2');
    });

    it('should apply blinking to the most recent round only when hasBlink is true', () => {
        // Arrange
        const mockRounds = [
            {
                roundId: '1',
                result: {
                    dice1: FishPrawnCrabChoices.fish as FishPrawnCrabSymbol,
                    dice2: FishPrawnCrabChoices.prawn as FishPrawnCrabSymbol
                },
                settlementResult: {}, // Required field for RoundHistory
                date: new Date().toISOString(), // Required field for RoundHistory
                gameId: 'game1' // Required field for RoundHistory
            },
            {
                roundId: '2',
                result: {
                    dice1: FishPrawnCrabChoices.rooster as FishPrawnCrabSymbol,
                    dice2: FishPrawnCrabChoices.gourd as FishPrawnCrabSymbol
                },
                settlementResult: {}, // Required field for RoundHistory
                date: new Date().toISOString(), // Required field for RoundHistory
                gameId: 'game1' // Required field for RoundHistory
            }
        ] as unknown as gc.RoundHistories.RoundHistory[];

        const props = {
            rounds: mockRounds,
            hasBlink: true
        };

        // Act
        render(<ResultHistory {...props} />);

        // Assert
        const diceColumns = screen.getAllByTestId('mock-dice-column');
        expect(diceColumns).toHaveLength(2);

        // First column (most recent in reverse order) should have hasBlink=true
        const firstColumn = diceColumns[0];
        expect(firstColumn.getAttribute('data-hasblink')).toBe('true');

        // Second column should have hasBlink=false
        const secondColumn = diceColumns[1];
        expect(secondColumn.getAttribute('data-hasblink')).toBe('false');
    });
}); 