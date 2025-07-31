import { SentryHelper, SentryLogLevel, SentryManager } from '../index';
import * as Sentry from '@sentry/react';

// Mock Sentry
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    captureMessage: jest.fn(),
    captureException: jest.fn(),
    setContext: jest.fn(),
    setTag: jest.fn(),
    setUser: jest.fn(),
    flush: jest.fn()
}));

describe('Sentry Error-Only Logging', () => {
    let sentryHelper: SentryHelper;
    let sentryManager: SentryManager;
    let mockCaptureMessage: jest.MockedFunction<typeof Sentry.captureMessage>;
    let mockCaptureException: jest.MockedFunction<typeof Sentry.captureException>;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Get mock functions
        mockCaptureMessage = Sentry.captureMessage as jest.MockedFunction<typeof Sentry.captureMessage>;
        mockCaptureException = Sentry.captureException as jest.MockedFunction<typeof Sentry.captureException>;

        // Reset singleton instances
        (SentryHelper as any).instance = undefined;
        (SentryManager as any).instance = undefined;

        // Create fresh instances
        sentryHelper = SentryHelper.getInstance();
        sentryManager = SentryManager.getInstance();

        // Initialize with error-only configuration
        sentryHelper.initialize({
            enabled: true,
            defaultLogLevel: SentryLogLevel.ERROR,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true
        });

        sentryManager.initialize({
            dsn: 'https://test-dsn@sentry.io/test',
            environment: 'test',
            componentName: 'TestComponent',
            debug: false
        });
    });

    afterEach(() => {
        // Cleanup
        sentryHelper.cleanup();
        sentryManager.close();
    });

    describe('Configuration Tests', () => {
        it('should have ERROR as default log level', () => {
            // Arrange
            const config = sentryHelper.getConfig();

            // Assert
            expect(config.defaultLogLevel).toBe(SentryLogLevel.ERROR);
        });

        it('should configure component with ERROR log level', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', {
                name: 'TestComponent',
                logLevel: SentryLogLevel.ERROR
            });

            // Act
            const componentConfig = sentryHelper.getComponentConfig('TestComponent');

            // Assert
            expect(componentConfig?.logLevel).toBe(SentryLogLevel.ERROR);
        });
    });

    describe('Log Level Filtering Tests', () => {
        it('should only enable logging for ERROR and FATAL levels', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', {
                name: 'TestComponent',
                logLevel: SentryLogLevel.ERROR
            });

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'trace')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'debug')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'info')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'warn')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'error')).toBe(true);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'fatal')).toBe(true);
        });

        it('should only enable logging for ERROR_ONLY level', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', {
                name: 'TestComponent',
                logLevel: SentryLogLevel.ERROR_ONLY
            });

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'trace')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'debug')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'info')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'warn')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'error')).toBe(true);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'fatal')).toBe(true);
        });
    });

    describe('SentryManager Logging Tests', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'https://test-dsn@sentry.io/test',
                environment: 'test',
                componentName: 'TestComponent',
                debug: false
            });
        });

        it('should NOT send TRACE logs to Sentry', () => {
            // Act
            sentryManager.logTrace('Test trace message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send DEBUG logs to Sentry', () => {
            // Act
            sentryManager.logDebug('Test debug message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send INFO logs to Sentry', () => {
            // Act
            sentryManager.logInfo('Test info message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send WARNING logs to Sentry', () => {
            // Act
            sentryManager.logWarning('Test warning message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should send ERROR logs to Sentry', () => {
            // Act
            sentryManager.logError('Test error message');

            // Assert
            expect(mockCaptureException).toHaveBeenCalledWith('Test error message', {
                level: 'error',
                tags: { component: 'TestComponent' }
            });
        });

        it('should send FATAL logs to Sentry', () => {
            // Act
            sentryManager.logFatal('Test fatal message');

            // Assert
            expect(mockCaptureException).toHaveBeenCalledWith('Test fatal message', {
                level: 'fatal',
                tags: { component: 'TestComponent' }
            });
        });

        it('should send Error objects to Sentry', () => {
            // Arrange
            const testError = new Error('Test error object');

            // Act
            sentryManager.logError(testError);

            // Assert
            expect(mockCaptureException).toHaveBeenCalledWith(testError, {
                level: 'error',
                tags: { component: 'TestComponent' }
            });
        });
    });

    describe('SentryHelper Logging Tests', () => {
        beforeEach(() => {
            sentryHelper.configureComponent('TestComponent', {
                name: 'TestComponent',
                logLevel: SentryLogLevel.ERROR
            });
        });

        it('should NOT send TRACE logs to Sentry', () => {
            // Act
            sentryHelper.logTrace('TestComponent', 'Test trace message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send DEBUG logs to Sentry', () => {
            // Act
            sentryHelper.logDebug('TestComponent', 'Test debug message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send INFO logs to Sentry', () => {
            // Act
            sentryHelper.logInfo('TestComponent', 'Test info message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send WARNING logs to Sentry', () => {
            // Act
            sentryHelper.logWarning('TestComponent', 'Test warning message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should send ERROR logs to Sentry', () => {
            // Act
            sentryHelper.logError('TestComponent', 'Test error message');

            // Assert
            expect(mockCaptureException).toHaveBeenCalledWith('Test error message', {
                component: 'TestComponent'
            });
        });
    });

    describe('Workflow Tracking Tests', () => {
        it('should NOT send workflow events to Sentry', () => {
            // Act
            sentryHelper.startWorkflow('workflow-1', 'Test Workflow', 'TestComponent');
            sentryHelper.updateWorkflow('workflow-1', 'in_progress' as any);
            sentryHelper.completeWorkflow('workflow-1', true);

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });
    });

    describe('Performance Tracking Tests', () => {
        it('should NOT send performance events to Sentry', async () => {
            // Arrange
            const testOperation = jest.fn().mockResolvedValue('test result');

            // Act
            await sentryHelper.trackPerformance('TestComponent', 'testOperation', testOperation);

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
            expect(testOperation).toHaveBeenCalled();
        });

        it('should send performance errors to Sentry', async () => {
            // Arrange
            const testError = new Error('Performance error');
            const testOperation = jest.fn().mockRejectedValue(testError);

            // Act & Assert
            await expect(sentryHelper.trackPerformance('TestComponent', 'testOperation', testOperation))
                .rejects.toThrow('Performance error');

            expect(mockCaptureException).toHaveBeenCalledWith(testError, {
                level: 'error',
                tags: { component: 'TestComponent', operationName: 'testOperation' }
            });
        });
    });

    describe('Console Override Tests', () => {
        let originalConsole: any;

        beforeEach(() => {
            originalConsole = {
                log: console.log,
                info: console.info,
                warn: console.warn,
                error: console.error,
                debug: console.debug,
                trace: console.trace
            };
        });

        afterEach(() => {
            // Restore original console methods
            console.log = originalConsole.log;
            console.info = originalConsole.info;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
            console.debug = originalConsole.debug;
            console.trace = originalConsole.trace;
        });

        it('should NOT send console.log to Sentry', () => {
            // Act
            console.log('Test log message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send console.info to Sentry', () => {
            // Act
            console.info('Test info message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should NOT send console.warn to Sentry', () => {
            // Act
            console.warn('Test warning message');

            // Assert
            expect(mockCaptureMessage).not.toHaveBeenCalled();
        });

        it('should send console.error to Sentry', () => {
            // Act
            console.error('Test error message');

            // Assert
            expect(mockCaptureException).toHaveBeenCalled();
        });
    });

    describe('LocalStorage Configuration Tests', () => {
        beforeEach(() => {
            // Clear localStorage
            localStorage.clear();
        });

        it('should default to ERROR level when no localStorage config', () => {
            // Act
            const config = sentryHelper.getConfig();

            // Assert
            expect(config.defaultLogLevel).toBe(SentryLogLevel.ERROR);
        });

        it('should respect ERROR level from localStorage', () => {
            // Arrange
            localStorage.setItem('sentry_log_level', 'error');

            // Act
            const config = sentryHelper.getConfig();

            // Assert
            expect(config.defaultLogLevel).toBe(SentryLogLevel.ERROR);
        });

        it('should override INFO level from localStorage to ERROR', () => {
            // Arrange
            localStorage.setItem('sentry_log_level', 'info');

            // Act
            const config = sentryHelper.getConfig();

            // Assert
            expect(config.defaultLogLevel).toBe(SentryLogLevel.ERROR);
        });
    });

    describe('Integration Tests', () => {
        it('should only send ERROR level events to Sentry in complete workflow', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', {
                name: 'TestComponent',
                logLevel: SentryLogLevel.ERROR
            });

            // Act - Simulate typical component usage
            sentryHelper.logTrace('TestComponent', 'Component initialized');
            sentryHelper.logDebug('TestComponent', 'Debug info');
            sentryHelper.logInfo('TestComponent', 'Component rendered');
            sentryHelper.logWarning('TestComponent', 'Warning occurred');
            sentryHelper.logError('TestComponent', 'Error occurred');
            sentryHelper.startWorkflow('workflow-1', 'Test Workflow', 'TestComponent');
            sentryHelper.updateWorkflow('workflow-1', 'in_progress' as any);
            sentryHelper.completeWorkflow('workflow-1', true);

            // Assert - Only error should be sent to Sentry
            expect(mockCaptureMessage).not.toHaveBeenCalled();
            expect(mockCaptureException).toHaveBeenCalledTimes(1);
            expect(mockCaptureException).toHaveBeenCalledWith('Error occurred', {
                component: 'TestComponent'
            });
        });
    });
}); 