# SentryManager - Enhanced Sentry Integration for HotLeagueWall

The `SentryManager` is a comprehensive utility that provides granular control over Sentry logging for the HotLeagueWall project. It integrates directly with the enhanced SentryLogger from sg-game-client and implements all six standard Sentry log levels with workflow tracking, performance monitoring, and component-specific configuration.

## 🚀 Features

-   **Six Standard Log Levels**: TRACE, DEBUG, INFO, WARN, ERROR, FATAL
-   **Direct Integration**: Uses sg-game-client SentryLogger via npm package with file: protocol
-   **Global Enable/Disable**: Turn Sentry logging on/off globally
-   **Component-Specific Configuration**: Different log levels for different components
-   **Workflow Tracking**: Track complex operations with states and metadata
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **Console Override**: Optional console method override for automatic logging
-   **Error Filtering**: Component-specific error filtering
-   **Legacy Support**: Backward compatibility with existing log levels

## 📋 Quick Start

### 1. Initialize SentryManager

```typescript
import { sentryManager, configureSentryManager } from './sentry-manager';

// Initialize with custom configuration
configureSentryManager({
    dsn: 'your-sentry-dsn',
    environment: 'production',
    componentName: 'HotLeagueWall',
    logLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true,
});
```

### 2. Use Enhanced Logging

```typescript
import { sentryManager, SentryLogLevel } from './sentry-manager';

// Log different types of events
sentryManager.logInfo('User entered game lobby', {
    userId: 'user123',
    lobbyId: 'lobby456',
    timestamp: Date.now(),
});

sentryManager.logWarning('User balance is low', {
    userId: 'user123',
    balance: 10.5,
    threshold: 20.0,
});

try {
    // Simulate some operation that might fail
    throw new Error('Failed to join game room');
} catch (error) {
    sentryManager.logError(error, {
        userId: 'user123',
        gameRoomId: 'room789',
        action: 'join_game',
    });
}
```

### 3. Workflow Tracking

```typescript
import { sentryManager, WorkflowState } from './sentry-manager';

const workflowId = 'game_session_123';

// Start a workflow
sentryManager.startWorkflow(workflowId, 'Game Session Initialization', {
    userId: 'user123',
    gameType: 'rng-soccer',
    betAmount: 100,
});

// Update workflow state
sentryManager.updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
    step: 'loading_game_assets',
    progress: 25,
});

// Complete workflow
sentryManager.completeWorkflow(workflowId, true, {
    sessionDuration: '2000ms',
    finalStatus: 'ready',
});
```

### 4. Performance Tracking

```typescript
import { sentryManager } from './sentry-manager';

// Track a simple operation
const result = await sentryManager.trackPerformance('Load User Data', async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { userId: 'user123', name: 'John Doe' };
});

// Track a complex operation with error handling
try {
    await sentryManager.trackPerformance('Process Payment', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new Error('Payment failed');
    });
} catch (error) {
    // Error is automatically logged by trackPerformance
    console.log('Payment processing failed');
}
```

## 🔧 Configuration Options

### SentryManagerConfig

```typescript
interface SentryManagerConfig {
    dsn: string; // Sentry DSN
    environment: string; // Environment (production, development, etc.)
    componentName: string; // Component name for filtering
    release?: string; // Release version
    debug?: boolean; // Enable debug mode
    logLevel?: SentryLogLevel; // Default log level
    enableWorkflowTracking?: boolean; // Enable workflow tracking
    enablePerformanceTracking?: boolean; // Enable performance monitoring
    enableConsoleOverride?: boolean; // Override console methods
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

## 📊 Log Levels

### Standard Sentry Log Levels

```typescript
enum SentryLogLevel {
    TRACE = 'trace', // Very fine-grained debugging events
    DEBUG = 'debug', // Debugging events
    INFO = 'info', // Informational events
    WARN = 'warn', // Warning events
    ERROR = 'error', // Error events
    FATAL = 'fatal', // Fatal errors (system crashes)
}
```

### Legacy Log Levels (Backward Compatibility)

```typescript
enum SentryLogLevel {
    DISABLED = 'disabled', // No logging
    ERROR_ONLY = 'error_only', // Only errors
    WARNING_AND_ERROR = 'warning_and_error', // Warnings and errors
    ALL = 'all', // All log levels
}
```

### Log Level Hierarchy

The log levels follow a hierarchy where higher levels include all lower levels:

-   **TRACE**: Includes all levels
-   **DEBUG**: Includes DEBUG, INFO, WARN, ERROR, FATAL
-   **INFO**: Includes INFO, WARN, ERROR, FATAL
-   **WARN**: Includes WARN, ERROR, FATAL
-   **ERROR**: Includes ERROR, FATAL
-   **FATAL**: Includes only FATAL

## 📝 Logging Methods

### Basic Logging

```typescript
// Trace level - very fine-grained debugging
sentryManager.logTrace('Detailed debugging information', { context: 'debug' });

// Debug level - debugging events
sentryManager.logDebug('Debug information', { userId: 'user123' });

// Info level - informational events
sentryManager.logInfo('User action completed', { action: 'bet_placed' });

// Warning level - warning events
sentryManager.logWarning('User balance is low', { balance: 10.5 });

// Error level - error events
sentryManager.logError('Connection failed', { retryCount: 3 });

// Fatal level - fatal errors
sentryManager.logFatal('System crash', { component: 'database' });
```

### Error Handling

```typescript
try {
    // Some operation that might fail
    await riskyOperation();
} catch (error) {
    sentryManager.logError(error, {
        operation: 'riskyOperation',
        userId: 'user123',
        timestamp: Date.now(),
    });

    // Re-throw if needed
    throw error;
}
```

## 🔄 Workflow Tracking

### Workflow States

```typescript
enum WorkflowState {
    STARTED = 'started', // Workflow has started
    IN_PROGRESS = 'in_progress', // Workflow is in progress
    COMPLETED = 'completed', // Workflow completed successfully
    FAILED = 'failed', // Workflow failed
    CANCELLED = 'cancelled', // Workflow was cancelled
}
```

### Complex Workflow Example

```typescript
const workflowId = 'tournament_creation_456';

// Start workflow
sentryManager.startWorkflow(workflowId, 'Tournament Creation', {
    tournamentName: 'Championship Cup',
    maxPlayers: 32,
    entryFee: 50,
});

const steps = [
    { name: 'validate_tournament_config', duration: 200 },
    { name: 'create_tournament_record', duration: 300 },
    { name: 'setup_brackets', duration: 500 },
    { name: 'notify_participants', duration: 400 },
];

for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    // Update workflow state
    sentryManager.updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
        currentStep: step.name,
        progress: ((i + 1) / steps.length) * 100,
        stepNumber: i + 1,
        totalSteps: steps.length,
    });

    try {
        // Track performance for each step
        await sentryManager.trackPerformance(step.name, async () => {
            await new Promise((resolve) => setTimeout(resolve, step.duration));

            // Simulate potential failure
            if (step.name === 'setup_brackets' && Math.random() > 0.8) {
                throw new Error('Failed to setup tournament brackets');
            }
        });
    } catch (error) {
        // Complete workflow with failure
        sentryManager.completeWorkflow(workflowId, false, {
            failedStep: step.name,
            error: error.message,
        });
        return;
    }
}

// Complete workflow successfully
sentryManager.completeWorkflow(workflowId, true, {
    totalDuration: '1400ms',
    participantsNotified: 32,
    tournamentStatus: 'ready',
});
```

## ⚡ Performance Monitoring

### Simple Performance Tracking

```typescript
// Track API calls
const userData = await sentryManager.trackPerformance('Load User Data', async () => {
    const response = await fetch('/api/user/123');
    return response.json();
});
```

### Complex Performance Tracking

```typescript
// Track batch operations
const batchSize = 1000;
const batchResults = {
    processed: 0,
    failed: 0,
    skipped: 0,
};

for (let i = 0; i < batchSize; i += 100) {
    const batchId = `batch_${i}_${i + 99}`;

    try {
        await sentryManager.trackPerformance(`Process Batch ${batchId}`, async () => {
            // Simulate batch processing
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Simulate some failures
            if (Math.random() > 0.95) {
                throw new Error(`Batch ${batchId} processing failed`);
            }

            batchResults.processed += 100;
        });
    } catch (error) {
        batchResults.failed += 100;
        sentryManager.logWarning(`Batch processing failed`, {
            batchId,
            error: error.message,
            retryCount: 0,
        });
    }
}
```

## 🎛️ Console Override

The SentryManager can optionally override console methods to automatically log component-specific errors:

```typescript
// Initialize with console override enabled
configureSentryManager({
    dsn: 'your-dsn',
    environment: 'production',
    componentName: 'HotLeagueWall',
    enableConsoleOverride: true,
});

// These will be automatically logged to Sentry if they contain component identifiers
console.error('HotLeagueWall component error');
console.warn('HotLeagueWall component warning');
console.info('HotLeagueWall component info');
console.debug('HotLeagueWall component debug');
console.trace('HotLeagueWall component trace');
```

### Component Identifiers

The following identifiers are used to filter component-specific errors:

-   `HotLeagueWall`
-   `hot-league-wall`
-   `Lobby`
-   `RNGSoccer`
-   `App.tsx`
-   `lobby`
-   `games`
-   `seal-vg-sg-index`
-   `data-react="true"`

## 🔧 Configuration Methods

### Component Configuration

```typescript
// Configure component-specific settings
sentryManager.configureComponent({
    logLevel: SentryLogLevel.DEBUG,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

// Get component configuration
const config = sentryManager.getComponentConfig();
console.log('Component log level:', config?.logLevel);

// Check if logging is enabled for a level
const isEnabled = sentryManager.isLoggingEnabled('info');
```

### Global Configuration

```typescript
// Get global configuration
const globalConfig = sentryManager.getConfig();
console.log('Global enabled:', globalConfig.enabled);

// Get active workflows
const activeWorkflows = sentryManager.getActiveWorkflows();
console.log('Active workflows:', activeWorkflows.size);
```

## 🧹 Cleanup and Management

### Cleanup Methods

```typescript
// Cleanup all workflows
sentryManager.cleanup();

// Close SentryManager and restore console methods
sentryManager.close();

// Get component name
const componentName = sentryManager.getComponentName();
```

## 🚀 Convenience Functions

The SentryManager provides convenience functions for easy usage:

```typescript
import {
    configureSentryManager,
    enableSentryManager,
    disableSentryManager,
    setSentryLogLevel,
    startSentryWorkflow,
    updateSentryWorkflow,
    completeSentryWorkflow,
    trackSentryPerformance,
} from './sentry-manager';

// Global configuration
configureSentryManager({
    dsn: 'your-dsn',
    environment: 'production',
    componentName: 'HotLeagueWall',
});

// Enable/disable Sentry
enableSentryManager();
disableSentryManager();

// Set log level
setSentryLogLevel(SentryLogLevel.WARN);

// Workflow convenience functions
startSentryWorkflow('workflow-1', 'Test Workflow', { data: 'test' });
updateSentryWorkflow('workflow-1', WorkflowState.IN_PROGRESS, { progress: 50 });
completeSentryWorkflow('workflow-1', true, { result: 'success' });

// Performance tracking convenience function
const result = await trackSentryPerformance('Test Operation', async () => {
    return 'operation result';
});
```

## 🧪 Testing

The SentryManager includes comprehensive tests that follow the AAA (Arrange, Act, Assert) pattern:

```typescript
// Example test structure
describe('SentryManager', () => {
    beforeEach(() => {
        // Arrange: Set up test environment
        sentryManager.initialize({
            dsn: 'test-dsn',
            environment: 'test',
            componentName: 'TestComponent',
        });
    });

    it('should log info message when logging is enabled', () => {
        // Arrange: Mock dependencies
        const { isLoggingEnabled, logInfo } = require('../../../../../../../sg-game-client/src/shared/utils/logger');
        isLoggingEnabled.mockReturnValue(true);

        // Act: Call the method under test
        sentryManager.logInfo('Test info message', { context: 'test' });

        // Assert: Verify the expected behavior
        expect(logInfo).toHaveBeenCalledWith('TestComponent', 'Test info message', { context: 'test' });
    });
});
```

## 🔄 Migration from Old Version

### Before (using old npm package)

```typescript
import * as gc from '@sg/sg-game-client';

// Initialize
gc.sentryLogger.start(dsn, environment, identifier);

// Log errors
gc.sentryLogger.logError('Error message');
```

### After (using enhanced SentryManager)

```typescript
import { sentryManager, configureSentryManager } from './sentry-manager';

// Initialize
configureSentryManager({
    dsn: dsn,
    environment: environment,
    componentName: 'HotLeagueWall',
    logLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true,
});

// Log errors with enhanced features
sentryManager.logError('Error message', {
    context: 'additional data',
    component: 'HotLeagueWall',
    action: 'user_action',
});
```

## 📚 API Reference

### Main Exports

-   `SentryManager`: Main class for Sentry management
-   `sentryManager`: Singleton instance of SentryManager
-   `SentryLogLevel`: Enum of all available log levels
-   `WorkflowState`: Enum of workflow states
-   `ComponentConfig`: Interface for component configuration
-   `WorkflowConfig`: Interface for workflow configuration
-   `GlobalSentryConfig`: Interface for global configuration

### Logging Methods

-   `logTrace()`: Log trace-level messages
-   `logDebug()`: Log debug-level messages
-   `logInfo()`: Log info-level messages
-   `logWarning()`: Log warning-level messages
-   `logError()`: Log error-level messages
-   `logFatal()`: Log fatal-level messages

### Workflow Methods

-   `startWorkflow()`: Start a new workflow
-   `updateWorkflow()`: Update workflow state
-   `completeWorkflow()`: Complete a workflow

### Performance Methods

-   `trackPerformance()`: Track operation performance

### Configuration Methods

-   `configureComponent()`: Configure component-specific settings
-   `getComponentConfig()`: Get component configuration
-   `isLoggingEnabled()`: Check if logging is enabled
-   `getConfig()`: Get global configuration
-   `getActiveWorkflows()`: Get active workflows

### Utility Methods

-   `cleanup()`: Clean up all workflows
-   `close()`: Close SentryManager and restore console
-   `getComponentName()`: Get component name

### Convenience Functions

-   `configureSentryManager()`: Initialize SentryManager
-   `enableSentryManager()`: Enable Sentry globally
-   `disableSentryManager()`: Disable Sentry globally
-   `setSentryLogLevel()`: Set default log level
-   `startSentryWorkflow()`: Start workflow (convenience)
-   `updateSentryWorkflow()`: Update workflow (convenience)
-   `completeSentryWorkflow()`: Complete workflow (convenience)
-   `trackSentryPerformance()`: Track performance (convenience)

## 🤝 Contributing

When contributing to the SentryManager:

1. Follow the existing code patterns
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Ensure all tests pass before submitting
5. Follow the AAA (Arrange, Act, Assert) testing pattern
6. Use descriptive test names that explain the scenario and expected behavior

## 📄 License

This project is part of the HotLeagueWall component and follows the same licensing terms as the parent project.
