# Component-Specific Sentry Usage Guide

This guide explains how to use the component-specific Sentry configuration for the HotLeagueWall component to isolate error logging from other game provider components on the same page.

## Overview

The component-specific Sentry implementation provides:

-   **Isolated Error Logging**: Only captures errors from the HotLeagueWall component
-   **Console Override**: Filters console.error and console.warn calls to only log component-specific errors
-   **Context-Aware Logging**: Adds component context to all error logs
-   **Performance Monitoring**: Tracks component-specific operations

## Basic Usage

### 1. Initialize in Your Component

```typescript
import { configureSentryManager, sentryManager, SentryLogLevel } from './_shared/utils/sentry-manager';

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

### 2. Log Different Types of Events

```typescript
// Log errors
try {
    // Your code here
} catch (error) {
    sentryManager.logError(error, {
        action: 'user-action',
        component: 'game-button',
        userId: 'user123',
    });
}

// Log warnings
sentryManager.logWarning('User session expiring soon', {
    timeRemaining: '5 minutes',
    userId: 'user123',
});

// Log info
sentryManager.logInfo('User started game', {
    gameId: 'rng-soccer',
    timestamp: Date.now(),
});

// Log debug
sentryManager.logDebug('Game state updated', {
    gameState: 'loading',
    progress: 75,
});

// Log trace
sentryManager.logTrace('Detailed debugging info', {
    functionName: 'updateGameState',
    parameters: { gameId: '123', action: 'bet' },
});
```

## Advanced Usage

### 1. Error Boundary Integration

```typescript
import React from 'react';
import { sentryManager } from './_shared/utils/sentry-manager';

const GameComponent = () => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        sentryManager.logError(error, {
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

### 2. API Call Error Handling

```typescript
const fetchGameData = async () => {
    try {
        sentryManager.logInfo('Fetching game data', { endpoint: '/api/game-data' });

        const response = await fetch('/api/game-data');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        sentryManager.logInfo('Game data fetched successfully', {
            dataSize: data.length,
            timestamp: Date.now(),
        });

        return data;
    } catch (error) {
        sentryManager.logError(error, {
            action: 'fetch-game-data',
            endpoint: '/api/game-data',
            timestamp: Date.now(),
        });
        throw error;
    }
};
```

### 3. Performance Monitoring

```typescript
const measureOperation = async (operationName: string, operation: () => Promise<any>) => {
    try {
        const result = await sentryManager.trackPerformance(operationName, operation);
        return result;
    } catch (error) {
        // Error is automatically logged by trackPerformance
        throw error;
    }
};

// Or use the convenience function
const result = await trackSentryPerformance(operationName, operation);
```

## Configuration Options

### SentryManager Configuration

```typescript
interface SentryManagerConfig {
    dsn: string; // Sentry DSN
    environment: string; // Environment (PROD, SIT, UAT, LOCAL)
    componentName: string; // Component name for tagging
    release?: string; // Release version
    debug?: boolean; // Enable debug mode
}
```

### SentryManager Configuration Options

```typescript
interface SentryManagerConfig {
    dsn: string; // Sentry DSN
    environment: string; // Environment (PROD, SIT, UAT, LOCAL)
    componentName: string; // Component name for tagging
    release?: string; // Release version
    debug?: boolean; // Enable debug mode
    logLevel?: SentryLogLevel; // Default log level
    enableWorkflowTracking?: boolean; // Enable workflow tracking
    enablePerformanceTracking?: boolean; // Enable performance monitoring
    enableConsoleOverride?: boolean; // Override console methods
}
```

## Error Filtering

The component-specific Sentry automatically filters errors based on:

1. **Component Identifiers**: Looks for component-specific keywords in error messages
2. **Stack Trace Analysis**: Checks if error stack trace contains component file paths
3. **DOM Context**: Filters UI interactions based on component-specific DOM elements

### Component Identifiers

The system looks for these identifiers in error messages and stack traces:

-   `HotLeagueWall`
-   `hot-league-wall`
-   `Lobby`
-   `RNGSoccer`
-   `App.tsx`
-   `lobby`
-   `games`
-   `seal-vg-sg-index`
-   `data-react="true"`

## Benefits

1. **Isolation**: Only captures errors from your component, not from other game providers
2. **Reduced Noise**: Eliminates irrelevant errors from the page
3. **Better Debugging**: Clear component context in all error logs
4. **Performance**: Reduced Sentry quota usage
5. **Maintainability**: Component-specific error tracking

## Migration from Global Sentry

If you're migrating from the global Sentry setup:

1. **Update Global Initialization**: Replace `gc.sentryLogger.start()` with `configureSentryManager()` in `useSentryInit`
2. **Use SentryManager**: Replace direct `gc.sentryLogger.logError` calls with `sentryManager.logError()`
3. **Add Enhanced Features**: Use workflow tracking, performance monitoring, and component-specific configuration
4. **Test**: Verify that all logging features work correctly with the new system

## Troubleshooting

### Errors Not Being Logged

1. Check that the error message contains component identifiers
2. Verify that `enableConsoleOverride` is set to `true`
3. Ensure the component name is correctly set
4. Check that the log level is appropriate for the message type
5. Verify that SentryManager is properly initialized

### Too Many Errors Being Logged

1. Review the component identifiers list
2. Add more specific filtering in the `isComponentError` method
3. Use more specific error contexts

### Performance Issues

1. Disable console override if not needed
2. Use `logInfo` sparingly for high-frequency events
3. Consider implementing sampling for frequent operations
