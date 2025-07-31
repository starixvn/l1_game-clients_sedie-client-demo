# SentryHelper - Advanced Sentry Management Guide

The `SentryHelper` is a comprehensive utility that provides granular control over Sentry logging for your HotLeagueWall component. It offers workflow tracking, performance monitoring, component-specific configuration, and localStorage-based dynamic control with easy on/off controls.

## 🚀 Features

-   **Global Enable/Disable**: Turn Sentry logging on/off globally
-   **Component-Specific Configuration**: Different log levels for different components
-   **Workflow Tracking**: Track complex operations with states and metadata
-   **Performance Monitoring**: Automatic timing and performance tracking
-   **Granular Log Levels**: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, DISABLED, ERROR_ONLY, WARNING_AND_ERROR, ALL
-   **React Hooks**: Easy integration with React components
-   **localStorage Control**: Dynamic logging control without code deployment
-   **Environment Consistency**: Same rules apply across all environments
-   **Privacy-Focused Session Replay**: Only enabled for error/fatal levels

## 📋 Quick Start

### 1. Initialize SentryHelper

```typescript
import { configureSentry, enableSentry, setLogLevel } from './_shared/utils/sentry/sentry-helper';

// Initialize with custom configuration
configureSentry({
    enabled: true,
    defaultLogLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true,
});

// Or use convenience functions
enableSentry();
setLogLevel(SentryLogLevel.WARNING_AND_ERROR);
```

### 2. Configure Components

```typescript
import { configureComponent } from './_shared/utils/sentry/sentry-helper';

// Configure different components with different log levels
configureComponent('GameLobby', {
    logLevel: SentryLogLevel.ALL,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

configureComponent('BettingSystem', {
    logLevel: SentryLogLevel.ERROR_ONLY,
    enableWorkflowTracking: false,
    enablePerformanceTracking: true,
});
```

### 3. Use in React Components

```typescript
import { useSentryHelper, SentryLogLevel } from './_shared/hooks/useSentryHelper';

const MyComponent = () => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: SentryLogLevel.ALL,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
    });

    // Your component logic here
};
```

## 🔧 Configuration Options

### Global Configuration

```typescript
interface GlobalSentryConfig {
    enabled: boolean; // Master switch for Sentry
    defaultLogLevel: SentryLogLevel; // Default log level for all components
    enableWorkflowTracking: boolean; // Enable workflow tracking
    enablePerformanceTracking: boolean; // Enable performance monitoring
    enableConsoleOverride: boolean; // Override console methods
    componentConfigs: Map<string, ComponentConfig>; // Component-specific configs
    workflowConfigs: Map<string, WorkflowConfig>; // Workflow-specific configs
}
```

### Component Configuration

```typescript
interface ComponentConfig {
    name: string; // Component name
    logLevel: SentryLogLevel; // Log level for this component
    enableWorkflowTracking?: boolean; // Enable workflow tracking for component
    enablePerformanceTracking?: boolean; // Enable performance tracking for component
}
```

### Log Levels

```typescript
enum SentryLogLevel {
    TRACE = 'trace', // Very detailed debugging
    DEBUG = 'debug', // Debug information
    INFO = 'info', // Informational messages
    WARN = 'warn', // Warning messages
    ERROR = 'error', // Error messages
    FATAL = 'fatal', // Fatal errors
    DISABLED = 'disabled', // No logging
    ERROR_ONLY = 'error_only', // Only error messages
    WARNING_AND_ERROR = 'warning_and_error', // Warning and error messages
    ALL = 'all', // All log levels
}
```

## 🎯 Logging Rules & localStorage Control

### **Environment Consistency**

The localStorage rules apply consistently across **ALL environments** (local, development, production):

-   **Info level and below** (trace, debug, info): Only sent when `sentry_enabled` is `true`
-   **Warning, Error, Fatal**: Always sent regardless of localStorage setting
-   **Session Replay**: Only enabled when `sentry_enabled` is `true` AND log level allows error/fatal logging

### **localStorage Keys**

```javascript
const SENTRY_LOG_LEVEL_KEY = 'sentry_log_level'; // Log level setting
const SENTRY_ENABLED_KEY = 'sentry_enabled'; // Enable/disable logging
const SENTRY_DEBUG_MODE_KEY = 'sentry_debug_mode'; // Debug mode toggle
```

### **Quick localStorage Commands**

```javascript
// Enable info level logging
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'info');
location.reload();

// Enable error level logging (with Session Replay)
localStorage.setItem('sentry_enabled', 'true');
localStorage.setItem('sentry_log_level', 'error');
location.reload();

// Disable all logging
localStorage.setItem('sentry_enabled', 'false');
location.reload();
```

## 🔄 Workflow Tracking

### Basic Workflow Usage

```typescript
import { startWorkflow, updateWorkflow, completeWorkflow, WorkflowState } from './_shared/utils/sentry/sentry-helper';

const workflowId = 'user-authentication-123';

// Start workflow
startWorkflow(workflowId, 'User Authentication', 'AuthComponent', {
    userId: 'user123',
    authMethod: 'sso',
});

try {
    // Update workflow state
    updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
        step: 'validating_token',
        progress: 25,
    });

    // Perform authentication
    await authenticateUser(token);

    updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
        step: 'loading_user_data',
        progress: 75,
    });

    // Complete successfully
    completeWorkflow(workflowId, true, {
        duration: '1500ms',
        userRole: 'premium',
    });
} catch (error) {
    // Complete with failure
    completeWorkflow(workflowId, false, {
        error: error.message,
        step: 'authentication_failed',
    });
}
```

### Workflow States

```typescript
enum WorkflowState {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}
```

### Advanced Workflow Example

```typescript
const handleGameSession = async (gameId: string, userId: string) => {
    const workflowId = `game-session-${Date.now()}`;

    startWorkflow(workflowId, 'Game Session Management', 'GameComponent', {
        gameId,
        userId,
        sessionStartTime: new Date().toISOString(),
    });

    const steps = [
        { name: 'validate_user', duration: 200 },
        { name: 'load_game_assets', duration: 500 },
        { name: 'establish_connection', duration: 300 },
        { name: 'initialize_game_state', duration: 400 },
    ];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
            currentStep: step.name,
            progress: ((i + 1) / steps.length) * 100,
            stepNumber: i + 1,
            totalSteps: steps.length,
        });

        try {
            await performStep(step.name);
        } catch (error) {
            completeWorkflow(workflowId, false, {
                failedStep: step.name,
                error: error.message,
                completedSteps: i,
            });
            throw error;
        }
    }

    completeWorkflow(workflowId, true, {
        totalDuration: '1400ms',
        gameStatus: 'ready',
        sessionId: generateSessionId(),
    });
};
```

## ⚡ Performance Tracking

### Basic Performance Tracking

```typescript
import { trackPerformance } from './_shared/utils/sentry/sentry-helper';

// Track a simple operation
const result = await trackPerformance('DataLoader', 'Load User Data', async () => {
    const response = await fetch('/api/user/123');
    return response.json();
});

// Track with error handling
try {
    await trackPerformance('PaymentProcessor', 'Process Payment', async () => {
        await validatePayment(paymentData);
        await processPayment(paymentData);
        return { success: true, transactionId: 'txn_123' };
    });
} catch (error) {
    // Error is automatically logged by trackPerformance
    console.error('Payment processing failed:', error);
}
```

### Complex Performance Tracking

```typescript
const handleComplexOperation = async () => {
    const operationId = `complex-op-${Date.now()}`;

    return await trackPerformance('ComplexProcessor', operationId, async () => {
        // Step 1: Data validation
        const validationResult = await trackPerformance('ComplexProcessor', 'validate_data', async () => {
            return await validateComplexData(inputData);
        });

        // Step 2: Data transformation
        const transformedData = await trackPerformance('ComplexProcessor', 'transform_data', async () => {
            return await transformData(validationResult);
        });

        // Step 3: Data persistence
        const persistenceResult = await trackPerformance('ComplexProcessor', 'persist_data', async () => {
            return await persistData(transformedData);
        });

        return {
            validationTime: validationResult.duration,
            transformationTime: transformedData.duration,
            persistenceTime: persistenceResult.duration,
            totalRecords: persistenceResult.recordCount,
        };
    });
};
```

## 🎣 React Hooks Integration

### useSentryHelper Hook

```typescript
import { useSentryHelper, SentryLogLevel } from './_shared/hooks/useSentryHelper';

const GameComponent = () => {
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'GameComponent',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        autoConfigure: true
    });

    useEffect(() => {
        logInfo('Game component mounted', {
            gameId: props.gameId,
            userId: props.userId
        });
    }, []);

    const handleGameAction = async (action: string) => {
        const workflowId = workflow.start(`Game Action: ${action}`, {
            action,
            gameId: props.gameId,
            timestamp: Date.now()
        });

        try {
            workflow.update(workflowId, 'in_progress', { step: 'processing' });

            // Perform game action
            await performGameAction(action);

            workflow.complete(workflowId, true, { result: 'success' });
        } catch (error) {
            logError(error, { action, gameId: props.gameId });
            workflow.complete(workflowId, false, { error: error.message });
        }
    };

    return (
        <div>
            {/* Component JSX */}
        </div>
    );
};
```

### useSimpleSentry Hook

```typescript
import { useSimpleSentry } from './_shared/hooks/useSentryHelper';

const SimpleComponent = () => {
    const { logError, logInfo } = useSimpleSentry('SimpleComponent', SentryLogLevel.INFO);

    const handleClick = () => {
        logInfo('Button clicked', { buttonId: 'primary-action' });
        // Component logic
    };

    return <button onClick={handleClick}>Click Me</button>;
};
```

### useWorkflowSentry Hook

```typescript
import { useWorkflowSentry } from './_shared/hooks/useSentryHelper';

const WorkflowComponent = () => {
    const { workflow } = useWorkflowSentry('WorkflowComponent', {
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    const handleComplexWorkflow = async () => {
        const workflowId = workflow.start('Complex Workflow', {
            trigger: 'user_action',
            timestamp: Date.now()
        });

        try {
            // Workflow steps
            workflow.update(workflowId, 'in_progress', { step: 'step1' });
            await step1();

            workflow.update(workflowId, 'in_progress', { step: 'step2' });
            await step2();

            workflow.complete(workflowId, true, { result: 'success' });
        } catch (error) {
            workflow.complete(workflowId, false, { error: error.message });
        }
    };

    return <div>{/* Component JSX */}</div>;
};
```

## 🔧 Advanced Configuration

### Environment-Specific Configuration

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

// Environment-specific overrides
const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV;

    switch (env) {
        case 'development':
            return {
                logLevel: SentryLogLevel.DEBUG,
                enableSessionReplay: true,
                sessionReplaySampleRate: 1.0
            };
        case 'production':
            return {
                logLevel: SentryLogLevel.INFO,
                enableSessionReplay: false,
                sessionReplaySampleRate: 0.0
            };
        default:
            return {
                logLevel: SentryLogLevel.WARN,
                enableSessionReplay: false,
                sessionReplaySampleRate: 0.0
            };
    }
};
```

### Component-Specific Error Filtering

```typescript
// Configure error filtering for specific components
configureComponent('PaymentComponent', {
    logLevel: SentryLogLevel.ERROR,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
});

// Custom error filtering logic
const isPaymentError = (error: Error) => {
    return error.message.includes('payment') || error.message.includes('transaction') || error.name === 'PaymentError';
};

// Use in component
const PaymentComponent = () => {
    const { logError } = useSentryHelper({
        componentName: 'PaymentComponent',
        logLevel: SentryLogLevel.ERROR,
    });

    const handlePayment = async () => {
        try {
            await processPayment();
        } catch (error) {
            if (isPaymentError(error)) {
                logError(error, {
                    paymentMethod: 'credit_card',
                    amount: 100.0,
                });
            }
        }
    };
};
```

## 🚨 Error Handling & Edge Cases

### Network Error Handling

```typescript
const handleNetworkOperation = async (url: string) => {
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

### Memory Leak Prevention

```typescript
const useSentryWithCleanup = (componentName: string) => {
    const { logError, logInfo } = useSentryHelper({
        componentName,
        logLevel: SentryLogLevel.INFO,
    });

    useEffect(() => {
        logInfo('Component mounted', { timestamp: Date.now() });

        return () => {
            logInfo('Component unmounting', { timestamp: Date.now() });
            // Cleanup any resources
        };
    }, []);

    // Prevent memory leaks by cleaning up workflows
    useEffect(() => {
        return () => {
            // This is handled automatically by useSentryHelper
        };
    }, []);
};
```

### localStorage Error Handling

```typescript
const useLocalStorageSentry = () => {
    const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);

    useEffect(() => {
        try {
            // Test localStorage availability
            const testKey = '__sentry_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            setIsLocalStorageAvailable(true);
        } catch (error) {
            setIsLocalStorageAvailable(false);
            console.warn('localStorage not available, using default Sentry config');
        }
    }, []);

    const setSentryConfig = useCallback(
        (config: any) => {
            if (!isLocalStorageAvailable) {
                console.warn('Cannot set Sentry config: localStorage not available');
                return;
            }

            try {
                setLocalStorageConfig(config);
            } catch (error) {
                console.error('Failed to set Sentry config:', error);
            }
        },
        [isLocalStorageAvailable],
    );

    return { isLocalStorageAvailable, setSentryConfig };
};
```

## 🔍 Troubleshooting

### Common Issues

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

#### 4. Circular Dependency Issues

**Symptoms:**

-   `Cannot access 'SentryLogLevel' before initialization`
-   Import errors in components

**Solutions:**

```typescript
// ✅ Correct import
import { SentryLogLevel } from './_shared/utils/sentry/sentry-types';

// ❌ Incorrect import
import { SentryLogLevel } from './_shared/utils/sentry/sentry-helper';
```

### Debug Mode

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

This comprehensive guide covers all aspects of the SentryHelper implementation, including edge cases, troubleshooting, and best practices for production use.
