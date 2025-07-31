import {
    sentryHelper,
    SentryHelper,
    configureSentry,
    enableSentry,
    disableSentry,
    setLogLevel,
    configureComponent,
    logError,
    logWarning,
    logInfo,
    logDebug,
    logTrace,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance,
    updateSentryConfiguration,
    setLocalStorageConfig,
    setComponentLocalStorageConfig,
    clearLocalStorageConfig,
    clearComponentLocalStorageConfig,
    getAllComponentConfigs
} from '../index';
import { SentryLogLevel, WorkflowState } from '../index';

// Mock SentryManager
jest.mock('../core/sentry-manager', () => {
    const mockSentryManager = {
        getInstance: jest.fn(() => mockSentryManager),
        initialize: jest.fn(),
        logError: jest.fn(),
        logWarning: jest.fn(),
        logInfo: jest.fn(),
        logDebug: jest.fn(),
        logTrace: jest.fn(),
        startWorkflow: jest.fn(),
        updateWorkflow: jest.fn(),
        completeWorkflow: jest.fn(),
        trackPerformance: jest.fn(),
        isManagerInitialized: jest.fn(() => true)
    };
    return mockSentryManager;
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    length: 0,
    key: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('SentryHelper - Circular Dependency Fix', () => {
    beforeEach(() => {
        // Arrange: Reset all mocks and clear localStorage
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        localStorageMock.setItem.mockImplementation(() => undefined);
        localStorageMock.removeItem.mockImplementation(() => undefined);
        localStorageMock.length = 0;
        localStorageMock.key.mockReturnValue(null);

        // Reset the singleton instance
        (sentryHelper as any).cleanup();
    });

    describe('Circular Dependency Resolution', () => {
        it('should initialize without appSettings dependency error', () => {
            // Arrange & Act
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Act
            configureSentry();
            configureComponent('TestComponent', {});

            // This should not throw the circular dependency error
            expect(() => {
                logError('TestComponent', new Error('Test error'));
            }).not.toThrow();

            // Assert
            expect(consoleSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('Cannot access \'appSettings\' before initialization')
            );

            consoleSpy.mockRestore();
        });

        it('should use fallback values when appSettings is not available', () => {
            // Arrange
            configureSentry();
            configureComponent('TestComponent', {});

            // Act
            logError('TestComponent', new Error('Test error'));

            // Assert - Should not throw and should use fallback DSN
            const mockSentryManager = require('../core/sentry-manager');
            expect(mockSentryManager.initialize).toHaveBeenCalledWith(
                expect.objectContaining({
                    dsn: 'https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056',
                    environment: 'LOCAL1'
                })
            );
        });

        it('should update configuration when appSettings becomes available', () => {
            // Arrange
            configureSentry();
            configureComponent('TestComponent', {});

            // Act - First call with fallback values
            logError('TestComponent', new Error('Test error'));

            // Act - Update with new configuration
            const newDsn = 'https://new-dsn@sentry.io/project';
            const newEnvironment = 'production';
            updateSentryConfiguration(newDsn, newEnvironment);

            // Assert
            const mockSentryManager = require('../core/sentry-manager');
            expect(mockSentryManager.initialize).toHaveBeenCalledWith(
                expect.objectContaining({
                    dsn: newDsn,
                    environment: newEnvironment
                })
            );
        });
    });

    describe('Basic Functionality', () => {
        it('should initialize with default configuration', () => {
            // Arrange
            const defaultConfig = {
                enabled: true,
                defaultLogLevel: SentryLogLevel.INFO,
                enableWorkflowTracking: true,
                enablePerformanceTracking: true,
                enableConsoleOverride: true,
                componentConfigs: new Map(),
                workflowConfigs: new Map()
            };

            // Act
            configureSentry();

            // Assert
            const config = sentryHelper.getConfig();
            expect(config.enabled).toBe(defaultConfig.enabled);
            expect(config.defaultLogLevel).toBe(defaultConfig.defaultLogLevel);
            expect(config.enableWorkflowTracking).toBe(defaultConfig.enableWorkflowTracking);
            expect(config.enablePerformanceTracking).toBe(defaultConfig.enablePerformanceTracking);
            expect(config.enableConsoleOverride).toBe(defaultConfig.enableConsoleOverride);
        });

        it('should enable and disable global logging', () => {
            // Arrange
            configureSentry();

            // Act
            enableSentry();
            expect(sentryHelper.getConfig().enabled).toBe(true);

            disableSentry();
            expect(sentryHelper.getConfig().enabled).toBe(false);
        });

        it('should configure component successfully', () => {
            // Arrange
            configureSentry();
            const componentName = 'TestComponent';

            // Act
            configureComponent(componentName, { logLevel: SentryLogLevel.ERROR });

            // Assert
            const config = sentryHelper.getComponentConfig(componentName);
            expect(config).toBeDefined();
            expect(config?.name).toBe(componentName);
            expect(config?.logLevel).toBe(SentryLogLevel.ERROR);
        });
    });

    describe('Logging Methods', () => {
        beforeEach(() => {
            configureSentry();
            configureComponent('TestComponent', { logLevel: SentryLogLevel.TRACE });
        });

        it('should log error when logging is enabled', () => {
            // Arrange
            const componentName = 'TestComponent';
            const error = new Error('Test error');
            const context = { test: 'data' };

            // Act
            logError(componentName, error, context);

            // Assert
            const mockSentryManager = require('../src/_shared/utils/sentry/sentry-manager');
            expect(mockSentryManager.logError).toHaveBeenCalledWith(error, context);
        });

        it('should not log when global logging is disabled', () => {
            // Arrange
            disableSentry();
            const componentName = 'TestComponent';
            const error = new Error('Test error');

            // Act
            logError(componentName, error);

            // Assert
            const mockSentryManager = require('../src/_shared/utils/sentry/sentry-manager');
            expect(mockSentryManager.logError).not.toHaveBeenCalled();
        });
    });

    describe('Workflow Tracking', () => {
        beforeEach(() => {
            configureSentry({ enableWorkflowTracking: true });
        });

        it('should start workflow successfully', () => {
            // Arrange
            const workflowId = 'test-workflow-1';
            const workflowName = 'Test Workflow';
            const componentName = 'TestComponent';
            const metadata = { test: 'data' };

            // Act
            startWorkflow(workflowId, workflowName, componentName, metadata);

            // Assert
            const activeWorkflows = sentryHelper.getActiveWorkflows();
            expect(activeWorkflows.has(workflowId)).toBe(true);

            const mockSentryManager = require('../src/_shared/utils/sentry/sentry-manager');
            expect(mockSentryManager.startWorkflow).toHaveBeenCalledWith(workflowId, workflowName, metadata);
        });

        it('should complete workflow successfully', () => {
            // Arrange
            const workflowId = 'test-workflow-2';
            const workflowName = 'Test Workflow';
            const componentName = 'TestComponent';
            startWorkflow(workflowId, workflowName, componentName);

            const success = true;
            const metadata = { result: 'success' };

            // Act
            completeWorkflow(workflowId, success, metadata);

            // Assert
            const activeWorkflows = sentryHelper.getActiveWorkflows();
            expect(activeWorkflows.has(workflowId)).toBe(false);

            const mockSentryManager = require('../src/_shared/utils/sentry/sentry-manager');
            expect(mockSentryManager.completeWorkflow).toHaveBeenCalledWith(workflowId, success, expect.objectContaining({
                ...metadata,
                duration: expect.any(Number)
            }));
        });
    });

    describe('LocalStorage Configuration', () => {
        it('should set localStorage configuration', () => {
            // Arrange
            const config = {
                logLevel: 'debug',
                enabled: false,
                debugMode: true
            };

            // Act
            setLocalStorageConfig(config);

            // Assert
            expect(localStorageMock.setItem).toHaveBeenCalledWith('sentry_log_level', 'debug');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('hot-league-wall-debug-enabled', 'false');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('sentry_debug_mode', 'true');
        });

        it('should clear localStorage configuration', () => {
            // Arrange
            localStorageMock.length = 1;
            localStorageMock.key.mockReturnValue('sentry_component_log_level_TestComponent');

            // Act
            clearLocalStorageConfig();

            // Assert
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('sentry_log_level');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('hot-league-wall-debug-enabled');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('sentry_debug_mode');
        });
    });

    describe('Singleton Pattern', () => {
        it('should maintain singleton instance', () => {
            // Arrange
            const instance1 = SentryHelper.getInstance();
            const instance2 = SentryHelper.getInstance();

            // Act & Assert
            expect(instance1).toBe(instance2);
        });
    });
}); 