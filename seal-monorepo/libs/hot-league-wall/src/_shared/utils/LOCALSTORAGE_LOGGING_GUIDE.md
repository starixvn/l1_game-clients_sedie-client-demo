# LocalStorage-Based Logging Control Guide

This guide explains how to use localStorage-based logging control to enable info level logging in production without code deployment.

## 🎯 Overview

The HotLeagueWall project now supports localStorage-based logging control that allows you to:

-   Enable/disable Sentry logging without code deployment
-   Set different log levels (trace, debug, info, warn, error, fatal)
-   Enable debug mode for more detailed logging
-   Control logging on a per-session basis

## 🔧 LocalStorage Keys

The system uses three localStorage keys to control logging:

```javascript
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level'; // Log level setting
const SENTRY_ENABLED_KEY = 'sentry_enabled'; // Enable/disable logging
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode'; // Debug mode toggle
```

## 🚀 Quick Start

### Enable Info Level Logging in Production

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Run the following commands:

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

### Available Log Levels

```javascript
// Very detailed debugging
localStorage.setItem('sentry_log_level', 'trace');

// Debug information
localStorage.setItem('sentry_log_level', 'debug');

// Informational messages (recommended for production debugging)
localStorage.setItem('sentry_log_level', 'info');

// Warning messages
localStorage.setItem('sentry_log_level', 'warn');

// Error messages only
localStorage.setItem('sentry_log_level', 'error');

// Fatal errors only
localStorage.setItem('sentry_log_level', 'fatal');
```

## 📋 Complete Usage Examples

### 1. Enable Comprehensive Logging for Production Debugging

```javascript
// Enable all logging features
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'info');
localStorage.setItem('sentry_debug_mode', 'true');

// Reload to apply
location.reload();
```

### 2. Enable Debug Level Logging

```javascript
// Enable debug level logging
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'debug');
localStorage.setItem('sentry_debug_mode', 'true');

// Reload to apply
location.reload();
```

### 3. Enable Warning and Error Logging Only

```javascript
// Enable warning and error logging only
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'warn');
localStorage.setItem('sentry_debug_mode', 'false');

// Reload to apply
location.reload();
```

### 4. Disable Logging Completely

```javascript
// Disable all logging
localStorage.setItem('sentry_enabled', 'false');

// Reload to apply
location.reload();
```

### 5. Clear All Logging Settings

```javascript
// Remove all logging settings
localStorage.removeItem('sentry_log_level');
localStorage.removeItem('sentry_enabled');
localStorage.removeItem('sentry_debug_mode');

// Reload to apply
location.reload();
```

## 🔍 Check Current Settings

### View Current Logging Configuration

```javascript
// Check current settings
console.log('Log Level:', localStorage.getItem('sentry_log_level'));
console.log('Enabled:', localStorage.getItem('sentry_enabled'));
console.log('Debug Mode:', localStorage.getItem('sentry_debug_mode'));
```

### Programmatic Configuration Check

```javascript
// Get current configuration
const config = {
    logLevel: localStorage.getItem('sentry_log_level') || 'info',
    enabled: localStorage.getItem('sentry_enabled') !== 'false',
    debugMode: localStorage.getItem('sentry_debug_mode') === 'true',
};

console.log('Current Sentry Configuration:', config);
```

## 🛠️ Advanced Usage

### Using the Programmatic API

The system also provides programmatic functions for controlling logging:

```javascript
// Import the functions (if available in global scope)
import { setLocalStorageConfig, clearLocalStorageConfig } from './sentry-session-replay';

// Set configuration programmatically
setLocalStorageConfig({
    logLevel: 'info',
    enabled: true,
    debugMode: true,
});

// Clear configuration
clearLocalStorageConfig();
```

### Conditional Logging Based on Environment

```javascript
// Enable logging only in specific conditions
if (window.location.hostname === 'your-production-domain.com') {
    localStorage.setItem('sentry_enabled', 'true');
    localStorage.setItem('sentry_log_level', 'info');
    localStorage.setItem('sentry_debug_mode', 'false');
}
```

## 📊 What Gets Logged

When info level logging is enabled, the following events will be logged to Sentry:

### Application Lifecycle

-   Component initialization and mounting
-   Configuration loading
-   Container setup and configuration
-   Authentication events

### User Interactions

-   Tab clicks and navigation
-   Game selections
-   League toggle changes
-   Session reconnection attempts

### System Operations

-   Connection management
-   Storage operations
-   Workflow tracking
-   Performance monitoring

### Error Handling

-   Connection failures
-   Authentication errors
-   Configuration errors
-   Component errors

## 🔧 Troubleshooting

### Logging Not Working

1. **Check if logging is enabled:**

    ```javascript
    console.log('Enabled:', localStorage.getItem('sentry_enabled'));
    ```

2. **Verify log level:**

    ```javascript
    console.log('Log Level:', localStorage.getItem('sentry_log_level'));
    ```

3. **Check browser console for errors:**

    - Look for any JavaScript errors that might prevent logging

4. **Reload the page:**
    - Settings only take effect after page reload

### Too Much Logging

If you're getting too many logs:

```javascript
// Reduce logging level
localStorage.setItem('sentry_log_level', 'warn');

// Disable debug mode
localStorage.setItem('sentry_debug_mode', 'false');

// Reload to apply
location.reload();
```

### Not Enough Logging

If you need more detailed logs:

```javascript
// Increase logging level
localStorage.setItem('sentry_log_level', 'debug');

// Enable debug mode
localStorage.setItem('sentry_debug_mode', 'true');

// Reload to apply
location.reload();
```

## 🎯 Best Practices

### For Production Debugging

1. **Start with info level:**

    ```javascript
    localStorage.setItem('sentry_log_level', 'info');
    ```

2. **Enable debug mode for detailed information:**

    ```javascript
    localStorage.setItem('sentry_debug_mode', 'true');
    ```

3. **Monitor specific components:**
    - Use the component-specific logging to focus on problematic areas

### For Performance Monitoring

1. **Use warning level for performance issues:**

    ```javascript
    localStorage.setItem('sentry_log_level', 'warn');
    ```

2. **Enable performance tracking:**
    - Performance tracking is automatically enabled when logging is enabled

### For Security

1. **Disable debug mode in production:**

    ```javascript
    localStorage.setItem('sentry_debug_mode', 'false');
    ```

2. **Use appropriate log levels:**
    - Don't log sensitive information at debug level

## 📝 Example Debugging Session

Here's a typical debugging session workflow:

```javascript
// 1. Enable comprehensive logging
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'info');
localStorage.setItem('sentry_debug_mode', 'true');

// 2. Reload the page
location.reload();

// 3. Reproduce the issue
// ... perform the actions that cause the problem ...

// 4. Check Sentry for logs
// Go to your Sentry dashboard to see the logged events

// 5. If you need more detail, increase log level
localStorage.setItem('sentry_log_level', 'debug');
location.reload();

// 6. When done debugging, disable logging
localStorage.setItem('sentry_enabled', 'false');
location.reload();
```

## 🔒 Security Considerations

-   **localStorage is client-side:** Settings are stored in the user's browser
-   **Session-specific:** Settings persist only for the current browser session
-   **No sensitive data:** The logging system is designed to avoid logging sensitive information
-   **Debug mode:** When enabled, may log more detailed information - use with caution in production

## 📞 Support

If you encounter issues with the localStorage logging control:

1. Check the browser console for any error messages
2. Verify that the localStorage settings are correctly set
3. Ensure the page is reloaded after changing settings
4. Check that Sentry is properly configured in your environment

## 🎉 Conclusion

The localStorage-based logging control provides a powerful way to enable detailed logging in production without requiring code deployment. This makes it much easier to debug issues in production environments and monitor application behavior in real-time.

Remember to always disable logging when you're done debugging to avoid unnecessary data collection and performance impact.
