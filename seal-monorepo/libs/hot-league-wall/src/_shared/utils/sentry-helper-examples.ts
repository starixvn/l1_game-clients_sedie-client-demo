// Comprehensive examples for using SentryHelper
// This file demonstrates various usage patterns for the SentryHelper utility

import {
    sentryHelper,
    configureSentry,
    enableSentry,
    disableSentry,
    setLogLevel,
    configureComponent,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance
} from './sentry-helper';
import { SentryLogLevel, WorkflowState } from './sentry-types';

import { setLocalStorageConfig, clearLocalStorageConfig } from './sentry-session-replay';

// Example 1: Global Configuration
export const configureGlobalSentry = () => {
    // Initialize with custom configuration
    configureSentry({
        enabled: true,
        defaultLogLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true,
        enableConsoleOverride: true
    });

    // Or use convenience functions
    enableSentry();
    setLogLevel(SentryLogLevel.WARN);
};

// Example 2: Component-Specific Configuration
export const configureComponents = () => {
    // Configure different components with different log levels
    configureComponent('GameLobby', {
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    configureComponent('BettingSystem', {
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    configureComponent('UserProfile', {
        logLevel: SentryLogLevel.DISABLED,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });
};

// Example 3: Basic Logging
export const basicLoggingExample = () => {
    const componentName = 'GameLobby';

    // Log different types of events
    sentryHelper.logInfo(componentName, 'User entered game lobby', {
        userId: 'user123',
        lobbyId: 'lobby456',
        timestamp: Date.now()
    });

    sentryHelper.logWarning(componentName, 'User balance is low', {
        userId: 'user123',
        balance: 10.50,
        threshold: 20.00
    });

    try {
        // Simulate some operation that might fail
        throw new Error('Failed to join game room');
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        sentryHelper.logError(componentName, errorMessage, {
            userId: 'user123',
            gameRoomId: 'room789',
            action: 'join_game'
        });
    }
};

// Example 4: Workflow Tracking
export const workflowTrackingExample = async () => {
    const componentName = 'GameSession';
    const workflowId = 'game_session_123';

    // Start a workflow
    startWorkflow(workflowId, 'Game Session Initialization', componentName, {
        userId: 'user123',
        gameType: 'rng-soccer',
        betAmount: 100
    });

    try {
        // Update workflow state
        updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
            step: 'loading_game_assets',
            progress: 25
        });

        // Simulate some async operation
        await new Promise(resolve => setTimeout(resolve, 1000));

        updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
            step: 'connecting_to_server',
            progress: 50
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
            step: 'game_ready',
            progress: 100
        });

        // Complete workflow successfully
        completeWorkflow(workflowId, true, {
            sessionDuration: '2000ms',
            finalStatus: 'ready'
        });

    } catch (error: unknown) {
        // Complete workflow with failure
        completeWorkflow(workflowId, false, {
            error: error instanceof Error ? error.message : String(error),
            step: 'failed'
        });
    }
};

// Example 5: Performance Tracking
export const performanceTrackingExample = async () => {
    const componentName = 'DataLoader';

    // Track a simple operation
    const result = await trackPerformance(componentName, 'Load User Data', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return { userId: 'user123', name: 'John Doe' };
    });

    // Track a complex operation with error handling
    try {
        await trackPerformance(componentName, 'Process Payment', async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            throw new Error('Payment failed');
        });
    } catch (error: unknown) {
        // Error is automatically logged by trackPerformance
        console.log('Payment processing failed');
    }
};

// Example 6: Complex Workflow with Multiple Steps
export const complexWorkflowExample = async () => {
    const componentName = 'TournamentManager';
    const workflowId = 'tournament_creation_456';

    startWorkflow(workflowId, 'Tournament Creation', componentName, {
        tournamentName: 'Championship Cup',
        maxPlayers: 32,
        entryFee: 50
    });

    const steps = [
        { name: 'validate_tournament_config', duration: 200 },
        { name: 'create_tournament_record', duration: 300 },
        { name: 'setup_brackets', duration: 500 },
        { name: 'notify_participants', duration: 400 }
    ];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
            currentStep: step.name,
            progress: ((i + 1) / steps.length) * 100,
            stepNumber: i + 1,
            totalSteps: steps.length
        });

        try {
            await trackPerformance(componentName, step.name, async () => {
                await new Promise(resolve => setTimeout(resolve, step.duration));

                // Simulate potential failure in setup_brackets
                if (step.name === 'setup_brackets' && Math.random() > 0.8) {
                    throw new Error('Failed to setup tournament brackets');
                }
            });
        } catch (error) {
            completeWorkflow(workflowId, false, {
                failedStep: step.name,
                error: error instanceof Error ? error.message : String(error)
            });
            return;
        }
    }

    completeWorkflow(workflowId, true, {
        totalDuration: '1400ms',
        participantsNotified: 32,
        tournamentStatus: 'ready'
    });
};

// Example 7: Conditional Logging Based on Environment
export const conditionalLoggingExample = () => {
    const componentName = 'DebugPanel';
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Only log detailed info in development
    if (isDevelopment) {
        sentryHelper.logInfo(componentName, 'Debug information', {
            memoryUsage: process.memoryUsage(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`
        });
    }

    // Always log errors regardless of environment
    try {
        // Some operation that might fail
        throw new Error('Critical system error');
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        sentryHelper.logError(componentName, errorMessage, {
            environment: process.env.NODE_ENV,
            timestamp: Date.now()
        });
    }
};

// Example 8: Batch Operations with Workflow Tracking
export const batchOperationsExample = async () => {
    const componentName = 'DataProcessor';
    const workflowId = 'batch_processing_789';

    startWorkflow(workflowId, 'Batch Data Processing', componentName, {
        batchSize: 1000,
        operationType: 'user_data_cleanup'
    });

    const batchSize = 1000;
    const batchResults = {
        processed: 0,
        failed: 0,
        skipped: 0
    };

    for (let i = 0; i < batchSize; i += 100) {
        const batchId = `batch_${i}_${i + 99}`;

        updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, {
            currentBatch: batchId,
            progress: (i / batchSize) * 100,
            processed: batchResults.processed,
            failed: batchResults.failed
        });

        try {
            await trackPerformance(componentName, `Process Batch ${batchId}`, async () => {
                // Simulate batch processing
                await new Promise(resolve => setTimeout(resolve, 50));

                // Simulate some failures
                if (Math.random() > 0.95) {
                    throw new Error(`Batch ${batchId} processing failed`);
                }

                batchResults.processed += 100;
            });
        } catch (error) {
            batchResults.failed += 100;
            sentryHelper.logWarning(componentName, `Batch processing failed`, {
                batchId,
                error: error instanceof Error ? error.message : String(error),
                retryCount: 0
            });
        }
    }

    completeWorkflow(workflowId, true, {
        totalProcessed: batchResults.processed,
        totalFailed: batchResults.failed,
        successRate: (batchResults.processed / batchSize) * 100
    });
};

// Example 9: Error Recovery and Retry Logic
export const errorRecoveryExample = async () => {
    const componentName = 'ConnectionManager';
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await trackPerformance(componentName, `Connection Attempt ${attempt}`, async () => {
                // Simulate connection attempt
                await new Promise(resolve => setTimeout(resolve, 200));

                // Simulate connection failure
                if (Math.random() > 0.7) {
                    throw new Error(`Connection failed on attempt ${attempt}`);
                }
            });

            sentryHelper.logInfo(componentName, 'Connection established successfully', {
                attempt,
                duration: '200ms'
            });
            break;

        } catch (error) {
            sentryHelper.logWarning(componentName, 'Connection attempt failed', {
                attempt,
                maxRetries,
                error: error instanceof Error ? error.message : String(error),
                willRetry: attempt < maxRetries
            });

            if (attempt === maxRetries) {
                sentryHelper.logError(componentName, new Error('All connection attempts failed'), {
                    totalAttempts: maxRetries,
                    finalError: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }
};

// Example 10: User Interaction Tracking
export const userInteractionExample = () => {
    const componentName = 'UserInterface';

    const trackUserAction = (action: string, details: Record<string, any>) => {
        sentryHelper.logInfo(componentName, `User action: ${action}`, {
            action,
            ...details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    };

    const trackUserError = (action: string, error: string, details: Record<string, any>) => {
        sentryHelper.logWarning(componentName, `User error during ${action}`, {
            action,
            error,
            ...details,
            timestamp: Date.now()
        });
    };

    // Example usage
    trackUserAction('button_click', {
        buttonId: 'play_game',
        userId: 'user123',
        gameType: 'rng-soccer'
    });

    trackUserError('form_submission', 'Invalid bet amount', {
        userId: 'user123',
        betAmount: -50,
        formId: 'betting_form'
    });
};

// Example 11: LocalStorage-Based Logging Control
export const localStorageLoggingControlExample = () => {
    const componentName = 'LoggingController';

    // Enable info level logging in production
    const enableInfoLogging = () => {
        setLocalStorageConfig({
            logLevel: 'info',
            enabled: true,
            debugMode: true
        });

        sentryHelper.logInfo(componentName, 'Info level logging enabled via localStorage', {
            action: 'enable_info_logging',
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });

        // Reload page to apply changes
        console.log('Reload the page to apply logging changes');
    };

    // Enable debug level logging
    const enableDebugLogging = () => {
        setLocalStorageConfig({
            logLevel: 'debug',
            enabled: true,
            debugMode: true
        });

        sentryHelper.logInfo(componentName, 'Debug level logging enabled via localStorage', {
            action: 'enable_debug_logging',
            timestamp: Date.now()
        });

        console.log('Reload the page to apply logging changes');
    };

    // Disable logging
    const disableLogging = () => {
        setLocalStorageConfig({
            enabled: false
        });

        sentryHelper.logInfo(componentName, 'Logging disabled via localStorage', {
            action: 'disable_logging',
            timestamp: Date.now()
        });

        console.log('Reload the page to apply logging changes');
    };

    // Clear all logging settings
    const clearLoggingSettings = () => {
        clearLocalStorageConfig();

        sentryHelper.logInfo(componentName, 'Logging settings cleared via localStorage', {
            action: 'clear_logging_settings',
            timestamp: Date.now()
        });

        console.log('Reload the page to apply logging changes');
    };

    // Check current logging status
    const checkLoggingStatus = () => {
        try {
            const logLevel = localStorage.getItem('sentry_log_level') || 'info';
            const enabled = localStorage.getItem('sentry_enabled') !== 'false';
            const debugMode = localStorage.getItem('sentry_debug_mode') === 'true';

            sentryHelper.logInfo(componentName, 'Current logging status', {
                action: 'check_logging_status',
                logLevel,
                enabled,
                debugMode,
                timestamp: Date.now()
            });

            console.log('Current logging status:', { logLevel, enabled, debugMode });
        } catch (error) {
            console.error('Failed to check logging status:', error);
        }
    };

    // Example usage in browser console
    console.log('Available localStorage logging functions:');
    console.log('- enableInfoLogging()');
    console.log('- enableDebugLogging()');
    console.log('- disableLogging()');
    console.log('- clearLoggingSettings()');
    console.log('- checkLoggingStatus()');

    return {
        enableInfoLogging,
        enableDebugLogging,
        disableLogging,
        clearLoggingSettings,
        checkLoggingStatus
    };
};

// Example 12: Production Debugging with LocalStorage
export const productionDebuggingExample = () => {
    const componentName = 'ProductionDebugger';

    // This function can be called from browser console in production
    const enableProductionDebugging = () => {
        // Enable comprehensive logging for production debugging
        setLocalStorageConfig({
            logLevel: 'info',
            enabled: true,
            debugMode: true
        });

        sentryHelper.logInfo(componentName, 'Production debugging enabled', {
            action: 'enable_production_debugging',
            environment: process.env.NODE_ENV,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        console.log('Production debugging enabled. Reload the page to apply changes.');
        console.log('You can now see detailed info logs in Sentry for troubleshooting.');
    };

    // Enable specific component debugging
    const enableComponentDebugging = (componentName: string) => {
        sentryHelper.logInfo('ProductionDebugger', `Component debugging enabled for: ${componentName}`, {
            action: 'enable_component_debugging',
            targetComponent: componentName,
            timestamp: Date.now()
        });

        console.log(`Component debugging enabled for: ${componentName}`);
    };

    // Log current application state
    const logApplicationState = () => {
        const state = {
            url: window.location.href,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: Date.now(),
            localStorageConfig: {
                logLevel: localStorage.getItem('sentry_log_level'),
                enabled: localStorage.getItem('sentry_enabled'),
                debugMode: localStorage.getItem('sentry_debug_mode')
            }
        };

        sentryHelper.logInfo(componentName, 'Application state logged', {
            action: 'log_application_state',
            ...state
        });

        console.log('Application state logged to Sentry:', state);
    };

    return {
        enableProductionDebugging,
        enableComponentDebugging,
        logApplicationState
    };
}; 