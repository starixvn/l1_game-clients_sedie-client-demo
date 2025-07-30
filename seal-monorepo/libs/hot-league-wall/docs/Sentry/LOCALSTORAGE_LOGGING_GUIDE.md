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
