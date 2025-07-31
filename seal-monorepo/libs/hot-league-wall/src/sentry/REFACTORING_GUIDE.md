# Sentry Code Refactoring Guide

## Overview

This document outlines the refactoring of the Sentry codebase to follow SOLID principles and improve maintainability, testability, and extensibility.

## Problems with Original Code

### 1. Single Responsibility Principle (SRP) Violations

-   **SentryManager** was doing too many things: logging, workflow tracking, performance tracking, localStorage management, console overrides
-   **sentry-helper.ts** had duplicate localStorage logic
-   Multiple files contained similar localStorage management code

### 2. Open/Closed Principle (OCP) Violations

-   Hard-coded localStorage keys scattered across files
-   Tight coupling between different concerns
-   Difficult to extend without modifying existing code

### 3. Dependency Inversion Principle (DIP) Violations

-   Direct dependencies on localStorage and console methods
-   No abstraction for storage or logging mechanisms
-   High coupling to concrete implementations

### 4. Interface Segregation Principle (ISP) Violations

-   Large interfaces that forced implementations to depend on methods they didn't use
-   Monolithic classes with too many responsibilities

### 5. Code Duplication

-   localStorage management logic repeated across multiple files
-   Similar logging methods in different classes

## Refactored Architecture

### New Directory Structure

```
sentry/
├── core/
│   ├── interfaces/
│   │   ├── storage.interface.ts
│   │   ├── logger.interface.ts
│   │   └── index.ts
│   ├── storage/
│   │   └── local-storage.ts
│   ├── logger/
│   │   └── sentry-logger.ts
│   ├── workflow/
│   │   └── workflow-tracker.ts
│   ├── console/
│   │   └── console-override.ts
│   ├── sentry-manager-refactored.ts
│   └── sentry-types.ts
├── utils/
│   └── sentry-helper-refactored.ts
├── hooks/
│   └── useSentryHelperRefactored.ts
└── __tests__/
    └── sentry-refactored.test.ts
```

### SOLID Principles Implementation

#### 1. Single Responsibility Principle (SRP)

**Before:**

```typescript
class SentryManager {
    // Handles logging, workflow tracking, performance tracking,
    // localStorage management, console overrides, and more
}
```

**After:**

```typescript
// Each class has a single responsibility
class SentryLogger implements ILogger {
    // Only handles logging operations
}

class WorkflowTracker implements IWorkflowTracker {
    // Only handles workflow tracking
}

class SentryConfigStorage implements IConfigStorage {
    // Only handles configuration storage
}

class ConsoleOverride implements IConsoleOverride {
    // Only handles console method overrides
}

class SentryManagerRefactored {
    // Orchestrates different services through dependency injection
}
```

#### 2. Open/Closed Principle (OCP)

**Before:**

```typescript
// Hard-coded localStorage keys
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
```

**After:**

```typescript
// Extensible through interfaces and dependency injection
interface IStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}

// Can easily add new storage implementations without modifying existing code
class LocalStorage implements IStorage {
    /* ... */
}
class SessionStorage implements IStorage {
    /* ... */
}
class RemoteStorage implements IStorage {
    /* ... */
}
```

#### 3. Liskov Substitution Principle (LSP)

**Implementation:**

```typescript
// All implementations can be substituted for their interfaces
const logger: ILogger = new SentryLogger('component');
const tracker: IWorkflowTracker = new WorkflowTracker('component');
const storage: IConfigStorage = new SentryConfigStorage();
```

#### 4. Interface Segregation Principle (ISP)

**Before:**

```typescript
// Large interface forcing implementations to depend on unused methods
interface SentryManager {
    // 20+ methods covering logging, workflow, performance, storage, etc.
}
```

**After:**

```typescript
// Specific interfaces for specific concerns
interface ILogger {
    logTrace(message: string, context?: Record<string, any>): void;
    logDebug(message: string, context?: Record<string, any>): void;
    logInfo(message: string, context?: Record<string, any>): void;
    logWarning(message: string, context?: Record<string, any>): void;
    logError(error: Error | string, context?: Record<string, any>): void;
    logFatal(error: Error | string, context?: Record<string, any>): void;
    isLoggingEnabled(level: SentryLogLevel): boolean;
}

interface IWorkflowTracker {
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void;
    updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void;
    completeWorkflow(workflowId: string, success?: boolean, metadata?: Record<string, any>): void;
    trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T>;
}
```

#### 5. Dependency Inversion Principle (DIP)

**Before:**

```typescript
// Direct dependency on concrete implementation
class SentryManager {
    private storage = localStorage; // Direct dependency
}
```

**After:**

```typescript
// Dependency on abstraction
class SentryManagerRefactored {
    private configStorage: IConfigStorage; // Dependency on interface

    constructor(configStorage: IConfigStorage) {
        this.configStorage = configStorage;
    }
}
```

## Key Benefits

### 1. Improved Testability

-   Each class can be tested in isolation
-   Easy to mock dependencies through interfaces
-   Clear separation of concerns makes testing more focused

### 2. Better Maintainability

-   Changes to one concern don't affect others
-   Clear interfaces make it easier to understand dependencies
-   Reduced code duplication

### 3. Enhanced Extensibility

-   Easy to add new storage implementations
-   Simple to extend logging capabilities
-   Can add new workflow tracking features without modifying existing code

### 4. Reduced Coupling

-   Components depend on abstractions, not concrete implementations
-   Changes in one module don't ripple through the entire system
-   Easier to swap implementations

## Migration Guide

### 1. Update Imports

```typescript
// Before
import { sentryManager } from './core/sentry-manager';

// After
import { SentryManagerRefactored } from './core/sentry-manager-refactored';
```

### 2. Update Usage

```typescript
// Before
sentryManager.initialize(config);
sentryManager.logInfo('message');

// After
const manager = SentryManagerRefactored.getInstance();
manager.initialize(config);
manager.logInfo('message');
```

### 3. Update Hooks

```typescript
// Before
import { useSentryHelper } from './hooks/useSentryHelper';

// After
import { useSentryHelperRefactored } from './hooks/useSentryHelperRefactored';
```

## Testing Strategy

The refactored code includes comprehensive tests following the AAA (Arrange, Act, Assert) pattern:

### Test Structure

```typescript
describe('ComponentName', () => {
    describe('MethodName', () => {
        it('should behave correctly when condition', () => {
            // Arrange: Set up test conditions
            const component = new Component();

            // Act: Execute the method under test
            const result = component.method();

            // Assert: Verify the expected behavior
            expect(result).toBe(expectedValue);
        });
    });
});
```

### Test Coverage

-   **Unit Tests**: Each class tested in isolation
-   **Integration Tests**: Components working together
-   **Error Handling**: Graceful handling of failures
-   **Edge Cases**: Boundary conditions and error scenarios

## Best Practices

### 1. Use Dependency Injection

```typescript
// Good
class MyClass {
    constructor(private logger: ILogger) {}
}

// Avoid
class MyClass {
    private logger = new SentryLogger();
}
```

### 2. Follow Interface Segregation

```typescript
// Good - Specific interfaces
interface ILogger {
    /* logging methods */
}
interface IWorkflowTracker {
    /* workflow methods */
}

// Avoid - Large interfaces
interface ISentryManager {
    /* all methods */
}
```

### 3. Single Responsibility

```typescript
// Good - Each class has one reason to change
class Logger {
    /* only logging */
}
class WorkflowTracker {
    /* only workflow tracking */
}

// Avoid - Multiple responsibilities
class SentryManager {
    /* logging + workflow + storage + ... */
}
```

### 4. Test-Driven Development

-   Write tests first
-   Follow AAA pattern
-   Test edge cases and error conditions
-   Mock external dependencies

## Conclusion

The refactored Sentry codebase now follows SOLID principles, making it more maintainable, testable, and extensible. The separation of concerns, dependency injection, and interface segregation provide a solid foundation for future development and maintenance.
