import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSSOSimulator } from '../src/_shared/components/sso-control-simulator/use-sso-simulator';

// Test component to use the hook
const TestComponent = () => {
    const ssoSimulator = useSSOSimulator();

    return (
        <div>
            <div data-testid="failure-mode">{ssoSimulator.isFailureMode.toString()}</div>
            <div data-testid="failed-token">{ssoSimulator.getFailedToken() || 'null'}</div>
            <button
                data-testid="toggle-failure"
                onClick={ssoSimulator.toggleFailureMode}
            >
                Toggle Failure
            </button>
            <button
                data-testid="reset-count"
                onClick={ssoSimulator.resetFailureCount}
            >
                Reset Count
            </button>
        </div>
    );
};

describe('SSO Simulator Failed Token Generation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Failed Token Generation', () => {
        it('should generate a random failed token when failure mode is enabled', () => {
            // Arrange
            render(<TestComponent />);

            // Act
            const toggleButton = screen.getByTestId('toggle-failure');
            fireEvent.click(toggleButton);

            // Assert
            expect(screen.getByTestId('failure-mode')).toHaveTextContent('true');

            const failedToken = screen.getByTestId('failed-token').textContent;
            expect(failedToken).not.toBe('null');
            expect(failedToken).toMatch(/^INVALID_TOKEN_\d+_[a-z0-9]+$/);
        });

        it('should return null when failure mode is disabled', () => {
            // Arrange
            render(<TestComponent />);

            // Act & Assert
            expect(screen.getByTestId('failure-mode')).toHaveTextContent('false');
            expect(screen.getByTestId('failed-token')).toHaveTextContent('null');
        });

        it('should generate different tokens on each toggle', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act: Enable failure mode
            fireEvent.click(toggleButton);
            const firstToken = screen.getByTestId('failed-token').textContent;

            // Act: Disable and re-enable failure mode
            fireEvent.click(toggleButton);
            fireEvent.click(toggleButton);
            const secondToken = screen.getByTestId('failed-token').textContent;

            // Assert
            expect(firstToken).not.toBe(secondToken);
            expect(firstToken).toMatch(/^INVALID_TOKEN_\d+_[a-z0-9]+$/);
            expect(secondToken).toMatch(/^INVALID_TOKEN_\d+_[a-z0-9]+$/);
        });

        it('should include timestamp in generated token', () => {
            // Arrange
            const startTime = Date.now();
            render(<TestComponent />);

            // Act
            const toggleButton = screen.getByTestId('toggle-failure');
            fireEvent.click(toggleButton);

            // Assert
            const failedToken = screen.getByTestId('failed-token').textContent;
            const tokenParts = failedToken!.split('_');
            const timestamp = parseInt(tokenParts[2]);

            expect(timestamp).toBeGreaterThanOrEqual(startTime);
            expect(timestamp).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('Token Format Validation', () => {
        it('should generate tokens with correct format', () => {
            // Arrange
            render(<TestComponent />);

            // Act
            const toggleButton = screen.getByTestId('toggle-failure');
            fireEvent.click(toggleButton);

            // Assert
            const failedToken = screen.getByTestId('failed-token').textContent;
            const tokenRegex = /^INVALID_TOKEN_\d+_[a-z0-9]{13}$/;
            expect(failedToken).toMatch(tokenRegex);
        });

        it('should generate tokens with sufficient randomness', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');
            const tokens = new Set();

            // Act: Generate multiple tokens
            for (let i = 0; i < 10; i++) {
                fireEvent.click(toggleButton); // Enable
                const token = screen.getByTestId('failed-token').textContent;
                tokens.add(token);
                fireEvent.click(toggleButton); // Disable
            }

            // Assert: Should have unique tokens (allowing for some timestamp overlap)
            expect(tokens.size).toBeGreaterThan(5);
        });
    });

    describe('State Management', () => {
        it('should maintain failed token when toggling other states', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');
            const resetButton = screen.getByTestId('reset-count');

            // Act: Enable failure mode
            fireEvent.click(toggleButton);
            const originalToken = screen.getByTestId('failed-token').textContent;

            // Act: Reset count (should not affect token)
            fireEvent.click(resetButton);

            // Assert
            expect(screen.getByTestId('failed-token')).toHaveTextContent(originalToken!);
            expect(screen.getByTestId('failure-mode')).toHaveTextContent('true');
        });

        it('should clear failed token when disabling failure mode', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act: Enable then disable failure mode
            fireEvent.click(toggleButton);
            fireEvent.click(toggleButton);

            // Assert
            expect(screen.getByTestId('failure-mode')).toHaveTextContent('false');
            expect(screen.getByTestId('failed-token')).toHaveTextContent('null');
        });
    });

    describe('Integration with App Component', () => {
        it('should provide failed token when in failure mode', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act: Enable failure mode
            fireEvent.click(toggleButton);

            // Assert: Should provide a failed token
            const failedToken = screen.getByTestId('failed-token').textContent;
            expect(failedToken).not.toBe('null');
            expect(failedToken).toMatch(/^INVALID_TOKEN_\d+_[a-z0-9]+$/);
        });

        it('should return null when not in failure mode', () => {
            // Arrange
            render(<TestComponent />);

            // Act & Assert: Should return null when failure mode is disabled
            expect(screen.getByTestId('failed-token')).toHaveTextContent('null');
        });
    });

    describe('Performance and Timing', () => {
        it('should generate tokens quickly', () => {
            // Arrange
            const startTime = performance.now();
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act
            fireEvent.click(toggleButton);

            // Assert
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Token generation should be very fast (< 10ms)
            expect(duration).toBeLessThan(10);
        });

        it('should handle rapid toggling without errors', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act: Rapid toggling
            for (let i = 0; i < 20; i++) {
                fireEvent.click(toggleButton);
            }

            // Assert: Should not throw errors and maintain consistent state
            expect(screen.getByTestId('failure-mode')).toHaveTextContent('false');
            expect(screen.getByTestId('failed-token')).toHaveTextContent('null');
        });
    });

    describe('Edge Cases', () => {
        it('should handle concurrent token generation', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act: Enable failure mode multiple times rapidly
            act(() => {
                fireEvent.click(toggleButton);
                fireEvent.click(toggleButton);
                fireEvent.click(toggleButton);
            });

            // Assert: Should maintain consistent state
            expect(screen.getByTestId('failure-mode')).toHaveTextContent('true');
            expect(screen.getByTestId('failed-token')).not.toHaveTextContent('null');
        });

        it('should handle very long random strings', () => {
            // Arrange
            render(<TestComponent />);
            const toggleButton = screen.getByTestId('toggle-failure');

            // Act
            fireEvent.click(toggleButton);

            // Assert
            const failedToken = screen.getByTestId('failed-token').textContent;
            expect(failedToken!.length).toBeLessThan(100); // Reasonable length
        });
    });
}); 