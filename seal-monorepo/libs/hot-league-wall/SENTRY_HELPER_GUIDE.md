# SentryHelper - Advanced Sentry Management Guide

The `SentryHelper` is a comprehensive utility that provides granular control over Sentry logging for your HotLeagueWall component. It offers workflow tracking, performance monitoring, and component-specific configuration with easy on/off controls.

## 🚀 Features

-   **Global Enable/Disable**: Turn Sentry logging on/off globally
-   **Component-Specific Configuration**: Different log levels for different components
-   **Workflow Tracking**: Track complex operations with states and metadata
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **Granular Log Levels**: ERROR_ONLY, WARNING_AND_ERROR, ALL, DISABLED
-   **React Hooks**: Easy integration with React components

## 📋 Quick Start

### 1. Initialize SentryHelper

```typescript
import { configureSentry, enableSentry, setLogLevel } from './_shared/utils/sentry-helper';

// Initialize with custom configuration
configureSentry({
    enabled: true,
    defaultLogLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true,
});

// Or use convenience functions
enableSentry();
setLogLevel(SentryLogLevel.WARNING_AND_ERROR);
```

### 2. Configure Components

```typescript
import { configureComponent } from './_shared/utils/sentry-helper';

// Configure different components with different log levels
configureComponent('GameLobby', {
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

configureComponent('BettingSystem', {
    logLevel: SentryLogLevel.ERROR_ONLY,
    enableWorkflowTracking: false,
    enablePerformanceTracking: true,
});
```

### 3. Use in React Components

```typescript
import { useSentryHelper, SentryLogLevel } from './_shared/hooks/useSentryHelper';

const MyComponent = () => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: SentryLogLevel.ALL,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
    });

    // Your component logic here
};
```

## 🔧 Configuration Options

### Global Configuration

```typescript
interface GlobalSentryConfig {
    enabled: boolean; // Master switch for Sentry
    defaultLogLevel: SentryLogLevel; // Default log level for all components
    enableWorkflowTracking: boolean; // Enable workflow tracking
    enablePerformanceTracking: boolean; // Enable performance monitoring
    enableConsoleOverride: boolean; // Override console methods
}
```

### Component Configuration

```typescript
interface ComponentConfig {
    name: string; // Component name
    logLevel: SentryLogLevel; // Log level for this component
    enableWorkflowTracking?: boolean; // Enable workflow tracking for component
    enablePerformanceTracking?: boolean; // Enable performance tracking for component
}
```

### Log Levels

```typescript
enum SentryLogLevel {
    DISABLED = 'disabled', // No logging
    ERROR_ONLY = 'error_only', // Only errors
    WARNING_AND_ERROR = 'warning_and_error', // Warnings and errors
    ALL = 'all', // All log levels
}
```

## 📊 Workflow Tracking

### Basic Workflow

```typescript
import { startWorkflow, updateWorkflow, completeWorkflow, WorkflowState } from './_shared/utils/sentry-helper';

const workflowId = 'user_login_123';

// Start workflow
startWorkflow(workflowId, 'User Login Process', 'AuthComponent', {
    userId: 'user123',
    loginMethod: 'email',
});

try {
    // Update workflow state
    updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
        step: 'validating_credentials',
        progress: 25,
    });

    // Your logic here
    await validateCredentials();

    updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
        step: 'creating_session',
        progress: 75,
    });

    await createSession();

    // Complete successfully
    completeWorkflow(workflowId, true, {
        sessionId: 'session456',
        duration: '1500ms',
    });
} catch (error) {
    // Complete with failure
    completeWorkflow(workflowId, false, {
        error: error.message,
        step: 'failed',
    });
}
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

### Automatic Performance Tracking

```typescript
import { trackPerformance } from './_shared/utils/sentry-helper';

// Track any operation automatically
const result = await trackPerformance('DataLoader', 'Load User Data', async () => {
    // Your async operation here
    const response = await fetch('/api/user-data');
    return response.json();
});

// The operation is automatically timed and logged
```

### Manual Performance Tracking

```typescript
const { workflow } = useSentryHelper({ componentName: 'MyComponent' });

const operationId = workflow.start('Complex Operation', { userId: 'user123' });

try {
    // Your operation here
    const result = await complexOperation();

    workflow.complete(operationId, true, { result: 'success' });
    return result;
} catch (error) {
    workflow.complete(operationId, false, { error: error.message });
    throw error;
}
```

## 🎯 React Hooks

### useSentryHelper (Full Featured)

```typescript
const { logError, logWarning, logInfo, workflow, isLoggingEnabled, getConfig } = useSentryHelper({
    componentName: 'MyComponent',
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});
```

### useSimpleSentry (Basic Logging)

```typescript
const { logError, logWarning, logInfo } = useSimpleSentry('MyComponent', SentryLogLevel.ERROR_ONLY);
```

### useWorkflowSentry (Workflow Focused)

```typescript
const { workflow, logError } = useWorkflowSentry('MyComponent', {
    logLevel: SentryLogLevel.WARNING_AND_ERROR,
});
```

## 🔄 Usage Patterns

### 1. Component Lifecycle Tracking

```typescript
const MyComponent = () => {
    const { workflow } = useSentryHelper({ componentName: 'MyComponent' });

    useEffect(() => {
        const lifecycleId = workflow.start('Component Lifecycle', {
            componentName: 'MyComponent',
        });

        return () => {
            workflow.complete(lifecycleId, true, {
                reason: 'component_unmounted',
            });
        };
    }, []);

    // Component logic
};
```

### 2. API Call Tracking

```typescript
const { workflow, logError } = useSentryHelper({ componentName: 'ApiClient' });

const fetchData = async (endpoint: string) => {
    const apiId = workflow.start('API Call', { endpoint });

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        workflow.complete(apiId, true, {
            statusCode: response.status,
            dataSize: JSON.stringify(data).length,
        });

        return data;
    } catch (error) {
        workflow.complete(apiId, false, { error: error.message });
        logError(error, { endpoint });
        throw error;
    }
};
```

### 3. User Interaction Tracking

```typescript
const { logInfo, logWarning } = useSentryHelper({ componentName: 'UserInterface' });

const handleButtonClick = (buttonId: string, userId: string) => {
    logInfo('User clicked button', {
        buttonId,
        userId,
        timestamp: Date.now(),
    });

    // Button logic
};

const handleFormError = (formId: string, error: string, userId: string) => {
    logWarning('Form validation failed', {
        formId,
        error,
        userId,
        timestamp: Date.now(),
    });
};
```

### 4. Error Recovery

```typescript
const { workflow, logError, logWarning } = useSentryHelper({ componentName: 'ConnectionManager' });

const connectWithRetry = async (maxRetries: number = 3) => {
    const connectionId = workflow.start('Connection with Retry', { maxRetries });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await workflow.track(`Connection Attempt ${attempt}`, async () => {
                // Connection logic
                await connect();
            });

            workflow.complete(connectionId, true, {
                attempts: attempt,
                success: true,
            });
            return;
        } catch (error) {
            logWarning('Connection attempt failed', {
                attempt,
                maxRetries,
                error: error.message,
                willRetry: attempt < maxRetries,
            });

            if (attempt === maxRetries) {
                workflow.complete(connectionId, false, {
                    attempts: attempt,
                    finalError: error.message,
                });
                throw error;
            }
        }
    }
};
```

## 🛠️ Advanced Configuration

### Environment-Based Configuration

```typescript
const configureForEnvironment = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    configureSentry({
        enabled: true,
        defaultLogLevel: isDevelopment ? SentryLogLevel.ALL : SentryLogLevel.ERROR_ONLY,
        enableWorkflowTracking: isDevelopment,
        enablePerformanceTracking: isProduction,
        enableConsoleOverride: true,
    });
};
```

### Dynamic Component Configuration

```typescript
const configureComponentsByType = () => {
    // Critical components - log everything
    configureComponent('PaymentProcessor', {
        logLevel: SentryLogLevel.ALL,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
    });

    // UI components - log errors only
    configureComponent('Button', {
        logLevel: SentryLogLevel.ERROR_ONLY,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
    });

    // Debug components - disabled in production
    configureComponent('DebugPanel', {
        logLevel: process.env.NODE_ENV === 'development' ? SentryLogLevel.ALL : SentryLogLevel.DISABLED,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
    });
};
```

## 📈 Monitoring and Debugging

### Get Current Configuration

```typescript
import { sentryHelper } from './_shared/utils/sentry-helper';

// Get current global configuration
const config = sentryHelper.getConfig();
console.log('Current Sentry config:', config);

// Get component-specific configuration
const componentConfig = sentryHelper.getComponentConfig('MyComponent');
console.log('Component config:', componentConfig);

// Get active workflows
const activeWorkflows = sentryHelper.getActiveWorkflows();
console.log('Active workflows:', activeWorkflows);
```

### Check Logging Status

```typescript
const { isLoggingEnabled } = useSentryHelper({ componentName: 'MyComponent' });

// Check if specific log levels are enabled
if (isLoggingEnabled('error')) {
    // Error logging is enabled
}

if (isLoggingEnabled('warning')) {
    // Warning logging is enabled
}

if (isLoggingEnabled('info')) {
    // Info logging is enabled
}
```

## 🧹 Cleanup

### Manual Cleanup

```typescript
import { sentryHelper } from './_shared/utils/sentry-helper';

// Clean up all workflows and configurations
sentryHelper.cleanup();
```

### React Component Cleanup

```typescript
const MyComponent = () => {
    const { workflow } = useSentryHelper({ componentName: 'MyComponent' });

    useEffect(() => {
        return () => {
            // Active workflows are automatically completed on unmount
            // with reason: 'component_unmounted'
        };
    }, []);
};
```

## 🎯 Best Practices

### 1. Use Appropriate Log Levels

-   **ERROR_ONLY**: For production-critical components
-   **WARNING_AND_ERROR**: For important components
-   **ALL**: For development and debugging
-   **DISABLED**: For non-critical UI components

### 2. Workflow Naming

-   Use descriptive workflow names: `'User Login Process'` not `'login'`
-   Include context in metadata: `{ userId, loginMethod, timestamp }`
-   Use consistent naming patterns across components

### 3. Performance Tracking

-   Track expensive operations: API calls, file operations, complex calculations
-   Use automatic tracking for simple operations
-   Use manual tracking for complex multi-step operations

### 4. Error Context

-   Always include relevant context in error logs
-   Use structured metadata for better filtering
-   Include user identifiers when appropriate

### 5. Environment Configuration

-   Use different log levels for different environments
-   Disable workflow tracking in production for performance
-   Enable detailed logging only in development

## 🔍 Troubleshooting

### Common Issues

1. **Logs not appearing**: Check if Sentry is enabled and log level is appropriate
2. **Workflows not tracking**: Ensure workflow tracking is enabled for the component
3. **Performance impact**: Disable workflow tracking for high-frequency operations
4. **Memory leaks**: Ensure workflows are properly completed or cleaned up

### Debug Mode

```typescript
// Enable debug mode for detailed logging
configureSentry({
    enabled: true,
    defaultLogLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true,
});

// Check console for detailed SentryHelper logs
```

This comprehensive SentryHelper system provides you with full control over Sentry logging while maintaining excellent developer experience and performance monitoring capabilities.
