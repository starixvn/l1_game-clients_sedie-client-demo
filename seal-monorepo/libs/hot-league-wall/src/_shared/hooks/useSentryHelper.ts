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
            configureComponent(componentName, {
                logLevel,
                enableWorkflowTracking,
                enablePerformanceTracking
            });
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, autoConfigure]);

    // Cleanup workflows on unmount
    useEffect(() => {
        return () => {
            // Complete any remaining workflows
            activeWorkflows.current.forEach(workflowId => {
                completeWorkflow(workflowId, false, { reason: 'component_unmounted' });
            });
            activeWorkflows.current.clear();
        };
    }, []);

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
            startWorkflow(workflowId, workflowName, componentName, metadata);
            activeWorkflows.current.add(workflowId);
            return workflowId;
        }, [componentName]),

        update: useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
            updateWorkflow(workflowId, state, metadata);
        }, []),

        complete: useCallback((workflowId: string, success: boolean = true, metadata?: Record<string, any>) => {
            completeWorkflow(workflowId, success, metadata);
            activeWorkflows.current.delete(workflowId);
        }, []),

        track: useCallback(async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
            return trackPerformance(componentName, operationName, operation);
        }, [componentName])
    };

    // Utility methods
    const isLoggingEnabled = useCallback((level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => {
        return sentryHelper.isLoggingEnabled(componentName, level);
    }, [componentName]);

    const getConfig = useCallback(() => {
        return sentryHelper.getComponentConfig(componentName);
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
    return useSentryHelper({
        componentName,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
        ...options
    });
}; 