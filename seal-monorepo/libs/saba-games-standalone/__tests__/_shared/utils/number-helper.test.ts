import { formatOdds, getRandomDiceNumbers, calculateTotalDiceNumber } from 'libs/saba-games/src/_shared/utils/number-helper';

describe('number-helper', () => {
    describe('formatOdds', () => {
        it('should format decimal odds correctly', () => {
            // Test basic decimal odds
            expect(formatOdds(2.5)).toBe('1:2.50');
            expect(formatOdds(1.5)).toBe('1:1.50');
            expect(formatOdds(10)).toBe('1:10');
        });

        it('should format fractional odds correctly', () => {
            // Test basic fractional odds
            expect(formatOdds(2.5, true)).toBe('1.50:1');
            expect(formatOdds(1.5, true)).toBe('0.50:1');
            expect(formatOdds(10, true)).toBe('9:1');
        });

        it('should handle string inputs', () => {
            // Test string inputs
            expect(formatOdds('2.5')).toBe('1:2.50');
            expect(formatOdds('1.5', true)).toBe('0.50:1');
        });

        it('should respect decimal places parameter', () => {
            // Test different decimal places
            expect(formatOdds(2.5, false, 1)).toBe('1:2.5');
            expect(formatOdds(2.5, false, 2)).toBe('1:2.50');
            expect(formatOdds(2.5, true, 1)).toBe('1.5:1');
            expect(formatOdds(2.5, true, 2)).toBe('1.50:1');
        });
    });

    describe('getRandomDiceNumbers', () => {
        it('should return an array of 3 numbers', () => {
            const result = getRandomDiceNumbers();
            expect(result).toHaveLength(3);
        });

        it('should return numbers between 1 and 6', () => {
            const result = getRandomDiceNumbers();
            result.forEach(num => {
                expect(num).toBeGreaterThanOrEqual(1);
                expect(num).toBeLessThanOrEqual(6);
            });
        });

        it('should return different numbers on multiple calls', () => {
            // This test might occasionally fail due to randomness
            // but the probability is very low
            const result1 = getRandomDiceNumbers();
            const result2 = getRandomDiceNumbers();
            expect(result1).not.toEqual(result2);
        });

        it('should return integers only', () => {
            const result = getRandomDiceNumbers();
            result.forEach(num => {
                expect(Number.isInteger(num)).toBe(true);
            });
        });
    });

    describe('calculateTotalDiceNumber', () => {
        it('should calculate sum of dice numbers correctly', () => {
            // Test basic sums
            expect(calculateTotalDiceNumber([1, 1, 1])).toBe(3);
            expect(calculateTotalDiceNumber([6, 6, 6])).toBe(18);
            expect(calculateTotalDiceNumber([1, 2, 3])).toBe(6);
        });

        it('should handle empty array', () => {
            expect(calculateTotalDiceNumber([])).toBe(0);
        });

        it('should handle single dice', () => {
            expect(calculateTotalDiceNumber([1])).toBe(1);
            expect(calculateTotalDiceNumber([6])).toBe(6);
        });

        it('should handle two dice', () => {
            expect(calculateTotalDiceNumber([1, 1])).toBe(2);
            expect(calculateTotalDiceNumber([6, 6])).toBe(12);
        });

        it('should handle more than three dice', () => {
            expect(calculateTotalDiceNumber([1, 1, 1, 1])).toBe(4);
            expect(calculateTotalDiceNumber([6, 6, 6, 6])).toBe(24);
        });
    });
}); 
