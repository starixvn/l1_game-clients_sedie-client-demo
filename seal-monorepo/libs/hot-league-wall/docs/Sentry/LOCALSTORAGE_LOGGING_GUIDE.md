# LocalStorage Logging Control Guide

## Overview

The HotLeagueWall project now supports localStorage-based logging control that allows you to:

-   Enable/disable Sentry logging without code deployment
-   Set different log levels (trace, debug, info, warn, error, fatal)
-   Enable debug mode for more detailed logging
-   Control logging on a per-session basis
-   **NEW**: Control Session Replay based on log levels (only enabled for error/fatal levels)

## 🔧 LocalStorage Keys

The system uses three localStorage keys to control logging behavior:

```javascript
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level'; // Log level setting
const SENTRY_ENABLED_KEY = 'sentry_enabled'; // Enable/disable logging
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode'; // Debug mode toggle
```

## 📋 Logging Rules

### **Log Level Control (All Environments)**

The localStorage rules apply consistently across **ALL environments** (local, development, production):

-   **Info level and below** (trace, debug, info): Only sent when `sentry_enabled` is `true`
-   **Warning, Error, Fatal**: Always sent regardless of localStorage setting
-   **Session Replay**: Only enabled when `sentry_enabled` is `true` AND log level allows error/fatal logging

### **Session Replay Rules**

Session Replay is now more conservative and privacy-focused:

-   **Only enabled for error/fatal levels**: Session Replay is only active when the log level is `error`, `fatal`, `warn`, or `all`
-   **Respects localStorage**: Even in development, Session Replay requires localStorage to be enabled
-   **Privacy-first**: Text and media are masked by default unless debug mode is enabled

## 🚀 Quick Start

### **Enable Info Level Logging:**

```javascript
// Enable Sentry logging
localStorage.setItem('sentry_enabled', 'true');

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
localStorage.setItem('sentry_enabled', 'true');

// Set log level to error (this will also enable Session Replay)
localStorage.setItem('sentry_log_level', 'error');

// Reload the page to apply changes
location.reload();
```

### **Disable All Logging:**

```javascript
// Disable Sentry logging
localStorage.setItem('sentry_enabled', 'false');

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
-   **Privacy**: Enhanced privacy settings by default

### **Local Environment**

-   **Logging**: Respects localStorage settings
-   **Session Replay**: Only enabled for error/fatal levels when localStorage allows
-   **Debug Mode**: Can be enabled via localStorage

## 📝 What Gets Logged

When logging is enabled, the system captures:

### **Application Lifecycle**

-   Component initialization and mounting
-   Configuration loading
-   Container setup and configuration
-   Authentication events

### **User Interactions**

-   Tab clicks and navigation
-   Game selections
-   League toggle changes
-   Session reconnection attempts

### **System Operations**

-   Connection management
-   Storage operations
-   Workflow tracking
-   Performance monitoring

### **Error Handling**

-   Connection failures
-   Authentication errors
-   Configuration errors
-   Component errors

### **Session Replay (Error/Fatal Only)**

-   User interactions during error conditions
-   Screen recordings for debugging critical issues
-   Network requests during error states

## 🔧 LocalStorage Control Functions

The system provides utility functions for programmatic control:

```javascript
// Set logging configuration
setLocalStorageConfig({
    logLevel: 'info',
    enabled: true,
    debugMode: true,
});

// Clear all settings
clearLocalStorageConfig();
```

## 🔒 Security Considerations

-   **localStorage is client-side:** Settings are stored in the user's browser
-   **Session-specific:** Settings persist only for the current browser session
-   **No sensitive data:** The logging system is designed to avoid logging sensitive information
-   **Session Replay privacy:** Text and media are masked by default
-   **Debug mode:** When enabled, may log more detailed information - use with caution in production

## 📞 Support

For issues or questions about the logging system, please refer to the Sentry dashboard or contact the development team.

## 🔍 Advanced Usage

### **Programmatic Control**

```javascript
// Import the utility functions
import { setLocalStorageConfig, clearLocalStorageConfig } from './_shared/utils/sentry/sentry-session-replay';

// Enable comprehensive logging
const enableComprehensiveLogging = () => {
    setLocalStorageConfig({
        logLevel: 'debug',
        enabled: true,
        debugMode: true,
    });
    location.reload();
};

// Enable error-only logging
const enableErrorLogging = () => {
    setLocalStorageConfig({
        logLevel: 'error',
        enabled: true,
        debugMode: false,
    });
    location.reload();
};

// Disable all logging
const disableLogging = () => {
    setLocalStorageConfig({
        enabled: false,
    });
    location.reload();
};

// Clear all settings
const clearSettings = () => {
    clearLocalStorageConfig();
    location.reload();
};
```

### **Conditional Logging Based on Environment**

```javascript
// Enable logging only in specific conditions
const enableConditionalLogging = () => {
    const isProduction = window.location.hostname === 'your-production-domain.com';
    const isDebugMode = window.location.search.includes('debug=true');

    if (isProduction && isDebugMode) {
        localStorage.setItem('sentry_enabled', 'true');
        localStorage.setItem('sentry_log_level', 'info');
        localStorage.setItem('sentry_debug_mode', 'false');
        location.reload();
    }
};
```

### **Dynamic Log Level Switching**

```javascript
// Switch log levels dynamically
const switchLogLevel = (newLevel) => {
    const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'all'];

    if (validLevels.includes(newLevel)) {
        localStorage.setItem('sentry_log_level', newLevel);
        console.log(`Log level switched to: ${newLevel}`);

        // Reload to apply changes
        location.reload();
    } else {
        console.error(`Invalid log level: ${newLevel}`);
    }
};

// Usage examples
switchLogLevel('debug'); // Enable debug logging
switchLogLevel('error'); // Enable error logging with Session Replay
switchLogLevel('info'); // Enable info logging
```

### **Browser Console Integration**

```javascript
// Add utility functions to global scope for easy access
window.sentryUtils = {
    enableDebug: () => {
        localStorage.setItem('sentry_enabled', 'true');
        localStorage.setItem('sentry_log_level', 'debug');
        localStorage.setItem('sentry_debug_mode', 'true');
        location.reload();
    },

    enableInfo: () => {
        localStorage.setItem('sentry_enabled', 'true');
        localStorage.setItem('sentry_log_level', 'info');
        localStorage.setItem('sentry_debug_mode', 'false');
        location.reload();
    },

    enableError: () => {
        localStorage.setItem('sentry_enabled', 'true');
        localStorage.setItem('sentry_log_level', 'error');
        localStorage.setItem('sentry_debug_mode', 'true');
        location.reload();
    },

    disable: () => {
        localStorage.setItem('sentry_enabled', 'false');
        location.reload();
    },

    clear: () => {
        localStorage.removeItem('sentry_log_level');
        localStorage.removeItem('sentry_enabled');
        localStorage.removeItem('sentry_debug_mode');
        location.reload();
    },

    status: () => {
        const config = {
            logLevel: localStorage.getItem('sentry_log_level') || 'info',
            enabled: localStorage.getItem('sentry_enabled') !== 'false',
            debugMode: localStorage.getItem('sentry_debug_mode') === 'true',
        };
        console.log('Current Sentry Configuration:', config);
        return config;
    },
};

// Usage in browser console:
// sentryUtils.enableDebug()  // Enable debug logging
// sentryUtils.enableError()  // Enable error logging with Session Replay
// sentryUtils.disable()      // Disable all logging
// sentryUtils.status()       // Check current configuration
```

## 🚨 Troubleshooting

### **Common Issues**

#### 1. Logs Not Appearing in Sentry

**Symptoms:**

-   No logs visible in Sentry dashboard
-   localStorage settings not taking effect

**Solutions:**

```javascript
// Check localStorage settings
console.log('Log Level:', localStorage.getItem('sentry_log_level'));
console.log('Enabled:', localStorage.getItem('sentry_enabled'));
console.log('Debug Mode:', localStorage.getItem('sentry_debug_mode'));

// Verify Sentry configuration
const config = sentryHelper.getConfig();
console.log('Sentry Config:', config);

// Check if component is configured
const componentConfig = sentryHelper.getComponentConfig('YourComponent');
console.log('Component Config:', componentConfig);
```

#### 2. Session Replay Not Working

**Symptoms:**

-   Session Replay not capturing sessions
-   Privacy settings too restrictive

**Solutions:**

```javascript
// Enable Session Replay for error/fatal levels
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'error');
localStorage.setItem('sentry_debug_mode', 'true');
location.reload();

// Check Session Replay configuration
const sessionReplayConfig = {
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    maskAllText: false,
    blockAllMedia: false,
};
```

#### 3. Performance Issues

**Symptoms:**

-   Slow component rendering
-   High memory usage
-   Excessive logging

**Solutions:**

```typescript
// Reduce logging in production
if (process.env.NODE_ENV === 'production') {
    configureSentry({
        defaultLogLevel: SentryLogLevel.WARN,
        enableConsoleOverride: false,
    });
}

// Use conditional logging
const shouldLog = (level: string) => {
    const localStorageConfig = getLocalStorageConfig();
    return localStorageConfig.enabled && localStorageConfig.logLevel === level;
};

if (shouldLog('info')) {
    logInfo('Detailed info', { data: largeDataObject });
}
```

#### 4. localStorage Not Available

**Symptoms:**

-   localStorage errors in console
-   Settings not persisting

**Solutions:**

```javascript
// Check localStorage availability
const isLocalStorageAvailable = () => {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

// Fallback to sessionStorage or memory storage
if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, using fallback storage');
    // Use sessionStorage or memory storage as fallback
}
```

### **Debug Mode**

```typescript
// Enable debug mode for detailed logging
localStorage.setItem('sentry_debug_mode', 'true');

// Check debug information
const debugInfo = {
    localStorageConfig: getLocalStorageConfig(),
    globalConfig: sentryHelper.getConfig(),
    activeWorkflows: sentryHelper.getActiveWorkflows(),
    componentConfigs: Array.from(sentryHelper.getConfig().componentConfigs.entries()),
};

console.log('Sentry Debug Info:', debugInfo);
```

## 📊 Best Practices

### 1. Log Level Strategy

```typescript
// Development: Full logging
if (process.env.NODE_ENV === 'development') {
    configureSentry({
        defaultLogLevel: SentryLogLevel.DEBUG,
        enableConsoleOverride: true,
    });
}

// Production: Conservative logging
if (process.env.NODE_ENV === 'production') {
    configureSentry({
        defaultLogLevel: SentryLogLevel.WARN,
        enableConsoleOverride: false,
    });
}
```

### 2. Component-Specific Logging

```typescript
// Critical components: Full logging
configureComponent('PaymentComponent', {
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

// UI components: Error-only logging
configureComponent('ButtonComponent', {
    logLevel: SentryLogLevel.ERROR_ONLY,
    enableWorkflowTracking: false,
    enablePerformanceTracking: false,
});
```

### 3. Workflow Best Practices

```typescript
// Always complete workflows
const handleOperation = async () => {
    const workflowId = workflow.start('Operation', {});

    try {
        // Operation logic
        workflow.complete(workflowId, true, { result: 'success' });
    } catch (error) {
        workflow.complete(workflowId, false, { error: error.message });
        throw error;
    }
};

// Use meaningful workflow names
const workflowId = workflow.start('User Authentication Flow', {
    userId: 'user123',
    authMethod: 'sso',
});
```

### 4. Performance Tracking Best Practices

```typescript
// Track meaningful operations
await trackPerformance('DataLoader', 'Load User Profile', async () => {
    return await fetchUserProfile(userId);
});

// Avoid tracking trivial operations
// ❌ Don't do this
await trackPerformance('Component', 'Simple State Update', () => {
    setState(newState);
});
```

### 5. Error Context Best Practices

```typescript
// Provide rich context
logError(error, {
    userId: 'user123',
    action: 'place_bet',
    gameId: 'rng-soccer',
    betAmount: 100.0,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
});

// Avoid sensitive information
// ❌ Don't log sensitive data
logError(error, {
    password: userPassword, // Never log passwords
    creditCard: cardNumber, // Never log credit card numbers
    ssn: socialSecurityNumber, // Never log SSNs
});
```

## 🔒 Security Considerations

### Data Privacy

```typescript
// Sanitize sensitive data before logging
const sanitizeUserData = (userData: any) => {
    const { password, creditCard, ssn, ...safeData } = userData;
    return {
        ...safeData,
        hasPassword: !!password,
        hasCreditCard: !!creditCard,
        hasSSN: !!ssn,
    };
};

logInfo('User data processed', sanitizeUserData(userData));
```

### Session Replay Privacy

```typescript
// Configure Session Replay for privacy
const sessionReplayConfig = {
    maskAllText: true, // Mask all text content
    blockAllMedia: true, // Block all media content
    maskAllInputs: true, // Mask all input fields
    sendDefaultPii: false, // Don't send PII data
};
```

## 📈 Monitoring & Analytics

### Custom Metrics

```typescript
// Track custom metrics
const trackCustomMetric = (metricName: string, value: number, tags?: Record<string, string>) => {
    logInfo('Custom Metric', {
        metric: metricName,
        value,
        tags,
        timestamp: Date.now(),
    });
};

// Usage examples
trackCustomMetric('user_session_duration', 3600, { userId: 'user123' });
trackCustomMetric('game_completion_rate', 0.85, { gameId: 'rng-soccer' });
trackCustomMetric('payment_success_rate', 0.98, { paymentMethod: 'credit_card' });
```

### Performance Monitoring

```typescript
// Monitor component performance
const ComponentWithPerformanceMonitoring = () => {
    const { workflow } = useSentryHelper({
        componentName: 'PerformanceComponent',
        enablePerformanceTracking: true
    });

    useEffect(() => {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            if (duration > 1000) { // Log slow components
                logWarning('Slow component unmount', {
                    duration: `${duration.toFixed(2)}ms`,
                    componentName: 'PerformanceComponent'
                });
            }
        };
    }, []);

    return <div>Component Content</div>;
};
```

## 🎯 Real-World Examples

### **Production Debugging Session**

```javascript
// 1. Enable comprehensive logging for production debugging
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'info');
localStorage.setItem('sentry_debug_mode', 'true');
location.reload();

// 2. Reproduce the issue
// ... perform the actions that cause the problem ...

// 3. Check Sentry for logs
// Go to your Sentry dashboard to see the logged events

// 4. If you need more detail, increase log level
localStorage.setItem('sentry_log_level', 'debug');
location.reload();

// 5. When done debugging, disable logging
localStorage.setItem('sentry_enabled', 'false');
location.reload();
```

### **Component-Specific Debugging**

```javascript
// Enable debugging for specific components
const enableComponentDebugging = (componentName) => {
    // Configure the specific component
    configureComponent(componentName, {
        logLevel: SentryLogLevel.DEBUG,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
    });

    // Enable debug mode
    localStorage.setItem('sentry_debug_mode', 'true');
    localStorage.setItem('sentry_log_level', 'debug');
    location.reload();
};

// Usage
enableComponentDebugging('PaymentComponent');
```

### **Error Investigation**

```javascript
// Enable error logging with Session Replay
const enableErrorInvestigation = () => {
    localStorage.setItem('sentry_enabled', 'true');
    localStorage.setItem('sentry_log_level', 'error');
    localStorage.setItem('sentry_debug_mode', 'true');
    location.reload();

    console.log('Error investigation mode enabled');
    console.log('Session Replay will capture user interactions during errors');
};

// Trigger the error scenario
// ... perform actions that trigger the error ...

// Check Sentry for error logs and Session Replay data
```

This comprehensive guide covers all aspects of localStorage-based logging control, including advanced usage patterns, troubleshooting, and real-world examples for effective debugging in production environments.
