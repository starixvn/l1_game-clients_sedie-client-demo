import { FunctionUtils } from 'libs/saba-games/src/_shared/utils/funtion-utils';

describe('FunctionUtils', () => {
    describe('delay', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should resolve after specified milliseconds', async () => {
            // Arrange
            const milliseconds = 1000;
            const promise = FunctionUtils.delay(milliseconds);

            // Act
            jest.advanceTimersByTime(milliseconds);

            // Assert
            await expect(promise).resolves.toBeUndefined();
        });

        it('should clear timeout after resolving', async () => {
            // Arrange
            const milliseconds = 1000;
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
            const promise = FunctionUtils.delay(milliseconds);

            // Act
            jest.advanceTimersByTime(milliseconds);
            await promise;

            // Assert
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });

        it('should handle different delay durations', async () => {
            // Arrange
            const durations = [100, 500, 1000];
            const promises = durations.map(duration => FunctionUtils.delay(duration));

            // Act
            durations.forEach(duration => jest.advanceTimersByTime(duration));

            // Assert
            await Promise.all(promises.map(promise => expect(promise).resolves.toBeUndefined()));
        });
    });

    describe('isFunctionNotExistedOrEmpty', () => {
        it('should return true for undefined function', () => {
            // Arrange
            const func = undefined;

            // Act
            const result = FunctionUtils.isFunctionNotExistedOrEmpty(func as unknown as Function);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true for null function', () => {
            // Arrange
            const func = null;

            // Act
            const result = FunctionUtils.isFunctionNotExistedOrEmpty(func as unknown as Function);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true for empty function', () => {
            // Arrange
            const func = () => { };

            // Act
            const result = FunctionUtils.isFunctionNotExistedOrEmpty(func);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true for function with only whitespace', () => {
            // Arrange
            const func = () => { };

            // Act
            const result = FunctionUtils.isFunctionNotExistedOrEmpty(func);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for function with content', () => {
            // Arrange
            const func = () => { return 'test'; };

            // Act
            const result = FunctionUtils.isFunctionNotExistedOrEmpty(func);

            // Assert
            expect(result).toBe(false);
        });

        it('should return false for function with comments only', () => {
            // Arrange
            const func = () => { /* comment */ };

            // Act
            const result = FunctionUtils.isFunctionNotExistedOrEmpty(func);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle arrow functions', () => {
            // Arrange
            const emptyArrow = () => { };
            const nonEmptyArrow = () => { return 'test'; };

            // Act & Assert
            expect(FunctionUtils.isFunctionNotExistedOrEmpty(emptyArrow)).toBe(true);
            expect(FunctionUtils.isFunctionNotExistedOrEmpty(nonEmptyArrow)).toBe(false);
        });

        it('should handle regular functions', () => {
            // Arrange
            function emptyRegular() { }
            function nonEmptyRegular() { return 'test'; }

            // Act & Assert
            expect(FunctionUtils.isFunctionNotExistedOrEmpty(emptyRegular)).toBe(true);
            expect(FunctionUtils.isFunctionNotExistedOrEmpty(nonEmptyRegular)).toBe(false);
        });
    });
}); 
