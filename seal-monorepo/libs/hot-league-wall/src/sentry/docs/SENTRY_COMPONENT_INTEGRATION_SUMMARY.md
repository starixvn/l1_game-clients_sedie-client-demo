# Sentry Component Integration Summary

This document provides a comprehensive overview of how Sentry logging has been integrated across all components in the HotLeagueWall project, including the new `@/sentry` import structure and component-specific configurations.

## 🎯 Integration Overview

The Sentry system has been successfully integrated across all major components with the following features:

-   **Unified Import Structure**: All components now use `@/sentry` for consistent imports
-   **Component-Specific Configuration**: Each component has tailored logging settings
-   **Environment-Based Configuration**: Different settings for different environments
-   **LocalStorage Control**: Dynamic logging control without code deployment
-   **Workflow Tracking**: Complex operation tracking with states and metadata
-   **Performance Monitoring**: Automatic timing and performance tracking

## 📁 File Structure

```
src/
├── sentry/                          # Main Sentry module
│   ├── index.ts                     # Main entry point with all exports
│   ├── core/                        # Core functionality
│   │   ├── sentry-manager.ts        # Core Sentry manager (776 lines)
│   │   ├── sentry-config.ts         # Configuration management
│   │   ├── sentry-session-replay.ts # Session replay functionality
│   │   └── sentry-types.ts          # Type definitions (89 lines)
│   ├── utils/                       # Utility functions
│   │   ├── sentry-helper.ts         # Main Sentry helper utilities
│   │   ├── sentry-helper-batched.ts # Batched logging utilities
│   │   ├── sentry-batch-manager.ts  # Batch management
│   │   └── sentry-game-cron-batch-manager.ts # Game cron batch management
│   ├── hooks/                       # React hooks
│   │   ├── useSentryHelper.ts       # Main Sentry hook (362 lines)
│   │   ├── useSentryHelperBatched.ts # Batched Sentry hook
│   │   ├── useGameCronSentry.ts     # Game cron Sentry hook
│   │   ├── useSessionReplay.ts      # Session replay hook
│   │   └── useComponentSentry.ts    # Component Sentry hook
│   └── components/                  # React components
│       ├── index.ts                 # Component exports
│       ├── LoggingDemo.tsx          # Logging demo component
│       └── sentry-log-context.tsx   # Sentry log context
├── _shared/                         # Shared components and utilities
│   ├── app-settings/                # Application settings
│   │   └── index.ts                 # ✅ Updated with Sentry integration
│   ├── components/                  # Shared components
│   │   ├── bet-panel/               # Betting panel component
│   │   │   └── bet-panel.tsx        # ✅ Updated with useSentryHelper hook
│   │   ├── betting-chips/           # Betting chips component
│   │   │   └── betting-chips.tsx    # ✅ Updated with @/sentry imports
│   │   ├── count-down-timer/        # Countdown timer component
│   │   │   └── index.tsx            # ✅ Updated with @/sentry imports
│   │   └── timeout/                 # Timeout component
│   │       └── index.tsx            # ✅ Updated with @/sentry imports
│   └── utils/                       # Shared utilities
│       └── storage-manager.ts       # ✅ Updated with @/sentry imports
└── configs/                         # Configuration files
    ├── configs.json                 # ✅ Main configuration with Sentry settings
    ├── sg/                          # SG environment configs
    │   └── configs.LOCAL_1.json     # ✅ SG environment configuration
    └── vg/                          # VG environment configs
        └── configs.LOCAL_1.json     # ✅ VG environment configuration
```

## 🔧 Configuration Integration

### Main Configuration (`configs/configs.json`)

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

### Environment-Specific Configurations

#### SG Environment (`configs/sg/configs.LOCAL_1.json`)

```json
{
    "sentry": {
        "dsn": "https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056",
        "environment": "LOCAL1",
        "logLevel": "info",
        "enableSessionReplay": true,
        "sessionReplaySampleRate": 1.0,
        "errorSampleRate": 1.0,
        "componentLogging": {
            "enabled": true,
            "defaultLogLevel": "info",
            "components": {
                "HotLeagueWall": {
                    "logLevel": "info",
                    "enableWorkflowTracking": true,
                    "enablePerformanceTracking": true
                },
                "BetPanel": {
                    "logLevel": "warn",
                    "enableWorkflowTracking": false,
                    "enablePerformanceTracking": true
                }
            }
        }
    }
}
```

#### VG Environment (`configs/vg/configs.LOCAL_1.json`)

Similar structure with VG-specific settings and component configurations.

## 🎣 Component Integration Details

### 1. App Settings Integration (`src/_shared/app-settings/index.ts`)

**Status**: ✅ **Fully Integrated**

```typescript
import { logInfo, logError, logWarning, updateSentryConfiguration } from '@/sentry';

export const getEnvironmentConfig = ({ appEnv, siteId }) => {
    const componentName = 'AppSettings';

    try {
        logInfo(componentName, 'Loading environment configuration', {
            appEnv,
            siteId,
            timestamp: Date.now(),
        });

        // Configuration loading logic...

        logInfo(componentName, 'Environment configuration loaded successfully', {
            appEnv,
            siteId,
            configKeys: Object.keys(result),
            gameSettingsCount: Object.keys(gameSettings).length,
            timestamp: Date.now(),
        });

        return result;
    } catch (error) {
        logError(componentName, 'Failed to load environment configuration', {
            error: error instanceof Error ? error.message : String(error),
            appEnv,
            siteId,
            timestamp: Date.now(),
        });

        // Return fallback configuration...
    }
};

// Update Sentry configuration with the loaded appSettings
try {
    updateSentryConfiguration(appSettings.sentry?.dsn, appSettings.sentry?.environment);
} catch (error) {
    console.warn('Failed to update Sentry configuration:', error);
}
```

**Features**:

-   Comprehensive logging for configuration loading
-   Error handling with detailed context
-   Automatic Sentry configuration updates
-   Fallback configuration support

### 2. Bet Panel Integration (`src/_shared/components/bet-panel/bet-panel.tsx`)

**Status**: ✅ **Fully Integrated with React Hook**

```typescript
import { useSentryHelper, SentryLogLevel } from '@/sentry';

const BetPanel: React.FC<{...}> = ({ namespace, clientRoundId, currency, minBet, maxBet, maxBetPerChoices, stakeLevel, handleBet, clientSeed }) => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'BetPanel',
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true,
        autoConfigure: true
    });

    useEffect(() => {
        logInfo('BetPanel component mounted', {
            namespace,
            clientRoundId,
            currency,
            minBet,
            maxBet,
            timestamp: Date.now()
        });
    }, [namespace, clientRoundId, currency, minBet, maxBet]);

    const handleClickBet = () => {
        const workflowId = workflow.start('bet-placement', 'Bet Placement Process', {
            namespace,
            clientRoundId,
            betAmount: inputValue,
            betChoice: selectedChoice,
            timestamp: Date.now()
        });

        try {
            // Bet placement logic...

            workflow.complete(workflowId, true, {
                betAmount: inputValue,
                betChoice: selectedChoice,
                result: 'success'
            });
        } catch (error) {
            logError(error, {
                namespace,
                clientRoundId,
                betAmount: inputValue,
                betChoice: selectedChoice
            });

            workflow.complete(workflowId, false, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    };

    // Component JSX...
};
```

**Features**:

-   React hook integration with `useSentryHelper`
-   Workflow tracking for bet placement process
-   Comprehensive error logging with context
-   Performance tracking enabled
-   Automatic component lifecycle logging

### 3. Betting Chips Integration (`src/_shared/components/betting-chips/betting-chips.tsx`)

**Status**: ✅ **Updated with New Import Structure**

```typescript
import { logInfo, logError, logWarning } from '@/sentry';

const BettingChips: React.FC<{...}> = ({ chips, onChipClick, selectedChip }) => {
    const componentName = 'BettingChips';

    useEffect(() => {
        logInfo(componentName, 'BettingChips component mounted', {
            chipsCount: chips.length,
            selectedChip,
            timestamp: Date.now()
        });
    }, [chips.length, selectedChip]);

    const handleChipClick = (chip: ChipType) => {
        try {
            logInfo(componentName, 'Chip clicked', {
                chipValue: chip.value,
                chipCurrency: chip.currency,
                timestamp: Date.now()
            });

            onChipClick(chip);
        } catch (error) {
            logError(componentName, 'Failed to handle chip click', {
                error: error instanceof Error ? error.message : String(error),
                chipValue: chip.value,
                timestamp: Date.now()
            });
        }
    };

    // Component JSX...
};
```

**Features**:

-   Direct Sentry utility imports
-   Component lifecycle logging
-   User interaction tracking
-   Error handling with context

### 4. Count Down Timer Integration (`src/_shared/components/count-down-timer/index.tsx`)

**Status**: ✅ **Updated with New Import Structure**

```typescript
import { logInfo, logWarning } from '@/sentry';

const CountDownTimer: React.FC<{...}> = ({ duration, onComplete }) => {
    const componentName = 'CountDownTimer';

    useEffect(() => {
        logInfo(componentName, 'CountDownTimer started', {
            duration,
            timestamp: Date.now()
        });
    }, [duration]);

    useEffect(() => {
        if (timeLeft <= 10) {
            logWarning(componentName, 'Countdown timer running low', {
                timeLeft,
                duration,
                timestamp: Date.now()
            });
        }
    }, [timeLeft, duration]);

    // Component logic...
};
```

**Features**:

-   Timer start logging
-   Warning logs for low time remaining
-   Performance monitoring

### 5. Timeout Component Integration (`src/_shared/components/timeout/index.tsx`)

**Status**: ✅ **Updated with New Import Structure**

```typescript
import { logError, logWarning } from '@/sentry';

const Timeout: React.FC<{...}> = ({ message, onRetry }) => {
    const componentName = 'Timeout';

    useEffect(() => {
        logWarning(componentName, 'Timeout component displayed', {
            message,
            timestamp: Date.now()
        });
    }, [message]);

    const handleRetry = () => {
        try {
            logInfo(componentName, 'Retry attempted', {
                timestamp: Date.now()
            });
            onRetry();
        } catch (error) {
            logError(componentName, 'Retry failed', {
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now()
            });
        }
    };

    // Component JSX...
};
```

**Features**:

-   Timeout event logging
-   Retry attempt tracking
-   Error handling for retry operations

### 6. Storage Manager Integration (`src/_shared/utils/storage-manager.ts`)

**Status**: ✅ **Updated with New Import Structure**

```typescript
import { logInfo, logError, logWarning } from '@/sentry';

export class StorageManager {
    private componentName = 'StorageManager';

    setItem(key: string, value: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            logInfo(this.componentName, 'Item stored successfully', {
                key,
                valueType: typeof value,
                timestamp: Date.now(),
            });
        } catch (error) {
            logError(this.componentName, 'Failed to store item', {
                error: error instanceof Error ? error.message : String(error),
                key,
                valueType: typeof value,
                timestamp: Date.now(),
            });
        }
    }

    getItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                logInfo(this.componentName, 'Item retrieved successfully', {
                    key,
                    valueType: typeof parsed,
                    timestamp: Date.now(),
                });
                return parsed;
            }
            return null;
        } catch (error) {
            logError(this.componentName, 'Failed to retrieve item', {
                error: error instanceof Error ? error.message : String(error),
                key,
                timestamp: Date.now(),
            });
            return null;
        }
    }
}
```

**Features**:

-   Storage operation logging
-   Error handling for localStorage operations
-   Type safety with generics
-   Performance monitoring

## 🎛️ LocalStorage Control Integration

### Global Control

```typescript
// Enable debug logging
localStorage.setItem('sentry_log_level', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled', 'true');
localStorage.setItem('sentry_debug_mode', 'true');

// Disable logging
localStorage.setItem('hot-league-wall-debug-enabled', 'false');
```

### Component-Specific Control

```typescript
// Enable debug logging for BetPanel only
localStorage.setItem('sentry_log_level_BetPanel', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled_BetPanel', 'true');

// Disable logging for specific component
localStorage.setItem('hot-league-wall-debug-enabled_BetPanel', 'false');
```

## 📊 Integration Statistics

### Components Integrated

| Component      | Status      | Integration Type | Features                                  |
| -------------- | ----------- | ---------------- | ----------------------------------------- |
| AppSettings    | ✅ Complete | Direct imports   | Configuration logging, error handling     |
| BetPanel       | ✅ Complete | React hook       | Workflow tracking, performance monitoring |
| BettingChips   | ✅ Complete | Direct imports   | Lifecycle logging, interaction tracking   |
| CountDownTimer | ✅ Complete | Direct imports   | Timer events, warnings                    |
| Timeout        | ✅ Complete | Direct imports   | Timeout events, retry tracking            |
| StorageManager | ✅ Complete | Direct imports   | Storage operations, error handling        |

### Configuration Files Updated

| File                    | Status      | Environment | Features                      |
| ----------------------- | ----------- | ----------- | ----------------------------- |
| configs.json            | ✅ Complete | Default     | Component-specific logging    |
| sg/configs.LOCAL_1.json | ✅ Complete | SG Local    | Environment-specific settings |
| vg/configs.LOCAL_1.json | ✅ Complete | VG Local    | Environment-specific settings |

### Import Structure Migration

| Old Import                              | New Import | Status      |
| --------------------------------------- | ---------- | ----------- |
| `./_shared/utils/sentry/sentry-helper`  | `@/sentry` | ✅ Complete |
| `./_shared/hooks/useSentryHelper`       | `@/sentry` | ✅ Complete |
| `./_shared/utils/sentry/sentry-manager` | `@/sentry` | ✅ Complete |

## 🚀 Benefits Achieved

### 1. Unified Import Structure

-   **Consistency**: All components use the same `@/sentry` import
-   **Maintainability**: Single point of import management
-   **Type Safety**: Full TypeScript support with proper types

### 2. Component-Specific Configuration

-   **Granular Control**: Different log levels for different components
-   **Performance Optimization**: Selective performance tracking
-   **Workflow Management**: Component-specific workflow tracking

### 3. Environment Consistency

-   **Cross-Environment**: Same logging rules across all environments
-   **LocalStorage Control**: Dynamic control without code deployment
-   **Fallback Support**: Robust error handling and fallback configurations

### 4. Enhanced Monitoring

-   **Workflow Tracking**: Complex operation tracking with states
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **Error Context**: Rich error context with component information

## 🔧 Configuration Management

### Environment-Specific Settings

The system supports different configurations for different environments:

-   **LOCAL**: Full logging for development
-   **SIT**: Moderate logging for system integration testing
-   **UAT**: Conservative logging for user acceptance testing
-   **PROD**: Minimal logging for production

### Component-Specific Settings

Each component can have its own logging configuration:

```json
{
    "components": {
        "HotLeagueWall": {
            "logLevel": "info",
            "enableWorkflowTracking": true,
            "enablePerformanceTracking": true
        },
        "BetPanel": {
            "logLevel": "warn",
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
```

## 📈 Performance Impact

### Minimal Overhead

-   **Conditional Logging**: Logs only when appropriate levels are enabled
-   **Batch Processing**: Efficient batched logging for high-frequency operations
-   **Buffer Management**: Automatic buffer clearing to prevent memory issues

### Optimization Features

-   **Lazy Initialization**: SentryManager initialized only when needed
-   **Error Filtering**: Intelligent filtering to reduce noise
-   **Console Override**: Optional console method override for automatic logging

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
2. **Add Component Name**: Include component name in logging calls
3. **Configure Logging**: Set appropriate log levels and features
4. **Add Error Handling**: Include try-catch blocks with logging
5. **Test Integration**: Verify logging works in different environments

## 📝 Best Practices

### 1. Component Integration

-   Use `useSentryHelper` hook for React components
-   Use direct imports for utility functions
-   Include component name in all logging calls
-   Add appropriate error handling

### 2. Configuration Management

-   Use environment-specific configurations
-   Set appropriate log levels for each component
-   Enable workflow tracking for complex operations
-   Enable performance tracking for critical operations

### 3. Error Handling

-   Always include context in error logs
-   Use try-catch blocks around critical operations
-   Provide fallback configurations
-   Log both success and failure scenarios

### 4. Performance Optimization

-   Use batched logging for high-frequency operations
-   Enable performance tracking selectively
-   Monitor buffer usage
-   Clear old configurations periodically

## 🔗 Related Documentation

-   [SentryHelper Guide](./SENTRY_HELPER_GUIDE.md)
-   [SentryManager Documentation](./sentry-manager.README.md)
-   [Session Replay Guide](./SENTRY_SESSION_REPLAY_GUIDE.md)
-   [Error Handling Enhancement Summary](./SENTRY_ERROR_HANDLING_ENHANCEMENT_SUMMARY.md)
