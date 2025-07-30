// Standard Sentry log levels
export enum SentryLogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
    // Legacy levels for backward compatibility
    DISABLED = 'disabled',
    ERROR_ONLY = 'error_only',
    WARNING_AND_ERROR = 'warning_and_error',
    ALL = 'all'
}

// Workflow tracking states
export enum WorkflowState {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

// Component tracking configuration
export interface ComponentConfig {
    name: string;
    logLevel: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
}

// Workflow tracking configuration
export interface WorkflowConfig {
    id: string;
    name: string;
    component: string;
    logLevel: SentryLogLevel;
    enablePerformanceTracking?: boolean;
    metadata?: Record<string, any>;
}

// Global Sentry configuration
export interface GlobalSentryConfig {
    enabled: boolean;
    defaultLogLevel: SentryLogLevel;
    enableWorkflowTracking: boolean;
    enablePerformanceTracking: boolean;
    enableConsoleOverride: boolean;
    componentConfigs: Map<string, ComponentConfig>;
    workflowConfigs: Map<string, WorkflowConfig>;
}

// LocalStorage configuration
export interface LocalStorageConfig {
    logLevel: string;
    enabled: boolean;
    debugMode: boolean;
}

// SentryManager configuration
export interface SentryManagerConfig {
    dsn: string;
    environment: string;
    componentName: string;
    release?: string;
    debug?: boolean;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    enableConsoleOverride?: boolean;
}

// UseSentryHelper options
export interface UseSentryHelperOptions {
    componentName: string;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    autoConfigure?: boolean;
}

// Workflow tracker interface
export interface WorkflowTracker {
    start: (workflowName: string, metadata?: Record<string, any>) => string;
    update: (workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => void;
    complete: (workflowId: string, success?: boolean, metadata?: Record<string, any>) => void;
    track: <T>(operationName: string, operation: () => Promise<T> | T) => Promise<T>;
} 