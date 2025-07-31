import React, { useState, useEffect } from 'react';
import { useSentryHelperBatched } from '../hooks/useSentryHelperBatched';

import { SentryLogLevel, WorkflowState } from '../core/sentry-types';
import { sentryBatchManager } from '../utils/sentry-batch-manager';
import {
    flushAllBatchesBatched,
    getBatchStatsBatched
} from '../utils/sentry-helper-batched';

// Example component demonstrating the new batched Sentry logging system
export const ExampleBatchedSentryComponent: React.FC = () => {
    const [count, setCount] = useState(0);
    const [batchStats, setBatchStats] = useState<Record<string, { logCount: number; lastFlushTime: number }>>({});

    // Initialize the batched Sentry helper
    const {
        logInfo,
        logError,
        logWarning,
        workflow,
        trackPerformance,
        flushBatches,
        getBatchStats
    } = useSentryHelperBatched({
        componentName: 'ExampleBatchedSentryComponent',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Example of logging different types of events
    const handleButtonClick = async () => {
        const workflowId = workflow.start('Button Click Action', {
            buttonId: 'example-button',
            timestamp: Date.now()
        });

        try {
            logInfo('User clicked the example button', {
                buttonId: 'example-button',
                count: count + 1
            });

            // Simulate some async operation
            await trackPerformance('Async Operation', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return 'Operation completed';
            });

            logInfo('Async operation completed successfully');

            workflow.complete(workflowId, true, { result: 'success' });
            setCount(prev => prev + 1);

        } catch (error) {
            logError('Failed to process button click', {
                error: error instanceof Error ? error.message : String(error),
                workflowId
            });

            workflow.complete(workflowId, false, { error: String(error) });
        }
    };

    // Example of error logging
    const handleErrorButton = () => {
        logError('This is a test error', {
            source: 'error-button',
            timestamp: Date.now()
        });
    };

    // Example of warning logging
    const handleWarningButton = () => {
        logWarning('This is a test warning', {
            source: 'warning-button',
            timestamp: Date.now()
        });
    };

    // Example of performance tracking
    const handlePerformanceTest = async () => {
        await trackPerformance('Complex Calculation', async () => {
            // Simulate complex calculation
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.random();
            }
            return result;
        });
    };

    // Example of manual batch flushing
    const handleFlushBatches = async () => {
        logInfo('Manually flushing batches');
        await flushBatches();
        logInfo('Batches flushed successfully');
    };

    // Example of getting batch statistics
    const handleGetStats = () => {
        const stats = getBatchStats();
        setBatchStats(stats);
        logInfo('Retrieved batch statistics', { stats });
    };

    // Example of workflow tracking with multiple steps
    const handleComplexWorkflow = async () => {
        const workflowId = workflow.start('Complex Workflow', {
            steps: ['init', 'process', 'validate', 'complete']
        });

        try {
            // Step 1: Initialize
            workflow.update(workflowId, WorkflowState.IN_PROGRESS, { step: 'init' });
            logInfo('Initializing complex workflow');
            await new Promise(resolve => setTimeout(resolve, 50));

            // Step 2: Process
            workflow.update(workflowId, WorkflowState.IN_PROGRESS, { step: 'process' });
            logInfo('Processing workflow data');
            await new Promise(resolve => setTimeout(resolve, 100));

            // Step 3: Validate
            workflow.update(workflowId, WorkflowState.IN_PROGRESS, { step: 'validate' });
            logInfo('Validating workflow results');
            await new Promise(resolve => setTimeout(resolve, 75));

            // Step 4: Complete
            workflow.update(workflowId, WorkflowState.IN_PROGRESS, { step: 'complete' });
            logInfo('Workflow completed successfully');

            workflow.complete(workflowId, true, {
                totalSteps: 4,
                duration: Date.now()
            });

        } catch (error) {
            logError('Complex workflow failed', {
                workflowId,
                error: String(error)
            });
            workflow.complete(workflowId, false, { error: String(error) });
        }
    };

    // Example of batch configuration
    const handleConfigureBatches = () => {
        // Configure batch settings
        sentryBatchManager.setFlushInterval(2000); // 2 seconds
        sentryBatchManager.setMaxBatchSize(25); // 25 logs per batch

        logInfo('Batch configuration updated', {
            flushInterval: 2000,
            maxBatchSize: 25
        });
    };

    // Update batch stats periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setBatchStats(getBatchStats());
        }, 1000);

        return () => clearInterval(interval);
    }, [getBatchStats]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Batched Sentry Logging Example</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>Basic Logging</h3>
                <button onClick={handleButtonClick} style={{ marginRight: '10px' }}>
                    Log Info ({count} clicks)
                </button>
                <button onClick={handleErrorButton} style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}>
                    Log Error
                </button>
                <button onClick={handleWarningButton} style={{ backgroundColor: '#ffd93d' }}>
                    Log Warning
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Performance Tracking</h3>
                <button onClick={handlePerformanceTest}>
                    Test Performance Tracking
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Workflow Tracking</h3>
                <button onClick={handleComplexWorkflow}>
                    Start Complex Workflow
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Batch Management</h3>
                <button onClick={handleFlushBatches} style={{ marginRight: '10px' }}>
                    Flush Batches
                </button>
                <button onClick={handleGetStats} style={{ marginRight: '10px' }}>
                    Get Stats
                </button>
                <button onClick={handleConfigureBatches}>
                    Configure Batches
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Batch Statistics</h3>
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '5px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                }}>
                    {Object.keys(batchStats).length === 0 ? (
                        <p>No active batches</p>
                    ) : (
                        Object.entries(batchStats).map(([component, stats]) => (
                            <div key={component}>
                                <strong>{component}:</strong> {stats.logCount} logs,
                                last flush: {new Date(stats.lastFlushTime).toLocaleTimeString()}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{
                backgroundColor: '#e9ecef',
                padding: '15px',
                borderRadius: '5px',
                fontSize: '14px'
            }}>
                <h4>How it works:</h4>
                <ul>
                    <li>Logs are batched by component name</li>
                    <li>Batches are automatically flushed every 5 seconds</li>
                    <li>High priority logs (error, warn) trigger immediate flush</li>
                    <li>All log details are preserved in Sentry context</li>
                    <li>Check Sentry dashboard to see batched events</li>
                </ul>
            </div>
        </div>
    );
};

// Example of using the simple hook for basic logging
export const SimpleBatchedSentryExample: React.FC = () => {
    const { logInfo, logError } = useSentryHelperBatched({
        componentName: 'SimpleExample',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    const handleSimpleLog = () => {
        logInfo('Simple log message');
    };

    const handleSimpleError = () => {
        logError('Simple error message');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Simple Batched Sentry Example</h3>
            <button onClick={handleSimpleLog} style={{ marginRight: '10px' }}>
                Simple Log
            </button>
            <button onClick={handleSimpleError} style={{ backgroundColor: '#ff6b6b' }}>
                Simple Error
            </button>
        </div>
    );
};

// Example of using the workflow-focused hook
export const WorkflowBatchedSentryExample: React.FC = () => {
    const { workflow, trackPerformance } = useSentryHelperBatched({
        componentName: 'WorkflowExample',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    const handleWorkflowTest = async () => {
        const workflowId = workflow.start('Test Workflow');

        try {
            await trackPerformance('Step 1', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return 'Step 1 completed';
            });

            workflow.update(workflowId, WorkflowState.IN_PROGRESS);

            await trackPerformance('Step 2', async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
                return 'Step 2 completed';
            });

            workflow.complete(workflowId, true);
        } catch (error) {
            workflow.complete(workflowId, false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Workflow Batched Sentry Example</h3>
            <button onClick={handleWorkflowTest}>
                Test Workflow with Performance Tracking
            </button>
        </div>
    );
}; 