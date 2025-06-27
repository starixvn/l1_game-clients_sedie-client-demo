# SSO Control Simulator - Quick Reference

## 🚀 Quick Start

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

| Feature            | Simulator Mode  | Real App Mode   |
| ------------------ | --------------- | --------------- |
| **Route**          | `/sso-control`  | `/`             |
| **Controls**       | ✅ Interactive  | ❌ None         |
| **Token Requests** | 🔄 Simulated    | 🎯 Real         |
| **Scenarios**      | 📋 Configurable | 🔒 Fixed        |
| **Performance**    | 📈 Monitored    | 📊 Real metrics |
| **Use Case**       | 🧪 Testing      | 🚀 Production   |

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

### 1. Test Normal Flow

```typescript
// Default behavior - no failures
const ssoSimulator = useSSOSimulator({
    isFailureMode: false,
    isFirstClickInvalidTokenMode: false,
});
```

### 2. Test Persistent Failures

```typescript
// Simulate 3 failures then success
const ssoSimulator = useSSOSimulator({
    isFailureMode: true,
    isFirstClickInvalidTokenMode: false,
});
ssoSimulator.setFailCount(3);
```

### 3. Test First Click Failure

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
