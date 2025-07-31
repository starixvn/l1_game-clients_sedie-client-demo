// @/sentry - Main entry point for all Sentry-related functionality

// Core exports
export {
    sentryManager,
    configureSentryManager,
    enableSentryManager,
    disableSentryManager,
    setSentryLogLevel,
    startSentryWorkflow,
    updateSentryWorkflow,
    completeSentryWorkflow,
    trackSentryPerformance,
    setLocalStorageConfig,
    clearLocalStorageConfig
} from './core/sentry-manager';

// Configuration exports
export {
    initializeSentryForProject,
    configureSentryForEnvironment,
    configureComponentByType,
    getCurrentConfiguration,
    configureComponentsBatch
} from './core/sentry-config';

// Session replay exports
export {
    initializeSentryWithSessionReplay,
    configureSessionReplayForEnvironment,
    startCustomSessionReplay,
    stopSessionReplay,
    addSessionReplayData,
    setUserContext,
    setTags,
    setExtra,
    blockElement,
    ignoreElement,
    unblockElement,
    unignoreElement
} from './core/sentry-session-replay';

// Type exports
export type {
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    LocalStorageConfig,
    SentryManagerConfig,
    UseSentryHelperOptions,
    WorkflowTracker
} from './core/sentry-types';

// Enum exports
export {
    SentryLogLevel,
    WorkflowState
} from './core/sentry-types';

// Utils exports
export {
    configureSentry,
    enableSentry,
    disableSentry,
    setLogLevel,
    configureComponent,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance,
    logInfo,
    logError,
    logWarning,
    logDebug,
    logTrace,
    SentryHelper,
    sentryHelper,
    updateSentryConfiguration
} from './utils/sentry-helper';

export {
    configureSentryBatched,
    enableSentryBatched,
    disableSentryBatched,
    setLogLevelBatched,
    configureComponentBatched,
    refreshComponentConfigBatched,
    refreshAllComponentConfigsBatched,
    startWorkflowBatched,
    updateWorkflowBatched,
    completeWorkflowBatched,
    trackPerformanceBatched,
    logErrorBatched,
    logWarningBatched,
    logInfoBatched,
    logDebugBatched,
    logTraceBatched,
    flushAllBatchesBatched,
    flushComponentBatchesBatched,
    getBatchStatsBatched,
    setLocalStorageConfig as setLocalStorageConfigBatched,
    clearLocalStorageConfig as clearLocalStorageConfigBatched,
    setComponentLocalStorageConfig,
    clearComponentLocalStorageConfig,
    getAllComponentConfigs
} from './utils/sentry-helper-batched';

// Batch manager exports
export {
    sentryBatchManager,
    addBatchedLog,
    flushAllBatches,
    flushComponentBatches,
    getBatchStats,
    cleanupBatchManager
} from './utils/sentry-batch-manager';

// Game cron batch manager exports
export {
    sentryGameCronBatchManager,
    addGameCronLog,
    flushAllGameCronBatches,
    flushGameCronBatches,
    getGameCronBatchStats,
    getRegisteredGameCrons,
    cleanupGameCronBatchManager
} from './utils/sentry-game-cron-batch-manager';

// Hooks exports
export { useSentryHelper } from './hooks/useSentryHelper';
export { useSentryHelperBatched } from './hooks/useSentryHelperBatched';
export { useGameCronSentry } from './hooks/useGameCronSentry';
export { useSessionReplay } from './hooks/useSessionReplay';
export { useComponentSentry } from './hooks/useComponentSentry';

// Components exports
export { LoggingDemo } from './components';
export { SentryLogContext, SentryLogProvider, useGameSentryLogger, useSentryLog } from './components/sentry-log-context';

// Re-export the default SentryManager class
export { default as SentryManager } from './core/sentry-manager'; 