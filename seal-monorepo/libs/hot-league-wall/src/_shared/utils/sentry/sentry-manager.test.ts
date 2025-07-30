import {
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
    trackSentryPerformance
} from './sentry-manager';
import { SentryLogLevel as SentryLogLevelType, WorkflowState as WorkflowStateType, ComponentConfig as ComponentConfigType, WorkflowConfig as WorkflowConfigType, GlobalSentryConfig as GlobalSentryConfigType } from './sentry-types';

// Import mocked modules
import * as sgGameClient from '@sg/sg-game-client';

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

// Type the mocked module
const mockedSgGameClient = jest.mocked(sgGameClient);

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
            const instance1 = sentryManager;
            const instance2 = sentryManager;

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
            mockedSgGameClient.configureSentry.mockImplementation(() => {
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
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logTrace('Test trace message', { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logTrace).toHaveBeenCalledWith('TestComponent', 'Test trace message', { context: 'test' });
            });

            it('should not log when logging is disabled', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(false);

                // Act
                sentryManager.logTrace('Test trace message');

                // Assert
                expect(mockedSgGameClient.logTrace).not.toHaveBeenCalled();
            });

            it('should handle logging errors gracefully', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);
                mockedSgGameClient.logTrace.mockImplementation(() => {
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
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logDebug('Test debug message', { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logDebug).toHaveBeenCalledWith('TestComponent', 'Test debug message', { context: 'test' });
            });
        });

        describe('logInfo', () => {
            it('should log info message when logging is enabled', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logInfo('Test info message', { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logInfo).toHaveBeenCalledWith('TestComponent', 'Test info message', { context: 'test' });
            });
        });

        describe('logWarning', () => {
            it('should log warning message when logging is enabled', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logWarning('Test warning message', { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logWarning).toHaveBeenCalledWith('TestComponent', 'Test warning message', { context: 'test' });
            });
        });

        describe('logError', () => {
            it('should log error message when logging is enabled', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);
                const error = new Error('Test error');

                // Act
                sentryManager.logError(error, { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logError).toHaveBeenCalledWith('TestComponent', error, { context: 'test' });
            });

            it('should log string error when logging is enabled', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);

                // Act
                sentryManager.logError('Test error string', { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logError).toHaveBeenCalledWith('TestComponent', 'Test error string', { context: 'test' });
            });
        });

        describe('logFatal', () => {
            it('should log fatal message when logging is enabled', () => {
                // Arrange
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);
                const error = new Error('Test fatal error');

                // Act
                sentryManager.logFatal(error, { context: 'test' });

                // Assert
                expect(mockedSgGameClient.logFatal).toHaveBeenCalledWith('TestComponent', error, { context: 'test' });
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
                const workflowId = 'test-workflow-1';
                const workflowName = 'Test Workflow';
                const metadata = { test: 'data' };

                // Act
                sentryManager.startWorkflow(workflowId, workflowName, metadata);

                // Assert
                expect(mockedSgGameClient.startWorkflow).toHaveBeenCalledWith(workflowId, workflowName, 'TestComponent', metadata);
            });

            it('should handle workflow start errors gracefully', () => {
                // Arrange
                mockedSgGameClient.startWorkflow.mockImplementation(() => {
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
                const workflowId = 'test-workflow-1';
                const state = WorkflowState.IN_PROGRESS;
                const metadata = { progress: 50 };

                // Act
                sentryManager.updateWorkflow(workflowId, state, metadata);

                // Assert
                expect(mockedSgGameClient.updateWorkflow).toHaveBeenCalledWith(workflowId, state, metadata);
            });
        });

        describe('completeWorkflow', () => {
            it('should complete workflow successfully with success', () => {
                // Arrange
                const workflowId = 'test-workflow-1';
                const metadata = { result: 'success' };

                // Act
                sentryManager.completeWorkflow(workflowId, true, metadata);

                // Assert
                expect(mockedSgGameClient.completeWorkflow).toHaveBeenCalledWith(workflowId, true, metadata);
            });

            it('should complete workflow with failure', () => {
                // Arrange
                const workflowId = 'test-workflow-1';
                const metadata = { error: 'failure' };

                // Act
                sentryManager.completeWorkflow(workflowId, false, metadata);

                // Assert
                expect(mockedSgGameClient.completeWorkflow).toHaveBeenCalledWith(workflowId, false, metadata);
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
            const mockOperation = jest.fn().mockResolvedValue('test result');
            mockedSgGameClient.trackPerformance.mockResolvedValue('test result');

            // Act
            const result = await sentryManager.trackPerformance('Test Operation', mockOperation);

            // Assert
            expect(mockedSgGameClient.trackPerformance).toHaveBeenCalledWith('TestComponent', 'Test Operation', mockOperation);
            expect(result).toBe('test result');
        });

        it('should handle performance tracking errors gracefully', async () => {
            // Arrange
            const mockOperation = jest.fn().mockResolvedValue('test result');
            mockedSgGameClient.trackPerformance.mockImplementation(() => {
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
                const config: Partial<ComponentConfigType> = {
                    logLevel: SentryLogLevel.DEBUG,
                    enableWorkflowTracking: true
                };

                // Act
                sentryManager.configureComponent(config);

                // Assert
                expect(mockedSgGameClient.configureComponent).toHaveBeenCalledWith('TestComponent', config);
            });
        });

        describe('getComponentConfig', () => {
            it('should get component configuration successfully', () => {
                // Arrange
                const mockConfig: ComponentConfigType = {
                    name: 'TestComponent',
                    logLevel: SentryLogLevel.INFO,
                    enableWorkflowTracking: true,
                    enablePerformanceTracking: true
                };
                mockedSgGameClient.getComponentConfig.mockReturnValue(mockConfig);

                // Act
                const result = sentryManager.getComponentConfig();

                // Assert
                expect(mockedSgGameClient.getComponentConfig).toHaveBeenCalledWith('TestComponent');
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
                mockedSgGameClient.isLoggingEnabled.mockReturnValue(true);

                // Act
                const result = sentryManager.isLoggingEnabled('info');

                // Assert
                expect(mockedSgGameClient.isLoggingEnabled).toHaveBeenCalledWith('TestComponent', 'info');
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
                const mockConfig: GlobalSentryConfigType = {
                    enabled: true,
                    defaultLogLevel: SentryLogLevel.INFO,
                    enableWorkflowTracking: true,
                    enablePerformanceTracking: true,
                    enableConsoleOverride: true,
                    componentConfigs: new Map(),
                    workflowConfigs: new Map()
                };
                mockedSgGameClient.getConfig.mockReturnValue(mockConfig);

                // Act
                const result = sentryManager.getConfig();

                // Assert
                expect(mockedSgGameClient.getConfig).toHaveBeenCalled();
                expect(result).toEqual(mockConfig);
            });
        });

        describe('getActiveWorkflows', () => {
            it('should get active workflows successfully', () => {
                // Arrange
                const mockWorkflows = new Map();
                mockedSgGameClient.getActiveWorkflows.mockReturnValue(mockWorkflows);

                // Act
                const result = sentryManager.getActiveWorkflows();

                // Assert
                expect(mockedSgGameClient.getActiveWorkflows).toHaveBeenCalled();
                expect(result).toEqual(mockWorkflows);
            });
        });

        describe('cleanup', () => {
            it('should cleanup workflows successfully', () => {
                // Arrange

                // Act
                sentryManager.cleanup();

                // Assert
                expect(mockedSgGameClient.cleanup).toHaveBeenCalled();
            });

            it('should handle cleanup errors gracefully', () => {
                // Arrange
                mockedSgGameClient.cleanup.mockImplementation(() => {
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
            const errorMessage = 'HotLeagueWall component error';

            // Act
            console.error(errorMessage);

            // Assert
            expect(mockedSgGameClient.logError).toHaveBeenCalledWith('TestComponent', '[TestComponent] HotLeagueWall component error');
        });

        it('should override console.warn for component-specific warnings', () => {
            // Arrange
            const warningMessage = 'HotLeagueWall component warning';

            // Act
            console.warn(warningMessage);

            // Assert
            expect(mockedSgGameClient.logWarning).toHaveBeenCalledWith('TestComponent', '[TestComponent] HotLeagueWall component warning');
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

            // Act
            enableSentryManager();

            // Assert
            expect(mockedSgGameClient.enableSentry).toHaveBeenCalled();
        });

        it('should disable Sentry using convenience function', () => {
            // Arrange

            // Act
            disableSentryManager();

            // Assert
            expect(mockedSgGameClient.disableSentry).toHaveBeenCalled();
        });

        it('should set log level using convenience function', () => {
            // Arrange

            // Act
            setSentryLogLevel(SentryLogLevel.DEBUG);

            // Assert
            expect(mockedSgGameClient.setLogLevel).toHaveBeenCalledWith(SentryLogLevel.DEBUG);
        });

        it('should start workflow using convenience function', () => {
            // Arrange

            // Act
            startSentryWorkflow('test-workflow', 'Test Workflow', { test: 'data' });

            // Assert
            expect(mockedSgGameClient.startWorkflow).toHaveBeenCalledWith('test-workflow', 'Test Workflow', 'TestComponent', { test: 'data' });
        });

        it('should update workflow using convenience function', () => {
            // Arrange

            // Act
            updateSentryWorkflow('test-workflow', WorkflowState.IN_PROGRESS, { progress: 50 });

            // Assert
            expect(mockedSgGameClient.updateWorkflow).toHaveBeenCalledWith('test-workflow', WorkflowState.IN_PROGRESS, { progress: 50 });
        });

        it('should complete workflow using convenience function', () => {
            // Arrange

            // Act
            completeSentryWorkflow('test-workflow', true, { result: 'success' });

            // Assert
            expect(mockedSgGameClient.completeWorkflow).toHaveBeenCalledWith('test-workflow', true, { result: 'success' });
        });

        it('should track performance using convenience function', async () => {
            // Arrange
            const mockOperation = jest.fn().mockResolvedValue('test result');
            mockedSgGameClient.trackPerformance.mockResolvedValue('test result');

            // Act
            const result = await trackSentryPerformance('Test Operation', mockOperation);

            // Assert
            expect(mockedSgGameClient.trackPerformance).toHaveBeenCalledWith('TestComponent', 'Test Operation', mockOperation);
            expect(result).toBe('test result');
        });
    });
}); 