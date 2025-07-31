import { useCallback, useEffect, useRef } from 'react';
import {
    logInfoBatched as sentryLogInfo,
    logErrorBatched as sentryLogError,
    logWarningBatched as sentryLogWarning,
    logDebugBatched as logDebug,
    logTraceBatched as logTrace,
    configureComponentBatched as configureComponent,
    startWorkflowBatched as startWorkflow,
    updateWorkflowBatched as updateWorkflow,
    completeWorkflowBatched as completeWorkflow,
    trackPerformanceBatched as sentryTrackPerformance,
    sentryHelperBatched,
    flushComponentBatchesBatched as flushComponentBatches
} from '../utils/sentry-helper-batched';
import {
    SentryLogLevel,
    WorkflowState,
    UseSentryHelperOptions,
    WorkflowTracker
} from '../core/sentry-types';

export const useSentryHelperBatched = (options: UseSentryHelperOptions) => {
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
                sentryLogInfo(componentName, 'Initializing SentryHelperBatched hook', {
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

                sentryLogInfo(componentName, 'SentryHelperBatched hook initialized successfully', {
                    componentName,
                    configuration: {
                        logLevel,
                        enableWorkflowTracking,
                        enablePerformanceTracking
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                // Don't throw error to prevent component from failing
            }
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, autoConfigure]);

    // Cleanup workflows on unmount
    useEffect(() => {
        return () => {
            try {
                sentryLogInfo(componentName, 'Cleaning up SentryHelperBatched hook', {
                    componentName,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now()
                });

                // Complete any remaining workflows
                activeWorkflows.current.forEach(workflowId => {
                    try {
                        completeWorkflow(workflowId, false, { reason: 'component_unmounted' });
                    } catch (error) {
                        // Silent fail during cleanup
                    }
                });
                activeWorkflows.current.clear();

                // Flush any remaining logs for this component
                flushComponentBatches(componentName);

                sentryLogInfo(componentName, 'SentryHelperBatched hook cleanup completed', {
                    componentName,
                    timestamp: Date.now()
                });
            } catch (error) {
                // Silent fail during cleanup
            }
        };
    }, [componentName]);

    // Logging methods
    const logError = useCallback((error: Error | string, context?: Record<string, any>) => {
        sentryLogError(componentName, error, context);
    }, [componentName]);

    const logWarning = useCallback((warning: string, context?: Record<string, any>) => {
        sentryLogWarning(componentName, warning, context);
    }, [componentName]);

    const logInfo = useCallback((info: string, context?: Record<string, any>) => {
        sentryLogInfo(componentName, info, context);
    }, [componentName]);

    // Workflow tracking
    const workflowTracker: WorkflowTracker = {
        start: useCallback((workflowName: string, metadata?: Record<string, any>) => {
            try {
                const workflowId = `${componentName}_${workflowName}_${Date.now()}`;

                sentryLogInfo(componentName, 'Starting workflow', {
                    workflowId,
                    workflowName,
                    metadata,
                    timestamp: Date.now()
                });

                startWorkflow(workflowId, workflowName, componentName, metadata);
                activeWorkflows.current.add(workflowId);

                sentryLogInfo(componentName, 'Workflow started successfully', {
                    workflowId,
                    workflowName,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now()
                });

                return workflowId;
            } catch (error) {
                return `${componentName}_${workflowName}_error_${Date.now()}`;
            }
        }, [componentName]),

        update: useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
            try {
                sentryLogInfo(componentName, 'Updating workflow', {
                    workflowId,
                    state,
                    metadata,
                    timestamp: Date.now()
                });

                updateWorkflow(workflowId, state, metadata);
            } catch (error) {
                // Silent fail
            }
        }, [componentName]),

        complete: useCallback((workflowId: string, success = true, metadata?: Record<string, any>) => {
            try {
                sentryLogInfo(componentName, 'Completing workflow', {
                    workflowId,
                    success,
                    metadata,
                    timestamp: Date.now()
                });

                completeWorkflow(workflowId, success, metadata);
                activeWorkflows.current.delete(workflowId);

                sentryLogInfo(componentName, 'Workflow completed successfully', {
                    workflowId,
                    success,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now()
                });
            } catch (error) {
                activeWorkflows.current.delete(workflowId);
            }
        }, [componentName]),

        track: useCallback(async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
            const workflowId = workflowTracker.start(operationName);

            try {
                sentryLogInfo(componentName, 'Tracking operation', {
                    workflowId,
                    operationName,
                    timestamp: Date.now()
                });

                const result = await operation();

                workflowTracker.complete(workflowId, true, { result: 'success' });
                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                sentryLogError(componentName, `Operation failed: ${errorMessage}`, {
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
            sentryLogInfo(componentName, 'Starting performance tracking', {
                operationName,
                timestamp: Date.now()
            });

            const result = await sentryTrackPerformance(componentName, operationName, operation);

            sentryLogInfo(componentName, 'Performance tracking completed', {
                operationName,
                timestamp: Date.now()
            });

            return result as T;
        } catch (error) {
            // Fallback to direct operation execution
            return await operation();
        }
    }, [componentName]);

    // Utility methods
    const isLoggingEnabled = useCallback((level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => {
        return sentryHelperBatched.isLoggingEnabled(componentName, level);
    }, [componentName]);

    const getConfig = useCallback(() => {
        try {
            sentryLogInfo(componentName, 'Getting component configuration', {
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
            return {
                componentName,
                logLevel: SentryLogLevel.ERROR_ONLY,
                enableWorkflowTracking: false,
                enablePerformanceTracking: false
            };
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking]);

    // Batch management methods
    const flushBatches = useCallback(async () => {
        try {
            await flushComponentBatches(componentName);
            sentryLogInfo(componentName, 'Component batches flushed', {
                componentName,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to flush component batches:', error);
        }
    }, [componentName]);

    const getBatchStats = useCallback(() => {
        return sentryHelperBatched.getBatchStats();
    }, []);

    return {
        // Logging methods
        logError,
        logWarning,
        logInfo,

        // Workflow tracking
        workflow: workflowTracker,

        // Performance tracking
        trackPerformance,

        // Utility methods
        isLoggingEnabled,
        getConfig,

        // Batch management methods
        flushBatches,
        getBatchStats,

        // Direct access to sentryHelperBatched for advanced usage
        sentryHelper: sentryHelperBatched
    };
};

// Convenience hook for simple logging without workflow tracking
export const useSimpleSentryBatched = (componentName: string, logLevel?: SentryLogLevel) => {
    const hookResult = useSentryHelperBatched({
        componentName,
        logLevel,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
        autoConfigure: true
    });

    try {
        sentryLogInfo(componentName, 'Initializing simple SentryBatched hook', {
            componentName,
            logLevel,
            timestamp: Date.now()
        });

        return hookResult;
    } catch (error) {
        // Return a minimal implementation
        return {
            logError: (error: Error | string, context?: Record<string, any>) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
            },
            logWarning: (warning: string, context?: Record<string, any>) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
            },
            logInfo: (info: string, context?: Record<string, any>) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
            },
            workflow: {
                start: () => 'error_workflow',
                update: () => { /* no-op */ },
                complete: () => { /* no-op */ },
                track: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation()
            },
            trackPerformance: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation(),
            getConfig: () => ({ componentName, logLevel: SentryLogLevel.ERROR_ONLY }),
            flushBatches: async () => { /* no-op */ },
            getBatchStats: () => ({})
        };
    }
};

// Hook for workflow-focused usage
export const useWorkflowSentryBatched = (componentName: string, options?: Partial<UseSentryHelperOptions>) => {
    const hookResult = useSentryHelperBatched({
        componentName,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
        ...options
    });

    try {
        sentryLogInfo(componentName, 'Initializing workflow SentryBatched hook', {
            componentName,
            options,
            timestamp: Date.now()
        });

        return hookResult;
    } catch (error) {
        // Return a minimal implementation
        return {
            logError: (error: Error | string, context?: Record<string, any>) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
            },
            logWarning: (warning: string, context?: Record<string, any>) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
            },
            logInfo: (info: string, context?: Record<string, any>) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
            },
            workflow: {
                start: () => 'error_workflow',
                update: () => { /* no-op */ },
                complete: () => { /* no-op */ },
                track: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation()
            },
            trackPerformance: async <T>(operationName: string, operation: () => Promise<T> | T) => await operation(),
            getConfig: () => ({ componentName, logLevel: SentryLogLevel.ERROR_ONLY }),
            flushBatches: async () => { /* no-op */ },
            getBatchStats: () => ({})
        };
    }
}; 