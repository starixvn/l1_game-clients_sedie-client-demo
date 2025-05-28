import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedDice, { AnimatedDiceSet } from '../../../../src/_shared/components/fish-prawn-crab-dice/animated-dice';
import { FishPrawnCrabSymbol } from '../../../../src/_shared/components/fish-prawn-crab-dice';

// Mock setTimeout and setInterval for faster testing
jest.useFakeTimers();

describe('AnimatedDice', () => {
    // Happy path - Single dice animation
    it('should render with initial empty symbol and animate to final symbol', async () => {
        // Arrange
        const finalSymbol = FishPrawnCrabSymbol.FISH;
        const onAnimationComplete = jest.fn();

        // Act
        render(
            <AnimatedDice
                finalSymbol={finalSymbol}
                animationDuration={500} // Shorter for tests
                onAnimationComplete={onAnimationComplete}
            />
        );

        // Verify initial state shows empty or a random symbol (not guaranteed to be final)
        const initialDice = screen.getByRole('img');
        expect(initialDice).toBeInTheDocument();

        // Fast-forward through all timers
        act(() => {
            jest.advanceTimersByTime(600);
        });

        // Assert
        await waitFor(() => {
            expect(onAnimationComplete).toHaveBeenCalled();
            // Final state should show the final symbol
            const finalDice = screen.getByRole('img');
            expect(finalDice).toHaveAttribute('alt', expect.stringContaining('fish'));
        });
    });

    // Edge case - Animation with delay
    it('should start animation after specified delay', async () => {
        // Arrange
        const finalSymbol = FishPrawnCrabSymbol.CRAB;
        const delayStart = 300;
        const onAnimationComplete = jest.fn();

        // Act
        render(
            <AnimatedDice
                finalSymbol={finalSymbol}
                animationDuration={500}
                delayStart={delayStart}
                onAnimationComplete={onAnimationComplete}
            />
        );

        // Fast-forward through delay only
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // Assert animation has not completed
        expect(onAnimationComplete).not.toHaveBeenCalled();

        // Fast-forward through remaining time
        act(() => {
            jest.advanceTimersByTime(700);
        });

        // Assert animation completed
        await waitFor(() => {
            expect(onAnimationComplete).toHaveBeenCalled();
        });
    });

});

describe('AnimatedDiceSet', () => {
    // Happy path - Multiple dice animation
    it('should render a set of animated dice and trigger completion callback', async () => {
        // Arrange
        const finalSymbols = [
            FishPrawnCrabSymbol.FISH,
            FishPrawnCrabSymbol.CRAB,
            FishPrawnCrabSymbol.PRAWN
        ];
        const onAllAnimationsComplete = jest.fn();

        // Act
        render(
            <AnimatedDiceSet
                finalSymbols={finalSymbols}
                animationDuration={500}
                onAllAnimationsComplete={onAllAnimationsComplete}
                staggerDelay={100}
            />
        );

        // Should have 3 dice
        const initialDice = screen.getAllByRole('img');
        expect(initialDice).toHaveLength(3);

        // Fast-forward time to complete all animations
        // Need to account for animation duration + delay for all dice
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Assert
        await waitFor(() => {
            expect(onAllAnimationsComplete).toHaveBeenCalled();

            // Verify final state shows all expected symbols
            const finalDice = screen.getAllByRole('img');
            expect(finalDice[0]).toHaveAttribute('alt', expect.stringContaining('fish'));
            expect(finalDice[1]).toHaveAttribute('alt', expect.stringContaining('crab'));
            expect(finalDice[2]).toHaveAttribute('alt', expect.stringContaining('prawn'));
        });
    });

    // Edge case - Empty dice set
    it('should handle empty finalSymbols array', () => {
        // Arrange
        const finalSymbols: FishPrawnCrabSymbol[] = [];
        const onAllAnimationsComplete = jest.fn();

        // Act
        render(
            <AnimatedDiceSet
                finalSymbols={finalSymbols}
                onAllAnimationsComplete={onAllAnimationsComplete}
            />
        );

        // Assert - No dice should be rendered
        const dice = screen.queryAllByRole('img');
        expect(dice).toHaveLength(0);

        // Animation complete callback should be triggered immediately
        expect(onAllAnimationsComplete).toHaveBeenCalled();
    });
}); 