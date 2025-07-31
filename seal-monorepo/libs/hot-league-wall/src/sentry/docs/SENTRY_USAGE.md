# Component-Specific Sentry Usage Guide

This guide explains how to use the component-specific Sentry configuration for the HotLeagueWall component to isolate error logging from other game provider components on the same page.

## Overview

The component-specific Sentry implementation provides:

-   **Isolated Error Logging**: Only captures errors from the HotLeagueWall component
-   **Console Override**: Filters console.error and console.warn calls to only log component-specific errors
-   **Context-Aware Logging**: Adds component context to all error logs
-   **Performance Monitoring**: Tracks component-specific operations
-   **Unified Import Structure**: Single `@/sentry` import point for all functionality

## Basic Usage

### 1. Initialize in Your Component

```typescript
import { configureSentryManager, sentryManager, SentryLogLevel } from '@/sentry';

const YourComponent = () => {
    useEffect(() => {
        configureSentryManager({
            dsn: 'your-sentry-dsn',
            environment: 'production',
            componentName: 'HotLeagueWall',
            logLevel: SentryLogLevel.INFO,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true,
        });
    }, []);

    // Your component logic here
};
```

### 2. Use React Hook for Component Integration

```typescript
import { useSentryHelper, SentryLogLevel } from '@/sentry';

const YourComponent = () => {
    const { logError, logWarning, logInfo, logDebug, logTrace, workflow } = useSentryHelper({
        componentName: 'YourComponent',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
    });

    useEffect(() => {
        logInfo('Component mounted', {
            timestamp: Date.now(),
            props: props,
        });
    }, []);

    // Your component logic here
};
```

### 3. Log Different Types of Events

```typescript
// Log errors
try {
    // Your code here
} catch (error) {
    logError(error, {
        action: 'user-action',
        component: 'game-button',
        userId: 'user123',
    });
}

// Log warnings
logWarning('User session expiring soon', {
    timeRemaining: '5 minutes',
    userId: 'user123',
});

// Log info
logInfo('User started game', {
    gameId: 'rng-soccer',
    timestamp: Date.now(),
});

// Log debug
logDebug('Game state updated', {
    gameState: 'loading',
    progress: 75,
});

// Log trace
logTrace('Detailed debugging info', {
    functionName: 'updateGameState',
    parameters: { gameId: '123', action: 'bet' },
});
```

## Advanced Usage

### 1. Error Boundary Integration

```typescript
import React from 'react';
import { logError } from '@/sentry';

const GameComponent = () => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        logError('ErrorBoundary', error, {
            errorInfo,
            component: 'GameComponent',
            action: 'render'
        });
    };

    return (
        <ErrorBoundary onError={handleError}>
            {/* Your game content */}
        </ErrorBoundary>
    );
};
```

### 2. Workflow Tracking

```typescript
import { useSentryHelper, WorkflowState } from '@/sentry';

const GameComponent = () => {
    const { workflow } = useSentryHelper({
        componentName: 'GameComponent',
        enableWorkflowTracking: true,
    });

    const handleGameAction = async () => {
        const workflowId = workflow.start('game-action', 'Game Action Process', {
            action: 'bet',
            gameId: 'rng-soccer',
            timestamp: Date.now(),
        });

        try {
            workflow.update(workflowId, WorkflowState.IN_PROGRESS, {
                step: 'processing',
                progress: 50,
            });

            // Perform game action
            await performGameAction();

            workflow.complete(workflowId, true, {
                result: 'success',
                duration: Date.now() - startTime,
            });
        } catch (error) {
            workflow.complete(workflowId, false, {
                error: error.message,
                step: 'failed',
            });
            throw error;
        }
    };
};
```

### 3. Performance Tracking

```typescript
import { useSentryHelper } from '@/sentry';

const GameComponent = () => {
    const { workflow } = useSentryHelper({
        componentName: 'GameComponent',
        enablePerformanceTracking: true,
    });

    const handleExpensiveOperation = async () => {
        const result = await workflow.track('expensive-operation', async () => {
            // Your expensive operation here
            return await performExpensiveOperation();
        });

        return result;
    };
};
```

### 4. Batched Logging for High-Frequency Operations

```typescript
import { useSentryHelperBatched } from '@/sentry';

const HighFrequencyComponent = () => {
    const { logInfoBatched, logErrorBatched, flushBatches } = useSentryHelperBatched({
        componentName: 'HighFrequencyComponent',
        batchSize: 10,
        flushInterval: 5000,
    });

    const handleHighFrequencyEvent = () => {
        logInfoBatched('High frequency event', {
            eventType: 'user-interaction',
            timestamp: Date.now(),
        });
    };

    // Flush batches when needed
    const handleComponentUnmount = () => {
        flushBatches();
    };
};
```

## Configuration

### Environment Configuration

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
                "YourComponent": {
                    "logLevel": "error",
                    "enableWorkflowTracking": true,
                    "enablePerformanceTracking": true
                }
            }
        }
    }
}
```

### LocalStorage Control

```javascript
// Enable debug logging
localStorage.setItem('sentry_log_level', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled', 'true');
localStorage.setItem('sentry_debug_mode', 'true');

// Disable logging
localStorage.setItem('hot-league-wall-debug-enabled', 'false');

// Component-specific control
localStorage.setItem('sentry_log_level_YourComponent', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled_YourComponent', 'true');
```

## Best Practices

### 1. Component Integration

```typescript
// ✅ Good: Use the hook with proper configuration
const { logError, logInfo } = useSentryHelper({
    componentName: 'YourComponent',
    logLevel: SentryLogLevel.ERROR,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

// ✅ Good: Include rich context
logError(error, {
    userId: 'user123',
    action: 'place_bet',
    gameId: 'rng-soccer',
    betAmount: 100.0,
    timestamp: Date.now(),
});

// ❌ Bad: Don't log sensitive information
logError(error, {
    password: userPassword, // Never log passwords
    creditCard: cardNumber, // Never log credit card numbers
});
```

### 2. Error Handling

```typescript
// ✅ Good: Always include error handling
const handleRiskyOperation = async () => {
    try {
        const result = await performRiskyOperation();
        logInfo('Operation successful', { result });
        return result;
    } catch (error) {
        logError(error, {
            operation: 'risky-operation',
            timestamp: Date.now(),
        });
        throw error;
    }
};
```

### 3. Workflow Management

```typescript
// ✅ Good: Always complete workflows
const handleOperation = async () => {
    const workflowId = workflow.start('operation', 'Operation Name', {});

    try {
        // Operation logic
        workflow.complete(workflowId, true, { result: 'success' });
    } catch (error) {
        workflow.complete(workflowId, false, { error: error.message });
        throw error;
    }
};
```

## Migration from Old Import Structure

### Before (Old Structure)

```typescript
import { configureSentryManager } from './_shared/utils/sentry/sentry-manager';
import { useSentryHelper } from './_shared/hooks/useSentryHelper';
import { SentryLogLevel } from './_shared/utils/sentry/sentry-types';
```

### After (New Structure)

```typescript
import { configureSentryManager, useSentryHelper, SentryLogLevel } from '@/sentry';
```

## Troubleshooting

### Common Issues

1. **Logs Not Appearing**: Check localStorage settings and component configuration
2. **Import Errors**: Ensure you're using `@/sentry` imports
3. **Performance Issues**: Use batched logging for high-frequency operations
4. **Memory Leaks**: Always complete workflows and clean up resources

### Debug Mode

```javascript
// Enable debug mode
localStorage.setItem('sentry_debug_mode', 'true');

// Check configuration
console.log('Sentry Config:', getCurrentConfiguration());
```

This guide provides comprehensive usage instructions for the component-specific Sentry implementation with the new unified import structure.
