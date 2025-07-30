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
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, autoConfigure]);

    // Cleanup workflows on unmount
    useEffect(() => {
        return () => {
            sentryHelper.logInfo(componentName, 'Cleaning up SentryHelper hook', {
                componentName,
                activeWorkflowsCount: activeWorkflows.current.size,
                timestamp: Date.now()
            });

            // Complete any remaining workflows
            activeWorkflows.current.forEach(workflowId => {
                completeWorkflow(workflowId, false, { reason: 'component_unmounted' });
            });
            activeWorkflows.current.clear();

            sentryHelper.logInfo(componentName, 'SentryHelper hook cleanup completed', {
                componentName,
                timestamp: Date.now()
            });
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
        }, [componentName]),

        update: useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
            sentryHelper.logInfo(componentName, 'Updating workflow', {
                workflowId,
                state,
                metadata,
                timestamp: Date.now()
            });

            updateWorkflow(workflowId, state, metadata);
        }, [componentName]),

        complete: useCallback((workflowId: string, success = true, metadata?: Record<string, any>) => {
            sentryHelper.logInfo(componentName, 'Completing workflow', {
                workflowId,
                success,
                metadata,
                timestamp: Date.now()
            });

            completeWorkflow(workflowId, success, metadata);
            activeWorkflows.current.delete(workflowId);

            sentryHelper.logInfo(componentName, 'Workflow completed', {
                workflowId,
                success,
                activeWorkflowsCount: activeWorkflows.current.size,
                timestamp: Date.now()
            });
        }, [componentName]),

        track: useCallback(async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
            sentryHelper.logInfo(componentName, 'Starting performance tracking', {
                operationName,
                timestamp: Date.now()
            });

            const result = await trackPerformance(componentName, operationName, operation);

            sentryHelper.logInfo(componentName, 'Performance tracking completed', {
                operationName,
                timestamp: Date.now()
            });

            return result;
        }, [componentName])
    };

    // Utility methods
    const isLoggingEnabled = useCallback((level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => {
        return sentryHelper.isLoggingEnabled(componentName, level);
    }, [componentName]);

    const getConfig = useCallback(() => {
        const config = sentryHelper.getComponentConfig(componentName);

        sentryHelper.logInfo(componentName, 'Retrieved component configuration', {
            config,
            timestamp: Date.now()
        });

        return config;
    }, [componentName]);

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
    sentryHelper.logInfo(componentName, 'Initializing simple Sentry hook', {
        componentName,
        logLevel,
        timestamp: Date.now()
    });

    return useSentryHelper({
        componentName,
        logLevel,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
        autoConfigure: true
    });
};

// Hook for workflow-focused usage
export const useWorkflowSentry = (componentName: string, options?: Partial<UseSentryHelperOptions>) => {
    sentryHelper.logInfo(componentName, 'Initializing workflow Sentry hook', {
        componentName,
        options,
        timestamp: Date.now()
    });

    return useSentryHelper({
        componentName,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
        ...options
    });
}; 