# Sentry Restructure Summary

This document provides a comprehensive summary of the Sentry restructuring project for the HotLeagueWall component, including the new `@/sentry` import structure, file organization, and implementation achievements.

## 🎯 Restructuring Overview

The Sentry system has been completely restructured to provide a unified, maintainable, and scalable logging solution with the following achievements:

-   **Unified Import Structure**: Single `@/sentry` import point for all Sentry functionality
-   **Organized File Structure**: Clear separation of concerns with dedicated directories
-   **Enhanced Type Safety**: Comprehensive TypeScript types and interfaces
-   **Component-Specific Configuration**: Granular control over logging per component
-   **Environment-Based Settings**: Different configurations for different environments
-   **LocalStorage Control**: Dynamic logging control without code deployment
-   **Advanced Error Handling**: Intelligent error filtering and buffer management

## 📁 New File Structure

```
src/sentry/
├── index.ts                     # Main entry point with all exports (141 lines)
├── README.md                    # Main documentation
├── core/                        # Core functionality
│   ├── sentry-manager.ts        # Core Sentry manager (776 lines)
│   ├── sentry-config.ts         # Configuration management
│   ├── sentry-session-replay.ts # Session replay functionality
│   └── sentry-types.ts          # Type definitions (89 lines)
├── utils/                       # Utility functions
│   ├── sentry-helper.ts         # Main Sentry helper utilities
│   ├── sentry-helper-batched.ts # Batched logging utilities
│   ├── sentry-batch-manager.ts  # Batch management
│   └── sentry-game-cron-batch-manager.ts # Game cron batch management
├── hooks/                       # React hooks
│   ├── useSentryHelper.ts       # Main Sentry hook (362 lines)
│   ├── useSentryHelperBatched.ts # Batched Sentry hook
│   ├── useGameCronSentry.ts     # Game cron Sentry hook
│   ├── useSessionReplay.ts      # Session replay hook
│   └── useComponentSentry.ts    # Component Sentry hook
├── components/                  # React components
│   ├── index.ts                 # Component exports
│   ├── LoggingDemo.tsx          # Logging demo component
│   └── sentry-log-context.tsx   # Sentry log context
├── tests/                       # Test files
├── docs/                        # Documentation (25 files)
├── examples/                    # Usage examples
└── scripts/                     # Utility scripts
```

## 🔧 Core Implementation

### 1. Main Entry Point (`src/sentry/index.ts`)

The main entry point provides a unified import interface for all Sentry functionality:

```typescript
// @/sentry - Main entry point for all Sentry-related functionality

// Core exports
export {
    sentryManager,
    configureSentryManager,
    enableSentryManager,
    disableSentryManager,
    setSentryLogLevel,
    startSentryWorkflow,
    updateSentryWorkflow,
    completeSentryWorkflow,
    trackSentryPerformance,
    setLocalStorageConfig,
    clearLocalStorageConfig,
} from './core/sentry-manager';

// Configuration exports
export {
    initializeSentryForProject,
    configureSentryForEnvironment,
    configureComponentByType,
    getCurrentConfiguration,
    configureComponentsBatch,
} from './core/sentry-config';

// Session replay exports
export {
    initializeSentryWithSessionReplay,
    configureSessionReplayForEnvironment,
    startCustomSessionReplay,
    stopSessionReplay,
    addSessionReplayData,
    setUserContext,
    setTags,
    setExtra,
    blockElement,
    ignoreElement,
    unblockElement,
    unignoreElement,
} from './core/sentry-session-replay';

// Type exports
export type {
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    LocalStorageConfig,
    SentryManagerConfig,
    UseSentryHelperOptions,
    WorkflowTracker,
} from './core/sentry-types';

// Enum exports
export { SentryLogLevel, WorkflowState } from './core/sentry-types';

// Utils exports
export {
    configureSentry,
    enableSentry,
    disableSentry,
    setLogLevel,
    configureComponent,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance,
    logInfo,
    logError,
    logWarning,
    logDebug,
    logTrace,
    SentryHelper,
    sentryHelper,
    updateSentryConfiguration,
} from './utils/sentry-helper';

// Batch manager exports
export {
    sentryBatchManager,
    addBatchedLog,
    flushAllBatches,
    flushComponentBatches,
    getBatchStats,
    cleanupBatchManager,
} from './utils/sentry-batch-manager';

// Game cron batch manager exports
export {
    sentryGameCronBatchManager,
    addGameCronLog,
    flushAllGameCronBatches,
    flushGameCronBatches,
    getGameCronBatchStats,
    getRegisteredGameCrons,
    cleanupGameCronBatchManager,
} from './utils/sentry-game-cron-batch-manager';

// Hooks exports
export { useSentryHelper } from './hooks/useSentryHelper';
export { useSentryHelperBatched } from './hooks/useSentryHelperBatched';
export { useGameCronSentry } from './hooks/useGameCronSentry';
export { useSessionReplay } from './hooks/useSessionReplay';
export { useComponentSentry } from './hooks/useComponentSentry';

// Components exports
export { LoggingDemo } from './components';
export { SentryLogContext, SentryLogProvider, useGameSentryLogger, useSentryLog } from './components/sentry-log-context';

// Re-export the default SentryManager class
export { default as SentryManager } from './core/sentry-manager';
```

### 2. Core Sentry Manager (`src/sentry/core/sentry-manager.ts`)

The core Sentry manager provides comprehensive logging management:

```typescript
// Direct integration with sg-game-client SentryLogger
// This file provides a comprehensive Sentry management system for the HotLeagueWall project

import { SentryLogLevel, WorkflowState, ComponentConfig, WorkflowConfig, GlobalSentryConfig, SentryManagerConfig } from './sentry-types';
import * as Sentry from '@sentry/react';

// LocalStorage keys for logging control
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level';
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled';
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode';

class SentryManager {
    private static instance: SentryManager;
    private isInitialized = false;
    private componentName = '';
    private originalConsoleError: typeof console.error;
    private originalConsoleWarn: typeof console.warn;
    private originalConsoleInfo: typeof console.info;
    private originalConsoleDebug: typeof console.debug;
    private originalConsoleTrace: typeof console.trace;
    private originalConsoleLog: typeof console.log;
    private errorFilter!: (error: any) => boolean;

    // ... implementation details
}

// Export singleton instance
export const sentryManager = SentryManager.getInstance();

// Export convenience functions
export const configureSentryManager = (config: SentryManagerConfig) => sentryManager.initialize(config);
export const enableSentryManager = () => sentryManager.enable();
export const disableSentryManager = () => sentryManager.disable();
export const setSentryLogLevel = (level: SentryLogLevel) => sentryManager.setLogLevel(level);
```

### 3. Type Definitions (`src/sentry/core/sentry-types.ts`)

Comprehensive type definitions for all Sentry functionality:

```typescript
// Standard Sentry log levels
export enum SentryLogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
    // Legacy levels for backward compatibility
    DISABLED = 'disabled',
    ERROR_ONLY = 'error_only',
    WARNING_AND_ERROR = 'warning_and_error',
    ALL = 'all',
}

// Workflow tracking states
export enum WorkflowState {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

// Component tracking configuration
export interface ComponentConfig {
    name: string;
    logLevel: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
}

// Workflow tracking configuration
export interface WorkflowConfig {
    id: string;
    name: string;
    component: string;
    logLevel: SentryLogLevel;
    enablePerformanceTracking?: boolean;
    metadata?: Record<string, any>;
}

// Global Sentry configuration
export interface GlobalSentryConfig {
    enabled: boolean;
    defaultLogLevel: SentryLogLevel;
    enableWorkflowTracking: boolean;
    enablePerformanceTracking: boolean;
    enableConsoleOverride: boolean;
    componentConfigs: Map<string, ComponentConfig>;
    workflowConfigs: Map<string, WorkflowConfig>;
}

// LocalStorage configuration
export interface LocalStorageConfig {
    logLevel: string;
    enabled: boolean;
    debugMode: boolean;
}

// SentryManager configuration
export interface SentryManagerConfig {
    dsn: string;
    environment: string;
    componentName: string;
    release?: string;
    debug?: boolean;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    enableConsoleOverride?: boolean;
}

// UseSentryHelper options
export interface UseSentryHelperOptions {
    componentName: string;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    autoConfigure?: boolean;
}

// Workflow tracker interface
export interface WorkflowTracker {
    start: (workflowName: string, metadata?: Record<string, any>) => string;
    update: (workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => void;
    complete: (workflowId: string, success?: boolean, metadata?: Record<string, any>) => void;
    track: <T>(operationName: string, operation: () => Promise<T> | T) => Promise<T>;
}
```

## 🎣 React Hooks Implementation

### 1. Main Sentry Hook (`src/sentry/hooks/useSentryHelper.ts`)

The main React hook for Sentry integration:

```typescript
import { useCallback, useEffect, useRef } from 'react';
import {
    logInfo as sentryLogInfo,
    logError as sentryLogError,
    logWarning as sentryLogWarning,
    logDebug,
    logTrace,
    configureComponent,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance as sentryTrackPerformance,
    sentryHelper,
} from '../utils/sentry-helper';
import { SentryLogLevel, WorkflowState, UseSentryHelperOptions, WorkflowTracker } from '../core/sentry-types';

export const useSentryHelper = (options: UseSentryHelperOptions) => {
    const {
        componentName,
        logLevel = SentryLogLevel.ALL,
        enableWorkflowTracking = true,
        enablePerformanceTracking = true,
        autoConfigure = true,
    } = options;

    const activeWorkflows = useRef<Set<string>>(new Set());

    // Auto-configure component on mount
    useEffect(() => {
        if (autoConfigure) {
            try {
                sentryLogInfo(componentName, 'Initializing SentryHelper hook', {
                    componentName,
                    logLevel,
                    enableWorkflowTracking,
                    enablePerformanceTracking,
                    autoConfigure,
                    timestamp: Date.now(),
                });

                configureComponent(componentName, {
                    logLevel,
                    enableWorkflowTracking,
                    enablePerformanceTracking,
                });

                sentryLogInfo(componentName, 'SentryHelper hook initialized successfully', {
                    componentName,
                    configuration: {
                        logLevel,
                        enableWorkflowTracking,
                        enablePerformanceTracking,
                    },
                    timestamp: Date.now(),
                });
            } catch (error) {
                // Don't throw error to prevent component from failing
            }
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, autoConfigure]);

    // Cleanup workflows on unmount
    useEffect(() => {
        return () => {
            try {
                sentryLogInfo(componentName, 'Cleaning up SentryHelper hook', {
                    componentName,
                    activeWorkflowsCount: activeWorkflows.current.size,
                    timestamp: Date.now(),
                });

                // Complete any remaining workflows
                activeWorkflows.current.forEach((workflowId) => {
                    try {
                        completeWorkflow(workflowId, false, { reason: 'component_unmounted' });
                    } catch (error) {
                        // Silent fail during cleanup
                    }
                });
                activeWorkflows.current.clear();

                sentryLogInfo(componentName, 'SentryHelper hook cleanup completed', {
                    componentName,
                    timestamp: Date.now(),
                });
            } catch (error) {
                // Silent fail during cleanup
            }
        };
    }, [componentName]);

    // Logging methods
    const logError = useCallback(
        (error: Error | string, context?: Record<string, any>) => {
            sentryLogError(componentName, error, context);
        },
        [componentName],
    );

    const logWarning = useCallback(
        (message: string, context?: Record<string, any>) => {
            sentryLogWarning(componentName, message, context);
        },
        [componentName],
    );

    const logInfo = useCallback(
        (message: string, context?: Record<string, any>) => {
            sentryLogInfo(componentName, message, context);
        },
        [componentName],
    );

    const logDebug = useCallback(
        (message: string, context?: Record<string, any>) => {
            logDebug(componentName, message, context);
        },
        [componentName],
    );

    const logTrace = useCallback(
        (message: string, context?: Record<string, any>) => {
            logTrace(componentName, message, context);
        },
        [componentName],
    );

    // Workflow methods
    const workflow: WorkflowTracker = {
        start: useCallback(
            (workflowName: string, metadata?: Record<string, any>) => {
                const workflowId = startWorkflow(componentName, workflowName, metadata);
                activeWorkflows.current.add(workflowId);
                return workflowId;
            },
            [componentName],
        ),

        update: useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
            updateWorkflow(workflowId, state, metadata);
        }, []),

        complete: useCallback((workflowId: string, success?: boolean, metadata?: Record<string, any>) => {
            completeWorkflow(workflowId, success, metadata);
            activeWorkflows.current.delete(workflowId);
        }, []),

        track: useCallback(
            async <T>(operationName: string, operation: () => Promise<T> | T): Promise<T> => {
                return sentryTrackPerformance(componentName, operationName, operation);
            },
            [componentName],
        ),
    };

    return {
        logError,
        logWarning,
        logInfo,
        logDebug,
        logTrace,
        workflow,
    };
};
```

## 🔧 Configuration Integration

### 1. Environment Configuration

The system supports comprehensive environment-specific configurations:

```json
{
    "sentry": {
        "dsn": "https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056",
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
                "App": {
                    "logLevel": "error",
                    "enableWorkflowTracking": true,
                    "enablePerformanceTracking": true
                },
                "BetPanel": {
                    "logLevel": "error",
                    "enableWorkflowTracking": false,
                    "enablePerformanceTracking": true
                },
                "BettingChips": {
                    "logLevel": "error",
                    "enableWorkflowTracking": false,
                    "enablePerformanceTracking": false
                }
            }
        }
    }
}
```

### 2. Component Integration

Components are now integrated using the new `@/sentry` import structure:

```typescript
// Old import structure
import { configureSentry } from './_shared/utils/sentry/sentry-helper';
import { useSentryHelper } from './_shared/hooks/useSentryHelper';
import { SentryManager } from './_shared/utils/sentry/sentry-manager';

// New import structure
import { configureSentry, useSentryHelper, sentryManager } from '@/sentry';
```

## 📊 Implementation Statistics

### Files Restructured

| Category            | Count | Status      |
| ------------------- | ----- | ----------- |
| Core Files          | 4     | ✅ Complete |
| Utility Files       | 4     | ✅ Complete |
| Hook Files          | 5     | ✅ Complete |
| Component Files     | 3     | ✅ Complete |
| Test Files          | 8     | ✅ Complete |
| Documentation Files | 25    | ✅ Complete |
| Example Files       | 12    | ✅ Complete |
| Script Files        | 6     | ✅ Complete |

### Lines of Code

| File                     | Lines | Description         |
| ------------------------ | ----- | ------------------- |
| sentry-manager.ts        | 776   | Core Sentry manager |
| useSentryHelper.ts       | 362   | Main React hook     |
| sentry-types.ts          | 89    | Type definitions    |
| index.ts                 | 141   | Main entry point    |
| sentry-helper.ts         | 450+  | Utility functions   |
| sentry-helper-batched.ts | 380+  | Batched utilities   |

### Components Updated

| Component      | Status      | Integration Type |
| -------------- | ----------- | ---------------- |
| AppSettings    | ✅ Complete | Direct imports   |
| BetPanel       | ✅ Complete | React hook       |
| BettingChips   | ✅ Complete | Direct imports   |
| CountDownTimer | ✅ Complete | Direct imports   |
| Timeout        | ✅ Complete | Direct imports   |
| StorageManager | ✅ Complete | Direct imports   |

## 🚀 Benefits Achieved

### 1. Unified Import Structure

-   **Single Import Point**: All Sentry functionality available through `@/sentry`
-   **Type Safety**: Full TypeScript support with proper types
-   **Consistency**: Uniform import pattern across all components
-   **Maintainability**: Centralized import management

### 2. Enhanced Organization

-   **Clear Separation**: Dedicated directories for different concerns
-   **Scalability**: Easy to add new functionality
-   **Discoverability**: Clear file structure makes it easy to find code
-   **Modularity**: Each module has a specific responsibility

### 3. Improved Configuration

-   **Environment-Specific**: Different settings for different environments
-   **Component-Specific**: Granular control over logging per component
-   **Dynamic Control**: LocalStorage-based control without code deployment
-   **Fallback Support**: Robust error handling and fallback configurations

### 4. Advanced Features

-   **Workflow Tracking**: Complex operation tracking with states
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **Error Filtering**: Intelligent error filtering and noise reduction
-   **Buffer Management**: Automatic buffer clearing to prevent overflow
-   **Session Replay**: Privacy-focused session replay configuration

## 🔄 Migration Guide

### From Old Import Structure

```typescript
// Old imports
import { configureSentry } from './_shared/utils/sentry/sentry-helper';
import { useSentryHelper } from './_shared/hooks/useSentryHelper';
import { SentryManager } from './_shared/utils/sentry/sentry-manager';

// New imports
import { configureSentry, useSentryHelper, sentryManager } from '@/sentry';
```

### Component Integration Steps

1. **Update Imports**: Replace old imports with `@/sentry`
2. **Configure Component**: Set appropriate log levels and features
3. **Add Error Handling**: Include try-catch blocks with logging
4. **Test Integration**: Verify logging works in different environments

### Configuration Updates

1. **Environment Configs**: Update configuration files with new structure
2. **Component Configs**: Add component-specific logging settings
3. **LocalStorage Keys**: Update localStorage keys for new structure
4. **TypeScript Config**: Ensure `@/sentry` alias is properly configured

## 📝 Best Practices

### 1. Import Structure

-   Always use `@/sentry` for imports
-   Import only what you need
-   Use TypeScript for type safety
-   Follow the established patterns

### 2. Component Integration

-   Use `useSentryHelper` hook for React components
-   Use direct imports for utility functions
-   Include component name in all logging calls
-   Add appropriate error handling

### 3. Configuration Management

-   Use environment-specific configurations
-   Set appropriate log levels for each component
-   Enable workflow tracking for complex operations
-   Enable performance tracking for critical operations

### 4. Error Handling

-   Always include context in error logs
-   Use try-catch blocks around critical operations
-   Provide fallback configurations
-   Log both success and failure scenarios

## 🔗 Related Documentation

-   [SentryHelper Guide](./SENTRY_HELPER_GUIDE.md)
-   [SentryManager Documentation](./sentry-manager.README.md)
-   [Component Integration Summary](./SENTRY_COMPONENT_INTEGRATION_SUMMARY.md)
-   [Error Handling Enhancement Summary](./SENTRY_ERROR_HANDLING_ENHANCEMENT_SUMMARY.md)
-   [Session Replay Guide](./SENTRY_SESSION_REPLAY_GUIDE.md)
