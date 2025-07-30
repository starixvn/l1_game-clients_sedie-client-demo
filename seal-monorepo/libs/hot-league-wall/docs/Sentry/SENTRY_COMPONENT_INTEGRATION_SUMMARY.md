# Sentry Component Integration Summary

## Overview

This document provides a comprehensive summary of how Sentry has been integrated into various components throughout the HotLeagueWall project. The integration includes logging, error tracking, workflow management, and performance monitoring with localStorage-based dynamic control.

## 🎯 Integration Strategy

### **Core Principles**

-   **Privacy-First**: Sensitive data is masked and filtered
-   **Performance-Optimized**: Minimal impact on application performance
-   **Environment-Consistent**: Same rules apply across all environments
-   **localStorage-Controlled**: Dynamic enable/disable without code deployment
-   **Component-Specific**: Different log levels for different components

### **Integration Levels**

1. **Basic Logging**: Error and warning tracking
2. **Enhanced Logging**: Info and debug level tracking
3. **Workflow Tracking**: Complex operation monitoring
4. **Performance Monitoring**: Operation timing and metrics
5. **Session Replay**: Visual debugging for error scenarios

## 📁 Component Integration Details

### **1. App-Level Integration**

#### **File**: `src/app.tsx`

**Integration Type**: Root-level Sentry initialization

```typescript
import { useSentryHelper } from './_shared/hooks/useSentryHelper';
import { SentryLogLevel } from './_shared/utils/sentry/sentry-types';

const AppWithSentry = (props: any) => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'App',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    logInfo('App component rendering', {
        hasProps: !!props,
        timestamp: Date.now()
    });

    return (
        <AppComponent
            {...props}
            sentryHelper={{ logError, logWarning, logInfo, workflow }}
        />
    );
};
```

**Key Features**:

-   Root-level error boundary
-   Application lifecycle tracking
-   Global error handling
-   Performance monitoring setup

### **2. Lobby Component Integration**

#### **File**: `src/lobby/lobby.tsx`

**Integration Type**: Complex component with SSO and connection management

```typescript
const LobbyWithSentry = (props: { token: string; onSSORetry?: () => Promise<void>; isReconnecting?: boolean; language: string }) => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'Lobby',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    logInfo('LobbyWithSentry component rendering', {
        hasToken: !!props.token,
        isReconnecting: props.isReconnecting,
        language: props.language,
        timestamp: Date.now()
    });

    return (
        <LobbyComponent
            {...props}
            sentryHelper={{ logError, logWarning, logInfo, workflow }}
        />
    );
};
```

**Key Features**:

-   SSO authentication tracking
-   Connection management monitoring
-   User session tracking
-   Error recovery workflows

**Critical Operations Tracked**:

```typescript
// SSO Authentication
sentryHelper.logInfo('SSO authentication initiated', {
    hasToken: !!token,
    timestamp: Date.now(),
});

// Connection Management
sentryHelper.logInfo('Connection manager initialized', {
    connectionType: 'gateway',
    timestamp: Date.now(),
});

// Error Recovery
sentryHelper.logError(error, {
    context: 'sso_authentication',
    retryCount: retryCount,
    timestamp: Date.now(),
});
```

### **3. Game Base Components**

#### **File**: `src/games/game-base/startup.ts`

**Integration Type**: Container configuration and initialization

```typescript
import { sentryHelper } from '../../_shared/utils/sentry/sentry-helper';

export const configSharedContainer = () => {
    try {
        sentryHelper.logInfo('Configuring shared container', {
            timestamp: Date.now(),
            environment: process.env.NODE_ENV,
        });

        const sharedContainer = gc.Container.getInstance();
        const containerOptions = {
            features: ['feature1', 'feature2'],
            // ... other options
        };

        sentryHelper.logInfo('Shared container configured successfully', {
            featuresCount: containerOptions.features?.length || 0,
            timestamp: Date.now(),
        });

        return sharedContainer;
    } catch (error) {
        sentryHelper.logError(error, {
            context: 'shared_container_configuration',
            timestamp: Date.now(),
        });

        // Fallback container creation
        return gc.Container.getInstance();
    }
};
```

**Key Features**:

-   Container initialization tracking
-   Feature configuration monitoring
-   Error handling with fallbacks
-   Performance metrics

### **4. Game-Specific Components**

#### **File**: `src/games/saba-club/rng-soccer/page.tsx`

**Integration Type**: Game-specific logging and error tracking

```typescript
import { useSentryHelper } from '../../../_shared/hooks/useSentryHelper';
import { SentryLogLevel } from '../../../_shared/utils/sentry/sentry-types';

const RNGSoccerWithSentry = (props: any) => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'RNGSoccer',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    logInfo('RNGSoccer component rendering', {
        gameId: props.gameId,
        userId: props.userId,
        timestamp: Date.now()
    });

    return (
        <RNGSoccerComponent
            {...props}
            sentryHelper={{ logError, logWarning, logInfo, workflow }}
        />
    );
};
```

**Key Features**:

-   Game state tracking
-   User interaction monitoring
-   Betting operation workflows
-   Performance monitoring

### **5. Shared Components**

#### **File**: `src/_shared/components/bet-panel/bet-panel.tsx`

**Integration Type**: UI component with user interaction tracking

```typescript
import { useSentryHelper } from '../../hooks/useSentryHelper';
import { SentryLogLevel } from '../../utils/sentry/sentry-types';

const BetPanelWithSentry = (props: any) => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'BetPanel',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: false
    });

    const handleBetPlacement = async (betData: any) => {
        const workflowId = workflow.start('Bet Placement', {
            betAmount: betData.amount,
            betType: betData.type,
            timestamp: Date.now()
        });

        try {
            workflow.update(workflowId, 'in_progress', { step: 'validating_bet' });

            // Validate bet
            await validateBet(betData);

            workflow.update(workflowId, 'in_progress', { step: 'placing_bet' });

            // Place bet
            const result = await placeBet(betData);

            workflow.complete(workflowId, true, {
                result: 'success',
                betId: result.betId
            });

            logInfo('Bet placed successfully', {
                betId: result.betId,
                amount: betData.amount,
                timestamp: Date.now()
            });

        } catch (error) {
            workflow.complete(workflowId, false, {
                error: error.message,
                step: 'bet_placement_failed'
            });

            logError(error, {
                context: 'bet_placement',
                betData: betData,
                timestamp: Date.now()
            });

            throw error;
        }
    };

    return (
        <BetPanelComponent
            {...props}
            onBetPlacement={handleBetPlacement}
            sentryHelper={{ logError, logWarning, logInfo, workflow }}
        />
    );
};
```

**Key Features**:

-   User interaction tracking
-   Betting workflow management
-   Error handling and recovery
-   Performance monitoring

## 🔧 Configuration Management

### **Environment-Specific Configuration**

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

### **Component-Specific Configuration**

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

// Game components: Info-level logging
configureComponent('RNGSoccer', {
    logLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});
```

## 📊 Logging Patterns

### **1. Component Lifecycle Logging**

```typescript
const ComponentWithLifecycleLogging = () => {
    const { logInfo, logError } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: SentryLogLevel.INFO,
    });

    useEffect(() => {
        logInfo('Component mounted', {
            timestamp: Date.now(),
            props: props,
        });

        return () => {
            logInfo('Component unmounting', {
                timestamp: Date.now(),
            });
        };
    }, []);

    // Component logic
};
```

### **2. Error Boundary Integration**

```typescript
const ComponentWithErrorBoundary = () => {
    const { logError } = useSentryHelper({
        componentName: 'ErrorBoundaryComponent',
        logLevel: SentryLogLevel.ERROR
    });

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        logError(error, {
            errorInfo,
            component: 'ErrorBoundaryComponent',
            action: 'render',
            timestamp: Date.now()
        });
    };

    return (
        <ErrorBoundary onError={handleError}>
            {/* Component content */}
        </ErrorBoundary>
    );
};
```

### **3. Workflow Tracking**

```typescript
const ComponentWithWorkflowTracking = () => {
    const { workflow } = useSentryHelper({
        componentName: 'WorkflowComponent',
        enableWorkflowTracking: true,
    });

    const handleComplexOperation = async () => {
        const workflowId = workflow.start('Complex Operation', {
            operationType: 'data_processing',
            timestamp: Date.now(),
        });

        try {
            workflow.update(workflowId, 'in_progress', { step: 'step1' });
            await step1();

            workflow.update(workflowId, 'in_progress', { step: 'step2' });
            await step2();

            workflow.complete(workflowId, true, { result: 'success' });
        } catch (error) {
            workflow.complete(workflowId, false, { error: error.message });
            throw error;
        }
    };
};
```

### **4. Performance Monitoring**

```typescript
const ComponentWithPerformanceMonitoring = () => {
    const { workflow } = useSentryHelper({
        componentName: 'PerformanceComponent',
        enablePerformanceTracking: true,
    });

    const handleExpensiveOperation = async () => {
        const startTime = performance.now();

        try {
            await expensiveOperation();

            const duration = performance.now() - startTime;
            if (duration > 1000) {
                logWarning('Slow operation detected', {
                    duration: `${duration.toFixed(2)}ms`,
                    operation: 'expensiveOperation',
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            const duration = performance.now() - startTime;
            logError(error, {
                duration: `${duration.toFixed(2)}ms`,
                operation: 'expensiveOperation',
                timestamp: Date.now(),
            });
        }
    };
};
```

## 🚨 Error Handling Patterns

### **1. Network Error Handling**

```typescript
const handleNetworkOperation = async (url: string) => {
    const { logError, workflow } = useSentryHelper({
        componentName: 'NetworkComponent',
    });

    const workflowId = workflow.start('Network Operation', { url });

    try {
        workflow.update(workflowId, 'in_progress', { step: 'connecting' });

        const response = await fetch(url, {
            timeout: 5000,
            retries: 3,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        workflow.complete(workflowId, true, { dataSize: JSON.stringify(data).length });
        return data;
    } catch (error) {
        const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
        const isTimeoutError = error.name === 'AbortError';

        logError(error, {
            url,
            errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
            retryCount: 0,
        });

        workflow.complete(workflowId, false, {
            error: error.message,
            errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
        });

        throw error;
    }
};
```

### **2. Authentication Error Handling**

```typescript
const handleAuthentication = async (token: string) => {
    const { logError, logInfo, workflow } = useSentryHelper({
        componentName: 'AuthComponent',
    });

    const workflowId = workflow.start('Authentication', { hasToken: !!token });

    try {
        workflow.update(workflowId, 'in_progress', { step: 'validating_token' });

        logInfo('Authentication initiated', {
            hasToken: !!token,
            timestamp: Date.now(),
        });

        const result = await authenticate(token);

        workflow.complete(workflowId, true, {
            userId: result.userId,
            authMethod: 'sso',
        });

        logInfo('Authentication successful', {
            userId: result.userId,
            timestamp: Date.now(),
        });

        return result;
    } catch (error) {
        workflow.complete(workflowId, false, {
            error: error.message,
            step: 'authentication_failed',
        });

        logError(error, {
            context: 'authentication',
            hasToken: !!token,
            timestamp: Date.now(),
        });

        throw error;
    }
};
```

### **3. Component Error Recovery**

```typescript
const ComponentWithErrorRecovery = () => {
    const { logError, logInfo, workflow } = useSentryHelper({
        componentName: 'RecoveryComponent',
    });

    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleOperationWithRetry = async () => {
        const maxRetries = 3;
        const workflowId = workflow.start('Operation with Retry', { maxRetries });

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                workflow.update(workflowId, 'in_progress', {
                    attempt,
                    maxRetries,
                });

                await performOperation();

                workflow.complete(workflowId, true, {
                    attempts: attempt,
                    success: true,
                });

                setError(null);
                setRetryCount(0);
                return;
            } catch (error) {
                logError(error, {
                    attempt,
                    maxRetries,
                    willRetry: attempt < maxRetries,
                });

                if (attempt === maxRetries) {
                    workflow.complete(workflowId, false, {
                        attempts: attempt,
                        finalError: error.message,
                    });

                    setError(error);
                    setRetryCount(attempt);
                } else {
                    setRetryCount(attempt);
                    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
    };
};
```

## 🔍 Troubleshooting

### **Common Integration Issues**

#### 1. **Component Not Logging**

**Symptoms**:

-   No logs appearing in Sentry
-   Component not configured properly

**Solutions**:

```typescript
// Check component configuration
const componentConfig = sentryHelper.getComponentConfig('YourComponent');
console.log('Component Config:', componentConfig);

// Verify localStorage settings
console.log('Log Level:', localStorage.getItem('sentry_log_level'));
console.log('Enabled:', localStorage.getItem('sentry_enabled'));

// Check if component is properly wrapped
const ComponentWithSentry = (props) => {
    const { logInfo } = useSentryHelper({
        componentName: 'YourComponent',
        logLevel: SentryLogLevel.INFO
    });

    logInfo('Component rendering', { timestamp: Date.now() });

    return <YourComponent {...props} />;
};
```

#### 2. **Workflow Not Tracking**

**Symptoms**:

-   Workflows not appearing in Sentry
-   Workflow tracking disabled

**Solutions**:

```typescript
// Enable workflow tracking
const { workflow } = useSentryHelper({
    componentName: 'YourComponent',
    enableWorkflowTracking: true,
});

// Ensure workflows are properly completed
const handleOperation = async () => {
    const workflowId = workflow.start('Operation', {});

    try {
        await performOperation();
        workflow.complete(workflowId, true, { result: 'success' });
    } catch (error) {
        workflow.complete(workflowId, false, { error: error.message });
        throw error;
    }
};
```

#### 3. **Performance Issues**

**Symptoms**:

-   Slow component rendering
-   High memory usage
-   Excessive logging

**Solutions**:

```typescript
// Reduce logging in production
if (process.env.NODE_ENV === 'production') {
    configureComponent('YourComponent', {
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false,
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

### **1. Component-Specific Configuration**

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

// Game components: Info-level logging
configureComponent('RNGSoccer', {
    logLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});
```

### **2. Error Context Best Practices**

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

### **3. Workflow Best Practices**

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

### **4. Performance Monitoring Best Practices**

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

## 🔒 Security Considerations

### **Data Privacy**

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

### **Session Replay Privacy**

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

### **Custom Metrics**

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

### **Performance Monitoring**

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

This comprehensive summary covers all aspects of Sentry component integration, including patterns, best practices, troubleshooting, and real-world examples for effective monitoring and debugging.
