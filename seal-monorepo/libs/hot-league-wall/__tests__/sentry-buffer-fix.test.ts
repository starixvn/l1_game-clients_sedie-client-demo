import { sentryManager } from '../src/_shared/utils/sentry/sentry-manager';

// Mock Sentry
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    setContext: jest.fn(),
    setTag: jest.fn(),
    setUser: jest.fn(),
    flush: jest.fn(),
    close: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    startTransaction: jest.fn(),
    getCurrentHub: jest.fn(() => ({
        getClient: jest.fn(() => ({
            getOptions: jest.fn(() => ({})),
        })),
    })),
}));

describe('Sentry Buffer Overflow Fix', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the singleton instance
        (sentryManager as any).cleanup();
    });

    describe('Buffer Configuration', () => {
        it('should initialize with buffer overflow prevention settings', () => {
            // Arrange
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };

            // Act
            sentryManager.initialize(config);

            // Assert
            const Sentry = require('@sentry/react');
            expect(Sentry.init).toHaveBeenCalledWith(
                expect.objectContaining({
                    maxBreadcrumbs: 50,
                    sampleRate: 0.1,
                })
            );
        });

        it('should filter out excessive logging events', () => {
            // Arrange
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };
            sentryManager.initialize(config);

            // Act - Send multiple info events
            for (let i = 0; i < 100; i++) {
                sentryManager.logInfo(`Test info message ${i}`);
            }

            // Assert - Most events should be filtered out due to 5% sample rate
            const Sentry = require('@sentry/react');
            // We expect significantly fewer than 100 calls due to filtering
            expect(Sentry.captureMessage).toHaveBeenCalledTimes(expect.any(Number));
            expect(Sentry.captureMessage).toHaveBeenCalledTimes(expect.lessThan(20)); // Should be much less than 100
        });

        it('should handle buffer overflow errors gracefully', () => {
            // Arrange
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };
            sentryManager.initialize(config);

            // Mock Sentry.flush to simulate buffer clearing
            const Sentry = require('@sentry/react');
            Sentry.flush.mockResolvedValue(true);

            // Act - Simulate a buffer overflow error
            const bufferOverflowError = new Error('Skipped sending event because buffer is full');
            sentryManager.logError(bufferOverflowError);

            // Assert - Should attempt to clear buffer
            expect(Sentry.flush).toHaveBeenCalledWith(2000);
        });
    });

    describe('Buffer Clearing', () => {
        it('should have clearBuffer method available', () => {
            // Arrange
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };
            sentryManager.initialize(config);

            // Act & Assert
            expect(typeof (sentryManager as any).clearBuffer).toBe('function');
        });

        it('should call flush when clearBuffer is called', () => {
            // Arrange
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };
            sentryManager.initialize(config);

            const Sentry = require('@sentry/react');
            Sentry.flush.mockResolvedValue(true);

            // Act
            (sentryManager as any).clearBuffer();

            // Assert
            expect(Sentry.flush).toHaveBeenCalledWith(2000);
        });
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting to different log levels', () => {
            // Arrange
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };
            sentryManager.initialize(config);

            const Sentry = require('@sentry/react');

            // Act - Send multiple events of different levels
            for (let i = 0; i < 50; i++) {
                sentryManager.logInfo(`Info message ${i}`);
                sentryManager.logWarning(`Warning message ${i}`);
                sentryManager.logError(`Error message ${i}`);
            }

            // Assert - Different levels should have different filtering rates
            const totalCalls = Sentry.captureMessage.mock.calls.length + Sentry.captureException.mock.calls.length;

            // Should be significantly less than 150 (50 * 3 levels) due to filtering
            expect(totalCalls).toBeLessThan(100);
        });
    });

    describe('Periodic Buffer Clearing', () => {
        it('should set up periodic buffer clearing', () => {
            // Arrange
            jest.useFakeTimers();
            const config = {
                dsn: 'https://test@sentry.io/project',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            };

            // Act
            sentryManager.initialize(config);

            const Sentry = require('@sentry/react');
            Sentry.flush.mockResolvedValue(true);

            // Fast-forward time to trigger periodic clearing
            jest.advanceTimersByTime(30000); // 30 seconds

            // Assert
            expect(Sentry.flush).toHaveBeenCalledWith(2000);

            jest.useRealTimers();
        });
    });
}); 