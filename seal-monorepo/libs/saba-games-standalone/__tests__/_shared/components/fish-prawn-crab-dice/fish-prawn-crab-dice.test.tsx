import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FishPrawnCrabDice, { FishPrawnCrabSymbol, diceValueToSymbol } from '../../../../src/_shared/components/fish-prawn-crab-dice';
import { Size } from '../../../../src/_shared/constants';

describe('FishPrawnCrabDice', () => {
    // Happy path tests
    it('should render fish symbol correctly', () => {
        // Arrange
        const symbol = FishPrawnCrabSymbol.FISH;

        // Act
        render(<FishPrawnCrabDice symbol={symbol} />);
        const diceImage = screen.getByAltText('fish-prawn-crab-fish');

        // Assert
        expect(diceImage).toBeInTheDocument();
        expect(diceImage).toHaveAttribute('class', 'dice-large');
    });

    it('should render with medium size when specified', () => {
        // Arrange
        const symbol = FishPrawnCrabSymbol.PRAWN;
        const size = Size.medium;

        // Act
        render(<FishPrawnCrabDice symbol={symbol} size={size} />);
        const diceImage = screen.getByAltText('fish-prawn-crab-prawn');

        // Assert
        expect(diceImage).toBeInTheDocument();
        expect(diceImage).toHaveAttribute('class', 'dice-medium');
    });

    it('should render with small size when specified', () => {
        // Arrange
        const symbol = FishPrawnCrabSymbol.CRAB;
        const size = Size.small;

        // Act
        render(<FishPrawnCrabDice symbol={symbol} size={size} />);
        const diceImage = screen.getByAltText('fish-prawn-crab-crab');

        // Assert
        expect(diceImage).toBeInTheDocument();
        expect(diceImage).toHaveAttribute('class', 'dice-small');
    });

    // Edge case tests
    it('should render empty image when symbol is EMPTY', () => {
        // Arrange
        const symbol = FishPrawnCrabSymbol.EMPTY;

        // Act
        render(<FishPrawnCrabDice symbol={symbol} />);
        const diceImage = screen.getByAltText('fish-prawn-crab-empty');

        // Assert
        expect(diceImage).toBeInTheDocument();
    });

    // Testing all symbols
    it.each([
        [FishPrawnCrabSymbol.FISH, 'fish-prawn-crab-fish'],
        [FishPrawnCrabSymbol.PRAWN, 'fish-prawn-crab-prawn'],
        [FishPrawnCrabSymbol.CRAB, 'fish-prawn-crab-crab'],
        [FishPrawnCrabSymbol.GOURD, 'fish-prawn-crab-gourd'],
        [FishPrawnCrabSymbol.ROOSTER, 'fish-prawn-crab-rooster'],
        [FishPrawnCrabSymbol.STAG, 'fish-prawn-crab-stag'],
    ])('should render %s symbol with correct alt text', (symbol, expectedAlt) => {
        // Arrange & Act
        render(<FishPrawnCrabDice symbol={symbol} />);

        // Assert
        const diceImage = screen.getByAltText(expectedAlt);
        expect(diceImage).toBeInTheDocument();
    });

    // Test diceValueToSymbol conversion function
    describe('diceValueToSymbol', () => {
        it.each([
            [1, FishPrawnCrabSymbol.FISH],
            [2, FishPrawnCrabSymbol.CRAB],
            [3, FishPrawnCrabSymbol.PRAWN],
            [4, FishPrawnCrabSymbol.GOURD],
            [5, FishPrawnCrabSymbol.ROOSTER],
            [6, FishPrawnCrabSymbol.STAG],
            [7, FishPrawnCrabSymbol.EMPTY], // Invalid input
            [0, FishPrawnCrabSymbol.EMPTY], // Invalid input
        ])('should convert dice value %i to correct symbol', (diceValue, expectedSymbol) => {
            // Act
            const result = diceValueToSymbol(diceValue);

            // Assert
            expect(result).toBe(expectedSymbol);
        });
    });
}); 