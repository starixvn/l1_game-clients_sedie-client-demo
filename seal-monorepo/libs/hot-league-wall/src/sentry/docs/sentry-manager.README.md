# SentryManager - Core Sentry Management System

The `SentryManager` is the core class that provides comprehensive Sentry logging management for the HotLeagueWall project. It offers component-specific configuration, workflow tracking, performance monitoring, localStorage-based dynamic control, and advanced error filtering.

## 🚀 Features

-   **Singleton Pattern**: Ensures single instance across the application
-   **Component-Specific Configuration**: Different log levels for different components
-   **Workflow Tracking**: Track complex operations with states and metadata
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **LocalStorage Integration**: Dynamic configuration without code deployment
-   **Console Method Override**: Automatic console method interception
-   **Error Filtering**: Intelligent error filtering and buffer management
-   **Session Replay Support**: Privacy-focused session replay configuration
-   **Environment Consistency**: Same rules apply across all environments

## 📋 Quick Start

### 1. Initialize SentryManager

```typescript
import { configureSentryManager, sentryManager } from '@/sentry';

// Configure the manager
configureSentryManager({
    dsn: 'https://your-dsn@sentry.io/project',
    environment: 'production',
    componentName: 'MyApp',
    logLevel: SentryLogLevel.ERROR,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true,
});
```

### 2. Use Direct Logging

```typescript
import { sentryManager } from '@/sentry';

// Log different levels
sentryManager.logError('Something went wrong', { context: 'additional info' });
sentryManager.logWarning('Warning message', { severity: 'medium' });
sentryManager.logInfo('Information message', { data: 'some data' });
sentryManager.logDebug('Debug message', { debugInfo: 'detailed info' });
sentryManager.logTrace('Trace message', { traceData: 'trace info' });
```

### 3. Configure Components

```typescript
import { configureComponent } from '@/sentry';

// Configure component-specific settings
configureComponent('GameLobby', {
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});
```

## 🔧 Configuration Options

### SentryManagerConfig Interface

```typescript
interface SentryManagerConfig {
    dsn: string; // Sentry DSN
    environment: string; // Environment name
    componentName: string; // Component name
    release?: string; // Release version
    debug?: boolean; // Enable debug mode
    logLevel?: SentryLogLevel; // Default log level
    enableWorkflowTracking?: boolean; // Enable workflow tracking
    enablePerformanceTracking?: boolean; // Enable performance tracking
    enableConsoleOverride?: boolean; // Override console methods
}
```

### Component Configuration

```typescript
interface ComponentConfig {
    name: string; // Component name
    logLevel: SentryLogLevel; // Log level for this component
    enableWorkflowTracking?: boolean; // Enable workflow tracking
    enablePerformanceTracking?: boolean; // Enable performance tracking
}
```

## 🎯 Log Levels

### Standard Log Levels

```typescript
enum SentryLogLevel {
    TRACE = 'trace', // Very detailed debugging
    DEBUG = 'debug', // Debug information
    INFO = 'info', // Informational messages
    WARN = 'warn', // Warning messages
    ERROR = 'error', // Error messages
    FATAL = 'fatal', // Fatal errors
}
```

### Legacy Log Levels (for backward compatibility)

```typescript
enum SentryLogLevel {
    DISABLED = 'disabled', // No logging
    ERROR_ONLY = 'error_only', // Only error messages
    WARNING_AND_ERROR = 'warning_and_error', // Warning and error messages
    ALL = 'all', // All log levels
}
```

## 🔄 Workflow Tracking

### Start a Workflow

```typescript
import { startSentryWorkflow } from '@/sentry';

const workflowId = startSentryWorkflow('user-login', 'User Login Process', {
    userId: '12345',
    timestamp: Date.now(),
});
```

### Update Workflow State

```typescript
import { updateSentryWorkflow, WorkflowState } from '@/sentry';

updateSentryWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
    step: 'validating-credentials',
    progress: 50,
});
```

### Complete Workflow

```typescript
import { completeSentryWorkflow } from '@/sentry';

completeSentryWorkflow(workflowId, true, {
    finalStatus: 'success',
    duration: Date.now() - startTime,
});
```

### Workflow States

```typescript
enum WorkflowState {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}
```

## ⚡ Performance Tracking

### Track Async Operations

```typescript
import { trackSentryPerformance } from '@/sentry';

const result = await trackSentryPerformance('api-call', async () => {
    return await fetch('/api/data');
});
```

### Track Synchronous Operations

```typescript
const result = trackSentryPerformance('data-processing', () => {
    return processData(largeDataset);
});
```

## 🗄️ LocalStorage Control

### Global Configuration

```typescript
import { setLocalStorageConfig, clearLocalStorageConfig } from '@/sentry';

// Set global logging level
setLocalStorageConfig({ logLevel: 'debug' });

// Enable/disable Sentry
setLocalStorageConfig({ enabled: false });

// Enable debug mode
setLocalStorageConfig({ debugMode: true });

// Clear all localStorage settings
clearLocalStorageConfig();
```

### Component-Specific Configuration

```typescript
import { setComponentLocalStorageConfig } from '@/sentry';

// Set component-specific log level
setComponentLocalStorageConfig('BetPanel', { logLevel: 'info' });

// Enable/disable specific component
setComponentLocalStorageConfig('BetPanel', { enabled: false });
```

### LocalStorage Keys

```typescript
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level'; // Global log level
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled'; // Global enable/disable
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode'; // Debug mode toggle

// Component-specific keys
const COMPONENT_LOG_LEVEL_KEY = `sentry_log_level_${componentName}`;
const COMPONENT_ENABLED_KEY = `hot-league-wall-debug-enabled_${componentName}`;
```

## 🔧 Advanced Features

### Console Method Override

The SentryManager can override console methods to automatically capture logs:

```typescript
// Console methods are automatically overridden when enableConsoleOverride is true
console.error('This will be captured by Sentry');
console.warn('This will be captured by Sentry');
console.info('This will be captured by Sentry');
console.debug('This will be captured by Sentry');
console.trace('This will be captured by Sentry');
```

### Error Filtering

The system includes intelligent error filtering:

```typescript
// Component-specific error filtering
private isComponentError(message: string): boolean {
    return message.includes(this.componentName) ||
           message.includes('Component') ||
           message.includes('React');
}

// Stack trace filtering
private isComponentStack(stack: string): boolean {
    return stack.includes(this.componentName) ||
           stack.includes('Component') ||
           stack.includes('React');
}
```

### Buffer Management

Automatic buffer clearing to prevent memory issues:

```typescript
// Buffer is automatically cleared every 5 minutes
private setupBufferClearing(): void {
    setInterval(() => {
        this.clearBuffer();
    }, 5 * 60 * 1000); // 5 minutes
}
```

## 📊 Monitoring and Debugging

### Get Current Configuration

```typescript
import { sentryManager } from '@/sentry';

const config = sentryManager.getConfig();
console.log('Current Sentry config:', config);
```

### Get Component Configuration

```typescript
const componentConfig = sentryManager.getComponentConfig();
console.log('Component config:', componentConfig);
```

### Get Active Workflows

```typescript
const activeWorkflows = sentryManager.getActiveWorkflows();
console.log('Active workflows:', activeWorkflows);
```

### Check Logging Status

```typescript
const isEnabled = sentryManager.isLoggingEnabled('info');
console.log('Info logging enabled:', isEnabled);
```

## 🧪 Testing

### Test Configuration

```typescript
import { configureSentryManager } from '@/sentry';

// Configure for testing
configureSentryManager({
    dsn: 'https://test-dsn@sentry.io/project',
    environment: 'test',
    componentName: 'TestComponent',
    logLevel: SentryLogLevel.DEBUG,
    enableConsoleOverride: false,
});
```

### Mock SentryManager

```typescript
// In test files
jest.mock('@/sentry', () => ({
    sentryManager: {
        logError: jest.fn(),
        logWarning: jest.fn(),
        logInfo: jest.fn(),
        logDebug: jest.fn(),
        logTrace: jest.fn(),
        getConfig: jest.fn(),
        getComponentConfig: jest.fn(),
        isLoggingEnabled: jest.fn(),
    },
    configureSentryManager: jest.fn(),
}));
```

## 🚨 Error Handling

### Fallback Configuration

If configuration loading fails, the system provides fallback configurations:

```typescript
// Fallback configuration
const fallbackConfig = {
    logLevel: 'error',
    enabled: true,
    debugMode: false,
};
```

### Error Recovery

The system includes error recovery mechanisms:

```typescript
// Silent fail for localStorage operations
try {
    localStorage.setItem(key, value);
} catch (error) {
    // Silent fail - don't break the application
}
```

## 📝 Best Practices

### 1. Component Configuration

```typescript
// Configure components based on importance
configureComponent('CriticalComponent', {
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

configureComponent('UIComponent', {
    logLevel: SentryLogLevel.ERROR_ONLY,
    enableWorkflowTracking: false,
    enablePerformanceTracking: false,
});
```

### 2. Workflow Management

```typescript
// Always complete workflows
const handleOperation = async () => {
    const workflowId = startSentryWorkflow('Operation', 'Operation Name', {});

    try {
        // Operation logic
        completeSentryWorkflow(workflowId, true, { result: 'success' });
    } catch (error) {
        completeSentryWorkflow(workflowId, false, { error: error.message });
        throw error;
    }
};
```

### 3. Performance Tracking

```typescript
// Track meaningful operations
const result = await trackSentryPerformance('DataProcessing', async () => {
    return await processLargeDataset(data);
});
```

### 4. Error Context

```typescript
// Provide rich context for errors
sentryManager.logError(error, {
    userId: 'user123',
    action: 'place_bet',
    gameId: 'rng-soccer',
    betAmount: 100.0,
    timestamp: Date.now(),
});
```

## 🔄 Migration Guide

### From Old Import Structure

```typescript
// Old
import { SentryManager } from './_shared/utils/sentry/sentry-manager';

// New
import { sentryManager, configureSentryManager } from '@/sentry';
```

### From Direct Class Usage

```typescript
// Old
const manager = new SentryManager();
manager.initialize(config);

// New
configureSentryManager(config);
// Use sentryManager singleton
```

## 📚 API Reference

### Core Methods

-   `initialize(config: SentryManagerConfig): void` - Initialize the manager
-   `logTrace(message: string, context?: Record<string, any>): void` - Log trace message
-   `logDebug(message: string, context?: Record<string, any>): void` - Log debug message
-   `logInfo(message: string, context?: Record<string, any>): void` - Log info message
-   `logWarning(message: string, context?: Record<string, any>): void` - Log warning message
-   `logError(error: Error | string, context?: Record<string, any>): void` - Log error message
-   `logFatal(error: Error | string, context?: Record<string, any>): void` - Log fatal message

### Workflow Methods

-   `startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void`
-   `updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void`
-   `completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void`

### Performance Methods

-   `trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T>`

### Configuration Methods

-   `configureComponent(config: Partial<ComponentConfig>): void`
-   `getComponentConfig(): ComponentConfig | undefined`
-   `getConfig(): GlobalSentryConfig`
-   `isLoggingEnabled(level: string): boolean`

### Utility Methods

-   `close(): void` - Close Sentry connection
-   `cleanup(): void` - Clean up resources
-   `clearBuffer(): void` - Clear internal buffer
-   `getComponentName(): string` - Get current component name
-   `isManagerInitialized(): boolean` - Check if manager is initialized

## 🔗 Related Documentation

-   [SentryHelper Guide](./SENTRY_HELPER_GUIDE.md)
-   [Session Replay Guide](./SENTRY_SESSION_REPLAY_GUIDE.md)
-   [Component Integration Summary](./SENTRY_COMPONENT_INTEGRATION_SUMMARY.md)
-   [Error Handling Enhancement Summary](./SENTRY_ERROR_HANDLING_ENHANCEMENT_SUMMARY.md)
