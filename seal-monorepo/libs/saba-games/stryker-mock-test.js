// This file is used to satisfy Jest's requirement for at least one test
// during Stryker mutation testing

// Simple math functions that Stryker can mutate
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
}

// Tests for the functions
describe('Math Functions', () => {
    // Tests for add function
    describe('add', () => {
        it('should add two positive numbers correctly', () => {
            expect(add(2, 3)).toBe(5);
        });

        it('should handle negative numbers', () => {
            expect(add(-2, -3)).toBe(-5);
            expect(add(-2, 3)).toBe(1);
        });

        it('should handle zero', () => {
            expect(add(0, 5)).toBe(5);
            expect(add(5, 0)).toBe(5);
        });
    });

    // Tests for subtract function
    describe('subtract', () => {
        it('should subtract two positive numbers correctly', () => {
            expect(subtract(5, 3)).toBe(2);
        });

        it('should handle negative numbers', () => {
            expect(subtract(-2, -3)).toBe(1);
            expect(subtract(-2, 3)).toBe(-5);
        });

        it('should handle zero', () => {
            expect(subtract(5, 0)).toBe(5);
            expect(subtract(0, 5)).toBe(-5);
        });
    });

    // Tests for multiply function
    describe('multiply', () => {
        it('should multiply two positive numbers correctly', () => {
            expect(multiply(2, 3)).toBe(6);
        });

        it('should handle negative numbers', () => {
            expect(multiply(-2, -3)).toBe(6);
            expect(multiply(-2, 3)).toBe(-6);
        });

        it('should handle zero', () => {
            expect(multiply(5, 0)).toBe(0);
            expect(multiply(0, 5)).toBe(0);
        });
    });

    // Tests for divide function
    describe('divide', () => {
        it('should divide two positive numbers correctly', () => {
            expect(divide(6, 3)).toBe(2);
        });

        it('should handle negative numbers', () => {
            expect(divide(-6, -3)).toBe(2);
            expect(divide(-6, 3)).toBe(-2);
        });

        it('should throw error when dividing by zero', () => {
            expect(() => divide(5, 0)).toThrow('Division by zero');
        });
    });
});
