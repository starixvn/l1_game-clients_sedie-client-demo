# Token Callback Implementation

## Overview

This implementation defines a callback function to get a fresh token when the user clicks the "Play" button in the RNG Soccer prototype page. The token is then passed to the App component for authentication.

## Flow Diagram

```
Preview Component
    ↓ (creates handlePlayButtonTokenRequest callback)
App Component
    ↓ (passes callback to AppContent)
AppContent Component
    ↓ (passes callback to RNGSoccerStaticPrototype)
RNGSoccerStaticPrototype Component
    ↓ (passes callback to RNGSoccerBase)
RNGSoccerBase Component
    ↓ (user clicks "Play Now" button)
Token Request via requestSSO()
    ↓ (returns fresh token)
App Component (updates token state)
    ↓ (transitions to main app)
Lobby Component (receives fresh token)
```

## Implementation Details

### 1. Preview Component (`preview.tsx`)

**Changes Made:**

-   Added `handlePlayButtonTokenRequest` callback function that calls `requestSSO()`
-   Updated `PreviewContext` to accept and pass the callback
-   The callback returns a fresh token and updates the component's token state

**Key Features:**

-   Uses `useCallback` for performance optimization
-   Handles both success and failure cases
-   Returns the token for immediate use

```typescript
const handlePlayButtonTokenRequest = useCallback(async () => {
    const result = await requestSSO();
    if (result?.token) {
        setToken(result.token);
        return result.token;
    }
    return null;
}, []);
```

### 2. App Component (`app.tsx`)

**Changes Made:**

-   Added `onPlayButtonTokenRequest` prop to both `AppProps` and `AppContentProps` interfaces
-   Updated `AppContent` to handle async token requests
-   Added `currentToken` state to manage token updates
-   Modified `handlePlayButtonClick` to be async and handle token requests

**Key Features:**

-   Maintains token state independently
-   Handles token updates gracefully
-   Provides fallback behavior if token request fails

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

### 3. RNGSoccerStaticPrototype Component (`rng-soccer-static-prototype.tsx`)

**Changes Made:**

-   Updated `onPlayButtonClick` prop type to accept async function
-   Modified `handlePlayClick` to handle async operations
-   Added error handling with fallback behavior

**Key Features:**

-   Re-shows play button if token request fails
-   Proper error logging
-   Maintains UI state consistency

```typescript
const handlePlayClick = async () => {
    setIsPlayButtonVisible(false);
    if (onPlayButtonClick) {
        try {
            await onPlayButtonClick();
        } catch (error) {
            console.error('Error during play button click:', error);
            setIsPlayButtonVisible(true);
        }
    }
};
```

### 4. RNGSoccerBase Component (`rng-soccer-base.tsx`)

**Changes Made:**

-   Updated `onPlayClick` prop type to accept async function
-   Modified Play button click handler to handle async operations
-   Added error handling for async callbacks

**Key Features:**

-   Proper async/await handling
-   Error logging for debugging
-   Maintains component stability

```typescript
onClick={async () => {
    if (onPlayClick) {
        try {
            await onPlayClick();
        } catch (error) {
            console.error('Error during play button click:', error);
        }
    }
}}
```

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
