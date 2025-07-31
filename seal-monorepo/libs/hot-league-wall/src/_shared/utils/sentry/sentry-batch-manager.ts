// Re-export from the main sentry module
export {
    sentryBatchManager,
    addBatchedLog,
    flushAllBatches,
    flushComponentBatches,
    getBatchStats,
    cleanupBatchManager
} from '../../../sentry'; 