# Token Timing Logs Guide

## Overview

This guide explains how to use the comprehensive timing logs that track the exact time it takes to get a token when the user clicks the "Play" button in the RNG Soccer prototype page.

## What Gets Logged

When a user clicks the "Play Now" button, the following timing information is automatically logged:

### 1. **Component-Level Timing**

-   **BASE**: RNG Soccer base component timing
-   **PROTOTYPE**: RNG Soccer static prototype timing
-   **APP**: App component timing
-   **TOKEN**: Token request timing

### 2. **Detailed Timing Information**

-   **Start Time**: Exact timestamp when action begins
-   **End Time**: Exact timestamp when action completes
-   **Duration**: Time taken in milliseconds
-   **Status**: Success, error, or info
-   **Component**: Which component performed the action
-   **Action**: What action was performed

## Console Log Output

When you click the "Play Now" button, you'll see logs like this:

```
🎮 [BASE_TIMING] Play button clicked in RNG Soccer base at: 2024-01-15T10:30:45.123Z
🔄 [BASE_TIMING] Calling onPlayClick callback...
🎯 [PROTOTYPE_TIMING] Play button clicked in RNG Soccer prototype at: 2024-01-15T10:30:45.125Z
👁️ [PROTOTYPE_TIMING] Hiding play button overlay...
🔄 [PROTOTYPE_TIMING] Calling onPlayButtonClick callback...
🎮 [APP_TIMING] Play button clicked in App component at: 2024-01-15T10:30:45.127Z
🔄 [APP_TIMING] Calling token request callback...
🕐 [TOKEN_TIMING] Play button clicked - Starting token request at: 2024-01-15T10:30:45.129Z
✅ [TOKEN_TIMING] Token request SUCCESS - Duration: 245.67ms
📊 [TOKEN_TIMING] Token received at: 2024-01-15T10:30:45.375Z
🔑 [TOKEN_TIMING] Token length: 128 characters
✅ [APP_TIMING] Token callback completed - Duration: 248.12ms
🔄 [APP_TIMING] Updating current token...
🎯 [APP_TIMING] Setting hasClickedPlay to true...
🏁 [APP_TIMING] Play button handling completed - Total duration: 250.45ms
✅ [PROTOTYPE_TIMING] onPlayButtonClick callback completed - Duration: 248.67ms
🏁 [PROTOTYPE_TIMING] Play button handling completed - Total duration: 250.89ms
✅ [BASE_TIMING] onPlayClick callback completed - Duration: 250.12ms
🏁 [BASE_TIMING] Play button handling completed - Total duration: 252.34ms
```

## How to Analyze Token Request Times

### 1. **Real-Time Monitoring**

Open your browser's Developer Tools (F12) and go to the Console tab. When you click the "Play Now" button, you'll see all the timing logs in real-time.

### 2. **Filtering Logs**

To focus on token-specific timing, filter the console by:

-   `[TOKEN_TIMING]` - For token request timing only
-   `Duration:` - For all duration measurements
-   `SUCCESS` - For successful token requests
-   `ERROR` - For failed token requests

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

#### **Token Request Duration**

Look for lines containing `[TOKEN_TIMING] Token request SUCCESS - Duration: X.XXms`

#### **Component Breakdown**

-   `[BASE_TIMING]` - UI component timing
-   `[PROTOTYPE_TIMING]` - Prototype logic timing
-   `[APP_TIMING]` - App component timing
-   `[TOKEN_TIMING]` - Actual token request timing

#### **Error Analysis**

Look for lines containing `[TOKEN_TIMING] Token request ERROR` for failed requests.

## Performance Metrics

### **Key Metrics to Monitor**

1. **Token Request Time**: The actual time taken by `requestSSO()`
2. **Total Flow Time**: From button click to app transition
3. **Component Overhead**: Time spent in each component
4. **Success Rate**: Percentage of successful token requests
5. **Error Patterns**: Types and frequency of errors

### **Performance Benchmarks**

| Metric             | Good    | Acceptable | Poor    |
| ------------------ | ------- | ---------- | ------- |
| Token Request Time | < 200ms | 200-500ms  | > 500ms |
| Total Flow Time    | < 300ms | 300-800ms  | > 800ms |
| Success Rate       | > 99%   | 95-99%     | < 95%   |

## Debugging Token Issues

### **Common Issues and Solutions**

#### 1. **Slow Token Requests (> 500ms)**

**Symptoms:**

-   `[TOKEN_TIMING] Token request SUCCESS - Duration: 750.45ms`

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

-   `[TOKEN_TIMING] Token request ERROR - Duration: 150.23ms`

**Possible Causes:**

-   Network errors
-   Authentication issues
-   Server errors

**Solutions:**

-   Check network status
-   Verify authentication credentials
-   Review server logs

#### 3. **Component Delays**

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
// Set up real-time alerts for slow requests
const checkPerformance = (duration) => {
    if (duration > 500) {
        console.warn(`Slow token request detected: ${duration}ms`);
        // Send alert to monitoring service
    }
};
```

## Best Practices

### **1. Regular Monitoring**

-   Check token request times daily
-   Monitor for performance degradation
-   Track error rates

### **2. Performance Optimization**

-   Optimize network requests
-   Implement caching where appropriate
-   Monitor bundle sizes

### **3. Error Handling**

-   Log all errors with context
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

## Conclusion

The token timing logs provide comprehensive visibility into the token request process. By monitoring these logs, you can:

-   **Identify performance bottlenecks**
-   **Track user experience metrics**
-   **Debug authentication issues**
-   **Optimize application performance**

Use this guide to effectively monitor and analyze token request timing in your application.
