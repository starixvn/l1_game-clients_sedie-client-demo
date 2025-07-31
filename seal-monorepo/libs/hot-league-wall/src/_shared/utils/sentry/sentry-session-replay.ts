// Re-export from the main sentry module
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
} from '../../../sentry'; 