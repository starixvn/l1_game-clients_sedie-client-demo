# Token Timing Logs Guide

## Overview

This guide explains how to use the comprehensive timing logs that track the exact time it takes to get a token when the user clicks the "Play" button in the **RNG Soccer Prototype** page, which then transitions to the **Real App**. The system now includes SSO Control Simulator capabilities for testing different authentication scenarios.

## Application Flow

### **Prototype → Real App Transition**

1. **RNG Soccer Prototype** (Initial State)

    - User sees the RNG Soccer game interface
    - "Play Now" button is visible
    - This is a **prototype/demo** environment

2. **User Clicks "Play Now"**

    - Token request is initiated via `TokenRequestManager`
    - SSO simulator can intercept and modify token requests
    - Timing logs track the entire process

3. **Real App** (Final State)
    - User transitions to the actual game lobby
    - Full application functionality is available
    - This is the **production/real** application

## Architecture Components

### **Core Components**

-   **Preview Component**: Main entry point with routing and SSO simulator integration
-   **App Component**: Handles Prototype → Real App transition with internal context management
-   **TokenRequestManager**: Singleton for managing token requests with simplified callback interface
-   **SSO Control Simulator**: Testing framework for authentication scenarios

### **Simulator Modes**

-   **Real App Mode** (`/` route): Direct token requests without simulation
-   **SSO Simulator Mode** (`/sso-control` route): Interactive testing with failure simulation
-   **3rd Party Integration Mode**: Production integration with simplified callback interface

## What Gets Logged

When a user clicks the "Play Now" button in the **Prototype**, the following timing information is automatically logged:

### 1. **Component-Level Timing**

-   **PREVIEW**: Preview component scenario management
-   **APP**: App component timing (handles Prototype → Real App transition)
-   **TOKEN**: Token request timing (for Real App authentication)
-   **SIMULATION**: SSO simulator behavior and failure simulation

### 2. **Detailed Timing Information**

-   **Start Time**: Exact timestamp when action begins
-   **End Time**: Exact timestamp when action completes
-   **Duration**: Time taken in milliseconds
-   **Status**: Success, error, or info
-   **Component**: Which component performed the action
-   **Action**: What action was performed
-   **Context**: Whether action is in Prototype or Real App (handled internally)
-   **Simulation State**: Current SSO simulator configuration

## Console Log Output

When you click the "Play Now" button in the **Prototype**, you'll see logs like this:

### **Normal Flow (Real App Mode)**

```
🎯 [PREVIEW] Scenario selected: Normal Flow
🔄 [PREVIEW] Reset play button click count to 0 for new scenario
🔄 [PREVIEW] Updated scenario key to: normal-flow
🔄 [FIRST_SSO] Using TokenRequestManager for REAL APP...
🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at: 2024-01-15T10:30:45.129Z
🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...
🔑 [TOKEN_TIMING] First click detected - checking for invalid token simulation
🔑 [TOKEN_TIMING] Proceeding with normal token request flow
✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: 245.67ms
🔑 [TOKEN_TIMING] Click count: 1
✅ [FIRST_SSO] TokenRequestManager completed for REAL APP - Duration: 248.12ms
🏁 [FIRST_SSO] PROTOTYPE to REAL APP transition completed - Total duration: 250.45ms
```

### **3rd Party Integration Mode**

```
🔄 [FIRST_SSO] Using TokenRequestManager for REAL APP...
🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at: 2024-01-15T10:30:45.129Z
🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...
✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: 245.67ms
✅ [FIRST_SSO] TokenRequestManager completed for REAL APP - Duration: 248.12ms
🏁 [FIRST_SSO] PROTOTYPE to REAL APP transition completed - Total duration: 250.45ms
```

### **Simulator Mode with Failure**

```
🎯 [PREVIEW] Scenario selected: Invalid Token
🔄 [PREVIEW] Reset play button click count to 0 for new scenario
🔄 [PREVIEW] Updated scenario key to: persistent-failure
🧪 [SIMULATION] Returning fake token for click #1: INVALID_TOKEN_1705311045123_abc123def456
🔄 [FIRST_SSO] Using TokenRequestManager for REAL APP...
⚠️ [FIRST_SSO] TokenRequestManager returned null for REAL APP - Duration: 2.34ms
```

### **Session Reconnect**

```
🔄 [SESSION_RECONNECT] Starting session reconnect...
🔄 [SSO_RETRY] Using TokenRequestManager for REAL APP...
✅ [SSO_RETRY] TokenRequestManager completed for REAL APP - Duration: 156.78ms
🔄 [SESSION_RECONNECT] New token obtained, Lobby should reconnect automatically
🔄 [SESSION_RECONNECT] Session reconnect completed
```

## How to Analyze Token Request Times

### 1. **Real-Time Monitoring**

Open your browser's Developer Tools (F12) and go to the Console tab. When you click the "Play Now" button in the **Prototype**, you'll see all the timing logs in real-time.

### 2. **Filtering Logs**

To focus on specific aspects, filter the console by:

-   `[TOKEN_TIMING]` - For token request timing only (Real App authentication)
-   `[PREVIEW]` - For Preview component scenario management
-   `[APP_TIMING]` - For App component timing (Prototype → Real App transition)
-   `[FIRST_SSO]` - For first-time SSO requests (context handled internally)
-   `[SSO_RETRY]` - For session reconnect requests (context handled internally)
-   `[SIMULATION]` - For SSO simulator behavior
-   `Duration:` - For all duration measurements
-   `SUCCESS` - For successful token requests
-   `ERROR` - For failed token requests
-   `PROTOTYPE` - For Prototype-related actions
-   `REAL APP` - For Real App-related actions

### 3. **Using the SSO Simulator**

Access the SSO Control Simulator at `/sso-control` route to test different scenarios:

```typescript
// Available scenarios
const scenarios = [
    { id: 'normal-flow', name: 'Normal Flow', description: 'Standard authentication' },
    { id: 'persistent-failure', name: 'Invalid Token', description: 'Persistent failure simulation' },
];

// Simulator controls
const simulator = useSSOSimulator({
    isFailureMode: false,
    isFirstClickInvalidTokenMode: false,
});

// Enable failure simulation
simulator.toggleFailure();
simulator.setFailCount(3);
```

### 4. **3rd Party Integration Testing**

For 3rd party integration testing, you can monitor the simplified callback interface:

```typescript
// Example 3rd party integration with timing
const MyGameClient = () => {
    const handleTokenRequest = async (): Promise<string | null> => {
        const startTime = performance.now();

        try {
            const response = await fetch('/api/sso/token');
            const data = await response.json();

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`🔗 [3RD_PARTY] Token request completed - Duration: ${duration.toFixed(2)}ms`);

            return data.token;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`💥 [3RD_PARTY] Token request failed - Duration: ${duration.toFixed(2)}ms`);
            console.error('[3RD_PARTY] Error details:', error);

            return null;
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

### 5. **Manual Analysis**

You can manually analyze the logs by looking for these key patterns:

#### **Token Request Duration (Real App)**

Look for lines containing `[TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: X.XXms`

#### **Component Breakdown**

-   `[PREVIEW]` - Preview component scenario management
-   `[FIRST_SSO]` - First-time token requests (context handled internally)
-   `[SSO_RETRY]` - Session reconnect requests (context handled internally)
-   `[TOKEN_TIMING]` - Actual token request timing (for Real App authentication)
-   `[SIMULATION]` - SSO simulator behavior
-   `[3RD_PARTY]` - 3rd party integration timing (if implemented)

#### **Transition Analysis**

-   Look for `PROTOTYPE to REAL APP transition` messages
-   Monitor transition success/failure rates
-   Track transition timing

#### **Error Analysis**

Look for lines containing `[TOKEN_TIMING] Token request ERROR for REAL APP` for failed requests.

## Performance Metrics

### **Key Metrics to Monitor**

1. **Token Request Time**: The actual time taken by `requestSSO()` for Real App authentication
2. **Prototype → Real App Transition Time**: From button click to app transition completion
3. **Component Overhead**: Time spent in each component
4. **Success Rate**: Percentage of successful Prototype → Real App transitions
5. **Error Patterns**: Types and frequency of transition errors
6. **Simulation Impact**: Performance impact of SSO simulator

### **Performance Benchmarks**

| Metric                          | Good    | Acceptable | Poor    |
| ------------------------------- | ------- | ---------- | ------- |
| Token Request Time (Real App)   | < 200ms | 200-500ms  | > 500ms |
| Prototype → Real App Transition | < 300ms | 300-800ms  | > 800ms |
| Success Rate                    | > 99%   | 95-99%     | < 95%   |
| Simulator Overhead              | < 10ms  | 10-50ms    | > 50ms  |

## Debugging Token Issues

### **Common Issues and Solutions**

#### 1. **Slow Token Requests (> 500ms)**

**Symptoms:**

-   `[TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: 750.45ms`

**Possible Causes:**

-   Network latency
-   Server overload
-   Large token payload
-   SSO simulator overhead

**Solutions:**

-   Check network connectivity
-   Monitor server performance
-   Optimize token size
-   Disable SSO simulator in production

#### 2. **Failed Token Requests**

**Symptoms:**

-   `[TOKEN_TIMING] Token request ERROR for REAL APP - Duration: 150.23ms`

**Possible Causes:**

-   Network errors
-   Authentication issues
-   Server errors
-   SSO simulator interference

**Solutions:**

-   Check network status
-   Verify authentication credentials
-   Review server logs
-   Check SSO simulator configuration

#### 3. **Simulation Issues**

**Symptoms:**

-   `🧪 [SIMULATION] Returning fake token for click #1`

**Possible Causes:**

-   SSO simulator enabled in production
-   Incorrect simulator configuration
-   Unintended failure mode activation

**Solutions:**

-   Ensure SSO simulator is disabled in production
-   Check simulator configuration
-   Verify scenario settings

#### 4. **Component Delays**

**Symptoms:**

-   Large gaps between component timing logs

**Possible Causes:**

-   Heavy component rendering
-   JavaScript execution delays
-   Memory issues
-   Simulator overhead

**Solutions:**

-   Optimize component performance
-   Reduce bundle size
-   Monitor memory usage
-   Minimize simulator overhead

## Advanced Analysis

### **Using the TokenRequestManager API**

```javascript
// Access TokenRequestManager
const tokenManager = TokenRequestManager.getInstance();

// Check if callback is set
const hasCallback = tokenManager.hasCallback();

// Get current callback
const callback = tokenManager.getTokenRequestCallback();

// Execute token request
const token = await tokenManager.executeTokenRequest();
```

### **SSO Simulator Analysis**

```javascript
// Access simulator state
const simulator = useSSOSimulator(DEFAULT_SSO_CONFIG);

// Check simulation state
console.log('Failure Mode:', simulator.isFailureMode);
console.log('Fail Count:', simulator.failCount);
console.log('First Click Invalid:', simulator.isFirstClickInvalidTokenMode);

// Analyze simulation impact
const simulationOverhead = endTime - startTime - actualTokenTime;
console.log('Simulation Overhead:', simulationOverhead + 'ms');
```

### **Exporting Data for External Analysis**

```javascript
// Collect timing data
const timingData = {
    timestamp: new Date().toISOString(),
    component: 'TOKEN',
    action: 'Token Request',
    duration: tokenDuration,
    success: true,
    simulation: {
        isFailureMode: simulator.isFailureMode,
        failCount: simulator.failCount,
        clickCount: playButtonClickCount,
    },
};

// Save to file (in browser console)
const blob = new Blob([JSON.stringify(timingData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'token-timing-data.json';
a.click();
```

## Production Monitoring

### **Setting Up Production Logging**

For production environments, you can:

1. **Send logs to external service:**

```javascript
// Example: Send to analytics service
const sendToAnalytics = (log) => {
    fetch('/api/analytics/timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
    });
};
```

2. **Store logs locally:**

```javascript
// Store in localStorage for persistence
const storeLog = (log) => {
    const logs = JSON.parse(localStorage.getItem('tokenTimingLogs') || '[]');
    logs.push(log);
    localStorage.setItem('tokenTimingLogs', JSON.stringify(logs));
};
```

3. **Real-time monitoring:**

```javascript
// Set up real-time alerts for slow transitions
const checkPerformance = (duration) => {
    if (duration > 500) {
        console.warn(`Slow Prototype → Real App transition detected: ${duration}ms`);
        // Send alert to monitoring service
    }
};
```

## Best Practices

### **1. Regular Monitoring**

-   Check Prototype → Real App transition times daily
-   Monitor for performance degradation
-   Track transition success rates
-   Monitor SSO simulator usage

### **2. Performance Optimization**

-   Optimize network requests for token acquisition
-   Implement caching where appropriate
-   Monitor bundle sizes
-   Minimize simulator overhead in production

### **3. Error Handling**

-   Log all errors with context (Prototype vs Real App)
-   Implement retry mechanisms
-   Provide user feedback
-   Handle simulator errors gracefully

### **4. Data Analysis**

-   Export timing data regularly
-   Analyze trends over time
-   Set up performance alerts
-   Monitor simulation patterns

## Troubleshooting

### **Logs Not Appearing**

1. Check browser console is open
2. Verify no console filters are active
3. Ensure TokenRequestManager is initialized
4. Check SSO simulator configuration

### **Incorrect Timing**

1. Check system clock accuracy
2. Verify performance.now() availability
3. Check for browser performance issues
4. Account for simulator overhead

### **Missing Data**

1. Clear browser cache
2. Check for JavaScript errors
3. Verify component rendering
4. Check simulator state

### **Simulation Issues**

1. Verify simulator is enabled only in test mode
2. Check scenario configuration
3. Monitor simulation state changes
4. Ensure proper cleanup

## Conclusion

The token timing logs provide comprehensive visibility into the **Prototype → Real App transition process** with enhanced SSO simulator capabilities. By monitoring these logs, you can:

-   **Identify performance bottlenecks** in the transition flow
-   **Track user experience metrics** from Prototype to Real App
-   **Debug authentication issues** for Real App access
-   **Optimize application performance** for smooth transitions
-   **Test different authentication scenarios** using the SSO simulator

Use this guide to effectively monitor and analyze the timing of token requests and Prototype → Real App transitions in your application, including the new SSO simulator functionality.
