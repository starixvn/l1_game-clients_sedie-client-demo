// @/sentry - Refactored entry point following SOLID principles

import { SentryManagerRefactored } from './core/sentry-manager-refactored';
import { SentryHelperRefactored } from './utils/sentry-helper-refactored';
import { SentryLogger } from './core/logger/sentry-logger';
import { WorkflowTracker } from './core/workflow/workflow-tracker';
import { ConsoleOverride } from './core/console/console-override';
import { SentryConfigStorage, LocalStorage } from './core/storage/local-storage';
import { IStorage, IConfigStorage, ILogger, IWorkflowTracker, IConsoleOverride } from './core/interfaces';
import { SentryLogLevel } from './core/sentry-types';

// Core interfaces exports
export {
    IStorage,
    IConfigStorage,
    ILogger,
    IWorkflowTracker,
    IConsoleOverride
} from './core/interfaces';

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