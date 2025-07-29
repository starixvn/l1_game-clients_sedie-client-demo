# Sentry Session Replay Setup Guide

This guide provides comprehensive instructions for setting up and using Sentry Session Replay in the HotLeagueWall project.

## 🎯 **Overview**

Sentry Session Replay allows you to see exactly what users experienced when errors occurred, providing valuable context for debugging and improving user experience.

## 📦 **Installation**

### **1. Install Sentry React SDK**

The `@sentry/react` package has been installed in the project:

```bash
npm install @sentry/react
```

**Version**: `^9.42.1` (minimum required: `7.27.0`)

### **2. Configuration Files**

The following files have been created for Session Replay:

-   `src/_shared/utils/sentry-session-replay.ts` - Main Session Replay configuration
-   `src/_shared/hooks/useSessionReplay.ts` - React hooks for Session Replay
-   Updated `src/app.tsx` - Integration with main App component

## ⚙️ **Configuration**

### **Environment-Specific Settings**

The Session Replay is configured differently for each environment:

#### **Development Environment**

```typescript
{
    replaysSessionSampleRate: 1.0,    // 100% recording for debugging
    replaysOnErrorSampleRate: 1.0,    // 100% error sessions
    maskAllText: false,               // Show text for debugging
    blockAllMedia: false,             // Show media for debugging
    sendDefaultPii: true              // Send PII for debugging
}
```

#### **Production Environment**

```typescript
{
    replaysSessionSampleRate: 0.1,    // 10% recording for privacy
    replaysOnErrorSampleRate: 1.0,    // 100% error sessions
    maskAllText: true,                // Mask text for privacy
    blockAllMedia: true,              // Block media for privacy
    sendDefaultPii: false             // Don't send PII for privacy
}
```

#### **Test Environment**

```typescript
{
    replaysSessionSampleRate: 0.0,    // 0% recording to avoid noise
    replaysOnErrorSampleRate: 0.0,    // 0% error sessions
    maskAllText: true,
    blockAllMedia: true,
    sendDefaultPii: false
}
```

## 🚀 **Usage**

### **1. Basic Session Replay Hook**

```typescript
import { useSessionReplay } from '../_shared/hooks/useSessionReplay';

const MyComponent = () => {
    const {
        startReplay,
        stopReplay,
        addData,
        trackInteraction,
        trackError,
        trackPerformance
    } = useSessionReplay('MyComponent');

    // Set custom session replay context
    const handleStartGame = () => {
        startReplay('Game Session', {
            gameType: 'RNG Soccer',
            userId: 'user123'
        });
        trackInteraction('game_started');
    };

    // Track user interactions
    const handleButtonClick = () => {
        trackInteraction('button_clicked', {
            buttonId: 'play-button',
            timestamp: Date.now()
        });
    };

    // Track errors
    const handleError = (error: Error) => {
        trackError(error, {
            context: 'game_initialization',
            userId: 'user123'
        });
    };

    // Track performance
    const measurePerformance = async () => {
        const startTime = performance.now();
        await expensiveOperation();
        const duration = performance.now() - startTime;
        trackPerformance('expensive_operation', duration);
    };

    return (
        <div>
            <button onClick={handleStartGame}>Start Game</button>
            <button onClick={handleButtonClick}>Click Me</button>
        </div>
    );
};
```

### **2. User Journey Tracking**

```typescript
import { useUserJourneyTracking } from '../_shared/hooks/useSessionReplay';

const LoginFlow = () => {
    const { startJourney, endJourney, trackJourneyStep } = useUserJourneyTracking('Login Flow');

    useEffect(() => {
        startJourney({
            flowType: 'user_login',
            timestamp: Date.now()
        });
    }, []);

    const handleEmailEntered = () => {
        trackJourneyStep('email_entered');
    };

    const handlePasswordEntered = () => {
        trackJourneyStep('password_entered');
    };

    const handleLoginSuccess = () => {
        trackJourneyStep('login_success');
        endJourney(true, { loginMethod: 'email' });
    };

    const handleLoginError = () => {
        trackJourneyStep('login_error');
        endJourney(false, { errorType: 'invalid_credentials' });
    };

    return (
        <form>
            <input onBlur={handleEmailEntered} placeholder="Email" />
            <input onBlur={handlePasswordEntered} placeholder="Password" />
            <button onClick={handleLoginSuccess}>Login</button>
        </form>
    );
};
```

### **3. Form Tracking**

```typescript
import { useFormTracking } from '../_shared/hooks/useSessionReplay';

const BettingForm = () => {
    const {
        trackFormStart,
        trackFormField,
        trackFormSubmit,
        trackFormError
    } = useFormTracking('Betting Form');

    useEffect(() => {
        trackFormStart();
    }, []);

    const handleFieldFocus = (fieldName: string) => {
        trackFormField(fieldName, 'focus');
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        trackFormField(fieldName, 'change', { value });
    };

    const handleSubmit = async () => {
        try {
            await submitBet();
            trackFormSubmit(true);
        } catch (error) {
            trackFormError(error.message);
            trackFormSubmit(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                onFocus={() => handleFieldFocus('amount')}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                placeholder="Bet Amount"
            />
            <button type="submit">Place Bet</button>
        </form>
    );
};
```

### **4. Game Tracking**

```typescript
import { useGameTracking } from '../_shared/hooks/useSessionReplay';

const RNGSoccerGame = () => {
    const {
        trackGameStart,
        trackGameAction,
        trackGameEnd,
        trackGamePerformance,
        trackGameError
    } = useGameTracking('RNG Soccer');

    useEffect(() => {
        trackGameStart({
            gameMode: 'single_player',
            stakeLevel: 'medium'
        });
    }, []);

    const handleBetPlaced = async (betData: any) => {
        const startTime = performance.now();

        try {
            await placeBet(betData);
            const duration = performance.now() - startTime;

            trackGameAction('bet_placed', betData);
            trackGamePerformance('bet_placement', duration);
        } catch (error) {
            trackGameError(error.message);
        }
    };

    const handleGameEnd = (result: string) => {
        trackGameEnd(result, {
            totalBets: 5,
            totalWinnings: 100
        });
    };

    return (
        <div>
            <button onClick={() => handleBetPlaced({ choice: 'home', amount: 10 })}>
                Bet on Home
            </button>
        </div>
    );
};
```

## 🔒 **Privacy Controls**

### **1. Element Blocking**

```typescript
import { useSessionReplay } from '../_shared/hooks/useSessionReplay';

const SensitiveComponent = () => {
    const { blockElement, ignoreElement } = useSessionReplay('SensitiveComponent');

    useEffect(() => {
        // Block sensitive elements from being recorded
        const sensitiveElement = document.getElementById('sensitive-data');
        if (sensitiveElement) {
            blockElement(sensitiveElement);
        }

        // Ignore elements that don't need to be recorded
        const debugElement = document.getElementById('debug-info');
        if (debugElement) {
            ignoreElement(debugElement);
        }
    }, []);

    return (
        <div>
            <div id="sensitive-data">Private Information</div>
            <div id="debug-info">Debug Info</div>
        </div>
    );
};
```

### **2. CSS Classes for Privacy**

You can also use CSS classes to control privacy:

```css
/* Block elements from session replay */
.sentry-block {
    /* This element will be blocked */
}

/* Ignore elements in session replay */
.sentry-ignore {
    /* This element will be ignored */
}
```

```html
<div class="sentry-block">This will be blocked</div>
<div class="sentry-ignore">This will be ignored</div>
```

## 📊 **Monitoring and Analytics**

### **1. Session Replay Data**

Session Replay captures:

-   **User interactions** (clicks, scrolls, form inputs)
-   **Network requests** (API calls, responses)
-   **Console logs** (errors, warnings, info)
-   **Performance metrics** (load times, render times)
-   **Custom events** (business logic, user journeys)

### **2. Privacy-First Approach**

The configuration ensures:

-   **Text masking** in production to protect user data
-   **Media blocking** to prevent sensitive content capture
-   **PII filtering** to remove personal information
-   **Selective recording** to minimize data collection

### **3. Error Context**

When errors occur, Session Replay provides:

-   **Visual context** of what the user was doing
-   **User journey** leading to the error
-   **Network state** at the time of error
-   **Console state** with relevant logs
-   **Performance metrics** around the error

## 🔧 **Advanced Configuration**

### **1. Custom Network Filtering**

```typescript
// In sentry-session-replay.ts
networkDetailAllowUrls: [
    window.location.origin,
    /\/api\//,
    /\/auth\//,
    /\/game\//
],
networkDetailDenyUrls: [
    /\/admin\//,
    /\/internal\//,
    /\/sensitive\//
]
```

### **2. Custom Error Filtering**

```typescript
// In sentry-session-replay.ts
ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /Game connection timeout/,
    /Network request failed/,
];
```

### **3. Custom URL Filtering**

```typescript
// In sentry-session-replay.ts
ignoreUrls: [/chrome-extension:\/\//, /moz-extension:\/\//, /safari-extension:\/\//];
```

## 🚀 **Best Practices**

### **1. Performance Optimization**

-   Use appropriate sampling rates for your environment
-   Block unnecessary elements to reduce data size
-   Monitor Session Replay impact on application performance

### **2. Privacy Compliance**

-   Always mask sensitive text in production
-   Block media content that might contain PII
-   Use selective recording to minimize data collection
-   Implement proper consent mechanisms

### **3. Debugging Efficiency**

-   Use descriptive session names
-   Add relevant context to custom events
-   Track user journeys for better error context
-   Monitor Session Replay data quality

### **4. Error Correlation**

-   Correlate Session Replay with error reports
-   Use Session Replay to understand error context
-   Track user actions leading to errors
-   Monitor error patterns in Session Replay

## 📈 **Monitoring Dashboard**

### **Key Metrics to Track**

1. **Session Replay Coverage**

    - Percentage of sessions recorded
    - Percentage of error sessions recorded
    - Session Replay data quality

2. **Performance Impact**

    - Session Replay initialization time
    - Memory usage impact
    - Network bandwidth usage

3. **Privacy Compliance**

    - Text masking effectiveness
    - Media blocking success rate
    - PII filtering accuracy

4. **Error Context Quality**
    - Error sessions with replay data
    - User journey completeness
    - Network state availability

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Session Replay Not Recording**

    - Check DSN configuration
    - Verify sampling rates
    - Check browser console for errors

2. **Performance Issues**

    - Reduce sampling rates
    - Block unnecessary elements
    - Monitor memory usage

3. **Privacy Concerns**

    - Enable text masking
    - Block sensitive elements
    - Review PII filtering

4. **Data Quality Issues**
    - Check network filtering
    - Verify error filtering
    - Review custom event data

## 📚 **Additional Resources**

-   [Sentry Session Replay Documentation](https://docs.sentry.io/product/session-replay/)
-   [Session Replay Configuration Guide](https://docs.sentry.io/platforms/javascript/guides/react/session-replay/)
-   [Privacy and Security Best Practices](https://docs.sentry.io/product/session-replay/privacy/)
-   [Performance Optimization Guide](https://docs.sentry.io/product/session-replay/performance/)

## 🎉 **Conclusion**

Sentry Session Replay is now fully integrated into the HotLeagueWall project with:

-   ✅ **Environment-specific configurations**
-   ✅ **Privacy-first approach**
-   ✅ **Comprehensive React hooks**
-   ✅ **User journey tracking**
-   ✅ **Form and game interaction tracking**
-   ✅ **Performance monitoring**
-   ✅ **Error context enhancement**

The implementation provides powerful debugging capabilities while maintaining user privacy and application performance.
