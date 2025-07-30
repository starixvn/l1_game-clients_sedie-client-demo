import { describe, it, expect, beforeEach, afterEach, vi, jest } from 'vitest';
import SentryBatchManager, {
    sentryBatchManager,
    addBatchedLog,
    flushAllBatches,
    flushComponentBatches,
    getBatchStats,
    cleanupBatchManager
} from './sentry-batch-manager';

// Mock Sentry
vi.mock('@sentry/react', () => ({
    default: {
        captureMessage: vi.fn(),
        captureException: vi.fn()
    },
    captureMessage: vi.fn(),
    captureException: vi.fn()
}));

describe('SentryBatchManager', () => {
    let batchManager: SentryBatchManager;

    beforeEach(() => {
        // Clear any existing instance
        (SentryBatchManager as any).instance = undefined;
        batchManager = SentryBatchManager.getInstance();
        batchManager.initialize();

        // Reset mocks
        vi.clearAllMocks();

        // Mock timers
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanupBatchManager();
        vi.useRealTimers();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance when called multiple times', () => {
            const instance1 = SentryBatchManager.getInstance();
            const instance2 = SentryBatchManager.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('Initialization', () => {
        it('should initialize successfully', () => {
            expect(batchManager).toBeDefined();
            expect(batchManager['isInitialized']).toBe(true);
        });

        it('should not re-initialize if already initialized', () => {
            const consoleSpy = vi.spyOn(console, 'log');

            batchManager.initialize();

            expect(consoleSpy).toHaveBeenCalledWith('SentryBatchManager initialized');
            consoleSpy.mockRestore();
        });
    });

    describe('Adding Logs', () => {
        it('should add logs to component batch', () => {
            addBatchedLog('TestComponent', 'Test message', 'info');

            const stats = getBatchStats();
            expect(stats['TestComponent']).toBeDefined();
            expect(stats['TestComponent'].logCount).toBe(1);
        });

        it('should add multiple logs to the same component', () => {
            addBatchedLog('TestComponent', 'Message 1', 'info');
            addBatchedLog('TestComponent', 'Message 2', 'warn');
            addBatchedLog('TestComponent', 'Message 3', 'error');

            const stats = getBatchStats();
            expect(stats['TestComponent'].logCount).toBe(3);
        });

        it('should handle different components separately', () => {
            addBatchedLog('ComponentA', 'Message A', 'info');
            addBatchedLog('ComponentB', 'Message B', 'warn');

            const stats = getBatchStats();
            expect(stats['ComponentA'].logCount).toBe(1);
            expect(stats['ComponentB'].logCount).toBe(1);
        });

        it('should not add logs if not initialized', () => {
            cleanupBatchManager();
            const consoleSpy = vi.spyOn(console, 'warn');

            addBatchedLog('TestComponent', 'Test message', 'info');

            expect(consoleSpy).toHaveBeenCalledWith('SentryBatchManager not initialized');
            consoleSpy.mockRestore();
        });
    });

    describe('Batch Flushing', () => {
        it('should flush immediately for high priority logs (error, fatal, warn)', async () => {
            const { captureMessage, captureException } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Error message', 'error');

            // Should flush immediately for errors
            await vi.runAllTimersAsync();

            expect(captureException).toHaveBeenCalled();
        });

        it('should flush when batch size reaches maximum', async () => {
            const { captureMessage } = await import('@sentry/react');

            // Set max batch size to 3
            batchManager.setMaxBatchSize(3);

            // Add 3 logs
            addBatchedLog('TestComponent', 'Message 1', 'info');
            addBatchedLog('TestComponent', 'Message 2', 'info');
            addBatchedLog('TestComponent', 'Message 3', 'info');

            // Should flush immediately when batch is full
            await vi.runAllTimersAsync();

            expect(captureMessage).toHaveBeenCalled();
        });

        it('should flush after timeout interval', async () => {
            const { captureMessage } = await import('@sentry/react');

            // Set flush interval to 1 second
            batchManager.setFlushInterval(1000);

            addBatchedLog('TestComponent', 'Test message', 'info');

            // Advance time by 1 second
            vi.advanceTimersByTime(1000);
            await vi.runAllTimersAsync();

            expect(captureMessage).toHaveBeenCalled();
        });

        it('should create summary message with correct format', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Info message', 'info');
            addBatchedLog('TestComponent', 'Warning message', 'warn');
            addBatchedLog('TestComponent', 'Error message', 'error');

            await flushComponentBatches('TestComponent');

            expect(captureMessage).toHaveBeenCalledWith(
                '[TestComponent] Batch Log Summary - Total: 3 (info: 1, warn: 1, error: 1)',
                expect.any(Object)
            );
        });

        it('should determine highest level correctly', async () => {
            const { captureException } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Info message', 'info');
            addBatchedLog('TestComponent', 'Error message', 'error');
            addBatchedLog('TestComponent', 'Debug message', 'debug');

            await flushComponentBatches('TestComponent');

            // Should use error level (highest) for the batch
            expect(captureException).toHaveBeenCalled();
        });
    });

    describe('Batch Context', () => {
        it('should include batch size in context', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Message 1', 'info');
            addBatchedLog('TestComponent', 'Message 2', 'warn');

            await flushComponentBatches('TestComponent');

            const callArgs = (captureMessage as any).mock.calls[0];
            const context = callArgs[1].tags;

            expect(context.batchSize).toBe(2);
        });

        it('should include level-specific information', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Info message', 'info');
            addBatchedLog('TestComponent', 'Warning message', 'warn');

            await flushComponentBatches('TestComponent');

            const callArgs = (captureMessage as any).mock.calls[0];
            const context = callArgs[1].tags;

            expect(context.levels.info.count).toBe(1);
            expect(context.levels.warn.count).toBe(1);
            expect(context.levels.info.messages[0].message).toBe('Info message');
            expect(context.levels.warn.messages[0].message).toBe('Warning message');
        });

        it('should include recent logs (last 10)', async () => {
            const { captureMessage } = await import('@sentry/react');

            // Add 15 logs
            for (let i = 1; i <= 15; i++) {
                addBatchedLog('TestComponent', `Message ${i}`, 'info');
            }

            await flushComponentBatches('TestComponent');

            const callArgs = (captureMessage as any).mock.calls[0];
            const context = callArgs[1].tags;

            expect(context.recentLogs).toHaveLength(10);
            expect(context.recentLogs[9].message).toBe('Message 15'); // Last message
        });
    });

    describe('Manual Flushing', () => {
        it('should flush all batches when flushAll is called', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('ComponentA', 'Message A', 'info');
            addBatchedLog('ComponentB', 'Message B', 'info');

            await flushAllBatches();

            expect(captureMessage).toHaveBeenCalledTimes(2);
        });

        it('should flush specific component when flushComponent is called', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('ComponentA', 'Message A', 'info');
            addBatchedLog('ComponentB', 'Message B', 'info');

            await flushComponentBatches('ComponentA');

            expect(captureMessage).toHaveBeenCalledTimes(1);
            expect(captureMessage).toHaveBeenCalledWith(
                '[ComponentA] Batch Log Summary - Total: 1 (info: 1)',
                expect.any(Object)
            );
        });

        it('should clear batch after flushing', async () => {
            addBatchedLog('TestComponent', 'Test message', 'info');

            let stats = getBatchStats();
            expect(stats['TestComponent'].logCount).toBe(1);

            await flushComponentBatches('TestComponent');

            stats = getBatchStats();
            expect(stats['TestComponent'].logCount).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle Sentry errors gracefully', async () => {
            const { captureMessage } = await import('@sentry/react');
            const consoleSpy = vi.spyOn(console, 'error');

            // Mock Sentry to throw an error
            (captureMessage as any).mockRejectedValue(new Error('Sentry error'));

            addBatchedLog('TestComponent', 'Test message', 'info');
            await flushComponentBatches('TestComponent');

            expect(consoleSpy).toHaveBeenCalledWith('Failed to flush component batch:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should not throw errors during cleanup', () => {
            expect(() => {
                cleanupBatchManager();
            }).not.toThrow();
        });
    });

    describe('Configuration', () => {
        it('should allow setting flush interval', () => {
            batchManager.setFlushInterval(10000);
            expect(batchManager['flushInterval']).toBe(10000);
        });

        it('should allow setting max batch size', () => {
            batchManager.setMaxBatchSize(100);
            expect(batchManager['maxBatchSize']).toBe(100);
        });
    });

    describe('Statistics', () => {
        it('should return correct batch statistics', () => {
            addBatchedLog('ComponentA', 'Message A', 'info');
            addBatchedLog('ComponentB', 'Message B', 'warn');
            addBatchedLog('ComponentB', 'Message C', 'error');

            const stats = getBatchStats();

            expect(stats['ComponentA'].logCount).toBe(1);
            expect(stats['ComponentB'].logCount).toBe(2);
            expect(stats['ComponentA'].lastFlushTime).toBeDefined();
            expect(stats['ComponentB'].lastFlushTime).toBeDefined();
        });

        it('should return empty stats when no batches exist', () => {
            const stats = getBatchStats();
            expect(Object.keys(stats)).toHaveLength(0);
        });
    });

    describe('Level Conversion', () => {
        it('should convert trace and debug to debug level', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Trace message', 'trace');
            addBatchedLog('TestComponent', 'Debug message', 'debug');

            await flushComponentBatches('TestComponent');

            const callArgs = (captureMessage as any).mock.calls[0];
            expect(callArgs[1].level).toBe('debug');
        });

        it('should convert warn to warning level', async () => {
            const { captureMessage } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Warning message', 'warn');

            await flushComponentBatches('TestComponent');

            const callArgs = (captureMessage as any).mock.calls[0];
            expect(callArgs[1].level).toBe('warning');
        });

        it('should convert error and fatal to exception', async () => {
            const { captureException } = await import('@sentry/react');

            addBatchedLog('TestComponent', 'Error message', 'error');

            await flushComponentBatches('TestComponent');

            expect(captureException).toHaveBeenCalled();
        });
    });

    describe('Performance', () => {
        it('should handle large batches efficiently', async () => {
            const { captureMessage } = await import('@sentry/react');

            // Add 100 logs
            for (let i = 1; i <= 100; i++) {
                addBatchedLog('TestComponent', `Message ${i}`, 'info');
            }

            await flushComponentBatches('TestComponent');

            expect(captureMessage).toHaveBeenCalledWith(
                '[TestComponent] Batch Log Summary - Total: 100 (info: 100)',
                expect.any(Object)
            );
        });

        it('should not block on flush operations', async () => {
            const startTime = Date.now();

            addBatchedLog('TestComponent', 'Test message', 'info');
            const flushPromise = flushComponentBatches('TestComponent');

            // Should not block
            expect(Date.now() - startTime).toBeLessThan(100);

            await flushPromise;
        });
    });
}); 