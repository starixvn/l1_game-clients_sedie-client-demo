import { sentryManager } from './sentry-manager';
import { SentryLogLevel } from './sentry-types';
import * as Sentry from '@sentry/react';

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

// Mock Sentry
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    captureMessage: jest.fn(),
    captureException: jest.fn(),
    setContext: jest.fn(),
    setTag: jest.fn(),
    setUser: jest.fn()
}));

describe('SentryManager Log Level Filtering', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockClear();

        // Initialize with test config
        sentryManager.initialize({
            dsn: 'test-dsn',
            environment: 'test',
            componentName: 'TestComponent',
            debug: false
        });
    });

    afterEach(() => {
        // Clean up
        sentryManager.close();
    });

    describe('when localStorage log level is set to "error"', () => {
        beforeEach(() => {
            // Mock localStorage to return 'error' log level
            mockLocalStorage.getItem.mockImplementation((key: string) => {
                if (key === 'sentry_log_level') return 'error';
                if (key === 'hot-league-wall-debug-enabled') return 'true';
                if (key === 'sentry_debug_mode') return 'false';
                return null;
            });
        });

        it('should only allow error and fatal log levels', () => {
            // Test that info level is blocked
            expect(sentryManager.isLoggingEnabled('info')).toBe(false);
            expect(sentryManager.isLoggingEnabled('debug')).toBe(false);
            expect(sentryManager.isLoggingEnabled('trace')).toBe(false);
            expect(sentryManager.isLoggingEnabled('warn')).toBe(false);

            // Test that error and fatal levels are allowed
            expect(sentryManager.isLoggingEnabled('error')).toBe(true);
            expect(sentryManager.isLoggingEnabled('fatal')).toBe(true);
        });

        it('should not send info messages to Sentry', () => {
            // Call logInfo - should not send to Sentry
            sentryManager.logInfo('Test info message');

            expect(Sentry.captureMessage).not.toHaveBeenCalled();
        });

        it('should not send warning messages to Sentry', () => {
            // Call logWarning - should not send to Sentry
            sentryManager.logWarning('Test warning message');

            expect(Sentry.captureMessage).not.toHaveBeenCalled();
        });

        it('should send error messages to Sentry', () => {
            // Call logError - should send to Sentry
            sentryManager.logError('Test error message');

            expect(Sentry.captureException).toHaveBeenCalledWith('Test error message', {
                level: 'error',
                tags: { component: 'TestComponent' }
            });
        });

        it('should send fatal messages to Sentry', () => {
            // Call logFatal - should send to Sentry
            sentryManager.logFatal('Test fatal message');

            expect(Sentry.captureException).toHaveBeenCalledWith('Test fatal message', {
                level: 'fatal',
                tags: { component: 'TestComponent' }
            });
        });

        it('should not send workflow info messages to Sentry', () => {
            // Call startWorkflow - should not send to Sentry
            sentryManager.startWorkflow('test-workflow', 'Test Workflow');

            expect(Sentry.captureMessage).not.toHaveBeenCalled();
        });

        it('should not send performance info messages to Sentry', async () => {
            // Call trackPerformance - should not send to Sentry
            await sentryManager.trackPerformance('test-operation', () => Promise.resolve('result'));

            expect(Sentry.captureMessage).not.toHaveBeenCalled();
        });
    });

    describe('when localStorage log level is set to "warn"', () => {
        beforeEach(() => {
            // Mock localStorage to return 'warn' log level
            mockLocalStorage.getItem.mockImplementation((key: string) => {
                if (key === 'sentry_log_level') return 'warn';
                if (key === 'hot-league-wall-debug-enabled') return 'true';
                if (key === 'sentry_debug_mode') return 'false';
                return null;
            });
        });

        it('should allow warn, error, and fatal log levels', () => {
            // Test that info level is blocked
            expect(sentryManager.isLoggingEnabled('info')).toBe(false);
            expect(sentryManager.isLoggingEnabled('debug')).toBe(false);
            expect(sentryManager.isLoggingEnabled('trace')).toBe(false);

            // Test that warn, error, and fatal levels are allowed
            expect(sentryManager.isLoggingEnabled('warn')).toBe(true);
            expect(sentryManager.isLoggingEnabled('error')).toBe(true);
            expect(sentryManager.isLoggingEnabled('fatal')).toBe(true);
        });

        it('should send warning messages to Sentry', () => {
            // Call logWarning - should send to Sentry
            sentryManager.logWarning('Test warning message');

            expect(Sentry.captureMessage).toHaveBeenCalledWith('Test warning message', {
                level: 'warning',
                tags: { component: 'TestComponent' }
            });
        });
    });

    describe('when localStorage log level is set to "info"', () => {
        beforeEach(() => {
            // Mock localStorage to return 'info' log level
            mockLocalStorage.getItem.mockImplementation((key: string) => {
                if (key === 'sentry_log_level') return 'info';
                if (key === 'hot-league-wall-debug-enabled') return 'true';
                if (key === 'sentry_debug_mode') return 'false';
                return null;
            });
        });

        it('should allow info, warn, error, and fatal log levels', () => {
            // Test that debug and trace levels are blocked
            expect(sentryManager.isLoggingEnabled('debug')).toBe(false);
            expect(sentryManager.isLoggingEnabled('trace')).toBe(false);

            // Test that info, warn, error, and fatal levels are allowed
            expect(sentryManager.isLoggingEnabled('info')).toBe(true);
            expect(sentryManager.isLoggingEnabled('warn')).toBe(true);
            expect(sentryManager.isLoggingEnabled('error')).toBe(true);
            expect(sentryManager.isLoggingEnabled('fatal')).toBe(true);
        });

        it('should send info messages to Sentry', () => {
            // Call logInfo - should send to Sentry
            sentryManager.logInfo('Test info message');

            expect(Sentry.captureMessage).toHaveBeenCalledWith('Test info message', {
                level: 'info',
                tags: { component: 'TestComponent' }
            });
        });

        it('should send workflow info messages to Sentry', () => {
            // Call startWorkflow - should send to Sentry
            sentryManager.startWorkflow('test-workflow', 'Test Workflow');

            expect(Sentry.captureMessage).toHaveBeenCalledWith('Workflow started: Test Workflow (ID: test-workflow)', {
                level: 'info',
                tags: { component: 'TestComponent', workflowId: 'test-workflow', workflowName: 'Test Workflow' }
            });
        });
    });

    describe('when Sentry is disabled', () => {
        beforeEach(() => {
            // Mock localStorage to disable Sentry
            mockLocalStorage.getItem.mockImplementation((key: string) => {
                if (key === 'sentry_log_level') return 'error';
                if (key === 'hot-league-wall-debug-enabled') return 'false';
                if (key === 'sentry_debug_mode') return 'false';
                return null;
            });
        });

        it('should not allow any log levels', () => {
            expect(sentryManager.isLoggingEnabled('error')).toBe(false);
            expect(sentryManager.isLoggingEnabled('fatal')).toBe(false);
            expect(sentryManager.isLoggingEnabled('warn')).toBe(false);
            expect(sentryManager.isLoggingEnabled('info')).toBe(false);
            expect(sentryManager.isLoggingEnabled('debug')).toBe(false);
            expect(sentryManager.isLoggingEnabled('trace')).toBe(false);
        });

        it('should not send any messages to Sentry', () => {
            // Call logError - should not send to Sentry
            sentryManager.logError('Test error message');

            expect(Sentry.captureException).not.toHaveBeenCalled();
        });
    });

    describe('legacy log levels', () => {
        it('should handle ERROR_ONLY level correctly', () => {
            mockLocalStorage.getItem.mockImplementation((key: string) => {
                if (key === 'sentry_log_level') return 'error_only';
                if (key === 'hot-league-wall-debug-enabled') return 'true';
                if (key === 'sentry_debug_mode') return 'false';
                return null;
            });

            expect(sentryManager.isLoggingEnabled('info')).toBe(false);
            expect(sentryManager.isLoggingEnabled('warn')).toBe(false);
            expect(sentryManager.isLoggingEnabled('error')).toBe(true);
            expect(sentryManager.isLoggingEnabled('fatal')).toBe(true);
        });

        it('should handle WARNING_AND_ERROR level correctly', () => {
            mockLocalStorage.getItem.mockImplementation((key: string) => {
                if (key === 'sentry_log_level') return 'warning_and_error';
                if (key === 'hot-league-wall-debug-enabled') return 'true';
                if (key === 'sentry_debug_mode') return 'false';
                return null;
            });

            expect(sentryManager.isLoggingEnabled('info')).toBe(false);
            expect(sentryManager.isLoggingEnabled('warn')).toBe(true);
            expect(sentryManager.isLoggingEnabled('error')).toBe(true);
            expect(sentryManager.isLoggingEnabled('fatal')).toBe(true);
        });
    });
}); 