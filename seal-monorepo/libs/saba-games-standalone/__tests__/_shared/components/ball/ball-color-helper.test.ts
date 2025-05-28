import { getBallColor } from "libs/saba-games/src/_shared/components/ball/ball-color-helper";

describe('ball-color-helper', () => {
    describe('getBallColor', () => {
        it('should return RED for even numbers', () => {
            expect(getBallColor(0)).toBe('red');
            expect(getBallColor(2)).toBe('red');
            expect(getBallColor(4)).toBe('red');
            expect(getBallColor(6)).toBe('red');
            expect(getBallColor(8)).toBe('red');
            expect(getBallColor(10)).toBe('red');
        });

        it('should return BLUE for odd numbers', () => {
            expect(getBallColor(1)).toBe('blue');
            expect(getBallColor(3)).toBe('blue');
            expect(getBallColor(5)).toBe('blue');
            expect(getBallColor(7)).toBe('blue');
            expect(getBallColor(9)).toBe('blue');
            expect(getBallColor(11)).toBe('blue');
        });

        it('should handle negative numbers', () => {
            expect(getBallColor(-1)).toBe('blue');
            expect(getBallColor(-2)).toBe('red');
        });

        it('should handle decimal numbers by rounding down', () => {
            expect(getBallColor(1.5)).toBe('blue');  // Math.floor(1.5) = 1
            expect(getBallColor(2.5)).toBe('blue');  // Math.floor(2.5) = 2
            expect(getBallColor(3.5)).toBe('blue');  // Math.floor(3.5) = 3
            expect(getBallColor(4.5)).toBe('blue');  // Math.floor(4.5) = 4
        });
    });
}); 
