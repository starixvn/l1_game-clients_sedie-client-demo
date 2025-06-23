import { FunctionUtils } from '../../../src/_shared/utils/funtion-utils';

describe('FunctionUtils', () => {
    describe('delay', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should delay for the specified milliseconds', async () => {
            const delayTime = 1000;
            const startTime = Date.now();
            
            const delayPromise = FunctionUtils.delay(delayTime);
            
            // Fast-forward time
            jest.advanceTimersByTime(delayTime);
            
            await delayPromise;
            const endTime = Date.now();
            
            // The actual time difference should be minimal since we're using fake timers
            expect(endTime - startTime).toBeGreaterThan(delayTime - 100);
        });

        it('should resolve after the delay', async () => {
            const delayTime = 500;
            let resolved = false;
            
            const delayPromise = FunctionUtils.delay(delayTime).then(() => {
                resolved = true;
            });
            
            // Before advancing time, promise should not be resolved
            expect(resolved).toBe(false);
            
            // Advance time to trigger the delay
            jest.advanceTimersByTime(delayTime);
            
            await delayPromise;
            expect(resolved).toBe(true);
        });

        it('should handle zero delay', async () => {
            const delayPromise = FunctionUtils.delay(0);
            
            // Even with zero delay, it should still be async
            jest.advanceTimersByTime(0);
            
            await delayPromise;
            // Should resolve without error
            expect(true).toBe(true);
        });

        it('should clear timeout after resolution', async () => {
            const delayTime = 1000;
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
            
            const delayPromise = FunctionUtils.delay(delayTime);
            
            jest.advanceTimersByTime(delayTime);
            
            await delayPromise;
            
            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });

        it('should work with multiple concurrent delays', async () => {
            const delay1 = FunctionUtils.delay(100);
            const delay2 = FunctionUtils.delay(200);
            const delay3 = FunctionUtils.delay(300);
            
            const results: number[] = [];
            
            delay1.then(() => results.push(1));
            delay2.then(() => results.push(2));
            delay3.then(() => results.push(3));
            
            // Advance time to trigger all delays
            jest.advanceTimersByTime(300);
            
            await Promise.all([delay1, delay2, delay3]);
            
            expect(results).toEqual([1, 2, 3]);
        });

        it('should handle negative delay values', async () => {
            const delayPromise = FunctionUtils.delay(-100);
            
            // Negative delays should still resolve
            jest.advanceTimersByTime(0);
            
            await delayPromise;
            // Should resolve without error
            expect(true).toBe(true);
        });

        it('should not resolve before the delay time', async () => {
            const delayTime = 1000;
            let resolved = false;
            
            const delayPromise = FunctionUtils.delay(delayTime).then(() => {
                resolved = true;
            });
            
            // Advance time by less than the delay
            jest.advanceTimersByTime(500);
            
            // Should not be resolved yet
            expect(resolved).toBe(false);
            
            // Advance the remaining time
            jest.advanceTimersByTime(500);
            
            await delayPromise;
            expect(resolved).toBe(true);
        });

        it('should work with async/await syntax', async () => {
            const delayTime = 500;
            
            const testFunction = async () => {
                await FunctionUtils.delay(delayTime);
                return 'completed';
            };
            
            const promise = testFunction();
            
            jest.advanceTimersByTime(delayTime);
            
            const result = await promise;
            expect(result).toBe('completed');
        });
    });
}); 