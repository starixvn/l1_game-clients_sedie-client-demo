import { SentryManagerRefactored } from '../core/sentry-manager-refactored';
import { SentryHelperRefactored } from '../utils/sentry-helper-refactored';
import { SentryLogger } from '../core/logger/sentry-logger';
import { WorkflowTracker } from '../core/workflow/workflow-tracker';
import { ConsoleOverride } from '../core/console/console-override';
import { SentryConfigStorage } from '../core/storage/local-storage';
import { LocalStorage } from '../core/storage/local-storage';
import { SentryLogLevel, WorkflowState } from '../core/sentry-types';

// Mock Sentry
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
    close: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Sentry Refactored - SOLID Principles Implementation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset singleton instances
        (SentryManagerRefactored as any).instance = undefined;
        (SentryHelperRefactored as any).instance = undefined;
    });

    describe('SentryManagerRefactored', () => {
        describe('Single Responsibility Principle', () => {
            it('should delegate logging to SentryLogger', () => {
                // Arrange
                const manager = SentryManagerRefactored.getInstance();
                const mockLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };

                // Act
                manager['logger'] = mockLogger;
                manager.logInfo('test message');
                manager.logError('test error');

                // Assert
                expect(mockLogger.logInfo).toHaveBeenCalledWith('test message', undefined);
                expect(mockLogger.logError).toHaveBeenCalledWith('test error', undefined);
            });

            it('should delegate workflow tracking to WorkflowTracker', () => {
                // Arrange
                const manager = SentryManagerRefactored.getInstance();
                const mockTracker = {
                    startWorkflow: jest.fn(),
                    updateWorkflow: jest.fn(),
                    completeWorkflow: jest.fn(),
                    trackPerformance: jest.fn()
                };

                // Act
                manager['workflowTracker'] = mockTracker;
                manager.startWorkflow('test-id', 'test-workflow');
                manager.updateWorkflow('test-id', WorkflowState.IN_PROGRESS);

                // Assert
                expect(mockTracker.startWorkflow).toHaveBeenCalledWith('test-id', 'test-workflow', undefined);
                expect(mockTracker.updateWorkflow).toHaveBeenCalledWith('test-id', WorkflowState.IN_PROGRESS, undefined);
            });
        });

        describe('Dependency Inversion Principle', () => {
            it('should use interfaces instead of concrete implementations', () => {
                // Arrange
                const mockLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };

                const mockTracker = {
                    startWorkflow: jest.fn(),
                    updateWorkflow: jest.fn(),
                    completeWorkflow: jest.fn(),
                    trackPerformance: jest.fn()
                };

                const mockConsoleOverride = {
                    override: jest.fn(),
                    restore: jest.fn(),
                    isOverridden: jest.fn().mockReturnValue(false)
                };

                const mockConfigStorage = {
                    getLogLevel: jest.fn(),
                    setLogLevel: jest.fn(),
                    isEnabled: jest.fn(),
                    setEnabled: jest.fn(),
                    isDebugMode: jest.fn(),
                    setDebugMode: jest.fn(),
                    getComponentLogLevel: jest.fn(),
                    setComponentLogLevel: jest.fn(),
                    isComponentEnabled: jest.fn(),
                    setComponentEnabled: jest.fn(),
                    clear: jest.fn(),
                    clearComponent: jest.fn()
                };

                // Act & Assert - This should work because we're using interfaces
                expect(() => {
                    const manager = new (SentryManagerRefactored as any)(
                        mockLogger,
                        mockTracker,
                        mockConsoleOverride,
                        mockConfigStorage
                    );
                }).not.toThrow();
            });
        });

        describe('Open/Closed Principle', () => {
            it('should be extensible without modification', () => {
                // Arrange
                const manager = SentryManagerRefactored.getInstance();
                const originalLogInfo = manager.logInfo;

                // Act - Extend functionality without modifying the class
                const extendedManager = {
                    ...manager,
                    logInfoWithTimestamp: (message: string, context?: Record<string, any>) => {
                        return originalLogInfo.call(manager, message, {
                            ...context,
                            timestamp: Date.now()
                        });
                    }
                };

                // Assert
                expect(extendedManager.logInfoWithTimestamp).toBeDefined();
                expect(typeof extendedManager.logInfoWithTimestamp).toBe('function');
            });
        });
    });

    describe('SentryLogger', () => {
        describe('Single Responsibility Principle', () => {
            it('should only handle logging operations', () => {
                // Arrange
                const logger = new SentryLogger('test-component', SentryLogLevel.INFO);

                // Act
                logger.logInfo('test message');
                logger.logError('test error');

                // Assert
                expect(logger.getComponentName()).toBe('test-component');
                expect(logger.isLoggingEnabled(SentryLogLevel.INFO)).toBe(true);
                expect(logger.isLoggingEnabled(SentryLogLevel.DEBUG)).toBe(false);
            });
        });

        describe('Interface Segregation Principle', () => {
            it('should implement only the logging interface', () => {
                // Arrange
                const logger = new SentryLogger('test-component');

                // Act & Assert
                expect(typeof logger.logTrace).toBe('function');
                expect(typeof logger.logDebug).toBe('function');
                expect(typeof logger.logInfo).toBe('function');
                expect(typeof logger.logWarning).toBe('function');
                expect(typeof logger.logError).toBe('function');
                expect(typeof logger.logFatal).toBe('function');
                expect(typeof logger.isLoggingEnabled).toBe('function');
            });
        });
    });

    describe('WorkflowTracker', () => {
        describe('Single Responsibility Principle', () => {
            it('should only handle workflow tracking', () => {
                // Arrange
                const tracker = new WorkflowTracker('test-component');

                // Act
                tracker.startWorkflow('test-id', 'test-workflow');
                const workflows = tracker.getActiveWorkflows();

                // Assert
                expect(workflows.has('test-id')).toBe(true);
                expect(workflows.get('test-id')?.name).toBe('test-workflow');
            });
        });

        describe('Performance Tracking', () => {
            it('should track performance of async operations', async () => {
                // Arrange
                const tracker = new WorkflowTracker('test-component');
                const mockOperation = jest.fn().mockResolvedValue('success');

                // Act
                const result = await tracker.trackPerformance('test-operation', mockOperation);

                // Assert
                expect(result).toBe('success');
                expect(mockOperation).toHaveBeenCalledTimes(1);
            });

            it('should handle performance tracking errors', async () => {
                // Arrange
                const tracker = new WorkflowTracker('test-component');
                const mockError = new Error('test error');
                const mockOperation = jest.fn().mockRejectedValue(mockError);

                // Act & Assert
                await expect(tracker.trackPerformance('test-operation', mockOperation))
                    .rejects.toThrow('test error');
            });
        });
    });

    describe('SentryConfigStorage', () => {
        describe('Single Responsibility Principle', () => {
            it('should only handle configuration storage', () => {
                // Arrange
                const storage = new SentryConfigStorage();

                // Act
                storage.setLogLevel('info');
                storage.setEnabled(true);
                storage.setDebugMode(false);

                // Assert
                expect(localStorageMock.setItem).toHaveBeenCalledWith('sentry_log_level', 'info');
                expect(localStorageMock.setItem).toHaveBeenCalledWith('hot-league-wall-debug-enabled', 'true');
                expect(localStorageMock.setItem).toHaveBeenCalledWith('sentry_debug_mode', 'false');
            });
        });

        describe('Component-specific Configuration', () => {
            it('should handle component-specific settings', () => {
                // Arrange
                const storage = new SentryConfigStorage();
                const componentName = 'test-component';

                // Act
                storage.setComponentLogLevel(componentName, 'debug');
                storage.setComponentEnabled(componentName, true);

                // Assert
                expect(localStorageMock.setItem).toHaveBeenCalledWith('sentry_component_log_level_test-component', 'debug');
                expect(localStorageMock.setItem).toHaveBeenCalledWith('sentry_component_enabled_test-component', 'true');
            });
        });
    });

    describe('ConsoleOverride', () => {
        describe('Single Responsibility Principle', () => {
            it('should only handle console method overrides', () => {
                // Arrange
                const mockLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };
                const consoleOverride = new ConsoleOverride(mockLogger);

                // Act
                consoleOverride.override();

                // Assert
                expect(consoleOverride.isOverridden()).toBe(true);
            });

            it('should restore original console methods', () => {
                // Arrange
                const mockLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };
                const consoleOverride = new ConsoleOverride(mockLogger);
                const originalConsoleLog = console.log;

                // Act
                consoleOverride.override();
                consoleOverride.restore();

                // Assert
                expect(consoleOverride.isOverridden()).toBe(false);
                expect(console.log).toBe(originalConsoleLog);
            });
        });
    });

    describe('SentryHelperRefactored', () => {
        describe('Component Management', () => {
            it('should manage multiple component loggers', () => {
                // Arrange
                const helper = SentryHelperRefactored.getInstance();

                // Act
                helper.configureComponent('component1', { logLevel: SentryLogLevel.INFO });
                helper.configureComponent('component2', { logLevel: SentryLogLevel.DEBUG });

                // Assert
                expect(helper.getComponentConfig('component1')?.logLevel).toBe(SentryLogLevel.INFO);
                expect(helper.getComponentConfig('component2')?.logLevel).toBe(SentryLogLevel.DEBUG);
            });

            it('should handle component-specific logging', () => {
                // Arrange
                const helper = SentryHelperRefactored.getInstance();
                helper.configureComponent('test-component', { logLevel: SentryLogLevel.INFO });

                // Act
                helper.logInfo('test-component', 'test message');
                helper.logError('test-component', 'test error');

                // Assert - These should not throw and should delegate to the appropriate logger
                expect(() => {
                    helper.logInfo('test-component', 'test message');
                }).not.toThrow();
            });
        });

        describe('Configuration Management', () => {
            it('should handle global configuration updates', () => {
                // Arrange
                const helper = SentryHelperRefactored.getInstance();

                // Act
                helper.setGlobalEnabled(false);
                helper.setDefaultLogLevel(SentryLogLevel.WARN);

                // Assert
                const config = helper.getConfig();
                expect(config.enabled).toBe(false);
                expect(config.defaultLogLevel).toBe(SentryLogLevel.WARN);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle localStorage errors gracefully', () => {
            // Arrange
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });
            const storage = new SentryConfigStorage();

            // Act & Assert
            expect(() => {
                storage.setLogLevel('info');
            }).not.toThrow();
        });

        it('should handle Sentry initialization errors', () => {
            // Arrange
            const manager = SentryManagerRefactored.getInstance();
            const invalidConfig = {
                dsn: '',
                environment: 'test',
                componentName: 'test'
            };

            // Act & Assert
            expect(() => {
                manager.initialize(invalidConfig);
            }).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        it('should work together as a complete system', () => {
            // Arrange
            const manager = SentryManagerRefactored.getInstance();
            const helper = SentryHelperRefactored.getInstance();

            // Act
            manager.initialize({
                dsn: 'test-dsn',
                environment: 'test',
                componentName: 'test-component',
                logLevel: SentryLogLevel.INFO
            });

            helper.configureComponent('test-component', {
                logLevel: SentryLogLevel.DEBUG,
                enableWorkflowTracking: true
            });

            // Assert
            expect(manager.isManagerInitialized()).toBe(true);
            expect(helper.getComponentConfig('test-component')).toBeDefined();
        });
    });
}); 