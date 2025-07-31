# Isolated Component Logging Guide

## Overview

The enhanced Sentry configuration now supports isolated component logging with separate log levels for each component. This allows developers to control logging granularity at the component level, reducing noise and improving debugging efficiency.

## Features

-   **Component-specific log levels**: Each component can have its own log level independent of global settings
-   **Isolated localStorage controls**: Component configurations are stored separately in localStorage
-   **Configuration hierarchy**: Clear priority system for log level resolution
-   **Console configuration display**: Real-time configuration summary in browser console
-   **Runtime configuration updates**: Ability to change component logging settings without page reload
-   **Browser console integration**: Direct access to functions from browser console
-   **Unified import structure**: Single `@/sentry` import point for all functionality

## Browser Console Usage

### Method 1: Automatic Global Exposure

When the Sentry configuration is loaded, functions are automatically exposed globally:

```javascript
// Set component log level
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });

// Set global configuration
setLocalStorageConfig({ logLevel: 'info', enabled: true });

// Get current configuration
getCurrentConfiguration();

// Show configuration in console
showConfiguration();
```

### Method 2: Console Helper Script

Copy and paste the entire contents of `console-helper.js` into your browser console:

```javascript
// After running the console helper script:
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });
setAllComponentsToLevel('warn');
showConfiguration();
```

### Method 3: SentryConfig Object

Access all functions through the SentryConfig object:

```javascript
// Using the SentryConfig object
SentryConfig.setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });
SentryConfig.setLocalStorageConfig({ logLevel: 'info' });
SentryConfig.getCurrentConfiguration();
```

## LocalStorage Keys

### Global Keys

-   `sentry_log_level`: Global log level (trace, debug, info, warn, error, fatal)
-   `hot-league-wall-debug-enabled`: Global enable/disable flag
-   `sentry_debug_mode`: Debug mode flag

### Component-specific Keys

-   `sentry_component_log_level_[ComponentName]`: Component-specific log level
-   `sentry_component_enabled_[ComponentName]`: Component-specific enable/disable flag

## Configuration Hierarchy

The system uses a priority-based configuration resolution:

1. **Component localStorage config** (highest priority)
2. **Global localStorage config**
3. **Default component config** (lowest priority)

## Usage Examples

### Setting Component Log Level

```javascript
// Set specific component log level
import { setComponentLocalStorageConfig } from '@/sentry';

// Enable debug logging for BetPanel component
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });

// Disable logging for Loading component
setComponentLocalStorageConfig('Loading', { enabled: false });

// Set both log level and enabled state
setComponentLocalStorageConfig('RNGSoccerBase', {
    logLevel: 'warn',
    enabled: true,
});
```

### Browser Console Examples

```javascript
// Enable debug logging for specific components
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });
setComponentLocalStorageConfig('RNGSoccerBase', { logLevel: 'debug' });

// Disable logging for utility components
setComponentLocalStorageConfig('Loading', { enabled: false });
setComponentLocalStorageConfig('CountDownTimer', { enabled: false });

// Set different levels for different component types
setComponentLocalStorageConfig('HotLeagueWall', { logLevel: 'info' });
setComponentLocalStorageConfig('GatewayConnectionManager', { logLevel: 'info' });
```

### UI Components (Warn Level)

```javascript
// UI components with moderate logging
setComponentLocalStorageConfig('BetPanel', { logLevel: 'warn' });
setComponentLocalStorageConfig('Scoreboard', { logLevel: 'warn' });
setComponentLocalStorageConfig('RoundHistory', { logLevel: 'warn' });
```

### Utility Components (Error Level)

```javascript
// Utility components with minimal logging
setComponentLocalStorageConfig('Loading', { logLevel: 'error' });
setComponentLocalStorageConfig('CountDownTimer', { logLevel: 'error' });
setComponentLocalStorageConfig('StringHelper', { logLevel: 'error' });
```

## Configuration Files

The component logging configuration is defined in the config files:

```json
{
    "sentry": {
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

## React Component Integration

### Using the useSentryHelper Hook

```typescript
import { useSentryHelper, SentryLogLevel } from '@/sentry';

const BetPanel: React.FC = () => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'BetPanel',
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true,
        autoConfigure: true
    });

    useEffect(() => {
        logInfo('BetPanel component mounted', {
            timestamp: Date.now(),
            props: props
        });
    }, []);

    const handleBet = async () => {
        const workflowId = workflow.start('bet-placement', 'Bet Placement Process', {
            betAmount: 100,
            gameId: 'rng-soccer'
        });

        try {
            // Bet placement logic
            await placeBet(betData);
            workflow.complete(workflowId, true, { result: 'success' });
        } catch (error) {
            logError(error, { betAmount: 100, gameId: 'rng-soccer' });
            workflow.complete(workflowId, false, { error: error.message });
        }
    };

    return <BetPanelContent onBet={handleBet} />;
};
```

### Using Component-Specific Configuration

```typescript
import { configureComponent, useSentryHelper } from '@/sentry';

// Configure component before using
configureComponent('BetPanel', {
    logLevel: SentryLogLevel.WARN,
    enableWorkflowTracking: false,
    enablePerformanceTracking: true,
});

const BetPanel: React.FC = () => {
    const { logError, logInfo } = useSentryHelper({
        componentName: 'BetPanel',
        autoConfigure: false, // Don't auto-configure since we did it manually
    });

    // Component logic
};
```

## Programmatic Configuration

### Setting Multiple Components

```typescript
import { configureComponentsBatch } from '@/sentry';

// Configure multiple components at once
configureComponentsBatch({
    HotLeagueWall: {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
    },
    BetPanel: {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true,
    },
    RNGSoccerBase: {
        logLevel: SentryLogLevel.DEBUG,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
    },
});
```

### Environment-Specific Configuration

```typescript
import { configureSentryForEnvironment } from '@/sentry';

// Configure for different environments
configureSentryForEnvironment('development', {
    componentLogging: {
        enabled: true,
        defaultLogLevel: 'debug',
        components: {
            BetPanel: { logLevel: 'debug' },
            RNGSoccerBase: { logLevel: 'debug' },
        },
    },
});

configureSentryForEnvironment('production', {
    componentLogging: {
        enabled: true,
        defaultLogLevel: 'error',
        components: {
            BetPanel: { logLevel: 'warn' },
            RNGSoccerBase: { logLevel: 'error' },
        },
    },
});
```

## Best Practices

### 1. Component Classification

-   **Critical**: Use `info` level for core application components
-   **Important**: Use `warn` level for significant UI components
-   **Utility**: Use `error` level for helper components

### 2. Performance Considerations

-   Disable workflow tracking for high-frequency components
-   Enable performance tracking only for components that need it
-   Use appropriate log levels to reduce console noise

### 3. Debugging Workflow

1. Set global log level to `info` for general debugging
2. Set specific component log levels to `debug` for detailed investigation
3. Use `trace` level sparingly for deep debugging
4. Disable components that are not relevant to current debugging

### 4. Production Considerations

-   Set global log level to `warn` or `error` in production
-   Disable debug mode in production
-   Consider disabling workflow tracking for performance-critical components

### 5. Console Usage

-   Use the console helper script for quick configuration changes
-   Use `showConfiguration()` to verify settings
-   Use bulk operations for quick setup
-   Clear configurations when done debugging

## Troubleshooting

### Component Not Logging

1. Check if component is enabled: `localStorage.getItem('sentry_component_enabled_[ComponentName]')`
2. Verify log level: `localStorage.getItem('sentry_component_log_level_[ComponentName]')`
3. Check global configuration: `localStorage.getItem('hot-league-wall-debug-enabled')`

### Configuration Not Applied

1. Ensure `initializeSentryForProject()` is called after configuration changes
2. Check browser console for configuration summary
3. Verify localStorage keys are correctly formatted

### Console Functions Not Available

1. Check if the Sentry configuration module is loaded
2. Run the console helper script if needed
3. Verify the page has loaded completely

## Migration from Old Import Structure

### Before (Old Import Structure)

```typescript
import { setComponentLocalStorageConfig } from './_shared/utils/sentry/sentry-config';
import { configureComponent } from './_shared/utils/sentry/sentry-helper';
```

### After (New Import Structure)

```typescript
import { setComponentLocalStorageConfig, configureComponent } from '@/sentry';
```

This comprehensive guide covers all aspects of isolated component logging with the new unified import structure and enhanced configuration options.
