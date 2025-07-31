# Infinite Re-render Issue Fix

## Problem Description

The application was experiencing a "Maximum update depth exceeded" error, which is a common React issue that occurs when there's an infinite re-render loop. This typically happens when a `useEffect` hook either doesn't have a dependency array or has dependencies that change on every render.

### Error Message

```
Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at GamePiece (http://localhost:4201/hot-league-wall/main.js:16928:3)
```

## Root Cause Analysis

The issue was caused by the `useGameSentryLogger` hook returning an object that included the entire `sentryLogContext` through object spreading:

```typescript
// Before (problematic code)
export const useGameSentryLogger = (componentName?: string) => {
    const sentryLogContext = useSentryLog();

    // ... logger methods ...

    return {
        ...sentryLogContext, // This spreads the entire context object
        log: gameLogger,
        logTrace,
        logDebug,
        logInfo,
        logWarn,
        logError,
        logFatal,
    };
};
```

### Why This Caused Infinite Re-renders

1. **Context Object Recreation**: The `sentryLogContext` object was being recreated on every render
2. **Object Spreading**: When the entire context was spread into the return object, it created a new object reference on every render
3. **Dependency Arrays**: Components were using the logger object as a dependency in `useEffect` and `useCallback` hooks
4. **Infinite Loop**: This caused the hooks to re-run, triggering re-renders, which recreated the logger object, causing the hooks to re-run again

## Solution

### 1. Fixed the `useGameSentryLogger` Hook

**Before:**

```typescript
return {
    ...sentryLogContext, // Problematic spreading
    log: gameLogger,
    logTrace,
    logDebug,
    logInfo,
    logWarn,
    logError,
    logFatal,
};
```

**After:**

```typescript
return {
    log: gameLogger,
    logTrace,
    logDebug,
    logInfo,
    logWarn,
    logError,
    logFatal,
};
```

### 2. Updated Component Usage

**Before:**

```typescript
const logger = useGameSentryLogger('GamePiece');

useEffect(() => {
    logger.logInfo('Component initialized', data);
}, [logger]); // logger object changes on every render
```

**After:**

```typescript
const { logInfo } = useGameSentryLogger('GamePiece');

useEffect(() => {
    logInfo('Component initialized', data);
}, [logInfo]); // Only the specific method is used as dependency
```

### 3. Improved Dependency Arrays

**Before:**

```typescript
}, [pieceId, pieceType, position, health, logger]);
```

**After:**

```typescript
}, [pieceId, pieceType, position.x, position.y, health, logInfo]);
```

## Additional Issues Encountered

### TypeScript Compilation Error

After fixing the infinite re-render issue, a TypeScript compilation error was encountered in the RNG Soccer component:

```
ERROR in ./src/games/saba-club/rng-soccer/page.tsx:422:26
TS2339: Property 'sendLogsToSentry' does not exist on type '{ log: (message: string, level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal", metadata?: Record<string, any> | undefined) => void; logTrace: (message: string, metadata?: Record<...> | undefined) => void; ... 4 more ...; logFatal: (message: string, metadata?: Record<...> | undefined) => void; }'.
```

### Root Cause

The `useGameSentryLogger` hook was being used to access `sendLogsToSentry`, but after our fix, this hook only returns logging methods and not the context methods like `sendLogsToSentry`.

### Solution

Updated the RNG Soccer component to use both hooks:

-   `useGameSentryLogger` for logging methods (`logInfo`, `logError`, etc.)
-   `useSentryLog` for context methods (`sendLogsToSentry`, `startSessionReplay`, etc.)

**Before:**

```typescript
const logger = useGameSentryLogger('RNGSoccerPage');
await logger.sendLogsToSentry(); // Error: method doesn't exist
```

**After:**

```typescript
const { logInfo, logError } = useGameSentryLogger('RNGSoccerPage');
const { sendLogsToSentry } = useSentryLog();
await sendLogsToSentry(); // Works correctly
```

### GameBoard Component Optimization

After the initial fixes, the GameBoard component was still causing infinite re-renders due to direct usage of the `logs` array in the render method.

**Root Cause:**
The `logs` array from `useSentryLog()` was being used directly in the component render, causing re-renders every time a new log was added.

**Solution:**
Used `useMemo` to memoize the logs data and prevent unnecessary re-renders:

**Before:**

```typescript
const { logs } = useSentryLog();

// In render:
<div>Log Count: {logs.length}</div>
{logs.slice(-5).map((log) => (
    <div key={log.id}>{log.message}</div>
))}
```

**After:**

```typescript
const { logs } = useSentryLog();

// Memoize logs data to prevent unnecessary re-renders
const logsData = useMemo(() => ({
    count: logs.length,
    recentLogs: logs.slice(-5)
}), [logs]);

// In render:
<div>Log Count: {logsData.count}</div>
{logsData.recentLogs.map((log) => (
    <div key={log.id}>{log.message}</div>
))}
```

## Components Fixed

The following components were updated to fix the infinite re-render issue:

1. **GamePiece** (`src/_shared/components/GamePiece/GamePiece.tsx`)

    - Updated to use individual logger methods instead of the logger object
    - Fixed dependency arrays in `useEffect` and `useCallback` hooks

2. **GameBoard** (`src/_shared/components/GameBoard/GameBoard.tsx`)

    - Updated to use individual logger methods
    - Added `useSentryLog` hook for accessing `sendLogsToSentry` and `logs`

3. **LoggingDemo** (`src/_shared/components/LoggingDemo/LoggingDemo.tsx`)

    - Updated to use individual logger methods
    - Fixed all dependency arrays

4. **GamePieceControls** (`src/_shared/components/GamePiece/GamePiece.tsx`)

    - Updated to use individual logger methods

5. **RNG Soccer** (`src/games/saba-club/rng-soccer/page.tsx`)
    - Updated to use individual logger methods from `useGameSentryLogger`
    - Added `useSentryLog` hook for accessing `sendLogsToSentry` method
    - Fixed dependency arrays in `useEffect` hooks

## Testing

Comprehensive tests were created to verify the fix:

-   **GamePiece Tests**: `src/_shared/components/GamePiece/__tests__/GamePiece.test.tsx`

    -   **Tests**: 34 tests covering all component functionality
    -   **Key Test**: "should not cause infinite re-renders" - verifies that the component doesn't trigger excessive re-renders

-   **GameBoard Tests**: `src/_shared/components/GameBoard/__tests__/GameBoard.test.tsx`
    -   **Tests**: 12 tests covering component functionality and performance
    -   **Key Test**: "should not cause infinite re-renders" - verifies that the component doesn't trigger excessive re-renders

### Test Results

**GamePiece Tests:**

```
Test Suites: 1 passed, 1 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        4.34 s
```

**GameBoard Tests:**

```
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        3.404 s
```

## Best Practices Implemented

### 1. Stable Dependencies

-   Use individual methods instead of entire objects in dependency arrays
-   Destructure hooks to get only the needed methods
-   Use primitive values in dependencies when possible

### 2. Hook Optimization

-   Ensure `useCallback` and `useMemo` dependencies are stable
-   Avoid spreading entire context objects in custom hooks
-   Use specific method dependencies instead of object dependencies

### 3. Component Design

-   Keep dependencies minimal and specific
-   Use primitive values for dependencies when possible
-   Avoid creating new object references in render

## Prevention Guidelines

To prevent similar issues in the future:

1. **Avoid Object Spreading in Hooks**: Don't spread entire context objects in custom hooks
2. **Use Specific Dependencies**: Only include the specific methods or values you need in dependency arrays
3. **Stable References**: Ensure that objects used in dependencies have stable references
4. **Test for Re-renders**: Include tests that verify components don't cause excessive re-renders
5. **Monitor Performance**: Use React DevTools Profiler to identify unnecessary re-renders

## Performance Impact

The fix resulted in:

-   **Elimination of infinite re-render loops**
-   **Improved component performance**
-   **Reduced memory usage**
-   **Better user experience with no more browser freezing**

## Related Files

-   `src/_shared/react-contexts/log-context/sentry-log-context.tsx` - Fixed `useGameSentryLogger` hook
-   `src/_shared/components/GamePiece/GamePiece.tsx` - Updated component usage
-   `src/_shared/components/GameBoard/GameBoard.tsx` - Updated component usage
-   `src/_shared/components/LoggingDemo/LoggingDemo.tsx` - Updated component usage
-   `src/_shared/components/GamePiece/__tests__/GamePiece.test.tsx` - Comprehensive tests
