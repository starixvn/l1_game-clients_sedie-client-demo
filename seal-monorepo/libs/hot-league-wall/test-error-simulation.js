/**
 * Test Error Simulation Script for Hot League Wall
 *
 * This script demonstrates how to run the hot-league-wall component in test mode
 * to simulate errors and test Sentry session replay functionality.
 */

// Example usage in a browser environment
console.log('🧪 Hot League Wall Error Simulation Test');
console.log('==========================================');

// Example of how to initialize the app in test mode
const initializeTestMode = () => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        // Example of how to render the app in test mode
        const testConfig = {
            appEnv: 'test',
            siteId: 'test-site-123',
            language: 'en',
            testMode: true, // This enables the error testing page
        };

        console.log('Test configuration:', testConfig);
        console.log('✅ Test mode enabled - Error simulator will be available');

        // In a real React app, you would render like this:
        // ReactDOM.render(
        //     <App {...testConfig} />,
        //     document.getElementById('root')
        // );

        return testConfig;
    } else {
        console.log('❌ This script should run in a browser environment');
        return null;
    }
};

// Example of how to trigger specific error scenarios
const triggerErrorScenarios = () => {
    console.log('\n🎯 Available Error Scenarios:');
    console.log('1. Null Reference Error - Simulates accessing null object properties');
    console.log('2. Network Error - Simulates failed network requests');
    console.log('3. State Error - Simulates state mutation errors');
    console.log('4. Workflow Error - Simulates workflow step failures');
    console.log('5. Performance Error - Simulates slow operations');
    console.log('6. User Interaction Error - Simulates DOM element not found');
    console.log('7. Random Error - Randomly selects one of the above');

    console.log('\n📋 Instructions:');
    console.log('- Load the app with testMode: true');
    console.log('- Click "Show Error Simulator" button');
    console.log('- Use individual error buttons or "Random Error"');
    console.log('- Enable "Auto Error Simulation" for continuous testing');
    console.log('- Check Sentry dashboard for session replay breadcrumbs');
};

// Example of how to check Sentry configuration
const checkSentryConfig = () => {
    console.log('\n🔧 Sentry Configuration Check:');

    // Example configuration (replace with actual values)
    const sentryConfig = {
        dsn: 'https://your-dsn@sentry.io/project',
        environment: 'test',
        componentName: 'HotLeagueWall',
        release: '1.0.0',
        debug: true,
        logLevel: 'ERROR',
    };

    console.log('Sentry Config:', sentryConfig);
    console.log('✅ Session replay will be enabled for ERROR level logs');
    console.log('✅ All error simulations will create session replay breadcrumbs');
};

// Example of how to monitor error logs
const monitorErrorLogs = () => {
    console.log('\n📊 Error Log Monitoring:');
    console.log('All error simulations will log with the following format:');
    console.log('Session replay: [Error Type] error occurred');
    console.log('With metadata including:');
    console.log('- error: Error message');
    console.log('- errorType: Type of error simulated');
    console.log('- timestamp: When the error occurred');
    console.log('- operation: Operation that triggered the error');
    console.log('- Additional context specific to each error type');
};

// Run the demonstration
const runDemo = () => {
    console.log('\n🚀 Starting Error Simulation Demo...\n');

    initializeTestMode();
    triggerErrorScenarios();
    checkSentryConfig();
    monitorErrorLogs();

    console.log('\n✅ Demo completed!');
    console.log('To test in a real environment:');
    console.log('1. Set testMode: true in your App component props');
    console.log('2. Load the hot-league-wall component');
    console.log('3. Use the error simulator interface');
    console.log('4. Check Sentry for session replay breadcrumbs');
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeTestMode,
        triggerErrorScenarios,
        checkSentryConfig,
        monitorErrorLogs,
        runDemo,
    };
}

// Run demo if this script is executed directly
if (typeof window !== 'undefined') {
    // Auto-run in browser environment
    setTimeout(runDemo, 1000);
} else {
    // Export for Node.js environment
    module.exports = {
        initializeTestMode,
        triggerErrorScenarios,
        checkSentryConfig,
        monitorErrorLogs,
        runDemo,
    };
}
