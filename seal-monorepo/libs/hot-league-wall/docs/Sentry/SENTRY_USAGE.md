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
import { useComponentSentry } from './_shared/hooks/useComponentSentry';

const YourComponent = () => {
    const { logError, logWarning, logInfo } = useComponentSentry({
        componentName: 'HotLeagueWall',
        enableConsoleOverride: true,
    });

    // Your component logic here
};
```

### 2. Log Different Types of Events

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
```

## Advanced Usage

### 1. Error Boundary Integration

```typescript
import React from 'react';
import { useComponentSentry } from './_shared/hooks/useComponentSentry';

const GameComponent = () => {
    const { logError } = useComponentSentry();

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        logError(error, {
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
    const { logError, logInfo } = useComponentSentry();

    try {
        logInfo('Fetching game data', { endpoint: '/api/game-data' });

        const response = await fetch('/api/game-data');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        logInfo('Game data fetched successfully', {
            dataSize: data.length,
            timestamp: Date.now(),
        });

        return data;
    } catch (error) {
        logError(error, {
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
    const { logError, logInfo } = useComponentSentry();
    const startTime = performance.now();

    try {
        logInfo(`Starting operation: ${operationName}`, {
            operationName,
            startTime: Date.now(),
        });

        const result = await operation();

        const endTime = performance.now();
        const duration = endTime - startTime;

        logInfo(`Operation completed: ${operationName}`, {
            operationName,
            duration: `${duration.toFixed(2)}ms`,
            endTime: Date.now(),
        });

        return result;
    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        logError(error, {
            operationName,
            duration: `${duration.toFixed(2)}ms`,
            failedAt: Date.now(),
        });

        throw error;
    }
};
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

### useComponentSentry Options

```typescript
interface UseComponentSentryOptions {
    componentName?: string; // Default: 'HotLeagueWall'
    enableConsoleOverride?: boolean; // Default: true
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

1. **Remove Global Initialization**: The `useSentryInit` function in `index.tsx` is now a no-op
2. **Add Component Hook**: Use `useComponentSentry` in your main component
3. **Update Error Logging**: Replace direct `gc.sentryLogger.logError` calls with the hook methods
4. **Test**: Verify that only component-specific errors are being logged

## Troubleshooting

### Errors Not Being Logged

1. Check that the error message contains component identifiers
2. Verify that `enableConsoleOverride` is set to `true`
3. Ensure the component name is correctly set

### Too Many Errors Being Logged

1. Review the component identifiers list
2. Add more specific filtering in the `isComponentError` method
3. Use more specific error contexts

### Performance Issues

1. Disable console override if not needed
2. Use `logInfo` sparingly for high-frequency events
3. Consider implementing sampling for frequent operations
