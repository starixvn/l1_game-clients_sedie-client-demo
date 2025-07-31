// @/sentry - Refactored entry point following SOLID principles

import { SentryManagerRefactored } from './core/sentry-manager-refactored';
import { SentryHelperRefactored } from './utils/sentry-helper-refactored';
import { SentryLogger } from './core/logger/sentry-logger';
import { WorkflowTracker } from './core/workflow/workflow-tracker';
import { ConsoleOverride } from './core/console/console-override';
import { SentryConfigStorage, LocalStorage } from './core/storage/local-storage';
// Import types for interface definitions
import { SentryLogLevel, WorkflowState } from './core/sentry-types';
import { useSentryHelperRefactored, useSimpleSentryRefactored, useWorkflowSentryRefactored } from './hooks/useSentryHelperRefactored';

// Core interfaces definitions
export interface IStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}

export interface IConfigStorage {
    getLogLevel(): string;
    setLogLevel(level: string): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    isDebugMode(): boolean;
    setDebugMode(debugMode: boolean): void;
    getComponentLogLevel(componentName: string): string | null;
    setComponentLogLevel(componentName: string, level: string): void;
    isComponentEnabled(componentName: string): boolean;
    setComponentEnabled(componentName: string, enabled: boolean): void;
    clear(): void;
    clearComponent(componentName: string): void;
}

export interface ILogger {
    logTrace(message: string, context?: Record<string, any>): void;
    logDebug(message: string, context?: Record<string, any>): void;
    logInfo(message: string, context?: Record<string, any>): void;
    logWarning(message: string, context?: Record<string, any>): void;
    logError(error: Error | string, context?: Record<string, any>): void;
    logFatal(error: Error | string, context?: Record<string, any>): void;
    isLoggingEnabled(level: SentryLogLevel): boolean;
}

export interface IWorkflowTracker {
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void;
    updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void;
    completeWorkflow(workflowId: string, success?: boolean, metadata?: Record<string, any>): void;
    trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T>;
}

export interface IConsoleOverride {
    override(): void;
    restore(): void;
    isOverridden(): boolean;
}

// Storage exports
export {
    LocalStorage,
    SentryConfigStorage
} from './core/storage/local-storage';

// Logger exports
export { SentryLogger } from './core/logger/sentry-logger';

// Workflow exports
export { WorkflowTracker } from './core/workflow/workflow-tracker';

// Console exports
export { ConsoleOverride } from './core/console/console-override';

// Refactored manager exports
export {
    SentryManagerRefactored
} from './core/sentry-manager-refactored';

// Refactored helper exports
export {
    SentryHelperRefactored
} from './utils/sentry-helper-refactored';

// Refactored hooks exports
export {
    useSentryHelperRefactored,
    useSimpleSentryRefactored,
    useWorkflowSentryRefactored
} from './hooks/useSentryHelperRefactored';

// Type exports
export type {
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    LocalStorageConfig,
    SentryManagerConfig,
    UseSentryHelperOptions
} from './core/sentry-types';

// Enum exports
export {
    SentryLogLevel,
    WorkflowState
} from './core/sentry-types';

// Utility functions for backward compatibility
export const createSentryManager = () => SentryManagerRefactored.getInstance();
export const createSentryHelper = () => SentryHelperRefactored.getInstance();

// Factory functions for dependency injection
export const createLogger = (componentName: string, logLevel?: SentryLogLevel) =>
    new SentryLogger(componentName, logLevel);

export const createWorkflowTracker = (componentName: string) =>
    new WorkflowTracker(componentName);

export const createConfigStorage = (storage?: IStorage) =>
    new SentryConfigStorage(storage);

export const createConsoleOverride = (logger: ILogger) =>
    new ConsoleOverride(logger);

// Backward compatibility exports (deprecated - use refactored versions)
export const sentryManager = createSentryManager();
export const sentryHelper = createSentryHelper();

// Legacy function exports for backward compatibility
export const configureSentryManager = (config: any) => sentryManager.initialize(config);
export const enableSentryManager = () => sentryManager.setLocalStorageConfig({ enabled: true });
export const disableSentryManager = () => sentryManager.setLocalStorageConfig({ enabled: false });
export const setSentryLogLevel = (level: SentryLogLevel) => sentryManager.setLocalStorageConfig({ logLevel: level });
export const startSentryWorkflow = (id: string, name: string, metadata?: any) => sentryManager.startWorkflow(id, name, metadata);
export const updateSentryWorkflow = (id: string, state: WorkflowState, metadata?: any) => sentryManager.updateWorkflow(id, state, metadata);
export const completeSentryWorkflow = (id: string, success?: boolean, metadata?: any) => sentryManager.completeWorkflow(id, success, metadata);
export const trackSentryPerformance = (operation: string, fn: () => any) => sentryManager.trackPerformance(operation, fn);
export const setLocalStorageConfig = (config: any) => sentryManager.setLocalStorageConfig(config);
export const clearLocalStorageConfig = () => sentryManager.clearLocalStorageConfig();

// Legacy utility exports
export const configureSentry = (config?: any) => sentryHelper.initialize(config);
export const enableSentry = () => sentryHelper.setGlobalEnabled(true);
export const disableSentry = () => sentryHelper.setGlobalEnabled(false);
export const setLogLevel = (level: SentryLogLevel) => sentryHelper.setDefaultLogLevel(level);
export const configureComponent = (name: string, config: any) => sentryHelper.configureComponent(name, config);
export const startWorkflow = (id: string, name: string, component: string, metadata?: any) => sentryHelper.startWorkflow(id, name, component, metadata);
export const updateWorkflow = (id: string, state: WorkflowState, metadata?: any) => sentryHelper.updateWorkflow(id, state, metadata);
export const completeWorkflow = (id: string, success?: boolean, metadata?: any) => sentryHelper.completeWorkflow(id, success, metadata);
export const trackPerformance = (component: string, operation: string, fn: () => any) => sentryHelper.trackPerformance(component, operation, fn);
export const logError = (component: string, error: any, context?: any) => sentryHelper.logError(component, error, context);
export const logWarning = (component: string, warning: string, context?: any) => sentryHelper.logWarning(component, warning, context);
export const logInfo = (component: string, info: string, context?: any) => sentryHelper.logInfo(component, info, context);
export const logDebug = (component: string, debug: string, context?: any) => sentryHelper.logDebug(component, debug, context);
export const logTrace = (component: string, trace: string, context?: any) => sentryHelper.logTrace(component, trace, context);
export const updateSentryConfiguration = (dsn?: string, environment?: string) => sentryHelper.updateSentryConfiguration(dsn, environment);

// Legacy hook exports for backward compatibility
export const useSentryHelper = useSentryHelperRefactored;
export const useSimpleSentry = useSimpleSentryRefactored;
export const useWorkflowSentry = useWorkflowSentryRefactored;

// Additional hook exports for backward compatibility
export { useGameCronSentry } from './hooks/useGameCronSentry';
export { useSessionReplay } from './hooks/useSessionReplay';

// Components exports (keeping existing components for now)
export { LoggingDemo } from './components';
export { SentryLogContext, SentryLogProvider, useGameSentryLogger, useSentryLog } from './components/sentry-log-context'; 