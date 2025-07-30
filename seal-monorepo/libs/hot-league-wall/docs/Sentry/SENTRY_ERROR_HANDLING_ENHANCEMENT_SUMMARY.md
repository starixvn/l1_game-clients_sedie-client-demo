# Sentry Error Handling Enhancement Summary

## Overview

This document provides a comprehensive summary of the enhanced error handling capabilities implemented throughout the HotLeagueWall project using Sentry. The enhancements include robust error tracking, recovery mechanisms, and debugging tools with localStorage-based dynamic control.

## 🎯 Error Handling Strategy

### **Core Principles**

-   **Graceful Degradation**: Applications continue to function even when errors occur
-   **Rich Context**: Comprehensive error information for effective debugging
-   **Recovery Mechanisms**: Automatic retry and fallback strategies
-   **Privacy-First**: Sensitive data is filtered and masked
-   **Performance-Optimized**: Minimal impact on application performance

### **Error Handling Levels**

1. **Component-Level**: Individual component error boundaries
2. **Application-Level**: Global error handling and recovery
3. **Network-Level**: Connection and API error management
4. **User-Level**: User interaction error tracking
5. **System-Level**: Infrastructure and configuration errors

## 🔧 Error Handling Implementation

### **1. Component Error Boundaries**

#### **File**: `src/_shared/components/error-boundary.tsx`

**Implementation**: React Error Boundary with Sentry integration

```typescript
import React from 'react';
import { useSentryHelper } from '../hooks/useSentryHelper';
import { SentryLogLevel } from '../utils/sentry/sentry-types';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const { sentryHelper } = this.props;

        if (sentryHelper) {
            sentryHelper.logError(error, {
                errorInfo,
                component: 'ErrorBoundary',
                action: 'componentDidCatch',
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        }

        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onRetry={() => this.setState({ hasError: false })}
                />
            );
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error, errorInfo, onRetry }: any) => {
    const { logError, logInfo } = useSentryHelper({
        componentName: 'ErrorFallback',
        logLevel: SentryLogLevel.ERROR
    });

    const handleRetry = () => {
        logInfo('User attempted error recovery', {
            errorMessage: error?.message,
            timestamp: Date.now()
        });
        onRetry();
    };

    return (
        <div className="error-fallback">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button onClick={handleRetry}>Try Again</button>
            <details>
                <summary>Error Details</summary>
                <pre>{error?.message}</pre>
                <pre>{errorInfo?.componentStack}</pre>
            </details>
        </div>
    );
};
```

**Key Features**:

-   Automatic error capture and logging
-   User-friendly error messages
-   Retry mechanisms
-   Detailed error information for debugging

### **2. Network Error Handling**

#### **File**: `src/_shared/utils/network-error-handler.ts`

**Implementation**: Comprehensive network error management

```typescript
import { useSentryHelper } from '../hooks/useSentryHelper';

interface NetworkErrorConfig {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
}

export class NetworkErrorHandler {
    private config: NetworkErrorConfig;
    private sentryHelper: any;

    constructor(config: NetworkErrorConfig, sentryHelper: any) {
        this.config = config;
        this.sentryHelper = sentryHelper;
    }

    async handleRequest<T>(requestFn: () => Promise<T>, context: Record<string, any> = {}): Promise<T> {
        const workflowId = this.sentryHelper.workflow.start('Network Request', {
            ...context,
            maxRetries: this.config.maxRetries,
            timeout: this.config.timeout,
        });

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                this.sentryHelper.workflow.update(workflowId, 'in_progress', {
                    attempt,
                    step: 'making_request',
                });

                const result = await this.executeWithTimeout(requestFn);

                this.sentryHelper.workflow.complete(workflowId, true, {
                    attempts: attempt,
                    success: true,
                });

                return result;
            } catch (error) {
                const isNetworkError = this.isNetworkError(error);
                const isTimeoutError = this.isTimeoutError(error);
                const isRetryable = this.isRetryableError(error);

                this.sentryHelper.logError(error, {
                    attempt,
                    maxRetries: this.config.maxRetries,
                    errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
                    isRetryable,
                    willRetry: attempt < this.config.maxRetries && isRetryable,
                    context,
                });

                if (attempt === this.config.maxRetries || !isRetryable) {
                    this.sentryHelper.workflow.complete(workflowId, false, {
                        attempts: attempt,
                        finalError: error.message,
                        errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
                    });
                    throw error;
                }

                // Wait before retry with exponential backoff
                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw new Error('Max retries exceeded');
    }

    private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), this.config.timeout);
        });

        return Promise.race([fn(), timeoutPromise]);
    }

    private isNetworkError(error: any): boolean {
        return error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('network'));
    }

    private isTimeoutError(error: any): boolean {
        return error.name === 'AbortError' || error.message.includes('timeout');
    }

    private isRetryableError(error: any): boolean {
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        const retryableErrors = ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'];

        return (
            retryableStatusCodes.includes(error.status) ||
            retryableErrors.includes(error.code) ||
            this.isNetworkError(error) ||
            this.isTimeoutError(error)
        );
    }
}
```

**Key Features**:

-   Automatic retry with exponential backoff
-   Timeout handling
-   Error classification and filtering
-   Comprehensive logging and tracking

### **3. Authentication Error Handling**

#### **File**: `src/auth/auth-error-handler.ts`

**Implementation**: SSO and authentication error management

```typescript
import { useSentryHelper } from '../_shared/hooks/useSentryHelper';

export class AuthenticationErrorHandler {
    private sentryHelper: any;
    private maxRetries: number;

    constructor(sentryHelper: any, maxRetries: number = 3) {
        this.sentryHelper = sentryHelper;
        this.maxRetries = maxRetries;
    }

    async handleAuthentication(token: string, context: Record<string, any> = {}) {
        const workflowId = this.sentryHelper.workflow.start('Authentication', {
            hasToken: !!token,
            authMethod: 'sso',
            ...context,
        });

        try {
            this.sentryHelper.workflow.update(workflowId, 'in_progress', {
                step: 'validating_token',
            });

            this.sentryHelper.logInfo('Authentication initiated', {
                hasToken: !!token,
                timestamp: Date.now(),
                ...context,
            });

            const result = await this.authenticateWithRetry(token);

            this.sentryHelper.workflow.complete(workflowId, true, {
                userId: result.userId,
                authMethod: 'sso',
                success: true,
            });

            this.sentryHelper.logInfo('Authentication successful', {
                userId: result.userId,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            this.sentryHelper.workflow.complete(workflowId, false, {
                error: error.message,
                step: 'authentication_failed',
            });

            this.sentryHelper.logError(error, {
                context: 'authentication',
                hasToken: !!token,
                timestamp: Date.now(),
                ...context,
            });

            throw error;
        }
    }

    private async authenticateWithRetry(token: string): Promise<any> {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await this.performAuthentication(token);
                return result;
            } catch (error) {
                const isRetryable = this.isRetryableAuthError(error);

                this.sentryHelper.logError(error, {
                    attempt,
                    maxRetries: this.maxRetries,
                    isRetryable,
                    willRetry: attempt < this.maxRetries && isRetryable,
                    context: 'authentication_retry',
                });

                if (attempt === this.maxRetries || !isRetryable) {
                    throw error;
                }

                // Wait before retry
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    private async performAuthentication(token: string): Promise<any> {
        // Actual authentication logic
        const response = await fetch('/api/auth/sso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }

        return response.json();
    }

    private isRetryableAuthError(error: any): boolean {
        const retryableErrors = ['Network Error', 'Request timeout', 'Service temporarily unavailable'];

        return retryableErrors.some((msg) => error.message.includes(msg));
    }
}
```

**Key Features**:

-   SSO authentication error handling
-   Token validation and refresh
-   Retry mechanisms for transient errors
-   Comprehensive error logging

### **4. Game-Specific Error Handling**

#### **File**: `src/games/game-error-handler.ts`

**Implementation**: Game-specific error management

```typescript
import { useSentryHelper } from '../_shared/hooks/useSentryHelper';

export class GameErrorHandler {
    private sentryHelper: any;
    private gameId: string;

    constructor(sentryHelper: any, gameId: string) {
        this.sentryHelper = sentryHelper;
        this.gameId = gameId;
    }

    async handleGameOperation<T>(operation: () => Promise<T>, operationName: string, context: Record<string, any> = {}): Promise<T> {
        const workflowId = this.sentryHelper.workflow.start(`Game Operation: ${operationName}`, {
            gameId: this.gameId,
            operationName,
            timestamp: Date.now(),
            ...context,
        });

        try {
            this.sentryHelper.workflow.update(workflowId, 'in_progress', {
                step: 'executing_operation',
            });

            const result = await operation();

            this.sentryHelper.workflow.complete(workflowId, true, {
                result: 'success',
                operationName,
            });

            this.sentryHelper.logInfo('Game operation successful', {
                gameId: this.gameId,
                operationName,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            this.sentryHelper.workflow.complete(workflowId, false, {
                error: error.message,
                operationName,
            });

            this.sentryHelper.logError(error, {
                context: 'game_operation',
                gameId: this.gameId,
                operationName,
                timestamp: Date.now(),
                ...context,
            });

            // Handle game-specific error recovery
            await this.handleGameErrorRecovery(error, operationName);
            throw error;
        }
    }

    async handleBetPlacement(betData: any): Promise<any> {
        return this.handleGameOperation(
            async () => {
                // Validate bet
                await this.validateBet(betData);

                // Place bet
                const result = await this.placeBet(betData);

                return result;
            },
            'bet_placement',
            { betData },
        );
    }

    async handleGameConnection(): Promise<any> {
        return this.handleGameOperation(
            async () => {
                // Establish game connection
                const connection = await this.establishConnection();

                // Initialize game state
                await this.initializeGameState();

                return connection;
            },
            'game_connection',
            { gameId: this.gameId },
        );
    }

    private async handleGameErrorRecovery(error: any, operationName: string) {
        const isConnectionError = error.message.includes('connection');
        const isBetError = error.message.includes('bet');

        if (isConnectionError) {
            this.sentryHelper.logInfo('Attempting connection recovery', {
                gameId: this.gameId,
                operationName,
                timestamp: Date.now(),
            });

            // Attempt to reconnect
            await this.attemptReconnection();
        }

        if (isBetError) {
            this.sentryHelper.logInfo('Handling bet error', {
                gameId: this.gameId,
                operationName,
                timestamp: Date.now(),
            });

            // Handle bet-specific error recovery
            await this.handleBetErrorRecovery(error);
        }
    }

    private async validateBet(betData: any): Promise<void> {
        // Bet validation logic
        if (!betData.amount || betData.amount <= 0) {
            throw new Error('Invalid bet amount');
        }
    }

    private async placeBet(betData: any): Promise<any> {
        // Bet placement logic
        const response = await fetch('/api/game/bet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(betData),
        });

        if (!response.ok) {
            throw new Error(`Bet placement failed: ${response.status}`);
        }

        return response.json();
    }

    private async establishConnection(): Promise<any> {
        // Connection establishment logic
        return new Promise((resolve, reject) => {
            // Simulate connection logic
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ connected: true });
                } else {
                    reject(new Error('Connection failed'));
                }
            }, 1000);
        });
    }

    private async initializeGameState(): Promise<void> {
        // Game state initialization logic
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    private async attemptReconnection(): Promise<void> {
        // Reconnection logic
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    private async handleBetErrorRecovery(error: any): Promise<void> {
        // Bet error recovery logic
        this.sentryHelper.logInfo('Bet error recovery completed', {
            gameId: this.gameId,
            timestamp: Date.now(),
        });
    }
}
```

**Key Features**:

-   Game-specific error handling
-   Bet placement error management
-   Connection error recovery
-   Game state error handling

## 🚨 Error Recovery Mechanisms

### **1. Automatic Retry Logic**

```typescript
const retryOperation = async <T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> => {
    const { logError, logInfo } = useSentryHelper({
        componentName: 'RetryHandler',
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();

            if (attempt > 1) {
                logInfo('Operation succeeded after retry', {
                    attempt,
                    maxRetries,
                    timestamp: Date.now(),
                });
            }

            return result;
        } catch (error) {
            const isRetryable = isRetryableError(error);

            logError(error, {
                attempt,
                maxRetries,
                isRetryable,
                willRetry: attempt < maxRetries && isRetryable,
            });

            if (attempt === maxRetries || !isRetryable) {
                throw error;
            }

            // Exponential backoff
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
    }

    throw new Error('Max retries exceeded');
};

const isRetryableError = (error: any): boolean => {
    const retryableErrors = ['Network Error', 'Request timeout', 'Service temporarily unavailable', 'ECONNRESET', 'ENOTFOUND'];

    return retryableErrors.some((msg) => error.message.includes(msg));
};
```

### **2. Fallback Mechanisms**

```typescript
const withFallback = async <T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: Record<string, any> = {},
): Promise<T> => {
    const { logError, logInfo } = useSentryHelper({
        componentName: 'FallbackHandler',
    });

    try {
        const result = await primaryOperation();
        return result;
    } catch (error) {
        logError(error, {
            context: 'primary_operation_failed',
            ...context,
        });

        logInfo('Attempting fallback operation', {
            ...context,
            timestamp: Date.now(),
        });

        try {
            const fallbackResult = await fallbackOperation();

            logInfo('Fallback operation succeeded', {
                ...context,
                timestamp: Date.now(),
            });

            return fallbackResult;
        } catch (fallbackError) {
            logError(fallbackError, {
                context: 'fallback_operation_failed',
                originalError: error.message,
                ...context,
            });

            throw fallbackError;
        }
    }
};
```

### **3. Circuit Breaker Pattern**

```typescript
class CircuitBreaker {
    private failureCount = 0;
    private lastFailureTime = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private threshold = 5;
    private timeout = 60000; // 1 minute
    private sentryHelper: any;

    constructor(sentryHelper: any, threshold: number = 5, timeout: number = 60000) {
        this.sentryHelper = sentryHelper;
        this.threshold = threshold;
        this.timeout = timeout;
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
                this.sentryHelper.logInfo('Circuit breaker transitioning to HALF_OPEN', {
                    timestamp: Date.now(),
                });
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error);
            throw error;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;
        this.state = 'CLOSED';

        this.sentryHelper.logInfo('Circuit breaker reset to CLOSED', {
            timestamp: Date.now(),
        });
    }

    private onFailure(error: any): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        this.sentryHelper.logError(error, {
            context: 'circuit_breaker_failure',
            failureCount: this.failureCount,
            threshold: this.threshold,
            state: this.state,
        });

        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';

            this.sentryHelper.logError(new Error('Circuit breaker opened'), {
                context: 'circuit_breaker_opened',
                failureCount: this.failureCount,
                threshold: this.threshold,
            });
        }
    }
}
```

## 🔍 Error Monitoring and Analytics

### **1. Error Metrics Tracking**

```typescript
const trackErrorMetrics = (error: any, context: Record<string, any> = {}) => {
    const { logInfo } = useSentryHelper({
        componentName: 'ErrorMetrics',
    });

    const metrics = {
        errorType: error.name || 'Unknown',
        errorMessage: error.message,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
    };

    logInfo('Error Metric', metrics);
};

// Usage
try {
    await riskyOperation();
} catch (error) {
    trackErrorMetrics(error, {
        operation: 'riskyOperation',
        userId: 'user123',
        gameId: 'rng-soccer',
    });
}
```

### **2. Performance Impact Monitoring**

```typescript
const monitorErrorPerformance = async <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
    const { logWarning, logError } = useSentryHelper({
        componentName: 'PerformanceMonitor',
    });

    const startTime = performance.now();

    try {
        const result = await operation();
        const duration = performance.now() - startTime;

        if (duration > 1000) {
            logWarning('Slow operation detected', {
                operationName,
                duration: `${duration.toFixed(2)}ms`,
                timestamp: Date.now(),
            });
        }

        return result;
    } catch (error) {
        const duration = performance.now() - startTime;

        logError(error, {
            operationName,
            duration: `${duration.toFixed(2)}ms`,
            timestamp: Date.now(),
        });

        throw error;
    }
};
```

## 🔧 Configuration and Customization

### **1. Error Handling Configuration**

```typescript
interface ErrorHandlingConfig {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    enableCircuitBreaker: boolean;
    circuitBreakerThreshold: number;
    circuitBreakerTimeout: number;
    logLevel: SentryLogLevel;
    enablePerformanceMonitoring: boolean;
}

const defaultErrorConfig: ErrorHandlingConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 5000,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000,
    logLevel: SentryLogLevel.ERROR,
    enablePerformanceMonitoring: true,
};
```

### **2. Environment-Specific Error Handling**

```typescript
const getErrorHandlingConfig = (): ErrorHandlingConfig => {
    const baseConfig = { ...defaultErrorConfig };

    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                ...baseConfig,
                maxRetries: 1,
                logLevel: SentryLogLevel.DEBUG,
                enablePerformanceMonitoring: true,
            };
        case 'production':
            return {
                ...baseConfig,
                maxRetries: 3,
                logLevel: SentryLogLevel.ERROR,
                enablePerformanceMonitoring: false,
            };
        default:
            return baseConfig;
    }
};
```

## 🚨 Troubleshooting

### **Common Error Handling Issues**

#### 1. **Infinite Retry Loops**

**Symptoms**:

-   Operations continuously retrying
-   High error rates
-   Performance degradation

**Solutions**:

```typescript
// Implement proper retry limits
const retryWithLimit = async <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }

            // Add delay between retries
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }

    throw new Error('Max retries exceeded');
};
```

#### 2. **Memory Leaks from Error Handling**

**Symptoms**:

-   Increasing memory usage
-   Performance degradation over time
-   Browser crashes

**Solutions**:

```typescript
// Clean up resources in error handlers
const handleErrorWithCleanup = async (operation: () => Promise<any>) => {
    let resources: any[] = [];

    try {
        // Allocate resources
        resources = await allocateResources();

        // Perform operation
        const result = await operation();

        return result;
    } catch (error) {
        // Log error
        logError(error, { context: 'operation_failed' });

        throw error;
    } finally {
        // Always clean up resources
        await cleanupResources(resources);
    }
};
```

#### 3. **Error Context Loss**

**Symptoms**:

-   Errors without sufficient context
-   Difficult debugging
-   Missing user information

**Solutions**:

```typescript
// Preserve error context
const preserveErrorContext = (error: any, context: Record<string, any>) => {
    const enhancedError = new Error(error.message);
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;

    // Add context to error object
    (enhancedError as any).context = {
        ...context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
    };

    return enhancedError;
};

// Usage
try {
    await riskyOperation();
} catch (error) {
    const enhancedError = preserveErrorContext(error, {
        operation: 'riskyOperation',
        userId: 'user123',
        gameId: 'rng-soccer',
    });

    throw enhancedError;
}
```

### **Debug Mode**

```typescript
// Enable debug mode for detailed error information
localStorage.setItem('sentry_debug_mode', 'true');

// Check error handling configuration
const debugErrorHandling = () => {
    const debugInfo = {
        errorConfig: getErrorHandlingConfig(),
        localStorageConfig: getLocalStorageConfig(),
        activeErrorHandlers: getActiveErrorHandlers(),
        errorMetrics: getErrorMetrics(),
    };

    console.log('Error Handling Debug Info:', debugInfo);
};
```

## 📊 Best Practices

### **1. Error Classification**

```typescript
// Classify errors for appropriate handling
const classifyError = (error: any): string => {
    if (error.name === 'NetworkError') return 'network';
    if (error.name === 'TimeoutError') return 'timeout';
    if (error.name === 'ValidationError') return 'validation';
    if (error.name === 'AuthenticationError') return 'authentication';
    if (error.name === 'AuthorizationError') return 'authorization';
    if (error.name === 'BusinessLogicError') return 'business';

    return 'unknown';
};

// Handle errors based on classification
const handleErrorByType = (error: any) => {
    const errorType = classifyError(error);

    switch (errorType) {
        case 'network':
            return handleNetworkError(error);
        case 'timeout':
            return handleTimeoutError(error);
        case 'validation':
            return handleValidationError(error);
        case 'authentication':
            return handleAuthenticationError(error);
        case 'authorization':
            return handleAuthorizationError(error);
        case 'business':
            return handleBusinessError(error);
        default:
            return handleUnknownError(error);
    }
};
```

### **2. Error Recovery Strategies**

```typescript
// Implement appropriate recovery strategies
const handleNetworkError = async (error: any) => {
    // Retry with exponential backoff
    return retryOperation(() => performNetworkRequest(), 3, 1000);
};

const handleTimeoutError = async (error: any) => {
    // Increase timeout and retry
    return retryOperation(() => performRequestWithTimeout(10000), 2, 2000);
};

const handleValidationError = async (error: any) => {
    // Log and return user-friendly message
    logError(error, { context: 'validation_error' });
    throw new Error('Please check your input and try again');
};

const handleAuthenticationError = async (error: any) => {
    // Redirect to login or refresh token
    await refreshAuthentication();
    return retryOperation(() => performAuthenticatedRequest(), 1, 0);
};
```

### **3. User Experience Considerations**

```typescript
// Provide user-friendly error messages
const getUserFriendlyMessage = (error: any): string => {
    const errorType = classifyError(error);

    switch (errorType) {
        case 'network':
            return 'Connection issue. Please check your internet connection and try again.';
        case 'timeout':
            return 'Request timed out. Please try again.';
        case 'validation':
            return 'Please check your input and try again.';
        case 'authentication':
            return 'Please log in again to continue.';
        case 'authorization':
            return "You don't have permission to perform this action.";
        case 'business':
            return 'Unable to complete your request. Please try again later.';
        default:
            return 'Something went wrong. Please try again.';
    }
};

// Show appropriate UI feedback
const showErrorFeedback = (error: any) => {
    const message = getUserFriendlyMessage(error);
    const severity = getErrorSeverity(error);

    // Show toast notification
    showToast(message, severity);

    // Update UI state
    updateUIState({ error: true, errorMessage: message });
};
```

## 🔒 Security Considerations

### **1. Error Information Sanitization**

```typescript
// Sanitize error information before logging
const sanitizeError = (error: any): any => {
    const sanitized = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
    };

    // Remove sensitive information
    if (error.context) {
        const { password, token, creditCard, ...safeContext } = error.context;
        sanitized.context = safeContext;
    }

    return sanitized;
};

// Usage
try {
    await riskyOperation();
} catch (error) {
    const sanitizedError = sanitizeError(error);
    logError(sanitizedError, { context: 'operation_failed' });
}
```

### **2. Error Rate Limiting**

```typescript
// Implement error rate limiting
class ErrorRateLimiter {
    private errorCounts = new Map<string, number>();
    private lastReset = Date.now();
    private maxErrors = 100;
    private resetInterval = 60000; // 1 minute

    shouldLogError(errorType: string): boolean {
        this.resetIfNeeded();

        const currentCount = this.errorCounts.get(errorType) || 0;

        if (currentCount >= this.maxErrors) {
            return false;
        }

        this.errorCounts.set(errorType, currentCount + 1);
        return true;
    }

    private resetIfNeeded(): void {
        if (Date.now() - this.lastReset > this.resetInterval) {
            this.errorCounts.clear();
            this.lastReset = Date.now();
        }
    }
}
```

This comprehensive summary covers all aspects of enhanced error handling, including patterns, best practices, troubleshooting, and real-world examples for effective error management and recovery.
