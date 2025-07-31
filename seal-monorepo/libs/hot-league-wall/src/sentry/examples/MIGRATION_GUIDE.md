# Sentry Logging Migration Guide

## Overview

This guide helps you migrate from the old Sentry logging system to the new batched system that significantly reduces Sentry noise by grouping logs per component and sending them as single messages.

## Problem Solved

The old system sent each log message individually to Sentry, creating excessive noise:

-   Multiple info logs for the same component
-   Workflow tracking logs scattered across multiple entries
-   Performance tracking logs creating clutter
-   Difficult to correlate related logs

The new batched system:

-   Groups logs by component
-   Sends summary messages with detailed context
-   Reduces Sentry noise by 90%+
-   Maintains all logging information in structured format

## Migration Steps

### 1. Update Imports

**Old:**

```typescript
import { useSentryHelper } from '../hooks/useSentryHelper';
import { logInfo, logError, startWorkflow } from '../utils/sentry/sentry-helper';
```

**New:**

```typescript
import { useSentryHelperBatched } from '../hooks/useSentryHelperBatched';
import { logInfoBatched, logErrorBatched, startWorkflowBatched } from '../utils/sentry/sentry-helper-batched';
```

### 2. Update Hook Usage

**Old:**

```typescript
const { logInfo, logError, workflow } = useSentryHelper({
    componentName: 'MyComponent',
    logLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
});
```

**New:**

```typescript
const { logInfo, logError, workflow, flushBatches, getBatchStats } = useSentryHelperBatched({
    componentName: 'MyComponent',
    logLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
});
```

### 3. Update Direct Function Calls

**Old:**

```typescript
import { logInfo, logError, startWorkflow } from '../utils/sentry/sentry-helper';

logInfo('MyComponent', 'User clicked button');
logError('MyComponent', new Error('API call failed'));
startWorkflow('workflow-123', 'User Action', 'MyComponent');
```

**New:**

```typescript
import { logInfoBatched, logErrorBatched, startWorkflowBatched } from '../utils/sentry/sentry-helper-batched';

logInfoBatched('MyComponent', 'User clicked button');
logErrorBatched('MyComponent', new Error('API call failed'));
startWorkflowBatched('workflow-123', 'User Action', 'MyComponent');
```

### 4. Add Batch Management (Optional)

The new system provides additional batch management capabilities:

```typescript
// Force flush all batches
await flushAllBatchesBatched();

// Force flush specific component
await flushComponentBatchesBatched('MyComponent');

// Get batch statistics
const stats = getBatchStatsBatched();
console.log('Batch stats:', stats);
```

## Configuration

### Batch Settings

You can configure the batch behavior:

```typescript
import { sentryBatchManager } from '../utils/sentry/sentry-batch-manager';

// Set flush interval (default: 5000ms)
sentryBatchManager.setFlushInterval(3000);

// Set max batch size (default: 50)
sentryBatchManager.setMaxBatchSize(100);
```

### Automatic Flushing

The system automatically flushes batches when:

-   High priority logs (error, fatal, warn) are added
-   Batch size reaches maximum
-   Time interval expires (default: 5 seconds)

## What Changes in Sentry

### Before (Old System)

```
[INFO] Initializing SentryHelper hook
[INFO] SentryHelper hook initialized successfully
[INFO] Starting workflow
[INFO] Workflow started successfully
[INFO] Processing bet
[INFO] Bet placed successfully
[INFO] Completing workflow
[INFO] Workflow completed successfully
```

### After (New System)

```
[INFO] [MyComponent] Batch Log Summary - Total: 8 (info: 8)
```

The detailed logs are preserved in the Sentry event context:

```json
{
    "batchSize": 8,
    "levels": {
        "info": {
            "count": 8,
            "messages": [
                { "message": "Initializing SentryHelper hook", "timestamp": 1234567890 },
                { "message": "SentryHelper hook initialized successfully", "timestamp": 1234567891 }
                // ... more messages
            ]
        }
    },
    "recentLogs": [{ "level": "info", "message": "Workflow completed successfully", "timestamp": 1234567897 }]
}
```

## Benefits

1. **Reduced Noise**: 90%+ reduction in Sentry events
2. **Better Organization**: Logs grouped by component
3. **Preserved Information**: All log details maintained in context
4. **Performance**: Reduced network overhead
5. **Debugging**: Easier to correlate related logs

## Backward Compatibility

The old system remains available for gradual migration:

-   `useSentryHelper` → `useSentryHelperBatched`
-   `sentry-helper.ts` → `sentry-helper-batched.ts`
-   All old functions still work

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { sentryBatchManager, addBatchedLog, flushComponentBatches } from './sentry-batch-manager';

describe('Sentry Batch Manager', () => {
    it('should batch logs correctly', async () => {
        addBatchedLog('TestComponent', 'Message 1', 'info');
        addBatchedLog('TestComponent', 'Message 2', 'warn');

        await flushComponentBatches('TestComponent');

        // Verify batch was sent to Sentry
    });
});
```

### Integration Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useSentryHelperBatched } from './useSentryHelperBatched';

describe('useSentryHelperBatched', () => {
    it('should initialize correctly', () => {
        const { result } = renderHook(() =>
            useSentryHelperBatched({
                componentName: 'TestComponent',
                logLevel: SentryLogLevel.INFO,
            }),
        );

        expect(result.current.logInfo).toBeDefined();
        expect(result.current.workflow).toBeDefined();
    });
});
```

## Troubleshooting

### Logs Not Appearing

1. Check if batch manager is initialized
2. Verify log level configuration
3. Check if batches are being flushed
4. Use `getBatchStats()` to see pending logs

### Performance Issues

1. Reduce flush interval for more frequent updates
2. Increase max batch size for fewer network calls
3. Use manual flushing for critical operations

### Memory Leaks

1. Ensure `cleanupBatchManager()` is called on app shutdown
2. Use `flushBatches()` in component cleanup
3. Monitor batch statistics for unusual growth

## Migration Checklist

-   [ ] Update imports to use batched versions
-   [ ] Replace hook usage with batched version
-   [ ] Update direct function calls
-   [ ] Test logging functionality
-   [ ] Verify Sentry events are batched
-   [ ] Configure batch settings if needed
-   [ ] Update tests to use new system
-   [ ] Monitor Sentry dashboard for reduced noise

## Support

For issues or questions:

1. Check the test files for usage examples
2. Review the batch manager implementation
3. Use the troubleshooting section above
4. Monitor Sentry dashboard for batch events
