import { useEffect, useCallback, useRef } from 'react';
import {
    sentryHelper,
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance,
    configureComponent
} from '../utils/sentry-helper';

interface UseSentryHelperOptions {
    componentName: string;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    autoConfigure?: boolean;
}

interface WorkflowTracker {
    start: (workflowName: string, metadata?: Record<string, any>) => string;
    update: (workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => void;
    complete: (workflowId: string, success?: boolean, metadata?: Record<string, any>) => void;
    track: <T>(operationName: string, operation: () => Promise<T> | T) => Promise<T>;
}

export const useSentryHelper = (options: UseSentryHelperOptions) => {
    const {
        componentName,
        logLevel = SentryLogLevel.ALL,
        enableWorkflowTracking = true,
        enablePerformanceTracking = true,
        autoConfigure = true
    } = options;

    const activeWorkflows = useRef<Set<string>>(new Set());

    // Auto-configure component on mount
    useEffect(() => {
        if (autoConfigure) {
            try {
                sentryHelper.logInfo(componentName, 'Initializing SentryHelper hook', {
                    componentName,
                    logLevel,
                    enableWorkflowTracking,
                    enablePerformanceTracking,
                    autoConfigure,
                    timestamp: Date.now()
                });

                configureComponent(componentName, {
                    logLevel,
                    enableWorkflowTracking,
                    enablePerformanceTracking
                });

                sentryHelper.logInfo(componentName, 'SentryHelper hook initialized successfully', {
                    componentName,
                    configuration: {
                        logLevel,
                        enableWorkflowTracking,
                        enablePerformanceTracking
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Failed to initialize SentryHelper hook:', error);
                // Don't throw error to prevent component from failing
            }
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, autoConfigure]);

    // Cleanup workflows on unmount
    useEffect(() => {
        return () => {
            try {
                sentryHelper.logInfo(componentName, 'Cleaning up SentryHelper hook', {
                    componentName,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now()
                });

                // Complete any remaining workflows
                activeWorkflows.current.forEach(workflowId => {
                    try {
                        completeWorkflow(workflowId, false, { reason: 'component_unmounted' });
                    } catch (error) {
                        console.error('Failed to complete workflow during cleanup:', error);
                    }
                });
                activeWorkflows.current.clear();

                sentryHelper.logInfo(componentName, 'SentryHelper hook cleanup completed', {
                    componentName,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Failed to cleanup SentryHelper hook:', error);
            }
        };
    }, [componentName]);

    // Logging methods
    const logError = useCallback((error: Error | string, context?: Record<string, any>) => {
        sentryHelper.logError(componentName, error, context);
    }, [componentName]);

    const logWarning = useCallback((warning: string, context?: Record<string, any>) => {
        sentryHelper.logWarning(componentName, warning, context);
    }, [componentName]);

    const logInfo = useCallback((info: string, context?: Record<string, any>) => {
        sentryHelper.logInfo(componentName, info, context);
    }, [componentName]);

    // Workflow tracking
    const workflowTracker: WorkflowTracker = {
        start: useCallback((workflowName: string, metadata?: Record<string, any>) => {
            try {
                const workflowId = `${componentName}_${workflowName}_${Date.now()}`;

                sentryHelper.logInfo(componentName, 'Starting workflow', {
                    workflowId,
                    workflowName,
                    metadata,
                    timestamp: Date.now()
                });

                startWorkflow(workflowId, workflowName, componentName, metadata);
                activeWorkflows.current.add(workflowId);

                sentryHelper.logInfo(componentName, 'Workflow started successfully', {
                    workflowId,
                    workflowName,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now()
                });

                return workflowId;
            } catch (error) {
                console.error('Failed to start workflow:', error);
                return `${componentName}_${workflowName}_error_${Date.now()}`;
            }
        }, [componentName]),

        update: useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
            try {
                sentryHelper.logInfo(componentName, 'Updating workflow', {
                    workflowId,
                    state,
                    metadata,
                    timestamp: Date.now()
                });

                updateWorkflow(workflowId, state, metadata);
            } catch (error) {
                console.error('Failed to update workflow:', error);
            }
        }, [componentName]),

        complete: useCallback((workflowId: string, success = true, metadata?: Record<string, any>) => {
            try {
                sentryHelper.logInfo(componentName, 'Completing workflow', {
                    workflowId,
                    success,
                    metadata,
                    timestamp: Date.now()
                });

                completeWorkflow(workflowId, success, metadata);
                activeWorkflows.current.delete(workflowId);

                sentryHelper.logInfo(componentName, 'Workflow completed successfully', {
                    workflowId,
                    success,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Failed to complete workflow:', error);
                activeWorkflows.current.delete(workflowId);
            }
        }, [componentName]),

        track: useCallback(async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
            const workflowId = workflowTracker.start(operationName);

            try {
                sentryHelper.logInfo(componentName, 'Tracking operation', {
                    workflowId,
                    operationName,
                    timestamp: Date.now()
                });

                const result = await operation();

                workflowTracker.complete(workflowId, true, { result: 'success' });
                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                sentryHelper.logError(componentName, `Operation failed: ${errorMessage}`, {
                    workflowId,
                    operationName,
                    error,
                    timestamp: Date.now()
                });

                workflowTracker.complete(workflowId, false, {
                    error: errorMessage,
                    result: 'failure'
                });
                throw error;
            }
        }, [componentName])
    };

    // Performance tracking
    const trackPerformance = useCallback(async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
        try {
            sentryHelper.logInfo(componentName, 'Starting performance tracking', {
                operationName,
                timestamp: Date.now()
            });

            const result = await sentryHelper.trackPerformance(componentName, operationName, operation);

            sentryHelper.logInfo(componentName, 'Performance tracking completed', {
                operationName,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            console.error('Failed to track performance:', error);
            // Fallback to direct operation execution
            return await operation();
        }
    }, [componentName]);

    // Utility methods
    const isLoggingEnabled = useCallback((level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => {
        return sentryHelper.isLoggingEnabled(componentName, level);
    }, [componentName]);

    const getConfig = useCallback(() => {
        try {
            sentryHelper.logInfo(componentName, 'Getting component configuration', {
                componentName,
                timestamp: Date.now()
            });

            return {
                componentName,
                logLevel,
                enableWorkflowTracking,
                enablePerformanceTracking
            };
        } catch (error) {
            console.error('Failed to get component configuration:', error);
            return {
                componentName,
                logLevel: SentryLogLevel.ERROR_ONLY,
                enableWorkflowTracking: false,
                enablePerformanceTracking: false
            };
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking]);

    return {
        // Logging methods
        logError,
        logWarning,
        logInfo,

        // Workflow tracking
        workflow: workflowTracker,

        // Utility methods
        isLoggingEnabled,
        getConfig,

        // Direct access to sentryHelper for advanced usage
        sentryHelper
    };
};

// Convenience hook for simple logging without workflow tracking
export const useSimpleSentry = (componentName: string, logLevel?: SentryLogLevel) => {
    const hookResult = useSentryHelper({
        componentName,
        logLevel,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
        autoConfigure: true
    });

    try {
        sentryHelper.logInfo(componentName, 'Initializing simple Sentry hook', {
            componentName,
            logLevel,
            timestamp: Date.now()
        });

        return hookResult;
    } catch (error) {
        console.error('Failed to initialize simple Sentry hook:', error);
        // Return a minimal implementation
        return {
            logError: (error: Error | string, context?: Record<string, any>) => console.error(error, context),
            logWarning: (warning: string, context?: Record<string, any>) => console.warn(warning, context),
            logInfo: (info: string, context?: Record<string, any>) => console.log(info, context),
            workflow: {
                start: () => 'error_workflow',
                update: () => { /* no-op */ },
                complete: () => { /* no-op */ },
                track: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation()
            },
            trackPerformance: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation(),
            getConfig: () => ({ componentName, logLevel: SentryLogLevel.ERROR_ONLY })
        };
    }
};

// Hook for workflow-focused usage
export const useWorkflowSentry = (componentName: string, options?: Partial<UseSentryHelperOptions>) => {
    const hookResult = useSentryHelper({
        componentName,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
        ...options
    });

    try {
        sentryHelper.logInfo(componentName, 'Initializing workflow Sentry hook', {
            componentName,
            options,
            timestamp: Date.now()
        });

        return hookResult;
    } catch (error) {
        console.error('Failed to initialize workflow Sentry hook:', error);
        // Return a minimal implementation
        return {
            logError: (error: Error | string, context?: Record<string, any>) => console.error(error, context),
            logWarning: (warning: string, context?: Record<string, any>) => console.warn(warning, context),
            logInfo: (info: string, context?: Record<string, any>) => console.log(info, context),
            workflow: {
                start: () => 'error_workflow',
                update: () => { /* no-op */ },
                complete: () => { /* no-op */ },
                track: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation()
            },
            trackPerformance: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation(),
            getConfig: () => ({ componentName, logLevel: SentryLogLevel.ERROR_ONLY })
        };
    }
}; 