import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { sentryManager, configureSentryManager, SentryLogLevel } from '../core/sentry-manager';
import { default as SentryManager } from '../core/sentry-manager';
import { useSessionReplay } from '../hooks/useSessionReplay';

// Types for the Sentry-integrated logging system
export interface SentryLogEntry {
    id: string;
    timestamp: number;
    message: string;
    sessionId?: string;
    gameId?: string;
    componentName?: string;
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    metadata?: Record<string, any>;
}

export interface SentryLogState {
    logs: SentryLogEntry[];
    sessionId: string;
    gameId?: string;
    isEnabled: boolean;
    sentryManager: SentryManager | null;
}

export interface SentryLogContextType {
    // State
    logs: SentryLogEntry[];
    sessionId: string;
    gameId?: string;
    isEnabled: boolean;

    // Actions
    addLog: (message: string, options?: Partial<Omit<SentryLogEntry, 'id' | 'timestamp'>>) => void;
    getMergedLogs: () => string;
    clearLogs: () => void;
    setSessionId: (sessionId: string) => void;
    setGameId: (gameId: string) => void;
    setEnabled: (enabled: boolean) => void;
    sendLogsToSentry: () => Promise<void>;

    // Sentry-specific methods
    logTrace: (message: string, metadata?: Record<string, any>) => void;
    logDebug: (message: string, metadata?: Record<string, any>) => void;
    logInfo: (message: string, metadata?: Record<string, any>) => void;
    logWarn: (message: string, metadata?: Record<string, any>) => void;
    logError: (message: string, metadata?: Record<string, any>) => void;
    logFatal: (message: string, metadata?: Record<string, any>) => void;

    // Session Replay methods
    startSessionReplay: (name: string, context?: Record<string, any>) => void;
    stopSessionReplay: () => void;
    addSessionReplayData: (data: Record<string, any>) => void;
    trackInteraction: (interaction: string, data?: Record<string, any>) => void;
    trackLifecycle: (lifecycle: 'mount' | 'unmount' | 'update', data?: Record<string, any>) => void;
    trackError: (error: Error | string, context?: Record<string, any>) => void;
    trackPerformance: (operation: string, duration: number, data?: Record<string, any>) => void;

    // Session Replay state
    isRecording: boolean;
    sessionReplayId?: string;
}

// Action types for the reducer
type SentryLogAction =
    | { type: 'ADD_LOG'; payload: SentryLogEntry }
    | { type: 'CLEAR_LOGS' }
    | { type: 'SET_SESSION_ID'; payload: string }
    | { type: 'SET_GAME_ID'; payload: string }
    | { type: 'SET_ENABLED'; payload: boolean }
    | { type: 'SET_SENTRY_MANAGER'; payload: SentryManager };

// Initial state
const initialState: SentryLogState = {
    logs: [],
    sessionId: generateSessionId(),
    gameId: undefined,
    isEnabled: true,
    sentryManager: null,
};

// Generate a unique session ID
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Reducer function
function sentryLogReducer(state: SentryLogState, action: SentryLogAction): SentryLogState {
    switch (action.type) {
        case 'ADD_LOG':
            return {
                ...state,
                logs: [...state.logs, action.payload],
            };
        case 'CLEAR_LOGS':
            return {
                ...state,
                logs: [],
            };
        case 'SET_SESSION_ID':
            return {
                ...state,
                sessionId: action.payload,
            };
        case 'SET_GAME_ID':
            return {
                ...state,
                gameId: action.payload,
            };
        case 'SET_ENABLED':
            return {
                ...state,
                isEnabled: action.payload,
            };
        case 'SET_SENTRY_MANAGER':
            return {
                ...state,
                sentryManager: action.payload,
            };
        default:
            return state;
    }
}

// Create the context
const SentryLogContext = createContext<SentryLogContextType | undefined>(undefined);
SentryLogContext.displayName = 'SentryLogContext';

// Provider component
interface SentryLogProviderProps {
    children: React.ReactNode;
    sessionId?: string;
    gameId?: string;
    enabled?: boolean;
    maxLogs?: number;
    autoSendOnUnmount?: boolean;
    sentryConfig?: {
        dsn: string;
        environment: string;
        componentName: string;
        release?: string;
        debug?: boolean;
        logLevel?: SentryLogLevel;
    };
}

export const SentryLogProvider: React.FC<SentryLogProviderProps> = ({
    children,
    sessionId,
    gameId,
    enabled = true,
    maxLogs = 1000,
    autoSendOnUnmount = false,
    sentryConfig
}) => {
    // Initialize Session Replay
    const sessionReplay = useSessionReplay(sentryConfig?.componentName || 'SentryLogProvider');
    const [state, dispatch] = useReducer(sentryLogReducer, {
        ...initialState,
        sessionId: sessionId || initialState.sessionId,
        gameId,
        isEnabled: enabled,
    });

    const maxLogsRef = useRef(maxLogs);
    const autoSendOnUnmountRef = useRef(autoSendOnUnmount);

    // Use refs to store current state values to avoid dependency issues
    const stateRef = useRef(state);
    stateRef.current = state;

    // Initialize Sentry Manager - only run once when sentryConfig changes
    useEffect(() => {
        if (sentryConfig) {
            try {
                configureSentryManager({
                    dsn: sentryConfig.dsn,
                    environment: sentryConfig.environment,
                    componentName: sentryConfig.componentName,
                    release: sentryConfig.release,
                    debug: sentryConfig.debug,
                    logLevel: sentryConfig.logLevel || SentryLogLevel.INFO,
                });

                const sentryManager = SentryManager.getInstance();
                dispatch({ type: 'SET_SENTRY_MANAGER', payload: sentryManager });

                // Log initialization (this is the only immediate log sent to Sentry)
                sentryManager.logInfo('SentryLogProvider initialized', {
                    sessionId: stateRef.current.sessionId,
                    gameId: stateRef.current.gameId,
                    enabled: stateRef.current.isEnabled,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Failed to initialize Sentry Manager:', error);
            }
        }
    }, [sentryConfig]); // Only depend on sentryConfig

    // Update maxLogs when prop changes
    useEffect(() => {
        maxLogsRef.current = maxLogs;
    }, [maxLogs]);

    // Update autoSendOnUnmount when prop changes
    useEffect(() => {
        autoSendOnUnmountRef.current = autoSendOnUnmount;
    }, [autoSendOnUnmount]);

    // Auto-send logs on unmount if enabled
    useEffect(() => {
        return () => {
            if (autoSendOnUnmountRef.current && stateRef.current.logs.length > 0) {
                sendLogsToSentry().catch(console.error);
            }
        };
    }, []); // Empty dependency array since we use refs

    // Add a log entry
    const addLog = useCallback((
        message: string,
        options: Partial<Omit<SentryLogEntry, 'id' | 'timestamp'>> = {}
    ) => {
        if (!stateRef.current.isEnabled) return;

        const logEntry: SentryLogEntry = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message,
            sessionId: stateRef.current.sessionId,
            gameId: stateRef.current.gameId,
            level: 'info',
            ...options,
        };

        dispatch({ type: 'ADD_LOG', payload: logEntry });

        // Note: Logs are only sent to Sentry when sendLogsToSentry() is called
        // This prevents too many requests to Sentry during gameplay

        // Trim logs if they exceed maxLogs - use ref to avoid dependency issues
        if (stateRef.current.logs.length >= maxLogsRef.current) {
            const trimmedLogs = stateRef.current.logs.slice(-maxLogsRef.current + 1);
            dispatch({ type: 'CLEAR_LOGS' });
            trimmedLogs.forEach(log => dispatch({ type: 'ADD_LOG', payload: log }));
        }
    }, []); // Empty dependency array since we use refs

    // Get merged logs as a string
    const getMergedLogs = useCallback(() => {
        return stateRef.current.logs
            .map(log => {
                const timestamp = new Date(log.timestamp).toISOString();
                const prefix = `[${timestamp}] [${log.sessionId}]`;
                const gamePrefix = log.gameId ? ` [Game:${log.gameId}]` : '';
                const componentPrefix = log.componentName ? ` [${log.componentName}]` : '';
                const levelPrefix = ` [${log.level.toUpperCase()}]`;
                return `${prefix}${gamePrefix}${componentPrefix}${levelPrefix}: ${log.message}`;
            })
            .join('\n');
    }, []); // Empty dependency array since we use refs

    // Clear all logs
    const clearLogs = useCallback(() => {
        dispatch({ type: 'CLEAR_LOGS' });
    }, []);

    // Set session ID
    const setSessionId = useCallback((sessionId: string) => {
        dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    }, []);

    // Set game ID
    const setGameId = useCallback((gameId: string) => {
        dispatch({ type: 'SET_GAME_ID', payload: gameId });
    }, []);

    // Set enabled state
    const setEnabled = useCallback((enabled: boolean) => {
        dispatch({ type: 'SET_ENABLED', payload: enabled });
    }, []);

    // Send logs to Sentry
    const sendLogsToSentry = useCallback(async () => {
        if (stateRef.current.logs.length === 0) {
            console.warn('No logs to send to Sentry');
            return;
        }

        if (!stateRef.current.sentryManager) {
            console.warn('Sentry Manager not initialized');
            return;
        }

        try {
            // Send each log individually to Sentry with proper metadata
            stateRef.current.logs.forEach(log => {
                const metadata = {
                    sessionId: log.sessionId,
                    gameId: log.gameId,
                    componentName: log.componentName,
                    logId: log.id,
                    timestamp: log.timestamp,
                    ...log.metadata,
                };

                switch (log.level) {
                    case 'trace':
                        stateRef.current.sentryManager!.logTrace(log.message, metadata);
                        break;
                    case 'debug':
                        stateRef.current.sentryManager!.logDebug(log.message, metadata);
                        break;
                    case 'info':
                        stateRef.current.sentryManager!.logInfo(log.message, metadata);
                        break;
                    case 'warn':
                        stateRef.current.sentryManager!.logWarning(log.message, metadata);
                        break;
                    case 'error':
                        stateRef.current.sentryManager!.logError(log.message, metadata);
                        break;
                    case 'fatal':
                        stateRef.current.sentryManager!.logFatal(log.message, metadata);
                        break;
                }
            });

            // Send a final summary log
            const mergedLogs = getMergedLogs();
            const logSummary = {
                totalLogs: stateRef.current.logs.length,
                sessionId: stateRef.current.sessionId,
                gameId: stateRef.current.gameId,
                mergedLogs,
                timestamp: Date.now(),
            };

            stateRef.current.sentryManager.logInfo('Game session completed - all logs sent', logSummary);

            console.log(`Successfully sent ${stateRef.current.logs.length} logs to Sentry`);
            clearLogs();
        } catch (error) {
            console.error('Failed to send logs to Sentry:', error);
            throw error;
        }
    }, [clearLogs, getMergedLogs]); // Depend on clearLogs and getMergedLogs

    // Sentry-specific logging methods
    const logTrace = useCallback((message: string, metadata?: Record<string, any>) => {
        addLog(message, { level: 'trace', metadata });
    }, [addLog]);

    const logDebug = useCallback((message: string, metadata?: Record<string, any>) => {
        addLog(message, { level: 'debug', metadata });
    }, [addLog]);

    const logInfo = useCallback((message: string, metadata?: Record<string, any>) => {
        addLog(message, { level: 'info', metadata });
    }, [addLog]);

    const logWarn = useCallback((message: string, metadata?: Record<string, any>) => {
        addLog(message, { level: 'warn', metadata });
    }, [addLog]);

    const logError = useCallback((message: string, metadata?: Record<string, any>) => {
        addLog(message, { level: 'error', metadata });
    }, [addLog]);

    const logFatal = useCallback((message: string, metadata?: Record<string, any>) => {
        addLog(message, { level: 'fatal', metadata });
    }, [addLog]);

    const contextValue: SentryLogContextType = React.useMemo(() => ({
        logs: state.logs,
        sessionId: state.sessionId,
        gameId: state.gameId,
        isEnabled: state.isEnabled,
        addLog,
        getMergedLogs,
        clearLogs,
        setSessionId,
        setGameId,
        setEnabled,
        sendLogsToSentry,
        logTrace,
        logDebug,
        logInfo,
        logWarn,
        logError,
        logFatal,

        // Session Replay methods
        startSessionReplay: sessionReplay.startReplay,
        stopSessionReplay: sessionReplay.stopReplay,
        addSessionReplayData: sessionReplay.addData,
        trackInteraction: sessionReplay.trackInteraction,
        trackLifecycle: sessionReplay.trackLifecycle,
        trackError: sessionReplay.trackError,
        trackPerformance: sessionReplay.trackPerformance,

        // Session Replay state
        isRecording: sessionReplay.isRecording,
        sessionReplayId: sessionReplay.sessionId,
    }), [
        state.logs,
        state.sessionId,
        state.gameId,
        state.isEnabled,
        addLog,
        getMergedLogs,
        clearLogs,
        setSessionId,
        setGameId,
        setEnabled,
        sendLogsToSentry,
        logTrace,
        logDebug,
        logInfo,
        logWarn,
        logError,
        logFatal,
        sessionReplay.startReplay,
        sessionReplay.stopReplay,
        sessionReplay.addData,
        sessionReplay.trackInteraction,
        sessionReplay.trackLifecycle,
        sessionReplay.trackError,
        sessionReplay.trackPerformance,
        sessionReplay.isRecording,
        sessionReplay.sessionId,
    ]);

    return (
        <SentryLogContext.Provider value={contextValue}>
            {children}
        </SentryLogContext.Provider>
    );
};

// Hook to use the Sentry log context
export const useSentryLog = (): SentryLogContextType => {
    const context = useContext(SentryLogContext);
    if (context === undefined) {
        throw new Error('useSentryLog must be used within a SentryLogProvider');
    }
    return context;
};

// Utility hook for game-specific Sentry logging
export const useGameSentryLogger = (componentName?: string) => {
    const sentryLogContext = useSentryLog();
    const addLogRef = useRef(sentryLogContext.addLog);
    const componentNameRef = useRef(componentName);

    // Update refs when they change
    addLogRef.current = sentryLogContext.addLog;
    componentNameRef.current = componentName;

    const gameLogger = useCallback((
        message: string,
        level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' = 'info',
        metadata?: Record<string, any>
    ) => {
        addLogRef.current(message, {
            level,
            componentName: componentNameRef.current,
            metadata,
        });
    }, []); // No dependencies since we use refs

    const logTrace = useCallback((message: string, metadata?: Record<string, any>) =>
        gameLogger(message, 'trace', metadata), [gameLogger]);
    const logDebug = useCallback((message: string, metadata?: Record<string, any>) =>
        gameLogger(message, 'debug', metadata), [gameLogger]);
    const logInfo = useCallback((message: string, metadata?: Record<string, any>) =>
        gameLogger(message, 'info', metadata), [gameLogger]);
    const logWarn = useCallback((message: string, metadata?: Record<string, any>) =>
        gameLogger(message, 'warn', metadata), [gameLogger]);
    const logError = useCallback((message: string, metadata?: Record<string, any>) =>
        gameLogger(message, 'error', metadata), [gameLogger]);
    const logFatal = useCallback((message: string, metadata?: Record<string, any>) =>
        gameLogger(message, 'fatal', metadata), [gameLogger]);

    return {
        log: gameLogger,
        logTrace,
        logDebug,
        logInfo,
        logWarn,
        logError,
        logFatal,
    };
};

// Export context for direct usage if needed
export { SentryLogContext }; 