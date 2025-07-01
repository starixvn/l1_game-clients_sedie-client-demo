# SSO Control Simulator & Real App Usage Guide

## Overview

This guide explains how to use the SSO (Single Sign-On) Control Simulator for testing different authentication scenarios and how the real app behaves without the simulator. The system is designed with a simplified interface for 3rd party integration.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [3rd Party Integration](#3rd-party-integration)
3. [SSO Control Simulator Mode](#sso-control-simulator-mode)
4. [Real App Mode](#real-app-mode)
5. [Configuration Options](#configuration-options)
6. [Testing Scenarios](#testing-scenarios)
7. [Troubleshooting](#troubleshooting)

## Architecture Overview

The application supports three main modes:

### 1. 3rd Party Integration Mode

-   **Purpose**: Production integration with external SSO services
-   **Features**:
    -   Simplified `onRequestSSOToken` callback interface
    -   Internal context management (`'FIRST_SSO'` | `'SSO_RETRY'`)
    -   Clean separation of concerns
    -   Focus on token retrieval only

### 2. SSO Control Simulator Mode (`/sso-control` route)

-   **Purpose**: Testing and debugging SSO authentication scenarios
-   **Features**:
    -   Interactive controls for simulating failures
    -   Predefined scenarios for common SSO issues
    -   Real-time state management
    -   Performance monitoring

### 3. Real App Mode (default route)

-   **Purpose**: Production-like behavior without simulation
-   **Features**:
    -   Direct SSO token requests
    -   Real authentication flow
    -   No simulation controls

## 3rd Party Integration

### Simplified Interface Design

The `onRequestSSOToken` callback is designed for easy 3rd party integration:

```typescript
interface AppProps {
    appEnv: string;
    siteId: string;
    language: string;
    updateBalanceCallback?: void | null;
    onRequestSSOToken?: () => Promise<string | null>; // Simplified interface
}
```

### Key Benefits

-   **No Context Parameter**: The callback doesn't need to handle `'FIRST_SSO'` or `'SSO_RETRY'` contexts
-   **Focus on Token Retrieval**: The callback only needs to return a token or null
-   **Internal Context Management**: The App component handles all context logic internally
-   **Clean Separation**: 3rd parties don't need to understand internal context management

### Integration Example

```typescript
// Simple 3rd party integration
const MyGameClient = () => {
    const handleTokenRequest = async (): Promise<string | null> => {
        try {
            // Your SSO service call
            const response = await fetch('/api/sso/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    siteId: 'your-site-id',
                    timestamp: Date.now(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.token || null;
        } catch (error) {
            console.error('Token request failed:', error);
            return null; // Return null on failure
        }
    };

    return (
        <App
            appEnv="production"
            siteId="your-site-id"
            language="en"
            onRequestSSOToken={handleTokenRequest}
        />
    );
};
```

### Best Practices for 3rd Party Integration

1. **Error Handling**: Always return `null` on failure, don't throw errors
2. **Timeout Management**: Implement appropriate timeouts for token requests
3. **Retry Logic**: Handle retries at the integration level if needed
4. **Logging**: Log token request attempts and failures for debugging
5. **Security**: Ensure secure token transmission and storage

## SSO Control Simulator Mode

### Accessing the Simulator

Navigate to `/sso-control` route to access the SSO Control Simulator.

### Available Controls

#### 1. Failure Mode Toggle

```typescript
// Enables/disables failure simulation
onToggleFailure: () => void
```

**Behavior:**

-   When enabled: Returns invalid tokens for SSO requests
-   When disabled: Returns real tokens
-   Automatically generates unique invalid tokens for each failure

#### 2. First Click Invalid Token Mode

```typescript
// Simulates invalid token on first click only
onToggleFirstClickInvalidToken: () => void
```

**Behavior:**

-   When enabled: First SSO request returns invalid token, subsequent requests return real tokens
-   Useful for testing retry mechanisms

#### 3. Scenario Selection

```typescript
// Predefined scenarios for common testing situations
onSelectScenario: (scenario: SSOScenario) => void
```

**Available Scenarios:**

| Scenario      | ID                   | Description                   | Failure Mode | First Click Invalid |
| ------------- | -------------------- | ----------------------------- | ------------ | ------------------- |
| Normal Flow   | `normal-flow`        | Standard authentication       | ❌           | ❌                  |
| Invalid Token | `persistent-failure` | Persistent failure simulation | ✅           | ❌                  |

#### 4. Fail Count Configuration

```typescript
// Number of failures to simulate before returning real token
failCount: number
setFailCount: (count: number) => void
```

### Simulator Features

#### State Management

The simulator maintains state for:

-   Failure mode status
-   First click invalid token mode status
-   Generated invalid tokens
-   Fail count configuration
-   Control visibility

#### Token Generation

```typescript
// Failed token format
`INVALID_TOKEN_${timestamp}_${randomString}` // First click invalid token format
`FIRST_CLICK_INVALID_TOKEN_${timestamp}_${randomString}_${randomChars}`;
```

#### Performance Monitoring

The simulator logs detailed performance metrics:

-   Token request duration
-   Success/failure status
-   Context information (FIRST_SSO, SSO_RETRY)

### Usage Example

```typescript
// Initialize simulator with default config
const ssoSimulator = useSSOSimulator(DEFAULT_SSO_CONFIG);

// Enable failure mode
ssoSimulator.toggleFailure();

// Set fail count to 3
ssoSimulator.setFailCount(3);

// Select a predefined scenario
const scenario = {
    id: 'persistent-failure',
    name: 'Invalid Token',
    description: 'First click will return invalid token, then use real tokens!',
    icon: '🔴',
    settings: {
        isFailureMode: true,
        isFirstClickInvalidTokenMode: false,
    },
};
ssoSimulator.selectScenario(scenario);
```

## Real App Mode

### Default Behavior

When not using the simulator, the app operates in real mode:

#### Token Request Flow

```typescript
// Real token request implementation with internal context management
const executeTokenRequest = async (context: 'FIRST_SSO' | 'SSO_RETRY') => {
    const tokenStartTime = performance.now();

    try {
        // Simplified callback call - no context parameter needed
        const newToken = (await onRequestSSOToken?.()) || (await TokenRequestManager.getInstance().executeTokenRequest());

        const tokenEndTime = performance.now();
        const tokenDuration = tokenEndTime - tokenStartTime;

        if (newToken) {
            console.log(`✅ [${context}] TokenRequestManager completed - Duration: ${tokenDuration.toFixed(2)}ms`);
            return { success: true, token: newToken, duration: tokenDuration };
        } else {
            console.log(`⚠️ [${context}] TokenRequestManager returned null - Duration: ${tokenDuration.toFixed(2)}ms`);
            return { success: false, token: null, duration: tokenDuration };
        }
    } catch (error) {
        const tokenEndTime = performance.now();
        const tokenDuration = tokenEndTime - tokenStartTime;
        console.log(`💥 [${context}] TokenRequestManager failed - Duration: ${tokenDuration.toFixed(2)}ms`);
        return { success: false, token: null, duration: tokenDuration, error };
    }
};
```

#### App Flow

1. **Initial State**: Shows RNG Soccer prototype
2. **Play Button Click**: Triggers first SSO token request (context: 'FIRST_SSO')
3. **Token Success**: Transitions to main lobby with real token
4. **Session Reconnect**: Handles token refresh on session expiry (context: 'SSO_RETRY')

### Key Differences from Simulator Mode

| Aspect             | Real App Mode       | Simulator Mode           | 3rd Party Integration |
| ------------------ | ------------------- | ------------------------ | --------------------- |
| Token Requests     | Real authentication | Simulated responses      | Real authentication   |
| Controls           | None                | Interactive SSO controls | None                  |
| Scenarios          | Fixed behavior      | Configurable scenarios   | Fixed behavior        |
| Performance        | Real metrics        | Simulated metrics        | Real metrics          |
| Error Handling     | Real errors         | Controlled failures      | Real errors           |
| Context Management | Internal            | Internal                 | Internal              |

## Configuration Options

### Environment Configuration

```typescript
// App configuration hook
const { language, showSSOControls, appEnv, siteId, platform } = useAppConfiguration();
```

### SSO Controls Visibility

SSO controls are shown based on environment configuration:

```typescript
// Determines if SSO controls should be visible
const showSSOControls = shouldShowSSOControls();
```

### Default Configuration

```typescript
// Default scenario key
export const DEFAULT_SCENARIO_KEY = 'normal-flow';

// Default SSO simulator configuration
export const DEFAULT_SSO_CONFIG = {
    isFailureMode: false,
    isFirstClickInvalidTokenMode: false,
} as const;
```

## Testing Scenarios

### 1. Normal Authentication Flow

**Setup:**

-   Use "Normal Flow" scenario
-   Ensure failure mode is disabled

**Expected Behavior:**

-   First SSO request succeeds immediately
-   Token is valid and app transitions to lobby
-   No retry mechanisms triggered

### 2. Persistent Failure Testing

**Setup:**

-   Use "Invalid Token" scenario
-   Enable failure mode
-   Set fail count to desired number

**Expected Behavior:**

-   First N SSO requests fail (where N = fail count)
-   (N+1)th request succeeds
-   App transitions to lobby after successful token

### 3. First Click Invalid Token Testing

**Setup:**

-   Enable first click invalid token mode
-   Keep failure mode disabled

**Expected Behavior:**

-   First SSO request returns invalid token
-   Subsequent requests return real tokens
-   App handles retry automatically

### 4. Session Reconnect Testing

**Setup:**

-   Use any scenario
-   Trigger session reconnect from lobby

**Expected Behavior:**

-   New token request with 'SSO_RETRY' context
-   App maintains current state
-   Lobby reconnects with new token

### 5. Performance Testing

**Setup:**

-   Monitor console logs for performance metrics
-   Test with different network conditions

**Metrics Tracked:**

-   Token request duration
-   Success/failure rates
-   Error types and frequencies

## Troubleshooting

### Common Issues

#### 1. SSO Controls Not Visible

**Problem:** SSO control panel is not showing
**Solution:** Check environment configuration for `showSSOControls` flag

#### 2. Simulator Not Responding

**Problem:** Simulator controls don't affect token requests
**Solution:** Ensure you're on `/sso-control` route and simulator is properly initialized

#### 3. Token Requests Always Fail

**Problem:** All SSO requests return invalid tokens
**Solution:** Check if failure mode is enabled and fail count is set correctly

#### 4. Performance Issues

**Problem:** Slow token request times
**Solution:** Monitor console logs for duration metrics and check network conditions

### Debug Information

The application provides extensive logging:

```typescript
// Token request logging
console.log(`🔄 [${context}] Using TokenRequestManager for REAL APP...`);
console.log(`✅ [${context}] TokenRequestManager completed - Duration: ${duration}ms`);
console.log(`⚠️ [${context}] TokenRequestManager returned null - Duration: ${duration}ms`);
console.log(`💥 [${context}] TokenRequestManager failed - Duration: ${duration}ms`);

// Scenario logging
console.log('🎯 [PREVIEW] Scenario selected:', scenario.name);
console.log('🔄 [PREVIEW] Reset play button click count to 0 for new scenario');

// State change logging
console.log('🔄 [DEBUG] isReconnecting state changed:', isReconnecting);
```

### Performance Monitoring

Monitor these key metrics:

-   **Token Request Duration**: Time from request to response
-   **Success Rate**: Percentage of successful token requests
-   **Retry Count**: Number of retry attempts before success
-   **Error Types**: Classification of different failure reasons

## Best Practices

### For Development

1. **Use Simulator for Testing**: Always test SSO scenarios using the simulator first
2. **Monitor Performance**: Use console logs to track token request performance
3. **Test Edge Cases**: Use different scenarios to test error handling
4. **Validate Real Flow**: Always test the real app mode before deployment

### For Production

1. **Disable Simulator**: Ensure simulator controls are not visible in production
2. **Monitor Real Metrics**: Track actual SSO performance in production
3. **Handle Errors Gracefully**: Implement proper error handling for SSO failures
4. **Optimize Performance**: Monitor and optimize token request times

### For Testing

1. **Cover All Scenarios**: Test both success and failure paths
2. **Performance Testing**: Test with various network conditions
3. **Integration Testing**: Test SSO integration with other app components
4. **Regression Testing**: Ensure changes don't break existing SSO functionality

## Conclusion

The SSO Control Simulator provides a powerful tool for testing and debugging authentication scenarios, while the real app mode ensures production-ready behavior. By understanding both modes and their configurations, developers can effectively test SSO functionality and ensure robust authentication flows.
