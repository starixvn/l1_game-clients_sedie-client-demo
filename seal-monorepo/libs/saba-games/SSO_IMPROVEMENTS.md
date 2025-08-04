# SSO Helper Improvements - Dynamic Domain Support

## Overview

This document describes the improvements made to the SSO (Single Sign-On) functionality to support dynamic domains instead of hardcoded ones. This change eliminates the need for deployment requests to the member site team when switching domains or handling new requests.

**Important**: This implementation is entirely client-side and does not require any modifications to the API simulators.

## Problem Statement

### Current Challenge

The page code was embedded as a child component on the member site with hardcoded domains within the configuration. This required deployment requests to the member site team for any changes such as:

-   Switching to backup domains
-   Handling new requests (like for KL)
-   Domain configuration updates

### Proposed Solution

Make the domain dynamic, similar to other app types, providing more control and flexibility while eliminating the need for frequent deployment requests. The solution is implemented entirely on the client side to avoid touching the API simulators.

## Implementation Details

### New Functions Added

#### 1. `getDynamicDomain()`

```typescript
export const getDynamicDomain = () => {
    const { serverDomain, ssl, subDomain } = appSettings;
    const protocol = ssl ? 'https' : 'http';
    return `${protocol}://${subDomain}.${serverDomain}`;
};
```

**Purpose**: Constructs the domain dynamically based on configuration settings.

**Returns**: Complete domain URL (e.g., `https://l1-proxy1.lumigame.com`)

#### 2. `requestSSOWithRedirectUrl(gameId = 0)`

```typescript
export const requestSSOWithRedirectUrl = async (gameId = 0) => {
    // ... SSO request logic using original endpoint ...

    // Use the original SSO endpoint to get the token
    const ssoResult = (await axios.post(`${gameLobbySimulatorUrl}/signin/sso`, request)).data;

    // Construct the complete redirect URL with dynamic domain on the client side
    const dynamicDomain = getDynamicDomain();
    const redirectUrl = `${dynamicDomain}/?token=${ssoResult.token}&lang=${request.language}&appType=${appType}&op=sg&cg=GrUSD`;

    return {
        token: ssoResult.token,
        redirectUrl: redirectUrl,
        domain: dynamicDomain,
    };
};
```

**Purpose**: Requests SSO using the original endpoint and constructs a complete redirect URL with dynamic domain on the client side.

**Returns**: Object containing:

-   `token`: The SSO token
-   `redirectUrl`: Complete redirect URL (e.g., `https://l1-proxy1.lumigame.com/?token=abc123&lang=vi-VN&appType=6&op=sg&cg=GrUSD`)
-   `domain`: The dynamic domain used

### Client-Side Implementation

The solution uses the existing `/signin/sso` endpoint and constructs the dynamic redirect URL entirely on the client side:

1. **Call Original Endpoint**: Uses the existing `/signin/sso` endpoint to get the token
2. **Extract Token**: Extracts the token from the response
3. **Construct Dynamic URL**: Builds the complete redirect URL using the `getDynamicDomain()` function
4. **Return Complete Result**: Returns both the token and the complete redirect URL

## Usage Examples

### Basic Usage

```typescript
import { requestSSOWithRedirectUrl } from './_shared/utils/sso-helper';

// Get SSO with complete redirect URL
const result = await requestSSOWithRedirectUrl();
console.log(result.redirectUrl);
// Output: https://l1-proxy1.lumigame.com/?token=abc123&lang=vi-VN&appType=6&op=sg&cg=GrUSD
```

### With Game ID

```typescript
// Get SSO for specific game
const result = await requestSSOWithRedirectUrl(123);
console.log(result.redirectUrl);
```

### Get Dynamic Domain Only

```typescript
import { getDynamicDomain } from './_shared/utils/sso-helper';

const domain = getDynamicDomain();
console.log(domain); // https://l1-proxy1.lumigame.com
```

## Component Integration

### Updated Preview Component

The `Preview` component now uses the new function:

```typescript
const handleGetToken = useCallback(async () => {
    const result = await requestSSOWithRedirectUrl();
    if (result?.token) {
        setToken(result.token);
        setRedirectUrl(result.redirectUrl);
    }
}, []);
```

### Updated App Component

The `App` component now accepts and uses the `redirectUrl` prop:

```typescript
interface AppProps {
    // ... other props
    redirectUrl?: string;
}

const AppContent = ({ token, language, redirectUrl, ... }) => {
    // Use dynamic redirectUrl if provided, otherwise fall back to standaloneUrl
    const iframeSrc = redirectUrl || appSettings.standaloneUrl;

    return (
        <IframeContainer
            src={iframeSrc}
            token={token}
            language={language}
            // ... other props
        />
    );
};
```

## Configuration

The dynamic domain is constructed from the following configuration properties:

```json
{
    "systemType": "SG",
    "serverDomain": "lumigame.com",
    "ssl": true,
    "subDomain": "l1-proxy1",
    "simulatorConfigs": {
        "gameLobbySimulatorUrl": "https://l1-glbs1.lumigame.com",
        "owApiSimulatorUrl": "https://l1-ows1.lumigame.com/SabaClub"
    }
}
```

## Testing

### Unit Tests

Comprehensive unit tests have been created following the AAA (Arrange, Act, Assert) pattern:

-   **Happy Path**: Tests successful SSO requests with valid parameters
-   **Edge Cases**: Tests null/undefined values, empty inputs, out-of-bound data
-   **Error Handling**: Tests appropriate error responses for invalid inputs
-   **Boundary Conditions**: Tests at the edges of valid input ranges
-   **Integration Points**: Tests interactions with external APIs

### Test Coverage

-   `randomIntFromInterval`: Random number generation within ranges
-   `getDynamicDomain`: Domain construction with different SSL settings
-   `requestSSO`: Original function backward compatibility
-   `requestSSOWithRedirectUrl`: New function with complete redirect URL
-   Integration tests for both functions

### Running Tests

```bash
npm test sso-helper.test.ts
```

## Demo Component

A demo component (`SSODemo`) has been created to showcase the new functionality:

```typescript
import SSODemo from './_shared/utils/sso-demo';

// Use in your component
<SSODemo />
```

The demo provides:

-   Interactive buttons to test all functions
-   Real-time results display
-   Copy-to-clipboard functionality
-   Error handling demonstration
-   Visual comparison between old and new approaches

## Migration Guide

### For Existing Code

The original `requestSSO` function remains unchanged for backward compatibility:

```typescript
// This still works
const result = await requestSSO();
console.log(result.token);
```

### For New Code

Use the new function for dynamic domain support:

```typescript
// Recommended for new implementations
const result = await requestSSOWithRedirectUrl();
console.log(result.redirectUrl); // Complete URL ready to use
```

### Gradual Migration

1. **Phase 1**: Use new function in new features
2. **Phase 2**: Gradually migrate existing code
3. **Phase 3**: Deprecate old function (future)

## Benefits

### Immediate Benefits

-   **No More Deployment Requests**: Domain changes can be handled through configuration
-   **Dynamic Domain Support**: Automatic domain construction based on environment
-   **Complete Redirect URLs**: Ready-to-use URLs with all necessary parameters
-   **Backward Compatibility**: Existing code continues to work
-   **No API Changes**: Implementation is entirely client-side

### Long-term Benefits

-   **Flexibility**: Easy switching between environments
-   **Maintainability**: Centralized domain configuration
-   **Scalability**: Support for multiple domains and environments
-   **Reduced Dependencies**: Less reliance on member site team for domain changes
-   **API Independence**: No need to modify or deploy API simulators

## Error Handling

The new functions include comprehensive error handling:

```typescript
try {
    const result = await requestSSOWithRedirectUrl();
    // Handle success
} catch (error) {
    // Handle network errors, invalid responses, etc.
    console.error('SSO request failed:', error);
}
```

## Security Considerations

-   All requests use HTTPS when SSL is enabled
-   Tokens are properly validated and sanitized
-   Domain construction is based on trusted configuration
-   No sensitive data is exposed in URLs
-   Uses existing, tested API endpoints

## Architecture Benefits

### Client-Side Approach Advantages

1. **No API Dependencies**: Doesn't require changes to existing API simulators
2. **Faster Deployment**: Changes can be deployed without API team coordination
3. **Reduced Risk**: No risk of breaking existing API functionality
4. **Easier Testing**: Can test domain logic independently of API
5. **Flexible Configuration**: Domain logic can be easily modified without API changes

### Implementation Strategy

1. **Leverage Existing Endpoints**: Uses the proven `/signin/sso` endpoint
2. **Client-Side URL Construction**: Builds dynamic URLs based on configuration
3. **Configuration-Driven**: Domain changes only require config updates
4. **Backward Compatible**: Existing code continues to work unchanged

## Future Enhancements

Potential improvements for future versions:

-   Support for multiple domains per environment
-   Automatic failover to backup domains
-   Domain health checking
-   Caching of domain configurations
-   Support for custom URL parameters
-   Domain validation and sanitization

## Support

For questions or issues related to the SSO improvements:

1. Check the unit tests for usage examples
2. Review the demo component for interactive testing
3. Consult the configuration documentation
4. Contact the development team for technical support
