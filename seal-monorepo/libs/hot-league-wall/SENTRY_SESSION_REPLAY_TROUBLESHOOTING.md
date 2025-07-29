# Sentry Session Replay Troubleshooting Guide

## 🔍 **Why Session Replay Shows "Set Up Now"**

If you're seeing the "Set up your React app with Session Replay" message in Sentry, here are the most common causes and solutions:

## 📋 **Step-by-Step Troubleshooting**

### **1. Check Sentry Plan & Session Replay Access**

#### **Verify Session Replay is Available**

1. Go to your **Sentry Dashboard**
2. Navigate to **Settings** → **Projects** → **Your Project**
3. Look for **Session Replay** in the left sidebar
4. If **Session Replay** is not visible, you need to:
    - **Upgrade your Sentry plan** (Session Replay is a premium feature)
    - **Contact Sentry support** to enable Session Replay

#### **Check Your Current Plan**

-   **Free Plan**: Session Replay is **NOT available**
-   **Team Plan**: Session Replay is **available** (limited)
-   **Business Plan**: Session Replay is **fully available**
-   **Enterprise Plan**: Session Replay is **fully available**

### **2. Verify DSN Configuration**

#### **Current DSN Setup**

Your project is configured with:

```json
{
    "sentry": {
        "dsn": "https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056",
        "environment": "LOCAL1"
    }
}
```

#### **Verify DSN in Sentry**

1. Go to **Settings** → **Projects** → **Your Project** → **Client Keys (DSN)**
2. Verify the DSN matches: `https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056`
3. Ensure the DSN is **active** and **not disabled**

### **3. Check Session Replay Configuration**

#### **Verify Session Replay Settings**

1. Go to **Settings** → **Projects** → **Your Project** → **Session Replay**
2. Ensure **Session Replay** is **enabled**
3. Check **sampling rates** are configured:
    - **Session Sample Rate**: Should be > 0 (e.g., 0.1 for 10%)
    - **Error Sample Rate**: Should be > 0 (e.g., 1.0 for 100%)

### **4. Verify Code Implementation**

#### **Check Initialization**

Ensure Session Replay is properly initialized in your app:

```typescript
// In src/app.tsx
React.useEffect(() => {
    const environment = process.env.NODE_ENV || 'development';

    // Initialize Sentry with Session Replay
    const sessionReplayConfig = configureSessionReplayForEnvironment(environment);
    initializeSentryWithSessionReplay(sessionReplayConfig);

    console.log('Sentry with Session Replay initialized for environment:', environment);
}, []);
```

#### **Check Console for Errors**

1. Open **Browser Developer Tools**
2. Go to **Console** tab
3. Look for any Sentry-related errors
4. Verify you see: `"Sentry with Session Replay initialized successfully"`

### **5. Test Session Replay Recording**

#### **Generate Test Data**

1. **Trigger an error** in your application
2. **Perform user interactions** (clicks, form inputs, navigation)
3. **Wait 1-2 minutes** for data to appear in Sentry

#### **Check Session Replay Data**

1. Go to **Issues** in your Sentry project
2. Click on an **error event**
3. Look for **Session Replay** tab
4. If no Session Replay tab, check **User Feedback** section

### **6. Environment-Specific Issues**

#### **Development Environment**

```typescript
{
    replaysSessionSampleRate: 1.0,    // 100% recording
    replaysOnErrorSampleRate: 1.0,    // 100% error sessions
    maskAllText: false,               // Show text for debugging
    blockAllMedia: false,             // Show media for debugging
    sendDefaultPii: true              // Send PII for debugging
}
```

#### **Production Environment**

```typescript
{
    replaysSessionSampleRate: 0.1,    // 10% recording
    replaysOnErrorSampleRate: 1.0,    // 100% error sessions
    maskAllText: true,                // Mask text for privacy
    blockAllMedia: true,              // Block media for privacy
    sendDefaultPii: false             // Don't send PII for privacy
}
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Set Up Now" Still Shows**

**Possible Causes:**

-   Session Replay not enabled in project settings
-   Wrong DSN being used
-   Code not properly initialized

**Solutions:**

1. **Enable Session Replay** in project settings
2. **Verify DSN** is correct and active
3. **Check initialization** in browser console
4. **Wait 5-10 minutes** for settings to propagate

### **Issue 2: No Session Replay Data**

**Possible Causes:**

-   Sampling rate too low
-   No errors triggered
-   Privacy settings blocking data

**Solutions:**

1. **Increase sampling rate** for testing
2. **Trigger test errors**
3. **Check privacy settings**
4. **Verify network connectivity**

### **Issue 3: Session Replay Tab Missing**

**Possible Causes:**

-   No Session Replay data for the error
-   Session Replay not properly configured
-   Browser compatibility issues

**Solutions:**

1. **Check error has Session Replay data**
2. **Verify Session Replay configuration**
3. **Test in different browser**
4. **Check Sentry plan includes Session Replay**

### **Issue 4: Performance Issues**

**Possible Causes:**

-   High sampling rates
-   Large DOM elements
-   Network issues

**Solutions:**

1. **Reduce sampling rates**
2. **Block unnecessary elements**
3. **Optimize network requests**
4. **Monitor performance impact**

## 🔧 **Debugging Steps**

### **Step 1: Enable Debug Mode**

```typescript
// In sentry-session-replay.ts
debug: true, // Enable debug logging
```

### **Step 2: Check Browser Console**

Look for these messages:

```
✅ "Sentry with Session Replay initialized successfully"
✅ "Session replay context set: [session name]"
✅ "Session replay data added: [data]"
```

### **Step 3: Verify Network Requests**

1. Open **Network** tab in DevTools
2. Filter by **"sentry"**
3. Look for requests to Sentry endpoints
4. Verify requests are successful (200 status)

### **Step 4: Test with Sample Error**

```typescript
// Add this to test Session Replay
const testError = () => {
    throw new Error('Test error for Session Replay');
};

// Call this function to trigger a test error
testError();
```

## 📊 **Monitoring & Verification**

### **Check Session Replay Metrics**

1. Go to **Performance** → **Session Replay**
2. Look for:
    - **Sessions recorded**
    - **Error sessions**
    - **Data quality metrics**

### **Verify Data Flow**

1. **User interaction** → **Session Replay capture**
2. **Error occurs** → **Error event created**
3. **Session Replay data** → **Correlated with error**
4. **Sentry dashboard** → **Session Replay tab available**

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

### **1. Check Sentry Status**

-   Visit [Sentry Status Page](https://status.sentry.io/)
-   Verify no ongoing issues

### **2. Review Documentation**

-   [Session Replay Setup Guide](https://docs.sentry.io/platforms/javascript/guides/react/session-replay/)
-   [Troubleshooting Guide](https://docs.sentry.io/product/session-replay/troubleshooting/)

### **3. Contact Support**

-   **Sentry Support**: For platform issues
-   **Your Team**: For code implementation issues

### **4. Enable Verbose Logging**

```typescript
// Add this to get more detailed logs
console.log('Sentry config:', sessionReplayConfig);
console.log('Environment:', process.env.NODE_ENV);
console.log('DSN:', appSettingsWithSentry.sentryDsn);
```

## ✅ **Success Checklist**

-   [ ] **Session Replay enabled** in Sentry project
-   [ ] **Correct DSN** configured and active
-   [ ] **Code properly initialized** (no console errors)
-   [ ] **Sampling rates** configured (> 0)
-   [ ] **Test errors** triggered and recorded
-   [ ] **Session Replay tab** visible in error events
-   [ ] **User interactions** captured in replay data

Once all items are checked, Session Replay should be working correctly! 🎉
