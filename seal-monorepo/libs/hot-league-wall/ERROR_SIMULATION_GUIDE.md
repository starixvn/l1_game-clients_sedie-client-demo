# Hot League Wall - Error Simulation Guide

This guide explains how to use the error simulation functionality to test Sentry session replay in the Hot League Wall component.

## 🎯 Overview

The error simulation system allows you to:

-   Simulate various types of errors in a controlled environment
-   Test Sentry session replay functionality
-   Verify error logging and breadcrumb capture
-   Debug error handling workflows

## 🚀 Quick Start

### 1. Enable Test Mode

To access the error simulation interface, set the `testMode` prop to `true` when initializing the Hot League Wall app:

```typescript
import App from './src/app';

// Initialize with test mode enabled
<App
    appEnv="test"
    siteId="test-site-123"
    language="en"
    testMode={true} // This enables the error testing page
/>
```

### 2. Access the Error Simulator

Once test mode is enabled, you'll see the error testing page with:

-   Quick error test buttons
-   Comprehensive error simulator
-   Auto-simulation controls
-   Real-time error monitoring

## 🧪 Error Simulation Types

### 1. Null Reference Error

Simulates accessing properties of null objects:

```typescript
const nullObject: any = null;
const result = nullObject.someProperty.length; // Throws TypeError
```

### 2. Network Error

Simulates failed network requests:

```typescript
const response = await fetch('https://invalid-url-that-will-fail.com/api/test');
const data = await response.json(); // Throws network error
```

### 3. State Error

Simulates state mutation errors:

```typescript
const state = { games: null };
const gameCount = state.games.length; // Throws TypeError
```

### 4. Workflow Error

Simulates workflow step failures:

```typescript
await workflowTracker.track('Failing Step', async () => {
    throw new Error('Workflow step intentionally failed for testing');
});
```

### 5. Performance Error

Simulates slow operations:

```typescript
await trackPerformance('Slow Operation', async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    throw new Error('Performance threshold exceeded');
});
```

### 6. User Interaction Error

Simulates DOM element not found:

```typescript
const element = document.querySelector('.non-existent-element');
if (!element) {
    throw new Error('Element not found for user action');
}
```

## 📊 Session Replay Breadcrumbs

All error simulations create detailed session replay breadcrumbs with the following format:

```typescript
logError('Session replay: [Error Type] error occurred', {
    error: errorMessage,
    errorType: 'specific_error_type',
    timestamp: Date.now(),
    operation: 'operation_name',
    // Additional context specific to each error type
});
```

### Breadcrumb Metadata

Each error simulation includes:

-   **error**: The actual error message
-   **errorType**: Type of error being simulated
-   **timestamp**: When the error occurred
-   **operation**: Operation that triggered the error
-   **Additional context**: Error-specific metadata

## 🔧 Configuration

### Sentry Configuration

The error simulator uses the following Sentry configuration:

```typescript
{
    dsn: appSettingsWithSentry.sentryDsn,
    environment: appSettingsWithSentry.sentryEnvironment || 'development',
    componentName: 'TestErrorPage',
    release: process.env.REACT_APP_VERSION || '1.0.0',
    debug: process.env.NODE_ENV === 'development',
    logLevel: SentryLogLevel.ERROR // Ensures session replay is enabled
}
```

### Log Levels

-   **ERROR**: All error simulations use ERROR level to ensure session replay
-   **WARNING**: Warning simulations for testing warning handling
-   **INFO**: Info messages for general testing

## 🎮 Using the Error Simulator

### Quick Error Tests

Use the quick test buttons to simulate immediate errors:

-   🚨 **Simulate Error**: Triggers an immediate error
-   ⚠️ **Simulate Warning**: Triggers a warning message
-   ℹ️ **Simulate Info**: Triggers an info message

### Comprehensive Error Simulator

Click "Show Error Simulator" to access the full testing interface:

1. **Individual Error Buttons**: Test specific error types
2. **Random Error**: Randomly selects an error type
3. **Auto Simulation**: Automatically triggers errors every 10 seconds
4. **Error Count**: Track how many errors have been simulated
5. **Reset Count**: Clear the error counter

### Auto Simulation

Enable auto error simulation for continuous testing:

-   Errors are triggered every 10 seconds
-   Random error types are selected
-   Perfect for long-running tests

## 📈 Monitoring and Debugging

### Console Logs

All error simulations log to the console with detailed information:

```
Session replay: Starting null reference error simulation
Session replay: Null reference error occurred
Session replay: Error simulation stopped
```

### Sentry Dashboard

Check your Sentry dashboard for:

-   Error reports with full context
-   Session replay recordings
-   Breadcrumb trails
-   Performance metrics

### Error Tracking

The simulator tracks:

-   Total error count
-   Error types triggered
-   Timestamps
-   Success/failure rates

## 🛠️ Development

### Adding New Error Types

To add a new error simulation type:

1. Add a new function in `ErrorSimulator`:

```typescript
const simulateNewErrorType = async () => {
    const workflowId = workflowTracker.start('New Error Type Simulation', {
        errorType: 'new_error_type',
        timestamp: Date.now(),
    });

    try {
        logInfo('Session replay: Starting new error type simulation', {
            errorType: 'new_error_type',
            timestamp: Date.now(),
        });

        // Your error simulation logic here
        throw new Error('New error type simulation');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        logError('Session replay: New error type occurred', {
            error: errorMessage,
            errorType: 'new_error_type',
            timestamp: Date.now(),
            operation: 'new_error_type_simulation',
        });

        workflowTracker.complete(workflowId, false, {
            error: errorMessage,
            errorType: 'new_error_type',
            timestamp: Date.now(),
        });
    }
};
```

2. Add a button in the UI:

```typescript
<button onClick={simulateNewErrorType}>
    New Error Type
</button>
```

3. Add to the random error selection:

```typescript
const errors = [
    // ... existing errors
    () => simulateNewErrorType(),
];
```

### Customizing Error Messages

You can customize error messages and metadata:

```typescript
logError('Session replay: Custom error message', {
    error: 'Custom error description',
    errorType: 'custom_error',
    customField: 'custom value',
    timestamp: Date.now(),
    operation: 'custom_operation',
});
```

## 🔍 Troubleshooting

### Session Replay Not Appearing

1. Ensure log level is set to `ERROR`
2. Check Sentry DSN configuration
3. Verify session replay is enabled in Sentry plan
4. Check browser console for errors

### Errors Not Logging

1. Verify SentryHelper is properly initialized
2. Check component name configuration
3. Ensure error simulation functions are called
4. Check network connectivity to Sentry

### Auto Simulation Not Working

1. Ensure auto simulation is enabled
2. Check browser console for errors
3. Verify interval is not being cleared
4. Check component unmounting

## 📋 Best Practices

1. **Use Test Mode**: Always use test mode for error simulation
2. **Monitor Console**: Watch console logs for debugging
3. **Check Sentry**: Regularly check Sentry dashboard
4. **Reset Counters**: Reset error counts between test sessions
5. **Document Errors**: Document any new error types added

## 🎯 Example Usage

```typescript
// Initialize app in test mode
const app = (
    <App
        appEnv="test"
        siteId="test-site"
        language="en"
        testMode={true}
    />
);

// The error testing page will be displayed
// Use the interface to simulate various errors
// Check Sentry dashboard for session replay breadcrumbs
```

## 📞 Support

For issues with error simulation:

1. Check this guide first
2. Review console logs
3. Check Sentry dashboard
4. Contact the development team

---

**Note**: This error simulation system is for testing purposes only. Do not use in production environments.
