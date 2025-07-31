# SentryHelper - Advanced Sentry Management Guide

The `SentryHelper` is a comprehensive utility that provides granular control over Sentry logging for your HotLeagueWall component. It offers workflow tracking, performance monitoring, component-specific configuration, and localStorage-based dynamic control with easy on/off controls.

## 🚀 Features

-   **Global Enable/Disable**: Turn Sentry logging on/off globally
-   **Component-Specific Configuration**: Different log levels for different components
-   **Workflow Tracking**: Track complex operations with states and metadata
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **Granular Log Levels**: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, DISABLED, ERROR_ONLY, WARNING_AND_ERROR, ALL
-   **React Hooks**: Easy integration with React components
-   **localStorage Control**: Dynamic logging control without code deployment
-   **Environment Consistency**: Same rules apply across all environments
-   **Privacy-Focused Session Replay**: Only enabled for error/fatal levels
-   **Batch Processing**: Efficient batched logging for high-frequency operations
-   **Game Cron Integration**: Specialized logging for game cron operations

## 📋 Quick Start

### 1. Initialize SentryHelper

```typescript
import { configureSentry, enableSentry, setLogLevel } from '@/sentry';

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
import { configureComponent } from '@/sentry';

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
import { useSentryHelper, SentryLogLevel } from '@/sentry';

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
    componentConfigs: Map<string, ComponentConfig>; // Component-specific configs
    workflowConfigs: Map<string, WorkflowConfig>; // Workflow-specific configs
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

### Environment Configuration

The system now supports comprehensive environment-specific configurations:

```json
{
    "sentry": {
        "dsn": "https://your-dsn@sentry.io/project",
        "environment": "LOCAL1",
        "logLevel": "error",
        "enableSessionReplay": true,
        "sessionReplaySampleRate": 1.0,
        "errorSampleRate": 1.0,
        "componentLogging": {
            "enabled": true,
            "defaultLogLevel": "error",
            "components": {
                "HotLeagueWall": {
                    "logLevel": "error",
                    "enableWorkflowTracking": true,
                    "enablePerformanceTracking": true
                },
                "BetPanel": {
                    "logLevel": "error",
                    "enableWorkflowTracking": false,
                    "enablePerformanceTracking": true
                }
            }
        }
    }
}
```

## 🎯 Log Levels

### Standard Log Levels

```typescript
enum SentryLogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
}
```

### Legacy Log Levels (for backward compatibility)

```typescript
enum SentryLogLevel {
    DISABLED = 'disabled',
    ERROR_ONLY = 'error_only',
    WARNING_AND_ERROR = 'warning_and_error',
    ALL = 'all',
}
```

## 🔄 Workflow Tracking

### Start a Workflow

```typescript
import { startWorkflow, updateWorkflow, completeWorkflow } from '@/sentry';

const workflowId = startWorkflow('user-login', 'User Login Process', {
    userId: '12345',
    timestamp: Date.now(),
});
```

### Update Workflow State

```typescript
updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
    step: 'validating-credentials',
    progress: 50,
});
```

### Complete Workflow

```typescript
completeWorkflow(workflowId, true, {
    finalStatus: 'success',
    duration: Date.now() - startTime,
});
```

## ⚡ Performance Tracking

### Track Async Operations

```typescript
import { trackPerformance } from '@/sentry';

const result = await trackPerformance('api-call', async () => {
    return await fetch('/api/data');
});
```

### Track Synchronous Operations

```typescript
const result = trackPerformance('data-processing', () => {
    return processData(largeDataset);
});
```

## 🎣 React Hooks

### useSentryHelper

Main hook for component-level Sentry integration:

```typescript
const { logError, logWarning, logInfo, workflow } = useSentryHelper({
    componentName: 'MyComponent',
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    autoConfigure: true,
});
```

### useSentryHelperBatched

For high-frequency logging operations:

```typescript
const { logErrorBatched, logInfoBatched, flushBatches } = useSentryHelperBatched({
    componentName: 'HighFrequencyComponent',
    batchSize: 10,
    flushInterval: 5000,
});
```

### useGameCronSentry

Specialized hook for game cron operations:

```typescript
const { logGameCron, trackGameCronPerformance } = useGameCronSentry({
    gameId: 118,
    cronType: 'round-settlement',
});
```

## 🗄️ LocalStorage Control

### Dynamic Configuration

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

### Component-Specific Control

```typescript
import { setComponentLocalStorageConfig } from '@/sentry';

// Set component-specific log level
setComponentLocalStorageConfig('BetPanel', { logLevel: 'info' });

// Enable/disable specific component
setComponentLocalStorageConfig('BetPanel', { enabled: false });
```

## 🔧 Advanced Configuration

### SentryManager Direct Usage

```typescript
import { sentryManager, configureSentryManager } from '@/sentry';

// Configure the manager
configureSentryManager({
    dsn: 'https://your-dsn@sentry.io/project',
    environment: 'production',
    componentName: 'MyApp',
    logLevel: SentryLogLevel.ERROR,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

// Use directly
sentryManager.logError('Something went wrong', { context: 'additional info' });
```

### Batch Manager

```typescript
import { sentryBatchManager, addBatchedLog, flushAllBatches } from '@/sentry';

// Add logs to batch
addBatchedLog('error', 'Component', 'Error message', { context: 'data' });

// Flush all batches
flushAllBatches();
```

## 🎮 Game Integration

### Game Cron Batch Manager

```typescript
import { sentryGameCronBatchManager, addGameCronLog } from '@/sentry';

// Add game cron logs
addGameCronLog('round-settlement', 'Round 12345 settled', {
    gameId: 118,
    roundId: 12345,
    settlement: { amount: 100, currency: 'USD' },
});
```

## 🧪 Testing

### Test Configuration

```typescript
import { configureSentryForEnvironment } from '@/sentry';

// Configure for testing environment
configureSentryForEnvironment('test', {
    dsn: 'https://test-dsn@sentry.io/project',
    logLevel: SentryLogLevel.DEBUG,
    enableSessionReplay: false,
});
```

## 📊 Monitoring and Debugging

### Get Current Configuration

```typescript
import { getCurrentConfiguration } from '@/sentry';

const config = getCurrentConfiguration();
console.log('Current Sentry config:', config);
```

### Get Batch Statistics

```typescript
import { getBatchStatsBatched } from '@/sentry';

const stats = getBatchStatsBatched();
console.log('Batch statistics:', stats);
```

## 🚨 Error Handling

### Error Filtering

The system automatically filters out component-specific errors and provides buffer management to prevent overflow.

### Fallback Configuration

If configuration loading fails, the system provides fallback configurations to ensure the application continues to function.

## 📝 Best Practices

1. **Use Component-Specific Configuration**: Configure different log levels for different components based on their importance
2. **Enable Workflow Tracking**: Use workflow tracking for complex operations that span multiple steps
3. **Use Performance Tracking**: Track performance for critical operations
4. **Use Batched Logging**: Use batched logging for high-frequency operations
5. **Configure Environment-Specific Settings**: Use different configurations for different environments
6. **Monitor LocalStorage Usage**: Be aware of localStorage limitations and clear old configurations periodically

## 🔄 Migration Guide

### From Old Import Structure

```typescript
// Old
import { configureSentry } from './_shared/utils/sentry/sentry-helper';

// New
import { configureSentry } from '@/sentry';
```

### From Direct SentryManager Usage

```typescript
// Old
import { SentryManager } from './_shared/utils/sentry/sentry-manager';

// New
import { sentryManager, configureSentryManager } from '@/sentry';
```

## 📚 Additional Resources

-   [SentryManager Documentation](./sentry-manager.README.md)
-   [Session Replay Guide](./SENTRY_SESSION_REPLAY_GUIDE.md)
-   [Component Integration Summary](./SENTRY_COMPONENT_INTEGRATION_SUMMARY.md)
-   [Error Handling Enhancement Summary](./SENTRY_ERROR_HANDLING_ENHANCEMENT_SUMMARY.md)
