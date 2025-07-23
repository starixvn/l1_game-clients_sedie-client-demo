import { formatOdds, getRandomDiceNumbers, calculateTotalDiceNumber } from '../../../src/_shared/utils/number-helper';

describe('Number Helper Utility', () => {
    describe('formatOdds_withValidInputs_shouldWorkCorrectly', () => {
        it('should format decimal odds correctly', () => {
            // Arrange
            const value = 2.5;

            // Act
            const result = formatOdds(value);

            // Assert
            expect(result).toBe('1:2.50');
        });

        it('should format fractional odds correctly', () => {
            // Arrange
            const value = 2.5;

            // Act
            const result = formatOdds(value, true);

            // Assert
            expect(result).toBe('1.50:1');
        });

        it('should handle string input', () => {
            // Arrange
            const value = '3.75';

            // Act
            const result = formatOdds(value);

            // Assert
            expect(result).toBe('1:3.75');
        });

        it('should handle string input with fractional format', () => {
            // Arrange
            const value = '3.75';

            // Act
            const result = formatOdds(value, true);

            // Assert
            expect(result).toBe('2.75:1');
        });

        it('should use custom decimal places', () => {
            // Arrange
            const value = 2.5678;

            // Act
            const result = formatOdds(value, false, 2);

            // Assert
            expect(result).toBe('1:2.57');
        });

        it('should use fractional format with custom decimal places', () => {
            // Arrange
            const value = 2.5678;

            // Act
            const result = formatOdds(value, true, 2);

            // Assert
            expect(result).toBe('1.57:1');
        });
    });

    describe('formatOdds_edgeCases_shouldHandleGracefully', () => {
        it('should handle zero value', () => {
            // Arrange
            const value = 0;

            // Act
            const result = formatOdds(value);

            // Assert
            expect(result).toBe('1:0.00');
        });

        it('should handle negative value', () => {
            // Arrange
            const value = -1.5;

            // Act
            const result = formatOdds(value);

            // Assert
            expect(result).toBe('1:-1.50');
        });

        it('should handle very large numbers', () => {
            // Arrange
            const value = 999999.99;

            // Act
            const result = formatOdds(value);

            // Assert
            expect(result).toBe('1:999,999.99');
        });

        it('should handle very small numbers', () => {
            // Arrange
            const value = 0.001;

            // Act
            const result = formatOdds(value, false, 2);

            // Assert
            expect(result).toBe('1:0.00');
        });

        it('should handle integer values', () => {
            // Arrange
            const value = 5;

            // Act
            const result = formatOdds(value);

            // Assert
            expect(result).toBe('1:5');
        });

        it('should handle integer values with fractional format', () => {
            // Arrange
            const value = 5;

            // Act
            const result = formatOdds(value, true);

            // Assert
            expect(result).toBe('4:1');
        });
    });

    describe('getRandomDiceNumbers_withValidCalls_shouldWorkCorrectly', () => {
        it('should return array of 3 numbers', () => {
            // Arrange
            // Act
            const result = getRandomDiceNumbers();

            // Assert
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(3);
        });

        it('should return numbers between 1 and 6', () => {
            // Arrange
            // Act
            const result = getRandomDiceNumbers();

            // Assert
            result.forEach(num => {
                expect(num).toBeGreaterThanOrEqual(1);
                expect(num).toBeLessThanOrEqual(6);
            });
        });

        it('should return integers', () => {
            // Arrange
            // Act
            const result = getRandomDiceNumbers();

            // Assert
            result.forEach(num => {
                expect(Number.isInteger(num)).toBe(true);
            });
        });

        it('should return different numbers on multiple calls', () => {
            // Arrange
            // Act
            const result1 = getRandomDiceNumbers();
            const result2 = getRandomDiceNumbers();

            // Assert
            // Note: This test might occasionally fail due to randomness
            // In a real scenario, you might want to mock Math.random
            expect(result1).not.toEqual(result2);
        });
    });

    describe('getRandomDiceNumbers_edgeCases_shouldHandleGracefully', () => {
        it('should always return valid dice numbers', () => {
            // Arrange
            const iterations = 1000;

            // Act & Assert
            for (let i = 0; i < iterations; i++) {
                const result = getRandomDiceNumbers();
                expect(result).toHaveLength(3);
                result.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(1);
                    expect(num).toBeLessThanOrEqual(6);
                    expect(Number.isInteger(num)).toBe(true);
                });
            }
        });

        it('should handle multiple rapid calls', () => {
            // Arrange
            const calls = 100;

            // Act
            const results = Array.from({ length: calls }, () => getRandomDiceNumbers());

            // Assert
            results.forEach(result => {
                expect(result).toHaveLength(3);
                result.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(1);
                    expect(num).toBeLessThanOrEqual(6);
                });
            });
        });
    });

    describe('calculateTotalDiceNumber_withValidInputs_shouldWorkCorrectly', () => {
        it('should calculate sum of dice numbers', () => {
            // Arrange
            const diceNumbers = [1, 2, 3];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(6);
        });

        it('should handle all ones', () => {
            // Arrange
            const diceNumbers = [1, 1, 1];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(3);
        });

        it('should handle all sixes', () => {
            // Arrange
            const diceNumbers = [6, 6, 6];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(18);
        });

        it('should handle mixed numbers', () => {
            // Arrange
            const diceNumbers = [2, 4, 6];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(12);
        });

        it('should handle zero values', () => {
            // Arrange
            const diceNumbers = [0, 0, 0];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(0);
        });
    });

    describe('calculateTotalDiceNumber_edgeCases_shouldHandleGracefully', () => {
        it('should handle empty array', () => {
            // Arrange
            const diceNumbers: number[] = [];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(0);
        });

        it('should handle single number', () => {
            // Arrange
            const diceNumbers = [5];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(5);
        });

        it('should handle large array', () => {
            // Arrange
            const diceNumbers = [1, 2, 3, 4, 5, 6];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(21);
        });

        it('should handle negative numbers', () => {
            // Arrange
            const diceNumbers = [-1, -2, -3];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(-6);
        });

        it('should handle decimal numbers', () => {
            // Arrange
            const diceNumbers = [1.5, 2.5, 3.5];

            // Act
            const result = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(result).toBe(7.5);
        });
    });

    describe('numberHelper_integration_shouldWorkWithRealData', () => {
        it('should work with complete dice game flow', () => {
            // Arrange
            // Act
            const diceNumbers = getRandomDiceNumbers();
            const total = calculateTotalDiceNumber(diceNumbers);
            const odds = formatOdds(total / 3); // Average as odds

            // Assert
            expect(diceNumbers).toHaveLength(3);
            expect(total).toBeGreaterThanOrEqual(3); // Minimum possible (1+1+1)
            expect(total).toBeLessThanOrEqual(18); // Maximum possible (6+6+6)
            expect(odds).toMatch(/^1:\d+(\.\d+)?$/);
        });

        it('should work with betting odds calculation', () => {
            // Arrange
            const betAmount = 100;
            const oddsValue = 2.5;

            // Act
            const decimalOdds = formatOdds(oddsValue);
            const fractionalOdds = formatOdds(oddsValue, true);

            // Assert
            expect(decimalOdds).toBe('1:2.50');
            expect(fractionalOdds).toBe('1.50:1');
        });

        it('should work with multiple dice rolls', () => {
            // Arrange
            const rolls = 5;

            // Act
            const allRolls = Array.from({ length: rolls }, () => getRandomDiceNumbers());
            const allTotals = allRolls.map(roll => calculateTotalDiceNumber(roll));

            // Assert
            expect(allRolls).toHaveLength(rolls);
            allRolls.forEach(roll => {
                expect(roll).toHaveLength(3);
                roll.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(1);
                    expect(num).toBeLessThanOrEqual(6);
                });
            });
            allTotals.forEach(total => {
                expect(total).toBeGreaterThanOrEqual(3);
                expect(total).toBeLessThanOrEqual(18);
            });
        });
    });

    describe('numberHelper_performance_shouldBeEfficient', () => {
        it('should handle large number of dice calculations efficiently', () => {
            // Arrange
            const iterations = 10000;

            // Act
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                const diceNumbers = getRandomDiceNumbers();
                calculateTotalDiceNumber(diceNumbers);
            }
            const endTime = performance.now();

            // Assert
            expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
        });

        it('should handle large number of odds calculations efficiently', () => {
            // Arrange
            const iterations = 10000;

            // Act
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                formatOdds(Math.random() * 10);
            }
            const endTime = performance.now();

            // Assert
            expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds
        });
    });

    describe('numberHelper_accessibility_shouldBeAccessible', () => {
        it('should have proper function signatures', () => {
            // Assert
            expect(typeof formatOdds).toBe('function');
            expect(typeof getRandomDiceNumbers).toBe('function');
            expect(typeof calculateTotalDiceNumber).toBe('function');
        });

        it('should return expected data types', () => {
            // Arrange
            const diceNumbers = [1, 2, 3];

            // Act
            const oddsResult = formatOdds(2.5);
            const randomResult = getRandomDiceNumbers();
            const totalResult = calculateTotalDiceNumber(diceNumbers);

            // Assert
            expect(typeof oddsResult).toBe('string');
            expect(Array.isArray(randomResult)).toBe(true);
            expect(typeof totalResult).toBe('number');
        });
    });

    describe('numberHelper_constants_shouldBeCorrect', () => {
        it('should have consistent dice range', () => {
            // Arrange
            const iterations = 1000;

            // Act & Assert
            for (let i = 0; i < iterations; i++) {
                const result = getRandomDiceNumbers();
                result.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(1);
                    expect(num).toBeLessThanOrEqual(6);
                });
            }
        });

        it('should have consistent array length', () => {
            // Arrange
            const iterations = 100;

            // Act & Assert
            for (let i = 0; i < iterations; i++) {
                const result = getRandomDiceNumbers();
                expect(result).toHaveLength(3);
            }
        });
    });
}); 