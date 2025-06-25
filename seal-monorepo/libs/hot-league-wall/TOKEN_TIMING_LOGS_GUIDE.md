# Token Timing Logs Guide

## Overview

This guide explains how to use the comprehensive timing logs that track the exact time it takes to get a token when the user clicks the "Play" button in the **RNG Soccer Prototype** page, which then transitions to the **Real App**.

## Application Flow

### **Prototype → Real App Transition**

1. **RNG Soccer Prototype** (Initial State)

    - User sees the RNG Soccer game interface
    - "Play Now" button is visible
    - This is a **prototype/demo** environment

2. **User Clicks "Play Now"**

    - Token request is initiated
    - Timing logs track the entire process

3. **Real App** (Final State)
    - User transitions to the actual game lobby
    - Full application functionality is available
    - This is the **production/real** application

## What Gets Logged

When a user clicks the "Play Now" button in the **Prototype**, the following timing information is automatically logged:

### 1. **Component-Level Timing**

-   **BASE**: RNG Soccer Prototype base component timing
-   **PROTOTYPE**: RNG Soccer Prototype static prototype timing
-   **APP**: App component timing (handles Prototype → Real App transition)
-   **TOKEN**: Token request timing (for Real App authentication)

### 2. **Detailed Timing Information**

-   **Start Time**: Exact timestamp when action begins
-   **End Time**: Exact timestamp when action completes
-   **Duration**: Time taken in milliseconds
-   **Status**: Success, error, or info
-   **Component**: Which component performed the action
-   **Action**: What action was performed
-   **Context**: Whether action is in Prototype or Real App

## Console Log Output

When you click the "Play Now" button in the **Prototype**, you'll see logs like this:

```
🎮 [BASE_TIMING] Play button clicked in RNG SOCCER PROTOTYPE BASE at: 2024-01-15T10:30:45.123Z
🔄 [BASE_TIMING] Calling onPlayClick callback to transition from PROTOTYPE to REAL APP...
🎯 [PROTOTYPE_TIMING] Play button clicked in RNG SOCCER PROTOTYPE at: 2024-01-15T10:30:45.125Z
👁️ [PROTOTYPE_TIMING] Hiding play button overlay in PROTOTYPE...
🔄 [PROTOTYPE_TIMING] Calling onPlayButtonClick callback to transition to REAL APP...
🎮 [APP_TIMING] Play button clicked in PROTOTYPE - App component handling at: 2024-01-15T10:30:45.127Z
🔄 [APP_TIMING] Calling token request callback for REAL APP...
🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at: 2024-01-15T10:30:45.129Z
✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: 245.67ms
📊 [TOKEN_TIMING] Token received for REAL APP at: 2024-01-15T10:30:45.375Z
🔑 [TOKEN_TIMING] Token length: 128 characters
🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...
✅ [APP_TIMING] Token callback completed for REAL APP - Duration: 248.12ms
🔄 [APP_TIMING] Updating current token for REAL APP...
🎯 [APP_TIMING] Setting hasClickedPlay to true - Transitioning from PROTOTYPE to REAL APP...
🏁 [APP_TIMING] PROTOTYPE to REAL APP transition completed - Total duration: 250.45ms
✅ [PROTOTYPE_TIMING] onPlayButtonClick callback completed - PROTOTYPE to REAL APP transition - Duration: 248.67ms
🏁 [PROTOTYPE_TIMING] RNG SOCCER PROTOTYPE handling completed - Total duration: 250.89ms
✅ [BASE_TIMING] onPlayClick callback completed - PROTOTYPE to REAL APP transition - Duration: 250.12ms
🏁 [BASE_TIMING] RNG SOCCER PROTOTYPE BASE handling completed - Total duration: 252.34ms
```

## How to Analyze Token Request Times

### 1. **Real-Time Monitoring**

Open your browser's Developer Tools (F12) and go to the Console tab. When you click the "Play Now" button in the **Prototype**, you'll see all the timing logs in real-time.

### 2. **Filtering Logs**

To focus on specific aspects, filter the console by:

-   `[TOKEN_TIMING]` - For token request timing only (Real App authentication)
-   `[PROTOTYPE_TIMING]` - For Prototype component timing
-   `[APP_TIMING]` - For App component timing (Prototype → Real App transition)
-   `[BASE_TIMING]` - For Prototype base component timing
-   `Duration:` - For all duration measurements
-   `SUCCESS` - For successful token requests
-   `ERROR` - For failed token requests
-   `PROTOTYPE` - For Prototype-related actions
-   `REAL APP` - For Real App-related actions

### 3. **Using the Token Timing Analyzer**

The system includes a built-in analyzer that provides comprehensive insights:

```javascript
// Access the analyzer in browser console
window.tokenTimingAnalyzer.analyzeTokenFlow();

// Export timing data
const timingData = window.tokenTimingAnalyzer.exportTimingData();
console.log(timingData);
```

### 4. **Manual Analysis**

You can manually analyze the logs by looking for these key patterns:

#### **Token Request Duration (Real App)**

Look for lines containing `[TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: X.XXms`

#### **Component Breakdown**

-   `[BASE_TIMING]` - RNG Soccer Prototype base component timing
-   `[PROTOTYPE_TIMING]` - RNG Soccer Prototype logic timing
-   `[APP_TIMING]` - App component timing (Prototype → Real App transition)
-   `[TOKEN_TIMING]` - Actual token request timing (for Real App authentication)

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
3. **Component Overhead**: Time spent in each Prototype component
4. **Success Rate**: Percentage of successful Prototype → Real App transitions
5. **Error Patterns**: Types and frequency of transition errors

### **Performance Benchmarks**

| Metric                          | Good    | Acceptable | Poor    |
| ------------------------------- | ------- | ---------- | ------- |
| Token Request Time (Real App)   | < 200ms | 200-500ms  | > 500ms |
| Prototype → Real App Transition | < 300ms | 300-800ms  | > 800ms |
| Success Rate                    | > 99%   | 95-99%     | < 95%   |

## Debugging Token Issues

### **Common Issues and Solutions**

#### 1. **Slow Token Requests (> 500ms)**

**Symptoms:**

-   `[TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: 750.45ms`

**Possible Causes:**

-   Network latency
-   Server overload
-   Large token payload

**Solutions:**

-   Check network connectivity
-   Monitor server performance
-   Optimize token size

#### 2. **Failed Token Requests**

**Symptoms:**

-   `[TOKEN_TIMING] Token request ERROR for REAL APP - Duration: 150.23ms`

**Possible Causes:**

-   Network errors
-   Authentication issues
-   Server errors

**Solutions:**

-   Check network status
-   Verify authentication credentials
-   Review server logs

#### 3. **Prototype → Real App Transition Failures**

**Symptoms:**

-   `[PROTOTYPE_TIMING] onPlayButtonClick callback failed - PROTOTYPE transition error`

**Possible Causes:**

-   Token request failures
-   Component rendering issues
-   State management problems

**Solutions:**

-   Check token request logs
-   Verify component state
-   Review transition logic

#### 4. **Component Delays**

**Symptoms:**

-   Large gaps between component timing logs

**Possible Causes:**

-   Heavy component rendering
-   JavaScript execution delays
-   Memory issues

**Solutions:**

-   Optimize component performance
-   Reduce bundle size
-   Monitor memory usage

## Advanced Analysis

### **Using the Timing Analyzer API**

```javascript
// Get all timing logs
const logs = window.tokenTimingAnalyzer.getTimingLogs();

// Filter by component
const tokenLogs = logs.filter((log) => log.component === 'TOKEN');

// Filter by action
const successLogs = logs.filter((log) => log.action === 'Token request' && log.status === 'success');

// Calculate average token request time
const avgTime = successLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / successLogs.length;
console.log(`Average token request time: ${avgTime.toFixed(2)}ms`);

// Filter Prototype vs Real App actions
const prototypeLogs = logs.filter((log) => log.message.includes('PROTOTYPE'));
const realAppLogs = logs.filter((log) => log.message.includes('REAL APP'));
```

### **Exporting Data for External Analysis**

```javascript
// Export timing data as JSON
const exportData = window.tokenTimingAnalyzer.exportTimingData();

// Save to file (in browser console)
const blob = new Blob([exportData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'prototype-to-realapp-timing-data.json';
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
    const logs = JSON.parse(localStorage.getItem('prototypeTimingLogs') || '[]');
    logs.push(log);
    localStorage.setItem('prototypeTimingLogs', JSON.stringify(logs));
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

### **2. Performance Optimization**

-   Optimize network requests for token acquisition
-   Implement caching where appropriate
-   Monitor bundle sizes

### **3. Error Handling**

-   Log all errors with context (Prototype vs Real App)
-   Implement retry mechanisms
-   Provide user feedback

### **4. Data Analysis**

-   Export timing data regularly
-   Analyze trends over time
-   Set up performance alerts

## Troubleshooting

### **Logs Not Appearing**

1. Check browser console is open
2. Verify no console filters are active
3. Ensure timing analyzer is initialized

### **Incorrect Timing**

1. Check system clock accuracy
2. Verify performance.now() availability
3. Check for browser performance issues

### **Missing Data**

1. Clear browser cache
2. Check for JavaScript errors
3. Verify component rendering

### **Prototype vs Real App Confusion**

1. Look for `PROTOTYPE` and `REAL APP` keywords in logs
2. Check component names in timing logs
3. Verify transition flow is working correctly

## Conclusion

The token timing logs provide comprehensive visibility into the **Prototype → Real App transition process**. By monitoring these logs, you can:

-   **Identify performance bottlenecks** in the transition flow
-   **Track user experience metrics** from Prototype to Real App
-   **Debug authentication issues** for Real App access
-   **Optimize application performance** for smooth transitions

Use this guide to effectively monitor and analyze the timing of token requests and Prototype → Real App transitions in your application.
