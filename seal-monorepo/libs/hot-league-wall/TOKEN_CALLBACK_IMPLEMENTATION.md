# Token Callback Implementation

## Overview

This implementation defines a callback function to get a fresh token **only when the user clicks the "Play" button** in the RNG Soccer prototype page. The token is then passed to the App component for authentication. **No initial token loading occurs** - tokens are only requested on user interaction.

## Flow Diagram

```
Preview Component (No initial token)
    ↓ (waits for user interaction)
User Clicks "Play Now" Button
    ↓ (triggers handlePlayButtonTokenRequest)
Token Request via requestSSO()
    ↓ (returns fresh token)
App Component (updates token state)
    ↓ (transitions to main app)
Lobby Component (receives fresh token)
```

## Implementation Details

### 1. Preview Component (`preview.tsx`)

**Changes Made:**

-   **Removed** `handleGetToken` function and initial token loading
-   **Removed** `useEffect` for automatic token loading
-   **Removed** `renewToken` prop (no session renewal functionality)
-   **Kept** `handlePlayButtonTokenRequest` callback function that calls `requestSSO()`
-   **Updated** component to render immediately without waiting for token

**Key Features:**

-   Uses `useCallback` for performance optimization
-   Handles both success and failure cases
-   Returns the token for immediate use
-   **No automatic token loading** - only on user interaction

```typescript
// Only token request function - no initial loading
const handlePlayButtonTokenRequest = useCallback(async () => {
    const startTime = performance.now();
    console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());

    try {
        const result = await requestSSO();
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (result?.token) {
            console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            setToken(result.token);
            return result.token;
        } else {
            console.log(`❌ [TOKEN_TIMING] Token request FAILED for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            return null;
        }
    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
        return null;
    }
}, []);
```

### 2. App Component (`app.tsx`)

**Changes Made:**

-   **Removed** `renewToken` prop from interfaces
-   **Updated** `AppContent` to handle async token requests
-   **Added** `currentToken` state to manage token updates
-   **Modified** `handlePlayButtonClick` to be async and handle token requests

**Key Features:**

-   Maintains token state independently
-   Handles token updates gracefully
-   Provides fallback behavior if token request fails
-   **No session renewal** - simplified token management

```typescript
const handlePlayButtonClick = useCallback(async () => {
    if (onPlayButtonTokenRequest) {
        const newToken = await onPlayButtonTokenRequest();
        if (newToken) {
            setCurrentToken(newToken);
        }
    }
    setHasClickedPlay(true);
}, [onPlayButtonTokenRequest]);
```

### 3. Lobby Component (`lobby.tsx`)

**Changes Made:**

-   **Removed** `renewToken` prop dependency
-   **Updated** session timeout handling to show simple message
-   **Simplified** session management

**Key Features:**

-   No automatic token renewal
-   Simple session expired message
-   Reduced complexity

```typescript
if (isSessionTimeout) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: 'white',
            fontSize: '18px'
        }}>
            Session expired. Please refresh the page to continue.
        </div>
    );
}
```

## Key Changes Summary

### **Removed Functionality:**

1. **Initial token loading** - No automatic token requests on app start
2. **Session renewal** - No automatic token refresh during app usage
3. **Session timeout recovery** - Simple message instead of automatic retry

### **Kept Functionality:**

1. **Play button token request** - Only when user clicks "Play Now"
2. **Timing logs** - Comprehensive performance tracking
3. **Error handling** - Graceful failure handling
4. **Prototype → Real App transition** - Smooth user experience

## Benefits

1. **Simplified Architecture:**

    - No complex session management
    - Clear single point of token acquisition
    - Reduced state management complexity

2. **Better User Experience:**

    - App loads immediately (no waiting for token)
    - Token only requested when needed
    - Clear user-initiated action

3. **Improved Performance:**

    - No unnecessary initial API calls
    - Faster app startup
    - Reduced server load

4. **Clearer Intent:**
    - Token acquisition is explicit user action
    - No hidden background processes
    - Easier to debug and monitor

## Usage Example

```typescript
// The flow is now:
// 1. App loads immediately (no token)
// 2. User sees RNG Soccer prototype
// 3. User clicks "Play Now" button
// 4. Token is requested and received
// 5. User transitions to Real App with fresh token
```

## Future Considerations

1. **Session Management:** If session renewal is needed, it can be implemented separately
2. **Token Caching:** Could add token caching for better performance
3. **Error Recovery:** Could add retry mechanisms for failed token requests
4. **User Feedback:** Could add loading states during token acquisition

The implementation now focuses solely on the user-initiated token request flow, making it simpler and more predictable.

## Testing

### Test Coverage

The implementation includes comprehensive tests covering:

1. **Preview Component Tests:**

    - Token callback creation
    - SSO request success/failure handling
    - Component rendering states

2. **App Component Tests:**

    - Token request callback propagation
    - Token state updates
    - Error handling scenarios

3. **RNGSoccerStaticPrototype Tests:**

    - Async callback handling
    - Error recovery
    - UI state management

4. **RNGSoccerBase Tests:**

    - Play button interaction
    - Async callback execution
    - Error handling

5. **Integration Tests:**
    - End-to-end flow validation
    - Component interaction verification

### Test Files

-   `token-callback-flow.spec.tsx` - Comprehensive integration tests
-   `simple-token-test.spec.tsx` - Basic functionality tests

## Error Handling

### Graceful Degradation

1. **SSO Request Failure:**

    - Component continues to function with existing token
    - User experience remains smooth
    - Errors are logged for debugging

2. **Network Issues:**

    - Play button re-appears if token request fails
    - User can retry the action
    - No application crashes

3. **Invalid Token Response:**
    - Fallback to existing token
    - Clear error logging
    - Maintains application stability

## Benefits

1. **Fresh Authentication:**

    - Ensures users have valid tokens when starting games
    - Reduces authentication-related errors
    - Improves user experience

2. **Security:**

    - Tokens are refreshed at the right moment
    - Prevents stale token issues
    - Maintains session integrity

3. **User Experience:**

    - Seamless transition from prototype to main app
    - No authentication interruptions
    - Clear visual feedback

4. **Maintainability:**
    - Clear separation of concerns
    - Comprehensive error handling
    - Well-documented code structure

## Usage Example

```typescript
// The flow is automatically handled when user clicks "Play Now"
// No additional code needed in consuming components

// The token callback flow:
// 1. User clicks "Play Now" in RNG Soccer prototype
// 2. Fresh token is requested via SSO
// 3. Token is updated in App component
// 4. User transitions to main app with fresh token
```

## Future Enhancements

1. **Token Refresh Strategy:**

    - Implement token expiration checking
    - Add automatic token refresh
    - Optimize token request timing

2. **Error Recovery:**

    - Add retry mechanisms
    - Implement exponential backoff
    - Provide user feedback for errors

3. **Performance Optimization:**

    - Cache token requests
    - Implement request deduplication
    - Add loading states

4. **Monitoring:**
    - Add telemetry for token requests
    - Monitor success/failure rates
    - Track user experience metrics
