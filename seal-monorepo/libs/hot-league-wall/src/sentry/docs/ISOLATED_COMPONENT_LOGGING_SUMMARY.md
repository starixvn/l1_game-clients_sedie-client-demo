# Isolated Component Logging Enhancement Summary

## Overview

The Sentry configuration has been significantly enhanced to support isolated component logging with separate log levels for each component. This enhancement provides granular control over logging behavior, reducing noise and improving debugging efficiency.

## Key Enhancements

### 1. Configuration Files Updated

**Files Modified:**

-   `configs/configs.json`
-   `configs/sg/configs.LOCAL_1.json`
-   `configs/vg/configs.LOCAL_1.json`

**Changes:**

-   Added `componentLogging` section with component-specific configurations
-   Each component has individual `logLevel`, `enableWorkflowTracking`, and `enablePerformanceTracking` settings
-   25+ components configured with appropriate default log levels

### 2. Enhanced sentry-config.ts

**New Features:**

-   Component-specific localStorage keys with prefixes:
    -   `sentry_component_log_level_[ComponentName]`
    -   `sentry_component_enabled_[ComponentName]`
-   Configuration hierarchy system (component localStorage > global localStorage > default config)
-   Real-time configuration summary in browser console
-   Global configuration object available as `window.__SENTRY_CONFIG__`

**New Functions:**

-   `setComponentLocalStorageConfig()` - Set component-specific configuration
-   `getComponentLocalStorageConfig()` - Get component-specific configuration
-   `getAllComponentConfigs()` - Get all component configurations
-   `clearComponentLocalStorageConfig()` - Clear component-specific configuration
-   `getCurrentConfiguration()` - Get complete configuration object
-   `logConfigurationSummary()` - Display configuration in console

### 3. Component Classification

**Critical Components (Info Level):**

-   HotLeagueWall, App, AppContent, Lobby, LobbyComponent
-   RNGSoccerStaticPrototype, SSOControlSimulator, Preview
-   GatewayConnectionManager, ConnectionManager, TokenRequestManager

**Important Components (Warn Level):**

-   RNGSoccerBase, RNGSoccerPage, GameDisconnectView
-   BetPanel, Scoreboard, RoundHistory, WinnerDisplay
-   SyncMemberSiteBalance, LobbyStore, GameStore

**UI Components (Warn/Error Level):**

-   BetOption, BettingChips, CountDownTimer, AnimBalance

**Utility Components (Error Level):**

-   Loading, StringHelper, ComponentUtil, I18n

### 4. Configuration Hierarchy

The system implements a clear priority system:

1. **Component localStorage config** (highest priority)

    - `sentry_component_log_level_[ComponentName]`
    - `sentry_component_enabled_[ComponentName]`

2. **Global localStorage config**

    - `sentry_log_level`
    - `hot-league-wall-debug-enabled`
    - `sentry_debug_mode`

3. **Default component config** (lowest priority)
    - Defined in configuration files

### 5. Console Integration

**Configuration Summary Display:**

```
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

**Global Access:**

-   Configuration available as `window.__SENTRY_CONFIG__` for debugging

### 6. Documentation

**New Documentation:**

-   `docs/Sentry/ISOLATED_COMPONENT_LOGGING_GUIDE.md` - Comprehensive usage guide
-   `ISOLATED_COMPONENT_LOGGING_SUMMARY.md` - This summary document

**Documentation Features:**

-   Complete API reference
-   Usage examples
-   Best practices
-   Troubleshooting guide
-   Migration guide

### 7. Test Interface

**New Test File:**

-   `test-isolated-logging.html` - Interactive test interface

**Test Features:**

-   Real-time component configuration management
-   Global configuration controls
-   Bulk operations (set all to info/warn/error)
-   Configuration display
-   Component logging simulation
-   Console integration testing

## Usage Examples

### Setting Component Log Level

```javascript
import { setComponentLocalStorageConfig } from './sentry-config';

// Enable debug logging for BetPanel component
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });

// Disable logging for Loading component
setComponentLocalStorageConfig('Loading', { enabled: false });
```

### Reading Configuration

```javascript
import { getAllComponentConfigs, getCurrentConfiguration } from './sentry-config';

// Get all component configurations
const componentConfigs = getAllComponentConfigs();

// Get complete configuration object
const config = getCurrentConfiguration();
```

### Clearing Configuration

```javascript
import { clearComponentLocalStorageConfig, clearLocalStorageConfig } from './sentry-config';

// Clear specific component configuration
clearComponentLocalStorageConfig('BetPanel');

// Clear all configurations
clearLocalStorageConfig();
```

## Benefits

### 1. Granular Control

-   Each component can have its own log level
-   Independent enable/disable controls
-   Reduced console noise during debugging

### 2. Performance Optimization

-   Disable logging for non-critical components
-   Reduce workflow tracking overhead
-   Optimize performance tracking usage

### 3. Debugging Efficiency

-   Focus on specific components during debugging
-   Real-time configuration changes
-   Clear configuration visibility

### 4. Production Readiness

-   Appropriate log levels for production
-   Component-specific performance settings
-   Environment-aware configuration

## Migration Path

### From Global to Component Logging

1. **Identify Components**: List components needing individual control
2. **Set Default Levels**: Configure appropriate defaults in config files
3. **Update localStorage**: Use component-specific keys
4. **Test Configuration**: Verify each component logs correctly
5. **Optimize**: Adjust based on debugging needs

### Example Migration

**Before:**

```javascript
localStorage.setItem('sentry_log_level', 'debug');
```

**After:**

```javascript
setComponentLocalStorageConfig('BetPanel', { logLevel: 'debug' });
setComponentLocalStorageConfig('Scoreboard', { logLevel: 'warn' });
setComponentLocalStorageConfig('Loading', { logLevel: 'error' });
```

## Technical Implementation

### LocalStorage Key Structure

```
Global Keys:
- sentry_log_level
- hot-league-wall-debug-enabled
- sentry_debug_mode

Component Keys:
- sentry_component_log_level_[ComponentName]
- sentry_component_enabled_[ComponentName]
```

### Configuration Resolution

```javascript
const finalLogLevel = componentLocalStorage.logLevel || componentConfig?.logLevel || localStorageConfig.logLevel || defaultConfig.logLevel;

const finalEnabled =
    componentLocalStorage.enabled !== null ? componentLocalStorage.enabled : componentConfig?.enabled ?? localStorageConfig.enabled;
```

### Console Integration

```javascript
console.group('🔧 Sentry Configuration Summary');
console.log('Global Configuration:', summary.global);
console.log('Component Logging:', summary.componentLogging);
console.log('LocalStorage Keys:', summary.localStorageKeys);
console.log('Component Configurations:', summary.componentLogging.components);
console.groupEnd();

// Global access for debugging
window.__SENTRY_CONFIG__ = summary;
```

## Future Enhancements

### Potential Improvements

1. **Configuration Persistence**: Save configurations to backend
2. **Environment Profiles**: Different configurations per environment
3. **Dynamic Component Discovery**: Auto-detect new components
4. **Performance Metrics**: Track logging performance impact
5. **Advanced Filtering**: Component group filtering
6. **Configuration Validation**: Validate configuration integrity

### Integration Opportunities

1. **Developer Tools**: Browser extension for configuration management
2. **Admin Panel**: Web interface for configuration management
3. **Analytics**: Track component logging usage patterns
4. **Automation**: CI/CD integration for configuration management

## Conclusion

The isolated component logging enhancement provides a robust, flexible, and user-friendly system for managing Sentry logging at the component level. This significantly improves debugging efficiency while maintaining performance and providing clear configuration visibility.

The implementation follows best practices for configuration management, provides comprehensive documentation, and includes testing tools for validation. The system is production-ready and can be easily extended for future enhancements.
