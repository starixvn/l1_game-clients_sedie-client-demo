# SSO Control Simulator - Quick Reference

## 🚀 Quick Start

### 3rd Party Integration

**Simplified Interface**: The `onRequestSSOToken` callback is designed for easy 3rd party integration:

```typescript
// Simple callback signature for 3rd party integration
interface AppProps {
    onRequestSSOToken?: () => Promise<string | null>;
}

// Usage example
const MyApp = () => {
    const handleTokenRequest = async (): Promise<string | null> => {
        // Your token request logic here
        const token = await yourSSOService.getToken();
        return token;
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

**Key Benefits:**

-   ✅ No context parameter needed
-   ✅ Focus on token retrieval only
-   ✅ Internal context management handled by App
-   ✅ Clean separation of concerns

### SSO Control Simulator Mode

**Route:** `/sso-control`
**Purpose:** Testing and debugging SSO authentication

```typescript
// Access simulator controls
const ssoSimulator = useSSOSimulator(DEFAULT_SSO_CONFIG);

// Enable failure simulation
ssoSimulator.toggleFailure();

// Set number of failures before success
ssoSimulator.setFailCount(3);

// Select predefined scenario
ssoSimulator.selectScenario(scenario);
```

### Real App Mode

**Route:** `/` (default)
**Purpose:** Production-like behavior

```typescript
// Direct token request without simulation
const token = await TokenRequestManager.getInstance().executeTokenRequest();
```

## 📊 Comparison Table

| Feature              | Simulator Mode  | Real App Mode   | 3rd Party Integration |
| -------------------- | --------------- | --------------- | --------------------- |
| **Route**            | `/sso-control`  | `/`             | Custom                |
| **Controls**         | ✅ Interactive  | ❌ None         | ❌ None               |
| **Token Requests**   | 🔄 Simulated    | 🎯 Real         | 🎯 Real               |
| **Scenarios**        | 📋 Configurable | 🔒 Fixed        | 🔒 Fixed              |
| **Performance**      | 📈 Monitored    | 📊 Real metrics | 📊 Real metrics       |
| **Use Case**         | 🧪 Testing      | 🚀 Production   | 🔌 Integration        |
| **Context Handling** | 🔧 Internal     | 🔧 Internal     | 🔧 Internal           |

## 🎮 Available Scenarios

| Scenario          | ID                   | Failure Mode | First Click Invalid |
| ----------------- | -------------------- | ------------ | ------------------- |
| **Normal Flow**   | `normal-flow`        | ❌           | ❌                  |
| **Invalid Token** | `persistent-failure` | ✅           | ❌                  |

## 🔧 Key Controls

### Failure Mode Toggle

```typescript
// Enable/disable failure simulation
ssoSimulator.toggleFailure();
```

### First Click Invalid Token

```typescript
// Simulate invalid token on first click only
ssoSimulator.toggleFirstClickInvalidToken();
```

### Fail Count Configuration

```typescript
// Set number of failures before success
ssoSimulator.setFailCount(5);
```

### Scenario Selection

```typescript
// Select predefined scenario
ssoSimulator.selectScenario({
    id: 'persistent-failure',
    name: 'Invalid Token',
    settings: { isFailureMode: true, isFirstClickInvalidTokenMode: false },
});
```

## 📝 Common Usage Patterns

### 1. 3rd Party Integration

```typescript
// Simple integration example
const MyGameClient = () => {
    const getToken = async (): Promise<string | null> => {
        try {
            const response = await fetch('/api/sso/token');
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Token request failed:', error);
            return null;
        }
    };

    return (
        <App
            appEnv="production"
            siteId="my-site"
            language="en"
            onRequestSSOToken={getToken}
        />
    );
};
```

### 2. Test Normal Flow

```typescript
// Default behavior - no failures
const ssoSimulator = useSSOSimulator({
    isFailureMode: false,
    isFirstClickInvalidTokenMode: false,
});
```

### 3. Test Persistent Failures

```typescript
// Simulate 3 failures then success
const ssoSimulator = useSSOSimulator({
    isFailureMode: true,
    isFirstClickInvalidTokenMode: false,
});
ssoSimulator.setFailCount(3);
```

### 4. Test First Click Failure

```typescript
// First request fails, subsequent succeed
const ssoSimulator = useSSOSimulator({
    isFailureMode: false,
    isFirstClickInvalidTokenMode: true,
});
```

## 🔍 Debug Information

### Console Logs

```typescript
// Token request logging
🔄 [FIRST_SSO] Using TokenRequestManager for REAL APP...
✅ [FIRST_SSO] TokenRequestManager completed - Duration: 150.25ms
⚠️ [FIRST_SSO] TokenRequestManager returned null - Duration: 200.10ms
💥 [FIRST_SSO] TokenRequestManager failed - Duration: 500.75ms

// Scenario logging
🎯 [PREVIEW] Scenario selected: Invalid Token
🔄 [PREVIEW] Reset play button click count to 0 for new scenario

// State logging
🔄 [DEBUG] isReconnecting state changed: true
```

### Performance Metrics

-   **Token Request Duration**: Time from request to response
-   **Success Rate**: Percentage of successful requests
-   **Retry Count**: Number of retry attempts
-   **Error Types**: Classification of failures

## 🛠️ Troubleshooting

### SSO Controls Not Visible

```typescript
// Check environment configuration
const { showSSOControls } = useAppConfiguration();
console.log('SSO Controls enabled:', showSSOControls);
```

### Simulator Not Responding

```typescript
// Ensure you're on correct route
// Navigate to: /sso-control
// Check simulator initialization
const ssoSimulator = useSSOSimulator(DEFAULT_SSO_CONFIG);
```

### Token Requests Always Fail

```typescript
// Check failure mode and count
console.log('Failure Mode:', ssoSimulator.isFailureMode);
console.log('Fail Count:', ssoSimulator.failCount);
```

### 3rd Party Integration Issues

```typescript
// Ensure callback returns Promise<string | null>
const handleTokenRequest = async (): Promise<string | null> => {
    // Your implementation
    return token || null; // Must return string or null
};

// Check for proper error handling
try {
    const token = await yourSSOService.getToken();
    return token;
} catch (error) {
    console.error('Token request failed:', error);
    return null; // Return null on failure
}
```

## 🎯 Best Practices

### Development

1. **Always test with simulator first**
2. **Use predefined scenarios for consistency**
3. **Monitor console logs for debugging**
4. **Test both success and failure paths**

### Production

1. **Disable simulator controls**
2. **Monitor real performance metrics**
3. **Implement proper error handling**
4. **Optimize token request times**

### Testing

1. **Cover all scenarios**
2. **Test with various network conditions**
3. **Validate integration with other components**
4. **Ensure regression testing**

### 3rd Party Integration

1. **Keep token requests simple and focused**
2. **Implement proper error handling**
3. **Return null on failures (not throw errors)**
4. **Test with real SSO services**
5. **Monitor token request performance**

## 📚 Related Files

-   **Main Preview:** `preview.tsx`
-   **App Component:** `app.tsx`
-   **Simulator:** `simulator/index.ts`
-   **SSO Controls:** `_shared/components/sso-control-simulator/`
-   **Types:** `simulator/types.ts`
-   **Constants:** `simulator/constants.ts`

## 🔗 Quick Links

-   [Full SSO Control Guide](./SSO_CONTROL_GUIDE.md)
-   [Simulator README](./simulator/README.md)
-   [SSO Control Types](./_shared/components/sso-control-simulator/types.ts)
