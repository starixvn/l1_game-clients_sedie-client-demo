/**
 * Counter component unit tests
 * Following AAA (Arrange, Act, Assert) pattern
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Counter } from '../src/components/Counter';

describe('Counter Component', () => {
    // Happy Path Tests
    describe('initialization', () => {
        it('should display the initial count', () => {
            // Arrange
            const initialCount = 5;

            // Act
            render(<Counter initialCount={initialCount} />);
            const countElement = screen.getByTestId('count');

            // Assert
            expect(countElement).toHaveTextContent(`Count: ${initialCount}`);
        });

        it('should default to 0 when no initialCount is provided', () => {
            // Arrange - no initial setup needed

            // Act
            render(<Counter />);
            const countElement = screen.getByTestId('count');

            // Assert
            expect(countElement).toHaveTextContent('Count: 0');
        });
    });

    describe('increment functionality', () => {
        it('should increment the count when + button is clicked', () => {
            // Arrange
            render(<Counter initialCount={0} />);
            const incrementButton = screen.getByTestId('increment');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(incrementButton);

            // Assert
            expect(countElement).toHaveTextContent('Count: 1');
        });

        it('should increment multiple times when clicked multiple times', () => {
            // Arrange
            render(<Counter initialCount={0} />);
            const incrementButton = screen.getByTestId('increment');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);

            // Assert
            expect(countElement).toHaveTextContent('Count: 3');
        });
    });

    describe('decrement functionality', () => {
        it('should decrement the count when - button is clicked', () => {
            // Arrange
            render(<Counter initialCount={5} />);
            const decrementButton = screen.getByTestId('decrement');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(decrementButton);

            // Assert
            expect(countElement).toHaveTextContent('Count: 4');
        });

        it('should handle negative numbers when decremented below zero', () => {
            // Arrange
            render(<Counter initialCount={0} />);
            const decrementButton = screen.getByTestId('decrement');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(decrementButton);

            // Assert
            expect(countElement).toHaveTextContent('Count: -1');
        });
    });

    describe('reset functionality', () => {
        it('should reset the count to 0 when reset button is clicked', () => {
            // Arrange
            render(<Counter initialCount={10} />);
            const resetButton = screen.getByTestId('reset');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(resetButton);

            // Assert
            expect(countElement).toHaveTextContent('Count: 0');
        });

        it('should reset to 0 even when count is already 0', () => {
            // Arrange
            render(<Counter initialCount={0} />);
            const resetButton = screen.getByTestId('reset');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(resetButton);

            // Assert
            expect(countElement).toHaveTextContent('Count: 0');
        });

        it('should reset to 0 after incrementing and decrementing', () => {
            // Arrange
            render(<Counter initialCount={0} />);
            const incrementButton = screen.getByTestId('increment');
            const decrementButton = screen.getByTestId('decrement');
            const resetButton = screen.getByTestId('reset');
            const countElement = screen.getByTestId('count');

            // Act
            fireEvent.click(incrementButton); // Count: 1
            fireEvent.click(incrementButton); // Count: 2
            fireEvent.click(decrementButton); // Count: 1
            fireEvent.click(resetButton);     // Count: 0

            // Assert
            expect(countElement).toHaveTextContent('Count: 0');
        });
    });

    // Edge Cases
    describe('edge cases', () => {
        it('should handle large numbers', () => {
            // Arrange
            render(<Counter initialCount={1000000} />);
            const countElement = screen.getByTestId('count');

            // Act - just rendering with a large initial count

            // Assert
            expect(countElement).toHaveTextContent('Count: 1000000');
        });

        it('should handle negative initial values', () => {
            // Arrange
            const initialCount = -5;

            // Act
            render(<Counter initialCount={initialCount} />);
            const countElement = screen.getByTestId('count');

            // Assert
            expect(countElement).toHaveTextContent(`Count: ${initialCount}`);
        });
    });
}); 