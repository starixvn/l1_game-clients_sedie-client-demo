/**
 * Sample test file for Stryker mutation testing
 */

describe('Sample Test Suite', () => {
    test('true should be true', () => {
        expect(true).toBe(true);
    });

    test('math operations work correctly', () => {
        expect(1 + 1).toBe(2);
        expect(5 - 3).toBe(2);
        expect(2 * 3).toBe(6);
        expect(6 / 2).toBe(3);
    });

    test('string operations work correctly', () => {
        expect('hello' + ' world').toBe('hello world');
        expect('hello world'.split(' ')).toEqual(['hello', 'world']);
    });
});
