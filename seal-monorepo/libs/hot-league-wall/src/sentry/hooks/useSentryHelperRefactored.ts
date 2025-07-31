import { useCallback, useEffect, useRef } from 'react';
import { SentryHelperRefactored } from '../utils/sentry-helper-refactored';
import {
    SentryLogLevel,
    WorkflowState,
    UseSentryHelperOptions,
    WorkflowTracker
} from '../core/sentry-types';

/**
 * Refactored useSentryHelper hook that follows SOLID principles
 * - Single Responsibility: Manages component-specific Sentry operations
 * - Open/Closed: Extensible through dependency injection
 * - Liskov Substitution: Uses interfaces
 * - Interface Segregation: Uses specific interfaces
 * - Dependency Inversion: Depends on abstractions
 */
export const useSentryHelperRefactored = (options: UseSentryHelperOptions) => {
    const {
        componentName,
        logLevel = SentryLogLevel.ALL,
        enableWorkflowTracking = true,
        enablePerformanceTracking = true,
        autoConfigure = true
    } = options;

    const sentryHelper = SentryHelperRefactored.getInstance();
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

                sentryHelper.configureComponent(componentName, {
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
                        sentryHelper.completeWorkflow(workflowId, false, { reason: 'component_unmounted' });
                    } catch (error) {
                        // Silent fail during cleanup
                    }
                });
                activeWorkflows.current.clear();

                sentryHelper.logInfo(componentName, 'SentryHelper hook cleanup completed', {
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
        sentryHelper.logError(componentName, error, context);
    }, [componentName]);

    const logWarning = useCallback((warning: string, context?: Record<string, any>) => {
        sentryHelper.logWarning(componentName, warning, context);
    }, [componentName]);

    const logInfo = useCallback((info: string, context?: Record<string, any>) => {
        sentryHelper.logInfo(componentName, info, context);
    }, [componentName]);

    const logDebug = useCallback((debug: string, context?: Record<string, any>) => {
        sentryHelper.logDebug(componentName, debug, context);
    }, [componentName]);

    const logTrace = useCallback((trace: string, context?: Record<string, any>) => {
        sentryHelper.logTrace(componentName, trace, context);
    }, [componentName]);

    // Workflow methods
    const startWorkflow = useCallback((workflowName: string, metadata?: Record<string, any>) => {
        const workflowId = `${componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        sentryHelper.startWorkflow(workflowId, workflowName, componentName, metadata);
        activeWorkflows.current.add(workflowId);

        return workflowId;
    }, [componentName]);

    const updateWorkflow = useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
        sentryHelper.updateWorkflow(workflowId, state, metadata);
    }, []);

    const completeWorkflow = useCallback((workflowId: string, success = true, metadata?: Record<string, any>) => {
        sentryHelper.completeWorkflow(workflowId, success, metadata);
        activeWorkflows.current.delete(workflowId);
    }, []);

    // Performance tracking
    const trackPerformance = useCallback(async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
        return sentryHelper.trackPerformance(componentName, operationName, operation);
    }, [componentName]);

    // Configuration methods
    const configureComponent = useCallback((config: Partial<{ logLevel: SentryLogLevel; enableWorkflowTracking: boolean; enablePerformanceTracking: boolean }>) => {
        sentryHelper.configureComponent(componentName, config);
    }, [componentName]);

    const isLoggingEnabled = useCallback((level: SentryLogLevel) => {
        return sentryHelper.isLoggingEnabled(componentName, level);
    }, [componentName]);

    // Workflow tracker object
    const workflowTracker: WorkflowTracker = {
        start: startWorkflow,
        update: updateWorkflow,
        complete: completeWorkflow,
        track: trackPerformance
    };

    return {
        // Logging methods
        logError,
        logWarning,
        logInfo,
        logDebug,
        logTrace,

        // Workflow methods
        startWorkflow,
        updateWorkflow,
        completeWorkflow,
        trackPerformance,
        workflowTracker,
        workflow: workflowTracker, // Backward compatibility

        // Configuration methods
        configureComponent,
        isLoggingEnabled,

        // Utility methods
        componentName,
        activeWorkflows: activeWorkflows.current
    };
};

/**
 * Simplified hook for basic logging
 */
export const useSimpleSentryRefactored = (componentName: string, logLevel?: SentryLogLevel) => {
    return useSentryHelperRefactored({
        componentName,
        logLevel: logLevel || SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
        autoConfigure: true
    });
};

/**
 * Hook specifically for workflow tracking
 */
export const useWorkflowSentryRefactored = (componentName: string, options?: Partial<UseSentryHelperOptions>) => {
    return useSentryHelperRefactored({
        componentName,
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
        ...options
    });
}; 