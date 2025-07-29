import {
    SentryManager,
    sentryManager,
    SentryLogLevel,
    WorkflowState,
    configureSentryManager,
    enableSentryManager,
    disableSentryManager,
    setSentryLogLevel,
    startSentryWorkflow,
    updateSentryWorkflow,
    completeSentryWorkflow,
    trackSentryPerformance,
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig
} from './sentry-manager';

// Mock the sg-game-client logger functions
jest.mock('@sg/sg-game-client', () => ({
    SentryLogLevel: {
        TRACE: 'trace',
        DEBUG: 'debug',
        INFO: 'info',
        WARN: 'warn',
        ERROR: 'error',
        FATAL: 'fatal',
        DISABLED: 'disabled',
        ERROR_ONLY: 'error_only',
        WARNING_AND_ERROR: 'warning_and_error',
        ALL: 'all'
    },
    WorkflowState: {
        STARTED: 'started',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
    },
    configureSentry: jest.fn(),
    enableSentry: jest.fn(),
    disableSentry: jest.fn(),
    setLogLevel: jest.fn(),
    configureComponent: jest.fn(),
    startWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    completeWorkflow: jest.fn(),
    trackPerformance: jest.fn(),
    logTrace: jest.fn(),
    logDebug: jest.fn(),
    logInfo: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
    logFatal: jest.fn(),
    isLoggingEnabled: jest.fn(),
    getComponentConfig: jest.fn(),
    getConfig: jest.fn(),
    getActiveWorkflows: jest.fn(),
    cleanup: jest.fn(),
    close: jest.fn(),
    resetLogger: jest.fn()
}));

// Mock appSettings
jest.mock('../app-settings', () => ({
    appSettings: {
        sentry: {
            dsn: 'test-dsn',
            environment: 'test'
        }
    }
}));

describe('SentryManager', () => {
    let mockConsoleError: jest.SpyInstance;
    let mockConsoleWarn: jest.SpyInstance;
    let mockConsoleInfo: jest.SpyInstance;
    let mockConsoleDebug: jest.SpyInstance;
    let mockConsoleTrace: jest.SpyInstance;

    beforeEach(() => {
        // Mock console methods
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
        mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();
        mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
        mockConsoleTrace = jest.spyOn(console, 'trace').mockImplementation();

        // Reset all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore console methods
        mockConsoleError.mockRestore();
        mockConsoleWarn.mockRestore();
        mockConsoleInfo.mockRestore();
        mockConsoleDebug.mockRestore();
        mockConsoleTrace.mockRestore();

        // Clean up SentryManager instance
        sentryManager.close();
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            // Arrange
            const instance1 = SentryManager.getInstance();
            const instance2 = SentryManager.getInstance();

            // Act & Assert
            expect(instance1).toBe(instance2);
        });
    });

    describe('initialize', () => {
        it('should initialize SentryManager with valid configuration', () => {
            // Arrange
            const config = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                logLevel: SentryLogLevel.INFO,
                enableWorkflowTracking: true,
                enablePerformanceTracking: true,
                enableConsoleOverride: true
            };

            // Act
            sentryManager.initialize(config);

            // Assert
            expect(sentryManager.getComponentName()).toBe('TestComponent');
        });

        it('should warn when already initialized', () => {
            // Arrange
            const config = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent'
            };

            // Act
            sentryManager.initialize(config);
            sentryManager.initialize(config); // Second initialization

            // Assert
            expect(mockConsoleWarn).toHaveBeenCalledWith('SentryManager already initialized');
        });

        it('should handle initialization errors gracefully', () => {
            // Arrange
            const config = {
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent'
            };

            // Mock configureSentry to throw an error
            const { configureSentry } = require('@sg/sg-game-client');
            configureSentry.mockImplementation(() => {
                throw new Error('Configuration failed');
            });

            // Act
            sentryManager.initialize(config);

            // Assert
            expect(mockConsoleError).toHaveBeenCalledWith('Failed to initialize Sentry:', expect.any(Error));
        });
    });

    describe('Logging Methods', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent'
            });
        });

        describe('logTrace', () => {
            it('should log trace message when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logTrace } = require('@sg/sg-game-client');
                isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logTrace('Test trace message', { context: 'test' });

                // Assert
                expect(logTrace).toHaveBeenCalledWith('TestComponent', 'Test trace message', { context: 'test' });
            });

            it('should not log when logging is disabled', () => {
                // Arrange
                const { isLoggingEnabled, logTrace } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(false);

                // Act
                sentryManager.logTrace('Test trace message');

                // Assert
                expect(logTrace).not.toHaveBeenCalled();
            });

            it('should handle logging errors gracefully', () => {
                // Arrange
                const { isLoggingEnabled, logTrace } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);
                logTrace.mockImplementation(() => {
                    throw new Error('Logging failed');
                });

                // Act
                sentryManager.logTrace('Test trace message');

                // Assert
                expect(mockConsoleError).toHaveBeenCalledWith('Failed to log trace to Sentry:', expect.any(Error));
            });
        });

        describe('logDebug', () => {
            it('should log debug message when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logDebug } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logDebug('Test debug message', { context: 'test' });

                // Assert
                expect(logDebug).toHaveBeenCalledWith('TestComponent', 'Test debug message', { context: 'test' });
            });
        });

        describe('logInfo', () => {
            it('should log info message when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logInfo } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logInfo('Test info message', { context: 'test' });

                // Assert
                expect(logInfo).toHaveBeenCalledWith('TestComponent', 'Test info message', { context: 'test' });
            });
        });

        describe('logWarning', () => {
            it('should log warning message when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logWarning } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logWarning('Test warning message', { context: 'test' });

                // Assert
                expect(logWarning).toHaveBeenCalledWith('TestComponent', 'Test warning message', { context: 'test' });
            });
        });

        describe('logError', () => {
            it('should log error message when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logError } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);
                const error = new Error('Test error');

                // Act
                sentryManager.logError(error, { context: 'test' });

                // Assert
                expect(logError).toHaveBeenCalledWith('TestComponent', error, { context: 'test' });
            });

            it('should log string error when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logError } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logError('Test error string', { context: 'test' });

                // Assert
                expect(logError).toHaveBeenCalledWith('TestComponent', 'Test error string', { context: 'test' });
            });
        });

        describe('logFatal', () => {
            it('should log fatal message when logging is enabled', () => {
                // Arrange
                const { isLoggingEnabled, logFatal } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);
                const error = new Error('Test fatal error');

                // Act
                sentryManager.logFatal(error, { context: 'test' });

                // Assert
                expect(logFatal).toHaveBeenCalledWith('TestComponent', error, { context: 'test' });
            });
        });
    });

    describe('Workflow Tracking', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                enableWorkflowTracking: true
            });
        });

        describe('startWorkflow', () => {
            it('should start workflow successfully', () => {
                // Arrange
                const { startWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const workflowId = 'test-workflow-1';
                const workflowName = 'Test Workflow';
                const metadata = { test: 'data' };

                // Act
                sentryManager.startWorkflow(workflowId, workflowName, metadata);

                // Assert
                expect(startWorkflow).toHaveBeenCalledWith(workflowId, workflowName, 'TestComponent', metadata);
            });

            it('should handle workflow start errors gracefully', () => {
                // Arrange
                const { startWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                startWorkflow.mockImplementation(() => {
                    throw new Error('Workflow start failed');
                });

                // Act
                sentryManager.startWorkflow('test-workflow', 'Test Workflow');

                // Assert
                expect(mockConsoleError).toHaveBeenCalledWith('Failed to start workflow in Sentry:', expect.any(Error));
            });
        });

        describe('updateWorkflow', () => {
            it('should update workflow successfully', () => {
                // Arrange
                const { updateWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const workflowId = 'test-workflow-1';
                const state = WorkflowState.IN_PROGRESS;
                const metadata = { progress: 50 };

                // Act
                sentryManager.updateWorkflow(workflowId, state, metadata);

                // Assert
                expect(updateWorkflow).toHaveBeenCalledWith(workflowId, state, metadata);
            });
        });

        describe('completeWorkflow', () => {
            it('should complete workflow successfully with success', () => {
                // Arrange
                const { completeWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const workflowId = 'test-workflow-1';
                const metadata = { result: 'success' };

                // Act
                sentryManager.completeWorkflow(workflowId, true, metadata);

                // Assert
                expect(completeWorkflow).toHaveBeenCalledWith(workflowId, true, metadata);
            });

            it('should complete workflow with failure', () => {
                // Arrange
                const { completeWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const workflowId = 'test-workflow-1';
                const metadata = { error: 'failure' };

                // Act
                sentryManager.completeWorkflow(workflowId, false, metadata);

                // Assert
                expect(completeWorkflow).toHaveBeenCalledWith(workflowId, false, metadata);
            });
        });
    });

    describe('Performance Tracking', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                enablePerformanceTracking: true
            });
        });

        it('should track performance successfully', async () => {
            // Arrange
            const { trackPerformance } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
            const mockOperation = jest.fn().mockResolvedValue('test result');
            trackPerformance.mockResolvedValue('test result');

            // Act
            const result = await sentryManager.trackPerformance('Test Operation', mockOperation);

            // Assert
            expect(trackPerformance).toHaveBeenCalledWith('TestComponent', 'Test Operation', mockOperation);
            expect(result).toBe('test result');
        });

        it('should handle performance tracking errors gracefully', async () => {
            // Arrange
            const { trackPerformance } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
            const mockOperation = jest.fn().mockResolvedValue('test result');
            trackPerformance.mockImplementation(() => {
                throw new Error('Performance tracking failed');
            });

            // Act
            const result = await sentryManager.trackPerformance('Test Operation', mockOperation);

            // Assert
            expect(mockConsoleError).toHaveBeenCalledWith('Failed to track performance in Sentry:', expect.any(Error));
            expect(result).toBe('test result');
        });

        it('should return operation result when not initialized', async () => {
            // Arrange
            sentryManager.close();
            const mockOperation = jest.fn().mockResolvedValue('test result');

            // Act
            const result = await sentryManager.trackPerformance('Test Operation', mockOperation);

            // Assert
            expect(result).toBe('test result');
            expect(mockConsoleWarn).toHaveBeenCalledWith('SentryManager not initialized');
        });
    });

    describe('Configuration Methods', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent'
            });
        });

        describe('configureComponent', () => {
            it('should configure component successfully', () => {
                // Arrange
                const { configureComponent } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const config: Partial<ComponentConfig> = {
                    logLevel: SentryLogLevel.DEBUG,
                    enableWorkflowTracking: true
                };

                // Act
                sentryManager.configureComponent(config);

                // Assert
                expect(configureComponent).toHaveBeenCalledWith('TestComponent', config);
            });
        });

        describe('getComponentConfig', () => {
            it('should get component configuration successfully', () => {
                // Arrange
                const { getComponentConfig } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const mockConfig: ComponentConfig = {
                    name: 'TestComponent',
                    logLevel: SentryLogLevel.INFO,
                    enableWorkflowTracking: true,
                    enablePerformanceTracking: true
                };
                getComponentConfig.mockReturnValue(mockConfig);

                // Act
                const result = sentryManager.getComponentConfig();

                // Assert
                expect(getComponentConfig).toHaveBeenCalledWith('TestComponent');
                expect(result).toEqual(mockConfig);
            });

            it('should return undefined when not initialized', () => {
                // Arrange
                sentryManager.close();

                // Act
                const result = sentryManager.getComponentConfig();

                // Assert
                expect(result).toBeUndefined();
                expect(mockConsoleWarn).toHaveBeenCalledWith('SentryManager not initialized');
            });
        });

        describe('isLoggingEnabled', () => {
            it('should check if logging is enabled for a level', () => {
                // Arrange
                const { isLoggingEnabled } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                isLoggingEnabled.mockReturnValue(true);

                // Act
                const result = sentryManager.isLoggingEnabled('info');

                // Assert
                expect(isLoggingEnabled).toHaveBeenCalledWith('TestComponent', 'info');
                expect(result).toBe(true);
            });

            it('should return false when not initialized', () => {
                // Arrange
                sentryManager.close();

                // Act
                const result = sentryManager.isLoggingEnabled('info');

                // Assert
                expect(result).toBe(false);
            });
        });
    });

    describe('Utility Methods', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent'
            });
        });

        describe('getConfig', () => {
            it('should get global configuration successfully', () => {
                // Arrange
                const { getConfig } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const mockConfig: GlobalSentryConfig = {
                    enabled: true,
                    defaultLogLevel: SentryLogLevel.INFO,
                    enableWorkflowTracking: true,
                    enablePerformanceTracking: true,
                    enableConsoleOverride: true,
                    componentConfigs: new Map(),
                    workflowConfigs: new Map()
                };
                getConfig.mockReturnValue(mockConfig);

                // Act
                const result = sentryManager.getConfig();

                // Assert
                expect(getConfig).toHaveBeenCalled();
                expect(result).toEqual(mockConfig);
            });
        });

        describe('getActiveWorkflows', () => {
            it('should get active workflows successfully', () => {
                // Arrange
                const { getActiveWorkflows } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                const mockWorkflows = new Map();
                getActiveWorkflows.mockReturnValue(mockWorkflows);

                // Act
                const result = sentryManager.getActiveWorkflows();

                // Assert
                expect(getActiveWorkflows).toHaveBeenCalled();
                expect(result).toEqual(mockWorkflows);
            });
        });

        describe('cleanup', () => {
            it('should cleanup workflows successfully', () => {
                // Arrange
                const { cleanup } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

                // Act
                sentryManager.cleanup();

                // Assert
                expect(cleanup).toHaveBeenCalled();
            });

            it('should handle cleanup errors gracefully', () => {
                // Arrange
                const { cleanup } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
                cleanup.mockImplementation(() => {
                    throw new Error('Cleanup failed');
                });

                // Act
                sentryManager.cleanup();

                // Assert
                expect(mockConsoleError).toHaveBeenCalledWith('Failed to cleanup Sentry:', expect.any(Error));
            });
        });

        describe('close', () => {
            it('should close SentryManager and restore console methods', () => {
                // Arrange
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalInfo = console.info;
                const originalDebug = console.debug;
                const originalTrace = console.trace;

                // Act
                sentryManager.close();

                // Assert
                expect(console.error).toBe(originalError);
                expect(console.warn).toBe(originalWarn);
                expect(console.info).toBe(originalInfo);
                expect(console.debug).toBe(originalDebug);
                expect(console.trace).toBe(originalTrace);
            });
        });

        describe('getComponentName', () => {
            it('should return the component name', () => {
                // Act
                const result = sentryManager.getComponentName();

                // Assert
                expect(result).toBe('TestComponent');
            });
        });
    });

    describe('Console Override', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                enableConsoleOverride: true
            });
        });

        it('should override console.error for component-specific errors', () => {
            // Arrange
            const { logError } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
            const errorMessage = 'HotLeagueWall component error';

            // Act
            console.error(errorMessage);

            // Assert
            expect(logError).toHaveBeenCalledWith('TestComponent', '[TestComponent] HotLeagueWall component error');
        });

        it('should override console.warn for component-specific warnings', () => {
            // Arrange
            const { logWarning } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
            const warningMessage = 'HotLeagueWall component warning';

            // Act
            console.warn(warningMessage);

            // Assert
            expect(logWarning).toHaveBeenCalledWith('TestComponent', '[TestComponent] HotLeagueWall component warning');
        });

        it('should not override console methods when console override is disabled', () => {
            // Arrange
            sentryManager.close();
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent',
                enableConsoleOverride: false
            });

            const originalError = console.error;
            const originalWarn = console.warn;

            // Act
            console.error('Test error');
            console.warn('Test warning');

            // Assert
            expect(console.error).toBe(originalError);
            expect(console.warn).toBe(originalWarn);
        });
    });

    describe('Convenience Functions', () => {
        beforeEach(() => {
            sentryManager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'TestComponent'
            });
        });

        it('should configure SentryManager using convenience function', () => {
            // Arrange
            const config = {
                dsn: 'test-dsn-2',
                environment: 'test-2',
                componentName: 'TestComponent2'
            };

            // Act
            configureSentryManager(config);

            // Assert
            expect(sentryManager.getComponentName()).toBe('TestComponent2');
        });

        it('should enable Sentry using convenience function', () => {
            // Arrange
            const { enableSentry } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

            // Act
            enableSentryManager();

            // Assert
            expect(enableSentry).toHaveBeenCalled();
        });

        it('should disable Sentry using convenience function', () => {
            // Arrange
            const { disableSentry } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

            // Act
            disableSentryManager();

            // Assert
            expect(disableSentry).toHaveBeenCalled();
        });

        it('should set log level using convenience function', () => {
            // Arrange
            const { setLogLevel } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

            // Act
            setSentryLogLevel(SentryLogLevel.DEBUG);

            // Assert
            expect(setLogLevel).toHaveBeenCalledWith(SentryLogLevel.DEBUG);
        });

        it('should start workflow using convenience function', () => {
            // Arrange
            const { startWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

            // Act
            startSentryWorkflow('test-workflow', 'Test Workflow', { test: 'data' });

            // Assert
            expect(startWorkflow).toHaveBeenCalledWith('test-workflow', 'Test Workflow', 'TestComponent', { test: 'data' });
        });

        it('should update workflow using convenience function', () => {
            // Arrange
            const { updateWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

            // Act
            updateSentryWorkflow('test-workflow', WorkflowState.IN_PROGRESS, { progress: 50 });

            // Assert
            expect(updateWorkflow).toHaveBeenCalledWith('test-workflow', WorkflowState.IN_PROGRESS, { progress: 50 });
        });

        it('should complete workflow using convenience function', () => {
            // Arrange
            const { completeWorkflow } = require('../../../../../../../sg-game-client/src/shared/utils/logger');

            // Act
            completeSentryWorkflow('test-workflow', true, { result: 'success' });

            // Assert
            expect(completeWorkflow).toHaveBeenCalledWith('test-workflow', true, { result: 'success' });
        });

        it('should track performance using convenience function', async () => {
            // Arrange
            const { trackPerformance } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
            const mockOperation = jest.fn().mockResolvedValue('test result');
            trackPerformance.mockResolvedValue('test result');

            // Act
            const result = await trackSentryPerformance('Test Operation', mockOperation);

            // Assert
            expect(trackPerformance).toHaveBeenCalledWith('TestComponent', 'Test Operation', mockOperation);
            expect(result).toBe('test result');
        });
    });
}); 