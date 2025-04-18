/**
 * Math utility functions
 */

/**
 * Adds two numbers
 */
export function add(a: number, b: number): number {
    return a + b;
}

/**
 * Subtracts second number from first number
 */
export function subtract(a: number, b: number): number {
    return a - b;
}

/**
 * Multiplies two numbers
 */
export function multiply(a: number, b: number): number {
    return a * b;
}

/**
 * Divides first number by second number
 * Throws error if dividing by zero
 */
export function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
} 