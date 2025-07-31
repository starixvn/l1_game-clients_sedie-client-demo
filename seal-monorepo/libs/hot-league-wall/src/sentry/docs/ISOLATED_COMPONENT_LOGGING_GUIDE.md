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
import { setComponentLocalStorageConfig } from './sentry-config';

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
// Quick component configuration
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });
setComponentLocalStorageConfig('Scoreboard', { logLevel: 'warn' });
setComponentLocalStorageConfig('Loading', { enabled: false });

// Global configuration
setLocalStorageConfig({ logLevel: 'info', enabled: true, debugMode: false });

// Bulk operations
setAllComponentsToLevel('warn');
enableAllComponents();
disableAllComponents();

// View configuration
showConfiguration();
getCurrentConfiguration();
```

### Reading Component Configuration

```javascript
import { getAllComponentConfigs, getCurrentConfiguration } from './sentry-config';

// Get all component configurations
const componentConfigs = getAllComponentConfigs();
console.log('Component configs:', componentConfigs);

// Get complete configuration object
const config = getCurrentConfiguration();
console.log('Current config:', config);
```

### Clearing Component Configuration

```javascript
import { clearComponentLocalStorageConfig, clearLocalStorageConfig } from './sentry-config';

// Clear specific component configuration
clearComponentLocalStorageConfig('BetPanel');

// Clear all configurations (global and component)
clearLocalStorageConfig();
```

## Browser Console Integration

When `initializeSentryForProject()` is called, a comprehensive configuration summary is logged to the console:

```javascript
🔧 Sentry Configuration Summary
├── Global Configuration
│   ├── enabled: true
│   ├── logLevel: "info"
│   └── debugMode: false
├── Component Logging
│   ├── enabled: true
│   ├── defaultLogLevel: "info"
│   └── components: [...]
├── LocalStorage Keys
│   ├── global: {...}
│   └── component: {...}
└── Component Configurations: [...]
```

The configuration is also available globally as `window.__SENTRY_CONFIG__` for debugging.

## Console Helper Functions

### Individual Functions

-   `setComponentLocalStorageConfig(componentName, config)` - Set component configuration
-   `setLocalStorageConfig(config)` - Set global configuration
-   `clearComponentLocalStorageConfig(componentName)` - Clear component configuration
-   `clearLocalStorageConfig()` - Clear all configurations
-   `getAllComponentConfigs()` - Get all component configurations
-   `getCurrentConfiguration()` - Get complete configuration
-   `showConfiguration()` - Display configuration in console

### Bulk Operations

-   `setAllComponentsToLevel(level)` - Set all components to specified level
-   `enableAllComponents()` - Enable all components
-   `disableAllComponents()` - Disable all components

### Object Access

-   `SentryConsole` - Object containing all functions
-   `SentryConfig` - Alternative object access (when module is loaded)

## Component Configuration Examples

### Critical Components (Info Level)

```javascript
// Components that need detailed logging for debugging
setComponentLocalStorageConfig('HotLeagueWall', { logLevel: 'info' });
setComponentLocalStorageConfig('App', { logLevel: 'info' });
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

### Performance Issues

1. Reduce log levels for high-frequency components
2. Disable workflow tracking for non-critical components
3. Use `error` level for utility components

## API Reference

### Functions

#### `setComponentLocalStorageConfig(componentName, config)`

Sets component-specific configuration in localStorage.

**Parameters:**

-   `componentName` (string): Name of the component
-   `config` (object): Configuration object
    -   `logLevel?` (string): Log level (trace, debug, info, warn, error, fatal)
    -   `enabled?` (boolean): Enable/disable component logging

#### `getAllComponentConfigs()`

Returns all component configurations from localStorage.

**Returns:** `Record<string, { logLevel: string; enabled: boolean }>`

#### `getCurrentConfiguration()`

Returns complete configuration object including global and component settings.

**Returns:** Configuration object with global, components, and localStorageKeys

#### `clearComponentLocalStorageConfig(componentName)`

Clears component-specific configuration from localStorage.

**Parameters:**

-   `componentName` (string): Name of the component to clear

#### `clearLocalStorageConfig()`

Clears all Sentry-related configurations from localStorage.

#### `showConfiguration()`

Displays current configuration in console and returns configuration object.

**Returns:** Configuration object

#### `setAllComponentsToLevel(level)`

Sets all components to the specified log level.

**Parameters:**

-   `level` (string): Log level (trace, debug, info, warn, error, fatal)

## Migration Guide

### From Global Logging to Component Logging

1. **Identify Components**: List all components that need individual logging control
2. **Set Default Levels**: Configure appropriate default log levels in config files
3. **Update localStorage**: Use component-specific keys instead of global keys
4. **Test Configuration**: Verify each component logs at the expected level
5. **Optimize**: Adjust log levels based on debugging needs

### Example Migration

**Before (Global):**

```javascript
localStorage.setItem('sentry_log_level', 'debug');
```

**After (Component-specific):**

```javascript
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });
setComponentLocalStorageConfig('Scoreboard', { logLevel: 'warn' });
setComponentLocalStorageConfig('Loading', { logLevel: 'error' });
```

## Conclusion

The isolated component logging feature provides granular control over Sentry logging, allowing developers to focus on specific components during debugging while reducing noise from other components. This improves debugging efficiency and application performance.

The browser console integration makes it easy to configure logging on-the-fly during development and debugging sessions.
