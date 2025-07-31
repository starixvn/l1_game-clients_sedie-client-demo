# LocalStorage Logging Control Guide

## Overview

The HotLeagueWall project now supports localStorage-based logging control that allows you to:

-   Enable/disable Sentry logging without code deployment
-   Set different log levels (trace, debug, info, warn, error, fatal)
-   Enable debug mode for more detailed logging
-   Control logging on a per-session basis
-   **NEW**: Control Session Replay based on log levels (only enabled for error/fatal levels)
-   **NEW**: Component-specific logging control with unified `@/sentry` import structure

## 🔧 LocalStorage Keys

The system uses three localStorage keys to control logging behavior:

```javascript
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level'; // Log level setting
const SENTRY_ENABLED_KEY = 'hot-league-wall-debug-enabled'; // Enable/disable logging
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode'; // Debug mode toggle
```

## Logging Rules

### Log Level Control (All Environments)

-   **Info level and below** (trace, debug, info): Only sent when `hot-league-wall-debug-enabled` is `true`
-   **Warning, Error, Fatal**: Always sent regardless of localStorage setting

### Session Replay Rules

-   **Session Replay**: Only enabled when `hot-league-wall-debug-enabled` is `true` AND log level allows error/fatal logging

## 🚀 Quick Start

### **Enable Info Level Logging:**

```javascript
// Enable Sentry logging
localStorage.setItem('hot-league-wall-debug-enabled', 'true');

// Set log level to info
localStorage.setItem('sentry_log_level', 'info');

// Enable debug mode for more detailed logging
localStorage.setItem('sentry_debug_mode', 'true');

// Reload the page to apply changes
location.reload();
```

### **Enable Error/Fatal Logging (with Session Replay):**

```javascript
// Enable Sentry logging
localStorage.setItem('hot-league-wall-debug-enabled', 'true');

// Set log level to error (this will also enable Session Replay)
localStorage.setItem('sentry_log_level', 'error');

// Reload the page to apply changes
location.reload();
```

### **Disable All Logging:**

```javascript
// Disable Sentry logging
localStorage.setItem('hot-league-wall-debug-enabled', 'false');

// Reload the page to apply changes
location.reload();
```

## 📊 Available Log Levels

| Level   | Description             | Sentry Logs     | Session Replay  |
| ------- | ----------------------- | --------------- | --------------- |
| `trace` | Very detailed debugging | ✅ (if enabled) | ❌              |
| `debug` | Debug information       | ✅ (if enabled) | ❌              |
| `info`  | Informational messages  | ✅ (if enabled) | ❌              |
| `warn`  | Warning messages        | ✅ (always)     | ✅ (if enabled) |
| `error` | Error messages          | ✅ (always)     | ✅ (if enabled) |
| `fatal` | Fatal errors            | ✅ (always)     | ✅ (if enabled) |
| `all`   | All levels              | ✅ (if enabled) | ✅ (if enabled) |

## 🔧 Environment Consistency

The localStorage rules now apply consistently across all environments:

### **Development Environment**

-   **Logging**: Respects localStorage settings
-   **Session Replay**: Only enabled for error/fatal levels when localStorage allows
-   **Debug Mode**: Can be enabled via localStorage

### **Production Environment**

-   **Logging**: Respects localStorage settings
-   **Session Replay**: Only enabled for error/fatal levels when localStorage allows
-   **Debug Mode**: Can be enabled via localStorage

### **Test Environment**

-   **Logging**: Respects localStorage settings
-   **Session Replay**: Only enabled for error/fatal levels when localStorage allows
-   **Debug Mode**: Can be enabled via localStorage

## 🎯 Component-Specific Control

### **Component-Level localStorage Keys**

The system now supports component-specific logging control:

```javascript
// Component-specific log level
localStorage.setItem('sentry_log_level_[ComponentName]', 'debug');

// Component-specific enable/disable
localStorage.setItem('hot-league-wall-debug-enabled_[ComponentName]', 'true');
```

### **Component Configuration Examples**

```javascript
// Enable debug logging for BetPanel component
localStorage.setItem('sentry_log_level_BetPanel', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled_BetPanel', 'true');

// Disable logging for Loading component
localStorage.setItem('hot-league-wall-debug-enabled_Loading', 'false');

// Set different levels for different components
localStorage.setItem('sentry_log_level_RNGSoccerBase', 'warn');
localStorage.setItem('sentry_log_level_HotLeagueWall', 'error');
```

## 🔧 Programmatic Control

### **Using the New @/sentry Import Structure**

```typescript
import { setLocalStorageConfig, setComponentLocalStorageConfig, getCurrentConfiguration } from '@/sentry';

// Set global logging level
setLocalStorageConfig({ logLevel: 'debug' });

// Enable/disable Sentry
setLocalStorageConfig({ enabled: false });

// Enable debug mode
setLocalStorageConfig({ debugMode: true });

// Set component-specific log level
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });

// Get current configuration
const config = getCurrentConfiguration();
console.log('Current config:', config);
```

### **Browser Console Usage**

```javascript
// Set global configuration
setLocalStorageConfig({ logLevel: 'info', enabled: true, debugMode: false });

// Set component-specific configuration
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug', enabled: true });

// Get all component configurations
getAllComponentConfigs();

// Show current configuration
showConfiguration();
```

## 🎮 Game-Specific Examples

### **RNG Soccer Game**

```javascript
// Enable detailed logging for RNG Soccer
localStorage.setItem('sentry_log_level_RNGSoccerBase', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled_RNGSoccerBase', 'true');

// Enable Session Replay for errors
localStorage.setItem('sentry_log_level_RNGSoccerBase', 'error');
```

### **Bet Panel Component**

```javascript
// Enable debug logging for Bet Panel
localStorage.setItem('sentry_log_level_BetPanel', 'debug');
localStorage.setItem('hot-league-wall-debug-enabled_BetPanel', 'true');

// Disable logging for Bet Panel
localStorage.setItem('hot-league-wall-debug-enabled_BetPanel', 'false');
```

### **Hot League Wall Main Component**

```javascript
// Enable error-level logging for main component
localStorage.setItem('sentry_log_level_HotLeagueWall', 'error');
localStorage.setItem('hot-league-wall-debug-enabled_HotLeagueWall', 'true');
```

## 🔄 Configuration Hierarchy

The system uses a priority-based configuration resolution:

1. **Component localStorage config** (highest priority)
2. **Global localStorage config**
3. **Default component config** (lowest priority)

### **Configuration Resolution Example**

```javascript
// Global setting
localStorage.setItem('sentry_log_level', 'info');

// Component-specific override
localStorage.setItem('sentry_log_level_BetPanel', 'debug');

// Result: BetPanel will use 'debug' level, other components use 'info'
```

## 🚨 Troubleshooting

### **Logs Not Appearing**

```javascript
// Check localStorage settings
console.log('Global Log Level:', localStorage.getItem('sentry_log_level'));
console.log('Global Enabled:', localStorage.getItem('hot-league-wall-debug-enabled'));
console.log('Debug Mode:', localStorage.getItem('sentry_debug_mode'));

// Check component-specific settings
console.log('BetPanel Log Level:', localStorage.getItem('sentry_log_level_BetPanel'));
console.log('BetPanel Enabled:', localStorage.getItem('hot-league-wall-debug-enabled_BetPanel'));
```

### **Session Replay Not Working**

```javascript
// Enable Session Replay
localStorage.setItem('hot-league-wall-debug-enabled', 'true');
localStorage.setItem('sentry_log_level', 'error');
localStorage.setItem('sentry_debug_mode', 'true');
location.reload();
```

### **Component-Specific Issues**

```javascript
// Check component configuration
const componentName = 'BetPanel';
console.log(`${componentName} Log Level:`, localStorage.getItem(`sentry_log_level_${componentName}`));
console.log(`${componentName} Enabled:`, localStorage.getItem(`hot-league-wall-debug-enabled_${componentName}`));

// Reset component configuration
localStorage.removeItem(`sentry_log_level_${componentName}`);
localStorage.removeItem(`hot-league-wall-debug-enabled_${componentName}`);
location.reload();
```

## 📊 Monitoring and Debugging

### **Get Current Configuration**

```typescript
import { getCurrentConfiguration } from '@/sentry';

const config = getCurrentConfiguration();
console.log('Current Sentry config:', config);
```

### **Get Component Configurations**

```typescript
import { getAllComponentConfigs } from '@/sentry';

const componentConfigs = getAllComponentConfigs();
console.log('Component configurations:', componentConfigs);
```

### **Debug Mode Information**

```javascript
// Enable debug mode
localStorage.setItem('sentry_debug_mode', 'true');

// Check debug information
const debugInfo = {
    localStorageConfig: getLocalStorageConfig(),
    globalConfig: getCurrentConfiguration(),
    componentConfigs: getAllComponentConfigs(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
};

console.log('Sentry Debug Info:', debugInfo);
```

## 🔧 Advanced Usage

### **Bulk Configuration**

```javascript
// Set all components to debug level
setAllComponentsToLevel('debug');

// Set all components to error level
setAllComponentsToLevel('error');

// Disable all components
setAllComponentsToLevel('disabled');
```

### **Configuration Persistence**

```javascript
// Save configuration to localStorage
const config = {
    global: { logLevel: 'info', enabled: true, debugMode: false },
    components: {
        BetPanel: { logLevel: 'debug', enabled: true },
        RNGSoccerBase: { logLevel: 'warn', enabled: true },
        HotLeagueWall: { logLevel: 'error', enabled: true },
    },
};

// Apply configuration
Object.entries(config.components).forEach(([component, settings]) => {
    setComponentLocalStorageConfig(component, settings);
});

setLocalStorageConfig(config.global);
```

### **Configuration Validation**

```javascript
// Validate configuration
const validateConfig = () => {
    const globalLevel = localStorage.getItem('sentry_log_level');
    const globalEnabled = localStorage.getItem('hot-league-wall-debug-enabled');

    const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'all'];

    if (globalLevel && !validLevels.includes(globalLevel)) {
        console.warn(`Invalid log level: ${globalLevel}`);
        return false;
    }

    if (globalEnabled && !['true', 'false'].includes(globalEnabled)) {
        console.warn(`Invalid enabled value: ${globalEnabled}`);
        return false;
    }

    return true;
};

validateConfig();
```

## 🔄 Migration from Old Structure

### **Before (Old Import Structure)**

```typescript
import { setLocalStorageConfig } from './_shared/utils/sentry/sentry-helper';
import { setComponentLocalStorageConfig } from './_shared/utils/sentry/sentry-config';
```

### **After (New Import Structure)**

```typescript
import { setLocalStorageConfig, setComponentLocalStorageConfig } from '@/sentry';
```

## 📚 Best Practices

### **1. Use Component-Specific Configuration**

```javascript
// ✅ Good: Set component-specific levels
localStorage.setItem('sentry_log_level_BetPanel', 'debug');
localStorage.setItem('sentry_log_level_RNGSoccerBase', 'warn');

// ❌ Bad: Use global level for everything
localStorage.setItem('sentry_log_level', 'debug'); // Too verbose for all components
```

### **2. Use Appropriate Log Levels**

```javascript
// ✅ Good: Use appropriate levels
localStorage.setItem('sentry_log_level_BetPanel', 'debug'); // Debug for development
localStorage.setItem('sentry_log_level_HotLeagueWall', 'error'); // Error for production

// ❌ Bad: Use debug for everything
localStorage.setItem('sentry_log_level', 'debug'); // Too verbose
```

### **3. Enable Session Replay Only When Needed**

```javascript
// ✅ Good: Enable Session Replay for error scenarios
localStorage.setItem('sentry_log_level', 'error');
localStorage.setItem('hot-league-wall-debug-enabled', 'true');

// ❌ Bad: Always enable Session Replay
localStorage.setItem('sentry_log_level', 'trace'); // Too much data
```

### **4. Use Debug Mode Sparingly**

```javascript
// ✅ Good: Use debug mode for troubleshooting
localStorage.setItem('sentry_debug_mode', 'true'); // Only when needed

// ❌ Bad: Always enable debug mode
localStorage.setItem('sentry_debug_mode', 'true'); // Too verbose
```

This comprehensive guide covers all aspects of localStorage-based logging control with the new unified import structure and component-specific configuration options.
