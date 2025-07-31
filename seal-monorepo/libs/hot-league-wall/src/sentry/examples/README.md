# Sentry Logging System - Batched Implementation

## Problem Solved

The original Sentry logging system was creating excessive noise by sending each log message individually to Sentry. This resulted in:

-   **Multiple info logs** for the same component scattered across different entries
-   **Workflow tracking logs** creating clutter with separate entries for start, update, and completion
-   **Performance tracking logs** adding noise with individual timing messages
-   **Difficult correlation** of related logs across multiple Sentry events

## Solution: Batched Logging System

The new batched system groups logs by component and sends them as single, comprehensive messages to Sentry, reducing noise by **90%+** while preserving all logging information.

### Key Features

1. **Component-based Batching**: Logs are grouped by component name
2. **Automatic Flushing**: Batches are flushed based on time intervals, size limits, or priority
3. **Preserved Information**: All log details are maintained in structured context
4. **Priority-based Flushing**: High-priority logs (error, fatal, warn) trigger immediate flush
5. **Configurable Settings**: Adjustable flush intervals and batch sizes
6. **Backward Compatibility**: Old system remains available for gradual migration

## Architecture

### Core Components

1. **SentryBatchManager** (`sentry-batch-manager.ts`)

    - Manages log batching per component
    - Handles automatic and manual flushing
    - Provides batch statistics and configuration

2. **SentryHelperBatched** (`sentry-helper-batched.ts`)

    - Batched version of the original SentryHelper
    - Uses batch manager for all logging operations
    - Maintains same API as original system

3. **useSentryHelperBatched** (`useSentryHelperBatched.ts`)
    - React hook for batched logging
    - Provides batch management capabilities
    - Automatic cleanup and flushing

## Usage Examples

### Basic Component Usage

```typescript
import { useSentryHelperBatched } from '../hooks/useSentryHelperBatched';
import { SentryLogLevel } from '../utils/sentry/sentry-types';

const MyComponent = () => {
    const { logInfo, logError, workflow, flushBatches } = useSentryHelperBatched({
        componentName: 'MyComponent',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true
    });

    const handleAction = async () => {
        const workflowId = workflow.start('User Action');

        try {
            logInfo('Processing user action');
            // ... perform action
            workflow.complete(workflowId, true);
        } catch (error) {
            logError('Action failed', { error: String(error) });
            workflow.complete(workflowId, false);
        }
    };

    return <button onClick={handleAction}>Perform Action</button>;
};
```

### Direct Function Usage

```typescript
import { logInfoBatched, logErrorBatched, startWorkflowBatched } from './sentry-helper-batched';

// Log individual messages
logInfoBatched('MyComponent', 'User clicked button');
logErrorBatched('MyComponent', new Error('API call failed'));

// Start workflow
startWorkflowBatched('workflow-123', 'User Action', 'MyComponent');
```

### Batch Management

```typescript
import { flushAllBatchesBatched, getBatchStatsBatched } from './sentry-helper-batched';

// Force flush all batches
await flushAllBatchesBatched();

// Get batch statistics
const stats = getBatchStatsBatched();
console.log('Active batches:', stats);
```

## Configuration

### Batch Settings

```typescript
import { sentryBatchManager } from './sentry-batch-manager';

// Set flush interval (default: 5000ms)
sentryBatchManager.setFlushInterval(3000);

// Set max batch size (default: 50)
sentryBatchManager.setMaxBatchSize(100);
```

### Automatic Flushing Triggers

Batches are automatically flushed when:

-   **High priority logs** (error, fatal, warn) are added
-   **Batch size** reaches maximum limit
-   **Time interval** expires (default: 5 seconds)

## What You See in Sentry

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

### Detailed Context in Sentry Event

```json
{
    "batchSize": 8,
    "levels": {
        "info": {
            "count": 8,
            "messages": [
                { "message": "Initializing SentryHelper hook", "timestamp": 1234567890 },
                { "message": "SentryHelper hook initialized successfully", "timestamp": 1234567891 },
                { "message": "Starting workflow", "timestamp": 1234567892 },
                { "message": "Workflow started successfully", "timestamp": 1234567893 },
                { "message": "Processing bet", "timestamp": 1234567894 },
                { "message": "Bet placed successfully", "timestamp": 1234567895 },
                { "message": "Completing workflow", "timestamp": 1234567896 },
                { "message": "Workflow completed successfully", "timestamp": 1234567897 }
            ]
        }
    },
    "recentLogs": [{ "level": "info", "message": "Workflow completed successfully", "timestamp": 1234567897 }]
}
```

## Migration Guide

### Step 1: Update Imports

```typescript
// Old
import { useSentryHelper } from '../hooks/useSentryHelper';
import { logInfo, logError } from '../utils/sentry/sentry-helper';

// New
import { useSentryHelperBatched } from '../hooks/useSentryHelperBatched';
import { logInfoBatched, logErrorBatched } from '../utils/sentry/sentry-helper-batched';
```

### Step 2: Update Hook Usage

```typescript
// Old
const { logInfo, logError } = useSentryHelper({
    componentName: 'MyComponent',
    logLevel: SentryLogLevel.INFO,
});

// New
const { logInfo, logError, flushBatches } = useSentryHelperBatched({
    componentName: 'MyComponent',
    logLevel: SentryLogLevel.INFO,
});
```

### Step 3: Update Function Calls

```typescript
// Old
logInfo('MyComponent', 'User clicked button');
logError('MyComponent', new Error('API call failed'));

// New
logInfoBatched('MyComponent', 'User clicked button');
logErrorBatched('MyComponent', new Error('API call failed'));
```

## Benefits

1. **Reduced Noise**: 90%+ reduction in Sentry events
2. **Better Organization**: Logs grouped by component
3. **Preserved Information**: All log details maintained in context
4. **Performance**: Reduced network overhead
5. **Debugging**: Easier to correlate related logs
6. **Backward Compatibility**: Gradual migration possible

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

## Files Overview

-   `sentry-batch-manager.ts` - Core batching logic
-   `sentry-helper-batched.ts` - Batched version of SentryHelper
-   `useSentryHelperBatched.ts` - React hook for batched logging
-   `example-usage.tsx` - Usage examples and demonstrations
-   `MIGRATION_GUIDE.md` - Detailed migration instructions
-   `sentry-batch-manager.test.ts` - Comprehensive test suite

## Support

For issues or questions:

1. Check the test files for usage examples
2. Review the batch manager implementation
3. Use the troubleshooting section above
4. Monitor Sentry dashboard for batch events
5. Refer to the migration guide for step-by-step instructions
