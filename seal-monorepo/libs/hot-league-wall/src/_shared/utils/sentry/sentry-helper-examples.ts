// Sentry helper examples file - placeholder
// This file is used for demonstration purposes
import { sentryHelper, SentryLogLevel } from '../../../sentry';

// Example usage of sentry helper
export const exampleSentryHelperUsage = () => {
    // Configure sentry helper
    sentryHelper.initialize({
        enabled: true,
        defaultLogLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        enableConsoleOverride: true
    });

    // Configure a component
    sentryHelper.configureComponent('ExampleComponent', {
        logLevel: SentryLogLevel.DEBUG,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Log some messages
    sentryHelper.logInfo('ExampleComponent', 'Component initialized');
    sentryHelper.logDebug('ExampleComponent', 'Debug information', { debug: true });
}; 