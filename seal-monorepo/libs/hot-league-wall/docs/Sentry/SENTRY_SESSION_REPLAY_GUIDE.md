# Sentry Session Replay - Comprehensive Guide

Sentry Session Replay is a powerful feature that captures user interactions and screen recordings to help debug issues in production. This guide covers the complete implementation, configuration, privacy considerations, and troubleshooting for the HotLeagueWall component.

## 🎯 Overview

Session Replay provides:

-   **Visual Debugging**: See exactly what users saw when errors occurred
-   **Privacy-First Design**: Only enabled for error/fatal levels by default
-   **Environment Consistency**: Same rules apply across all environments
-   **localStorage Control**: Dynamic enable/disable without code deployment
-   **Performance Optimization**: Minimal impact on application performance

## 🔧 Configuration

### Basic Configuration

```typescript
// configs/configs.json
{
    "sentry": {
        "dsn": "https://your-dsn@sentry.io/project",
        "environment": "LOCAL1",
        "logLevel": "info",
        "enableSessionReplay": true,
        "sessionReplaySampleRate": 1.0,
        "errorSampleRate": 1.0
    }
}
```

### Environment-Specific Configuration

```typescript
import { configureSessionReplayForEnvironment } from './_shared/utils/sentry/sentry-session-replay';

// Configure based on environment
const config = configureSessionReplayForEnvironment(process.env.NODE_ENV);

// Initialize with configuration
initializeSentryWithSessionReplay(config);
```

### Environment Configurations

#### Development Environment

```typescript
{
    dsn: 'your-dsn',
    environment: 'development',
    release: 'hot-league-wall@dev',
    debug: true,
    replaysSessionSampleRate: 1.0, // 100% for development
    replaysOnErrorSampleRate: 1.0, // 100% for error sessions
    maskAllText: false, // Show text for debugging
    blockAllMedia: false, // Show media for debugging
    sendDefaultPii: true // Send PII for debugging
}
```

#### Production Environment

```typescript
{
    dsn: 'your-dsn',
    environment: 'production',
    release: 'hot-league-wall@prod',
    debug: false,
    replaysSessionSampleRate: 0.1, // 10% for production
    replaysOnErrorSampleRate: 1.0, // 100% for error sessions
    maskAllText: true, // Mask text for privacy
    blockAllMedia: true, // Block media for privacy
    sendDefaultPii: false // Don't send PII for privacy
}
```

#### Test Environment

```typescript
{
    dsn: 'your-dsn',
    environment: 'test',
    release: 'hot-league-wall@test',
    debug: false,
    replaysSessionSampleRate: 0.0, // 0% for test
    replaysOnErrorSampleRate: 0.0, // 0% for test
    maskAllText: true,
    blockAllMedia: true,
    sendDefaultPii: false
}
```

## 🎯 Session Replay Rules

### **Privacy-First Design**

Session Replay is designed with privacy in mind:

-   **Only enabled for error/fatal levels**: Session Replay is only active when the log level is `error`, `fatal`, `warn`, or `all`
-   **Respects localStorage settings**: Even in development, Session Replay requires localStorage to be enabled
-   **Privacy-first approach**: Text and media are masked by default unless debug mode is enabled

### **localStorage Control**

```javascript
// Enable Session Replay for error/fatal levels
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'error');
localStorage.setItem('sentry_debug_mode', 'true');
location.reload();

// Disable Session Replay
localStorage.setItem('sentry_enabled', 'false');
location.reload();
```

### **Log Level Requirements**

| Log Level | Session Replay | Description            |
| --------- | -------------- | ---------------------- |
| `trace`   | ❌             | No Session Replay      |
| `debug`   | ❌             | No Session Replay      |
| `info`    | ❌             | No Session Replay      |
| `warn`    | ✅             | Session Replay enabled |
| `error`   | ✅             | Session Replay enabled |
| `fatal`   | ✅             | Session Replay enabled |
| `all`     | ✅             | Session Replay enabled |

## 🔒 Privacy & Security

### Data Masking

```typescript
// Configure privacy settings
const privacyConfig = {
    maskAllText: true, // Mask all text content
    blockAllMedia: true, // Block all media content
    maskAllInputs: true, // Mask all input fields
    sendDefaultPii: false, // Don't send PII data
};

// Initialize with privacy settings
initializeSentryWithSessionReplay({
    ...baseConfig,
    ...privacyConfig,
});
```

### Sensitive Data Handling

```typescript
// Before Send Hook for additional filtering
beforeSend(event, hint) {
    // Filter out sensitive information
    if (event.request?.headers) {
        // Remove sensitive headers
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-api-key'];
    }

    // Filter out sensitive URL parameters
    if (event.request?.url) {
        const url = new URL(event.request.url);
        const sensitiveParams = ['token', 'password', 'secret', 'key'];
        sensitiveParams.forEach(param => {
            url.searchParams.delete(param);
        });
        event.request.url = url.toString();
    }

    return event;
}
```

### Element Blocking

```typescript
import { blockElement, ignoreElement } from './_shared/utils/sentry/sentry-session-replay';

// Block sensitive elements
const blockSensitiveElements = () => {
    // Block password fields
    document.querySelectorAll('input[type="password"]').forEach((element) => {
        blockElement(element as HTMLElement);
    });

    // Block credit card fields
    document.querySelectorAll('input[name*="card"], input[name*="cc"]').forEach((element) => {
        blockElement(element as HTMLElement);
    });

    // Block personal information fields
    document.querySelectorAll('input[name*="ssn"], input[name*="social"]').forEach((element) => {
        blockElement(element as HTMLElement);
    });
};

// Ignore non-essential elements
const ignoreNonEssentialElements = () => {
    // Ignore ads
    document.querySelectorAll('.ad, .advertisement, [data-ad]').forEach((element) => {
        ignoreElement(element as HTMLElement);
    });

    // Ignore analytics elements
    document.querySelectorAll('[data-analytics], [data-tracking]').forEach((element) => {
        ignoreElement(element as HTMLElement);
    });
};
```

## 🎮 Usage Examples

### Basic Implementation

```typescript
import { initializeSentryWithSessionReplay } from './_shared/utils/sentry/sentry-session-replay';

// Initialize in your app entry point
const initializeSentry = () => {
    const config = {
        dsn: 'your-sentry-dsn',
        environment: process.env.NODE_ENV,
        release: `hot-league-wall@${process.env.npm_package_version}`,
        debug: process.env.NODE_ENV === 'development',
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        maskAllText: process.env.NODE_ENV === 'production',
        blockAllMedia: process.env.NODE_ENV === 'production',
        sendDefaultPii: process.env.NODE_ENV === 'development',
    };

    initializeSentryWithSessionReplay(config);
};
```

### Custom Session Management

```typescript
import { startCustomSessionReplay, stopSessionReplay, addSessionReplayData } from './_shared/utils/sentry/sentry-session-replay';

// Start custom session replay
const startGameSession = (gameId: string, userId: string) => {
    startCustomSessionReplay(`game-session-${gameId}`, {
        gameId,
        userId,
        sessionStartTime: new Date().toISOString(),
        gameType: 'rng-soccer',
    });
};

// Add custom data to session
const addGameEvent = (event: string, data: any) => {
    addSessionReplayData({
        event,
        data,
        timestamp: Date.now(),
    });
};

// Stop session replay
const endGameSession = () => {
    stopSessionReplay();
};
```

### User Context Management

```typescript
import { setUserContext, setTags, setExtra } from './_shared/utils/sentry/sentry-session-replay';

// Set user context
const setUserInfo = (user: any) => {
    setUserContext({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium,
    });
};

// Set custom tags
const setGameTags = (gameId: string, betAmount: number) => {
    setTags({
        gameId,
        betAmount: betAmount.toString(),
        gameType: 'rng-soccer',
        environment: process.env.NODE_ENV,
    });
};

// Set extra data
const setGameExtra = (gameState: any) => {
    setExtra({
        gameState,
        userBalance: gameState.balance,
        activeBets: gameState.activeBets,
        gameHistory: gameState.history,
    });
};
```

## 🔧 Advanced Configuration

### Network Filtering

```typescript
// Configure network detail filtering
const networkConfig = {
    networkDetailAllowUrls: [
        // Allow network details for specific URLs
        window.location.origin,
        /\/api\//,
        /\/auth\//,
        /\/game\//,
    ],
    networkDetailDenyUrls: [
        // Deny network details for sensitive URLs
        /\/admin\//,
        /\/internal\//,
        /\/sensitive\//,
        /\/payment\//,
    ],
};

// Initialize with network filtering
initializeSentryWithSessionReplay({
    ...baseConfig,
    integrations: [
        Sentry.replayIntegration({
            ...privacyConfig,
            ...networkConfig,
        }),
    ],
});
```

### Performance Optimization

```typescript
// Optimize for performance
const performanceConfig = {
    // Reduce sampling for better performance
    replaysSessionSampleRate: 0.05, // 5% of sessions
    replaysOnErrorSampleRate: 0.5, // 50% of error sessions

    // Optimize privacy settings
    maskAllText: true,
    blockAllMedia: true,
    maskAllInputs: true,

    // Reduce data collection
    sendDefaultPii: false,
};
```

### Conditional Session Replay

```typescript
// Enable Session Replay only for specific conditions
const shouldEnableSessionReplay = () => {
    const localStorageConfig = getLocalStorageConfig();

    // Only enable if localStorage allows error/fatal logging
    if (!localStorageConfig.enabled) return false;

    // Only enable for error/fatal levels
    const errorLevels = ['error', 'fatal', 'warn', 'all'];
    if (!errorLevels.includes(localStorageConfig.logLevel)) return false;

    // Only enable for premium users in production
    if (process.env.NODE_ENV === 'production') {
        return user.isPremium;
    }

    return true;
};

// Initialize conditionally
if (shouldEnableSessionReplay()) {
    initializeSentryWithSessionReplay(config);
}
```

## 🚨 Error Handling & Edge Cases

### Network Error Handling

```typescript
const handleSessionReplayError = (error: Error) => {
    console.warn('Session Replay error:', error);

    // Fallback to basic Sentry without Session Replay
    Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        debug: config.debug,
        // Disable Session Replay on error
        integrations: [],
    });
};

// Wrap initialization with error handling
try {
    initializeSentryWithSessionReplay(config);
} catch (error) {
    handleSessionReplayError(error);
}
```

### Browser Compatibility

```typescript
const isSessionReplaySupported = () => {
    // Check for required browser features
    const requiredFeatures = ['localStorage', 'sessionStorage', 'fetch', 'Promise'];

    return requiredFeatures.every((feature) => {
        try {
            return feature in window;
        } catch {
            return false;
        }
    });
};

// Initialize only if supported
if (isSessionReplaySupported()) {
    initializeSentryWithSessionReplay(config);
} else {
    console.warn('Session Replay not supported in this browser');
    // Fallback to basic Sentry
}
```

### Memory Management

```typescript
// Clean up Session Replay resources
const cleanupSessionReplay = () => {
    try {
        // Stop current session
        stopSessionReplay();

        // Clear custom data
        setUserContext({});
        setTags({});
        setExtra({});

        console.log('Session Replay cleanup completed');
    } catch (error) {
        console.error('Session Replay cleanup failed:', error);
    }
};

// Clean up on page unload
window.addEventListener('beforeunload', cleanupSessionReplay);
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Session Replay Not Capturing

**Symptoms:**

-   No sessions visible in Sentry dashboard
-   Session Replay not starting

**Solutions:**

```javascript
// Check localStorage settings
console.log('Log Level:', localStorage.getItem('sentry_log_level'));
console.log('Enabled:', localStorage.getItem('sentry_enabled'));

// Verify Session Replay configuration
const config = {
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    maskAllText: false,
    blockAllMedia: false,
};

// Enable debug mode
localStorage.setItem('sentry_debug_mode', 'true');
location.reload();
```

#### 2. Privacy Settings Too Restrictive

**Symptoms:**

-   Sessions captured but no useful information
-   All text and media blocked

**Solutions:**

```javascript
// Relax privacy settings for debugging
const debugConfig = {
    maskAllText: false,
    blockAllMedia: false,
    maskAllInputs: false,
    sendDefaultPii: true,
};

// Enable debug mode
localStorage.setItem('sentry_debug_mode', 'true');
location.reload();
```

#### 3. Performance Issues

**Symptoms:**

-   Slow page loading
-   High memory usage
-   Browser freezing

**Solutions:**

```typescript
// Reduce sampling rates
const performanceConfig = {
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 0.1, // 10% of error sessions
    maskAllText: true,
    blockAllMedia: true,
};

// Disable in development if causing issues
if (process.env.NODE_ENV === 'development' && isPerformanceIssue()) {
    console.warn('Disabling Session Replay due to performance issues');
    return;
}
```

#### 4. Browser Compatibility Issues

**Symptoms:**

-   Session Replay not working in certain browsers
-   Console errors related to Session Replay

**Solutions:**

```typescript
// Check browser compatibility
const checkBrowserCompatibility = () => {
    const userAgent = navigator.userAgent;
    const isIE = /MSIE|Trident/.test(userAgent);
    const isOldChrome = /Chrome\/([1-9]|[1-5][0-9]|6[0-3])/.test(userAgent);

    if (isIE || isOldChrome) {
        console.warn('Session Replay not supported in this browser');
        return false;
    }

    return true;
};

// Initialize only if compatible
if (checkBrowserCompatibility()) {
    initializeSentryWithSessionReplay(config);
}
```

### Debug Mode

```typescript
// Enable debug mode for detailed logging
localStorage.setItem('sentry_debug_mode', 'true');

// Check debug information
const debugSessionReplay = () => {
    const debugInfo = {
        localStorageConfig: getLocalStorageConfig(),
        userAgent: navigator.userAgent,
        sessionStorage: !!window.sessionStorage,
        localStorage: !!window.localStorage,
        fetch: !!window.fetch,
        performance: !!window.performance,
    };

    console.log('Session Replay Debug Info:', debugInfo);
};

// Call debug function
debugSessionReplay();
```

## 📊 Best Practices

### 1. Privacy-First Approach

```typescript
// Always prioritize privacy
const privacyFirstConfig = {
    maskAllText: true,
    blockAllMedia: true,
    maskAllInputs: true,
    sendDefaultPii: false,
    networkDetailDenyUrls: [/\/payment\//, /\/admin\//, /\/internal\//],
};
```

### 2. Performance Optimization

```typescript
// Optimize for performance
const performanceOptimizedConfig = {
    replaysSessionSampleRate: 0.05, // 5% for production
    replaysOnErrorSampleRate: 0.5, // 50% for errors
    maskAllText: true,
    blockAllMedia: true,
};
```

### 3. Environment-Specific Configuration

```typescript
// Different settings for different environments
const getEnvironmentConfig = () => {
    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                replaysSessionSampleRate: 1.0,
                maskAllText: false,
                sendDefaultPii: true,
            };
        case 'production':
            return {
                replaysSessionSampleRate: 0.01,
                maskAllText: true,
                sendDefaultPii: false,
            };
        default:
            return {
                replaysSessionSampleRate: 0.0,
                maskAllText: true,
                sendDefaultPii: false,
            };
    }
};
```

### 4. Error Handling

```typescript
// Always handle Session Replay errors gracefully
const safeSessionReplayInit = (config: any) => {
    try {
        initializeSentryWithSessionReplay(config);
    } catch (error) {
        console.warn('Session Replay initialization failed:', error);
        // Fallback to basic Sentry
        Sentry.init({
            dsn: config.dsn,
            environment: config.environment,
            release: config.release,
        });
    }
};
```

### 5. User Consent

```typescript
// Check for user consent before enabling
const checkUserConsent = () => {
    const consent = localStorage.getItem('session_replay_consent');
    return consent === 'true';
};

// Only enable if user consents
if (checkUserConsent()) {
    initializeSentryWithSessionReplay(config);
}
```

## 🔒 Security Considerations

### Data Protection

```typescript
// Protect sensitive data
const protectSensitiveData = () => {
    // Block sensitive elements
    document.querySelectorAll('input[type="password"]').forEach((element) => {
        blockElement(element as HTMLElement);
    });

    // Block personal information
    document.querySelectorAll('input[name*="ssn"], input[name*="credit"]').forEach((element) => {
        blockElement(element as HTMLElement);
    });

    // Block payment information
    document.querySelectorAll('input[name*="card"], input[name*="payment"]').forEach((element) => {
        blockElement(element as HTMLElement);
    });
};
```

### Network Security

```typescript
// Secure network configuration
const secureNetworkConfig = {
    networkDetailAllowUrls: [
        // Only allow specific safe URLs
        /\/api\/public\//,
        /\/game\/public\//,
    ],
    networkDetailDenyUrls: [
        // Deny all sensitive URLs
        /\/admin\//,
        /\/payment\//,
        /\/internal\//,
        /\/sensitive\//,
    ],
};
```

This comprehensive guide covers all aspects of Session Replay implementation, including privacy considerations, performance optimization, and troubleshooting for production use.
