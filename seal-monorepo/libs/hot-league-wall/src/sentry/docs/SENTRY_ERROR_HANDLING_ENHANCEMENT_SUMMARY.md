# Sentry Error Handling Enhancement Summary

This document provides a comprehensive overview of the enhanced error handling capabilities implemented in the HotLeagueWall Sentry integration, including the new `@/sentry` import structure and advanced error management features.

## 🎯 Error Handling Overview

The Sentry system has been enhanced with comprehensive error handling capabilities:

-   **Intelligent Error Filtering**: Component-specific error filtering and noise reduction
-   **Buffer Management**: Automatic buffer clearing to prevent overflow
-   **Fallback Configurations**: Robust error recovery mechanisms
-   **Context-Rich Error Logging**: Detailed error context with component information
-   **Error Recovery Workflows**: Automatic error recovery and retry mechanisms
-   **Performance Impact Monitoring**: Error impact on application performance

## 📁 Error Handling Architecture

```
src/sentry/
├── core/
│   ├── sentry-manager.ts        # Core error handling (776 lines)
│   │   ├── Error filtering logic
│   │   ├── Buffer management
│   │   ├── Console override
│   │   └── Error recovery
│   ├── sentry-config.ts         # Configuration error handling
│   └── sentry-types.ts          # Error-related type definitions
├── utils/
│   ├── sentry-helper.ts         # Error handling utilities
│   ├── sentry-helper-batched.ts # Batched error handling
│   └── sentry-batch-manager.ts  # Batch error management
└── hooks/
    ├── useSentryHelper.ts       # React error handling hooks
    └── useSentryHelperBatched.ts # Batched error handling hooks
```

## 🔧 Core Error Handling Features

### 1. Intelligent Error Filtering

The system includes sophisticated error filtering to reduce noise and focus on relevant errors:

```typescript
// Component-specific error filtering
private isComponentError(message: string): boolean {
    return message.includes(this.componentName) ||
           message.includes('Component') ||
           message.includes('React');
}

// Stack trace filtering
private isComponentStack(stack: string): boolean {
    return stack.includes(this.componentName) ||
           stack.includes('Component') ||
           stack.includes('React');
}

// Error filtering configuration
private setupErrorFiltering(): void {
    this.errorFilter = (error: any) => {
        // Filter out component-specific errors when not needed
        if (this.isComponentError(error.message || error)) {
            return this.isLoggingEnabled('error');
        }

        // Always log critical errors
        if (error.fatal || error.critical) {
            return true;
        }

        // Apply log level filtering
        return this.isLoggingEnabled('error');
    };
}
```

### 2. Buffer Management

Automatic buffer management to prevent memory issues and overflow:

```typescript
// Buffer clearing setup
private setupBufferClearing(): void {
    setInterval(() => {
        this.clearBuffer();
    }, 5 * 60 * 1000); // 5 minutes
}

// Buffer clearing implementation
clearBuffer(): void {
    try {
        // Clear internal buffers
        this.activeWorkflows.clear();

        // Clear console buffers if overridden
        if (this.originalConsoleError) {
            console.error = this.originalConsoleError;
        }

        logInfo(this.componentName, 'Buffer cleared successfully', {
            timestamp: Date.now(),
            activeWorkflowsCleared: this.activeWorkflows.size
        });
    } catch (error) {
        // Silent fail during buffer clearing
        console.warn('Failed to clear buffer:', error);
    }
}
```

### 3. Console Method Override

Intelligent console method override for automatic error capture:

```typescript
// Console method override
private overrideConsoleMethods(): void {
    if (!this.enableConsoleOverride) return;

    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleInfo = console.info;
    this.originalConsoleDebug = console.debug;
    this.originalConsoleTrace = console.trace;
    this.originalConsoleLog = console.log;

    // Override console.error
    console.error = (...args) => {
        try {
            const message = args.join(' ');
            if (this.errorFilter({ message })) {
                this.logError(new Error(message), {
                    source: 'console.error',
                    args: args
                });
            }
        } catch (error) {
            // Fallback to original console.error
            this.originalConsoleError(...args);
        }
    };

    // Similar overrides for other console methods...
}
```

## 🎣 React Error Handling Integration

### 1. useSentryHelper Hook Error Handling

```typescript
import { useSentryHelper, SentryLogLevel } from '@/sentry';

const ComponentWithErrorHandling = () => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true,
    });

    // Error handling with context
    const handleRiskyOperation = async () => {
        const workflowId = workflow.start('risky-operation', 'Risky Operation', {
            timestamp: Date.now(),
        });

        try {
            // Perform risky operation
            const result = await performRiskyOperation();

            workflow.complete(workflowId, true, {
                result: 'success',
                data: result,
            });

            return result;
        } catch (error) {
            // Comprehensive error logging
            logError(error, {
                operation: 'risky-operation',
                workflowId,
                timestamp: Date.now(),
                userContext: {
                    userId: 'user123',
                    sessionId: 'session456',
                },
            });

            workflow.complete(workflowId, false, {
                error: error instanceof Error ? error.message : String(error),
                operation: 'risky-operation',
            });

            throw error;
        }
    };

    // Component JSX...
};
```

### 2. Error Boundary Integration

```typescript
import { logError } from '@/sentry';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        logError('ErrorBoundary', error, {
            errorInfo,
            componentStack: errorInfo.componentStack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
```

## 🔄 Error Recovery Mechanisms

### 1. Fallback Configuration

```typescript
// Fallback configuration when loading fails
const getFallbackConfiguration = () => {
    return {
        serverDomain: 'localhost',
        socketGatewayPath: '/socket',
        sentry: {
            dsn: 'https://fallback-dsn@sentry.io/project',
            environment: 'development',
        },
        gameSettings: {},
        enableMsgpackParser: false,
        enableMsgpackParserOnNotification: false,
        systemType: 'development',
        gamePath: '/games',
        gameSettingUrl: '',
        ssl: false,
        subDomain: '',
        env: 'development',
        enableMsgpackParserAllGames: false,
        subDirectory: '',
        simulatorConfigs: {
            gameLobbySimulatorUrl: '',
            owApiSimulatorUrl: '',
            operatorId: '',
            operatorSecret: '',
            operatorToken: '',
        },
        defaultGameId: 1,
        userServicePath: '/user',
    };
};
```

### 2. Error Recovery Workflows

```typescript
// Error recovery with retry mechanism
const handleOperationWithRetry = async (operation, maxRetries = 3) => {
    const workflowId = workflow.start('operation-with-retry', 'Operation with Retry', {
        maxRetries,
        timestamp: Date.now(),
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            workflow.update(workflowId, 'in_progress', {
                attempt,
                maxRetries,
            });

            const result = await operation();

            workflow.complete(workflowId, true, {
                attempts: attempt,
                result: 'success',
            });

            return result;
        } catch (error) {
            logError(error, {
                attempt,
                maxRetries,
                willRetry: attempt < maxRetries,
                operation: operation.name,
            });

            if (attempt === maxRetries) {
                workflow.complete(workflowId, false, {
                    attempts: attempt,
                    finalError: error instanceof Error ? error.message : String(error),
                });
                throw error;
            }

            // Wait before retry with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
};
```

### 3. Network Error Handling

```typescript
// Network error handling with timeout and retry
const handleNetworkOperation = async (url, options = {}) => {
    const { timeout = 5000, retries = 3 } = options;

    const workflowId = workflow.start('network-operation', 'Network Operation', {
        url,
        timeout,
        retries,
        timestamp: Date.now(),
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            workflow.update(workflowId, 'in_progress', {
                attempt,
                step: 'connecting',
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            workflow.complete(workflowId, true, {
                dataSize: JSON.stringify(data).length,
                status: response.status,
            });

            return data;
        } catch (error) {
            const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
            const isTimeoutError = error.name === 'AbortError';

            logError(error, {
                url,
                attempt,
                retries,
                errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
                willRetry: attempt < retries,
            });

            if (attempt === retries) {
                workflow.complete(workflowId, false, {
                    error: error.message,
                    errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
                });
                throw error;
            }

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
};
```

## 🗄️ LocalStorage Error Handling

### 1. Safe LocalStorage Operations

```typescript
// Safe localStorage operations with error handling
const setLocalStorageConfig = (config: { logLevel?: string; enabled?: boolean; debugMode?: boolean }) => {
    try {
        if (config.logLevel !== undefined) {
            localStorage.setItem(SENTRY_LOG_LEVEL_KEY, config.logLevel);
        }
        if (config.enabled !== undefined) {
            localStorage.setItem(SENTRY_ENABLED_KEY, config.enabled.toString());
        }
        if (config.debugMode !== undefined) {
            localStorage.setItem(SENTRY_DEBUG_MODE_KEY, config.debugMode.toString());
        }
    } catch (error) {
        // Silent fail - don't break the application
        console.warn('Failed to set localStorage config:', error);
    }
};

const getLocalStorageConfig = () => {
    try {
        const logLevel = localStorage.getItem(SENTRY_LOG_LEVEL_KEY) || 'error';
        const enabled = localStorage.getItem(SENTRY_ENABLED_KEY) !== 'false';
        const debugMode = localStorage.getItem(SENTRY_DEBUG_MODE_KEY) === 'true';

        return { logLevel, enabled, debugMode };
    } catch (error) {
        console.warn('Failed to read localStorage config:', error);
        return { logLevel: 'error', enabled: true, debugMode: false };
    }
};
```

### 2. Component-Specific LocalStorage Error Handling

```typescript
// Component-specific localStorage error handling
const getComponentLocalStorageConfig = (componentName: string) => {
    try {
        const logLevel = localStorage.getItem(`sentry_log_level_${componentName}`) || null;
        const enabled = localStorage.getItem(`hot-league-wall-debug-enabled_${componentName}`);

        return {
            logLevel,
            enabled: enabled === null ? null : enabled === 'true',
        };
    } catch (error) {
        console.warn('Failed to read component localStorage config:', error);
        return { logLevel: null, enabled: null };
    }
};
```

## 📊 Error Monitoring and Analytics

### 1. Error Statistics

```typescript
// Error statistics tracking
const getErrorStatistics = () => {
    const stats = {
        totalErrors: 0,
        errorsByComponent: {},
        errorsByType: {},
        errorsByLevel: {},
        recentErrors: [],
    };

    // Collect error statistics from Sentry
    // This would integrate with Sentry's API to get error statistics

    return stats;
};
```

### 2. Performance Impact Monitoring

```typescript
// Monitor error impact on performance
const monitorErrorImpact = (error, context) => {
    const startTime = performance.now();

    try {
        // Log error with performance context
        logError(error, {
            ...context,
            performanceImpact: {
                memoryUsage: performance.memory?.usedJSHeapSize,
                timestamp: Date.now(),
            },
        });
    } catch (loggingError) {
        // If error logging fails, at least log to console
        console.error('Failed to log error to Sentry:', loggingError);
        console.error('Original error:', error);
    }

    const endTime = performance.now();
    const loggingDuration = endTime - startTime;

    // Log if error logging takes too long
    if (loggingDuration > 100) {
        logWarning('Error logging took too long', {
            duration: `${loggingDuration.toFixed(2)}ms`,
            errorType: error.name || 'Unknown',
        });
    }
};
```

## 🔧 Configuration Error Handling

### 1. Configuration Loading Error Handling

```typescript
// Configuration loading with error handling
export const getEnvironmentConfig = ({ appEnv, siteId }) => {
    const componentName = 'AppSettings';

    try {
        logInfo(componentName, 'Loading environment configuration', {
            appEnv,
            siteId,
            timestamp: Date.now(),
        });

        const configMaps = {
            [NOVA88_SITE_ID]: {
                LOCAL: VG_LOCAL_CONFIG,
                SIT: VG_SIT_CONFIG,
                UAT: VG_UAT_CONFIG,
                PROD: VG_PROD_CONFIG,
            },
            [VIVA88_SITE_ID]: {
                LOCAL: SG_LOCAL_CONFIG,
                SIT: SG_SIT_CONFIG,
                UAT: SG_UAT_CONFIG,
                PROD: SG_PROD_CONFIG,
            },
        };

        const environmentsConfig = configMaps[siteId][appEnv];

        if (!environmentsConfig) {
            const error = `No environment configuration found for siteId: ${siteId}, appEnv: ${appEnv}`;
            logError(componentName, error, {
                siteId,
                appEnv,
                availableSites: Object.keys(configMaps),
                availableEnvs: Object.keys(configMaps[siteId] || {}),
                timestamp: Date.now(),
            });
            throw new Error(error);
        }

        // ... rest of configuration loading logic

        logInfo(componentName, 'Environment configuration loaded successfully', {
            appEnv,
            siteId,
            configKeys: Object.keys(result),
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

        // Return fallback configuration
        console.error('Failed to load environment configuration, using fallback:', error);
        return getFallbackConfiguration();
    }
};
```

### 2. Sentry Configuration Error Handling

```typescript
// Sentry configuration with error handling
try {
    updateSentryConfiguration(appSettings.sentry?.dsn, appSettings.sentry?.environment);
} catch (error) {
    console.warn('Failed to update Sentry configuration:', error);

    // Try to use fallback configuration
    try {
        updateSentryConfiguration('https://fallback-dsn@sentry.io/project', 'development');
    } catch (fallbackError) {
        console.error('Failed to set fallback Sentry configuration:', fallbackError);
    }
}
```

## 📝 Best Practices

### 1. Error Context Best Practices

```typescript
// Provide rich error context
logError(error, {
    userId: 'user123',
    action: 'place_bet',
    gameId: 'rng-soccer',
    betAmount: 100.0,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: sessionStorage.getItem('sessionId'),
    componentState: {
        isLoading: false,
        hasData: true,
        errorCount: 0,
    },
});

// Avoid sensitive information
// ❌ Don't log sensitive data
logError(error, {
    password: userPassword, // Never log passwords
    creditCard: cardNumber, // Never log credit card numbers
    ssn: socialSecurityNumber, // Never log SSNs
});
```

### 2. Error Recovery Best Practices

```typescript
// Always provide fallback behavior
const handleCriticalOperation = async () => {
    try {
        return await performCriticalOperation();
    } catch (error) {
        logError(error, {
            operation: 'critical-operation',
            timestamp: Date.now(),
        });

        // Provide fallback behavior
        return getFallbackResult();
    }
};

// Use exponential backoff for retries
const retryWithBackoff = async (operation, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) throw error;

            // Exponential backoff: 1s, 2s, 4s, 8s...
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
    }
};
```

### 3. Error Boundary Best Practices

```typescript
// Comprehensive error boundary
class ComprehensiveErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        logError('ErrorBoundary', error, {
            errorInfo,
            componentStack: errorInfo.componentStack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            componentName: this.props.componentName || 'Unknown'
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1>Something went wrong.</h1>
                    <button onClick={() => window.location.reload()}>
                        Reload Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details>
                            <summary>Error Details</summary>
                            <pre>{this.state.error?.toString()}</pre>
                            <pre>{this.state.errorInfo?.componentStack}</pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
```

## 🔗 Related Documentation

-   [SentryHelper Guide](./SENTRY_HELPER_GUIDE.md)
-   [SentryManager Documentation](./sentry-manager.README.md)
-   [Component Integration Summary](./SENTRY_COMPONENT_INTEGRATION_SUMMARY.md)
-   [Session Replay Guide](./SENTRY_SESSION_REPLAY_GUIDE.md)
