# Token Callback Implementation

## Overview

This implementation defines a callback function to get a fresh token **only when the user clicks the "Play" button** in the RNG Soccer prototype page. The token is then passed to the App component for authentication. The system now includes SSO Control Simulator capabilities for testing different authentication scenarios and a TokenRequestManager for centralized token management.

## Flow Diagram

```
Preview Component (No initial token)
    ↓ (waits for user interaction)
User Clicks "Play Now" Button
    ↓ (triggers TokenRequestManager)
Token Request via requestSSO() or Simulator
    ↓ (returns fresh token or simulated response)
App Component (updates token state)
    ↓ (transitions to main app)
Lobby Component (receives fresh token)
```

## Architecture Components

### **Core Components**

-   **Preview Component**: Main entry point with routing and SSO simulator integration
-   **App Component**: Handles Prototype → Real App transition
-   **TokenRequestManager**: Singleton for managing token requests
-   **SSO Control Simulator**: Testing framework for authentication scenarios
-   **useTokenRequest Hook**: Custom hook for token request logic

### **Simulator Modes**

-   **Real App Mode** (`/` route): Direct token requests without simulation
-   **SSO Simulator Mode** (`/sso-control` route): Interactive testing with failure simulation

## Implementation Details

### 1. Preview Component (`preview.tsx`)

**Key Features:**

-   **SSO Simulator Integration**: Supports testing different authentication scenarios
-   **TokenRequestManager Setup**: Configures token request callbacks
-   **Scenario Management**: Handles different testing scenarios
-   **No Initial Token Loading**: Only requests tokens on user interaction

**Token Request Setup:**

```typescript
// Main Preview Component
const Preview: React.FC = (): React.ReactElement => {
    const prototypeState = usePrototypeState();
    const [currentScenarioKey, setCurrentScenarioKey] = useState<string>(DEFAULT_SCENARIO_KEY);

    const ssoSimulator = useSSOSimulator(DEFAULT_SSO_CONFIG);

    const onRequestSSOToken = useTokenRequest({
        playButtonClickCount: prototypeState.playButtonClickCount,
        setPlayButtonClickCount: prototypeState.setPlayButtonClickCount,
        failCount: ssoSimulator.failCount,
        isFailureMode: ssoSimulator.isFailureMode
    });

    useEffect(() => {
        TokenRequestManager.getInstance().setTokenRequestCallback(
            () => onRequestSSOToken('FIRST_SSO')
        );
    }, [onRequestSSOToken]);

    return (
        <PreviewProvider>
            <Router>
                <PreviewContext
                    onRequestSSOToken={onRequestSSOToken}
                    playButtonClickCount={prototypeState.playButtonClickCount}
                    setPlayButtonClickCount={prototypeState.setPlayButtonClickCount}
                    currentScenarioKey={currentScenarioKey}
                    setCurrentScenarioKey={setCurrentScenarioKey}
                    ssoSimulator={ssoSimulator}
                />
            </Router>
        </PreviewProvider>
    );
};
```

### 2. useTokenRequest Hook (`simulator/hooks/useTokenRequest.ts`)

**Key Features:**

-   **SSO Simulator Integration**: Supports failure simulation and testing
-   **Performance Monitoring**: Comprehensive timing logs
-   **Error Handling**: Graceful failure handling
-   **Click Count Tracking**: Monitors user interactions

```typescript
export const useTokenRequest = ({ playButtonClickCount, setPlayButtonClickCount, failCount, isFailureMode }: TokenRequestHookParams) => {
    return useCallback(
        async (context: TokenRequestContext): Promise<string | null> => {
            const startTime = performance.now();
            setPlayButtonClickCount((prev) => prev + 1);
            const currentClickCount = playButtonClickCount + 1;

            // Simulate failure for the first N clicks if failure mode is enabled
            if (context === 'FIRST_SSO' && isFailureMode && currentClickCount <= failCount) {
                const fakeToken = `INVALID_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                console.log(`🧪 [SIMULATION] Returning fake token for click #${currentClickCount}:`, fakeToken);
                return fakeToken;
            }

            try {
                console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());
                console.log('🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...');

                const result = await requestSSO();
                const endTime = performance.now();
                const duration = endTime - startTime;

                console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
                console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);

                return result.token as string | null;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
                console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);
                console.error('[TOKEN_TIMING] Error details:', error);

                return null;
            }
        },
        [playButtonClickCount, setPlayButtonClickCount, failCount, isFailureMode],
    );
};
```

### 3. App Component (`app.tsx`)

**Key Features:**

-   **TokenRequestManager Integration**: Uses centralized token management
-   **Session Reconnect Support**: Handles token refresh during app usage
-   **Loading States**: Provides user feedback during token requests
-   **Error Handling**: Graceful failure handling

**Token Request Handling:**

```typescript
const AppContent = ({ updateBalanceCallback, onRequestSSOToken }: AppContentProps) => {
    const { language } = useAppContext();
    const [hasClickedPlay, setHasClickedPlay] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Shared token request logic
    const executeTokenRequest = useCallback(
        async (context: 'FIRST_SSO' | 'SSO_RETRY') => {
            console.log(`🔄 [${context}] Using TokenRequestManager for REAL APP...`);
            const tokenStartTime = performance.now();

            try {
                let newToken: string | null = null;
                if (onRequestSSOToken) {
                    newToken = await onRequestSSOToken(context);
                } else {
                    newToken = await TokenRequestManager.getInstance().executeTokenRequest();
                }
                const tokenEndTime = performance.now();
                const tokenDuration = tokenEndTime - tokenStartTime;

                if (newToken) {
                    console.log(`✅ [${context}] TokenRequestManager completed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                    setCurrentToken(newToken);
                    return { success: true, token: newToken, duration: tokenDuration };
                } else {
                    console.log(`⚠️ [${context}] TokenRequestManager returned null for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                    return { success: false, token: null, duration: tokenDuration };
                }
            } catch (error) {
                const tokenEndTime = performance.now();
                const tokenDuration = tokenEndTime - tokenStartTime;
                console.log(`💥 [${context}] TokenRequestManager failed for REAL APP - Duration: ${tokenDuration.toFixed(2)}ms`);
                console.error(`[${context}] TokenRequestManager error:`, error);
                return { success: false, token: null, duration: tokenDuration, error };
            }
        },
        [onRequestSSOToken],
    );

    const handlePlayButtonClick = useCallback(async () => {
        await performTokenRequest({ context: 'FIRST_SSO', showLoading: true, triggerPlayTransition: true });
    }, [performTokenRequest]);

    const handleSessionReconnect = useCallback(async () => {
        console.log('🔄 [SESSION_RECONNECT] Starting session reconnect...');
        await performTokenRequest({ context: 'SSO_RETRY', showReconnectLoading: true });
        console.log('🔄 [SESSION_RECONNECT] Session reconnect completed');
    }, [performTokenRequest]);
};
```

### 4. TokenRequestManager (`_shared/utils/callback-singleton/token-request-manager.ts`)

**Key Features:**

-   **Singleton Pattern**: Centralized token request management
-   **Callback Registration**: Allows dynamic token request callbacks
-   **Error Handling**: Graceful failure handling
-   **Type Safety**: Strong TypeScript typing

```typescript
export class TokenRequestManager extends CallbackSingleton<() => Promise<string | null>> {
    private constructor() {
        super();
    }

    public static getInstance(): TokenRequestManager {
        if (!TokenRequestManager.instance) {
            TokenRequestManager.instance = new TokenRequestManager();
        }
        return TokenRequestManager.instance;
    }

    public setTokenRequestCallback(callback: () => Promise<string | null>): void {
        this.setCallback(callback);
    }

    public getTokenRequestCallback(): (() => Promise<string | null>) | null {
        return this.getCallback();
    }

    public async executeTokenRequest(): Promise<string | null> {
        if (this.hasCallback()) {
            return await this.callback!();
        }
        return null;
    }
}
```

## SSO Control Simulator

### **Available Scenarios**

```typescript
const SSO_SCENARIOS: SSOScenario[] = [
    {
        id: 'normal-flow',
        name: 'Normal Flow',
        description: 'Standard SSO authentication without any failures',
        icon: '🟢',
        settings: {
            isFailureMode: false,
            isFirstClickInvalidTokenMode: false,
        },
    },
    {
        id: 'persistent-failure',
        name: 'Invalid Token',
        description: 'First click will return invalid token, then use real tokens!',
        icon: '🔴',
        settings: {
            isFailureMode: true,
            isFirstClickInvalidTokenMode: false,
        },
    },
];
```

### **Simulator Controls**

```typescript
const ssoSimulator = useSSOSimulator(DEFAULT_SSO_CONFIG);

// Enable failure simulation
ssoSimulator.toggleFailure();

// Set number of failures before success
ssoSimulator.setFailCount(3);

// Select predefined scenario
ssoSimulator.selectScenario(scenario);
```

## Key Changes Summary

### **New Functionality:**

1. **SSO Control Simulator**: Interactive testing framework for authentication scenarios
2. **TokenRequestManager**: Centralized token request management
3. **useTokenRequest Hook**: Custom hook for token request logic with simulation support
4. **Scenario Management**: Predefined testing scenarios
5. **Session Reconnect**: Token refresh during app usage

### **Kept Functionality:**

1. **Play button token request**: Only when user clicks "Play Now"
2. **Timing logs**: Comprehensive performance tracking
3. **Error handling**: Graceful failure handling
4. **Prototype → Real App transition**: Smooth user experience

## Benefits

1. **Enhanced Testing Capabilities:**

    - Interactive SSO simulator for testing different scenarios
    - Predefined failure scenarios
    - Real-time simulation controls

2. **Improved Architecture:**

    - Centralized token management via TokenRequestManager
    - Separation of concerns with custom hooks
    - Better error handling and logging

3. **Better User Experience:**

    - App loads immediately (no waiting for token)
    - Token only requested when needed
    - Clear user-initiated action
    - Session reconnect support

4. **Developer Experience:**
    - Comprehensive timing logs
    - Easy scenario testing
    - Clear debugging information
    - Type-safe implementation

## Usage Example

### **Real App Mode (Production)**

```typescript
// Navigate to "/" route
// Token requests go directly to SSO service
// No simulation interference
```

### **SSO Simulator Mode (Testing)**

```typescript
// Navigate to "/sso-control" route
// Access interactive SSO controls
// Test different failure scenarios
// Monitor simulation behavior
```

## Testing

### **Test Coverage**

The implementation includes comprehensive tests covering:

1. **Preview Component Tests:**

    - SSO simulator integration
    - Scenario management
    - TokenRequestManager setup

2. **useTokenRequest Hook Tests:**

    - Token request logic
    - Simulation behavior
    - Error handling

3. **App Component Tests:**

    - Token request callback propagation
    - Session reconnect handling
    - Loading state management

4. **TokenRequestManager Tests:**

    - Singleton pattern
    - Callback registration
    - Error handling

5. **SSO Simulator Tests:**
    - Scenario selection
    - Failure simulation
    - State management

### **Test Files**

-   Integration tests for complete token flow
-   Unit tests for individual components
-   Simulation tests for SSO simulator

## Error Handling

### **Graceful Degradation**

1. **SSO Request Failure:**

    - Component continues to function
    - User experience remains smooth
    - Errors are logged for debugging

2. **Simulation Errors:**

    - Fallback to real token requests
    - Clear error logging
    - Maintains application stability

3. **Network Issues:**
    - Retry mechanisms available
    - User can retry the action
    - No application crashes

## Future Enhancements

1. **Advanced Simulation:**

    - More complex failure scenarios
    - Network latency simulation
    - Token expiration testing

2. **Performance Optimization:**

    - Token caching strategies
    - Request deduplication
    - Optimized simulation overhead

3. **Monitoring & Analytics:**

    - Real-time performance monitoring
    - Success/failure rate tracking
    - User experience metrics

4. **Security Enhancements:**
    - Token validation
    - Security testing scenarios
    - Vulnerability simulation

The implementation now provides a robust, testable, and maintainable token request system with comprehensive SSO simulator capabilities for testing different authentication scenarios.
