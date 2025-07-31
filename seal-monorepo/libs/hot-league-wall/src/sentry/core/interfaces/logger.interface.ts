import { SentryLogLevel } from '../sentry-types';

/**
 * Logger interface for abstracting logging operations
 * Follows Interface Segregation Principle
 */
export interface ILogger {
    logTrace(message: string, context?: Record<string, any>): void;
    logDebug(message: string, context?: Record<string, any>): void;
    logInfo(message: string, context?: Record<string, any>): void;
    logWarning(message: string, context?: Record<string, any>): void;
    logError(error: Error | string, context?: Record<string, any>): void;
    logFatal(error: Error | string, context?: Record<string, any>): void;
    isLoggingEnabled(level: SentryLogLevel): boolean;
}

/**
 * Workflow tracker interface
 */
export interface IWorkflowTracker {
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void;
    updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void;
    completeWorkflow(workflowId: string, success?: boolean, metadata?: Record<string, any>): void;
    trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T>;
}

/**
 * Console override interface
 */
export interface IConsoleOverride {
    override(): void;
    restore(): void;
    isOverridden(): boolean;
} 