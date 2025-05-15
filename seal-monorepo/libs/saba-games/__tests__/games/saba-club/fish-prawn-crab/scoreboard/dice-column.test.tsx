import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiceColumn from '../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/components/dice-column';
import { FishPrawnCrabChoices } from '../../../../../src/games/saba-club/fish-prawn-crab/type';

// Define FishPrawnCrabSymbol locally
export enum FishPrawnCrabSymbol {
    FISH = 'FISH',
    PRAWN = 'PRAWN',
    CRAB = 'CRAB',
    ROOSTER = 'ROOSTER',
    GOURD = 'GOURD',
    STAG = 'STAG'
}

// Mock the dice component - use the same path that DiceColumn would use
jest.mock('../../../../../src/_shared/components/fish-prawn-crab-dice', () => ({
    FishPrawnCrabSymbol: {
        FISH: 'FISH',
        PRAWN: 'PRAWN',
        CRAB: 'CRAB',
        ROOSTER: 'ROOSTER',
        GOURD: 'GOURD',
        STAG: 'STAG'
    },
    __esModule: true,
    default: jest.fn().mockImplementation(({ symbol, size }) => (
        <div data-testid={`mock-dice-${symbol}`} data-size={size}>
            Mock Dice {symbol}
        </div>
    ))
}));

describe('DiceColumn', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when result is null', () => {
        it('should render empty column when result is null and not blinking', () => {
            // Arrange & Act
            render(<DiceColumn result={null} hasBlink={false} />);

            // Assert
            expect(screen.getByTestId('empty-dice-column')).toBeInTheDocument();
            expect(screen.queryByTestId('blink-dice')).not.toBeInTheDocument();
        });

        it('should render blinking dice when result is null and hasBlink is true', () => {
            // Arrange & Act
            render(<DiceColumn result={null} hasBlink={true} />);

            // Assert
            expect(screen.getByTestId('empty-dice-column')).toBeInTheDocument();
            const blinkDice = screen.getAllByTestId('blink-dice');
            expect(blinkDice).toHaveLength(3);
        });
    });

    describe('when result has dice values', () => {
        it('should render dice for each valid dice value in the result', () => {
            // Arrange
            const mockResult = {
                dice1: FishPrawnCrabChoices.fish as unknown as FishPrawnCrabSymbol,
                dice2: FishPrawnCrabChoices.prawn as unknown as FishPrawnCrabSymbol,
                dice3: FishPrawnCrabChoices.crab as unknown as FishPrawnCrabSymbol
            } as any;

            // Act
            render(<DiceColumn result={mockResult} hasBlink={false} />);

            // Assert
            expect(screen.getByTestId('dice-column')).toBeInTheDocument();
            expect(screen.getByTestId('mock-dice-fish')).toBeInTheDocument();
            expect(screen.getByTestId('mock-dice-prawn')).toBeInTheDocument();
            expect(screen.getByTestId('mock-dice-crab')).toBeInTheDocument();
        });

        it('should handle partial dice values in the result', () => {
            // Arrange
            const mockResult = {
                dice1: FishPrawnCrabChoices.rooster as unknown as FishPrawnCrabSymbol,
                dice2: FishPrawnCrabChoices.gourd as unknown as FishPrawnCrabSymbol
                // dice3 is missing
            } as any;

            // Act
            render(<DiceColumn result={mockResult} hasBlink={false} />);

            // Assert
            expect(screen.getByTestId('dice-column')).toBeInTheDocument();
            expect(screen.getByTestId('mock-dice-rooster')).toBeInTheDocument();
            expect(screen.getByTestId('mock-dice-gourd')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-dice-crab')).not.toBeInTheDocument();
        });

        it('should handle empty dice values', () => {
            // Arrange
            const mockResult = {} as any; // No dice values

            // Act
            render(<DiceColumn result={mockResult} hasBlink={false} />);

            // Assert
            expect(screen.getByTestId('dice-column')).toBeInTheDocument();
            expect(screen.queryByTestId(/mock-dice/)).not.toBeInTheDocument();
        });
    });
}); 