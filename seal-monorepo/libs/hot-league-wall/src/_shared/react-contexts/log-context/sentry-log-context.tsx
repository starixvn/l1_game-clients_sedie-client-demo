import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { sentryManager, configureSentryManager } from '../../utils/sentry/sentry-manager';
import SentryManager from '../../utils/sentry/sentry-manager';
import { SentryLogLevel } from '../../utils/sentry/sentry-types';

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
    const [state, dispatch] = useReducer(sentryLogReducer, {
        ...initialState,
        sessionId: sessionId || initialState.sessionId,
        gameId,
        isEnabled: enabled,
    });

    const maxLogsRef = useRef(maxLogs);
    const autoSendOnUnmountRef = useRef(autoSendOnUnmount);

    // Initialize Sentry Manager
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

                // Log initialization
                sentryManager.logInfo('SentryLogProvider initialized', {
                    sessionId: state.sessionId,
                    gameId: state.gameId,
                    enabled: state.isEnabled,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Failed to initialize Sentry Manager:', error);
            }
        }
    }, [sentryConfig, state.sessionId, state.gameId, state.isEnabled]);

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
            if (autoSendOnUnmountRef.current && state.logs.length > 0) {
                sendLogsToSentry().catch(console.error);
            }
        };
    }, [state.logs.length]);

    // Add a log entry
    const addLog = useCallback((
        message: string,
        options: Partial<Omit<SentryLogEntry, 'id' | 'timestamp'>> = {}
    ) => {
        if (!state.isEnabled) return;

        const logEntry: SentryLogEntry = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message,
            sessionId: state.sessionId,
            gameId: state.gameId,
            level: 'info',
            ...options,
        };

        dispatch({ type: 'ADD_LOG', payload: logEntry });

        // Also send to Sentry if manager is available
        if (state.sentryManager) {
            const metadata = {
                sessionId: state.sessionId,
                gameId: state.gameId,
                ...options.metadata,
            };

            switch (logEntry.level) {
                case 'trace':
                    state.sentryManager.logTrace(message, metadata);
                    break;
                case 'debug':
                    state.sentryManager.logDebug(message, metadata);
                    break;
                case 'info':
                    state.sentryManager.logInfo(message, metadata);
                    break;
                case 'warn':
                    state.sentryManager.logWarning(message, metadata);
                    break;
                case 'error':
                    state.sentryManager.logError(message, metadata);
                    break;
                case 'fatal':
                    state.sentryManager.logFatal(message, metadata);
                    break;
            }
        }

        // Trim logs if they exceed maxLogs
        if (state.logs.length >= maxLogsRef.current) {
            const trimmedLogs = state.logs.slice(-maxLogsRef.current + 1);
            dispatch({ type: 'CLEAR_LOGS' });
            trimmedLogs.forEach(log => dispatch({ type: 'ADD_LOG', payload: log }));
        }
    }, [state.isEnabled, state.sessionId, state.gameId, state.logs.length, state.sentryManager]);

    // Get merged logs as a string
    const getMergedLogs = useCallback(() => {
        return state.logs
            .map(log => {
                const timestamp = new Date(log.timestamp).toISOString();
                const prefix = `[${timestamp}] [${log.sessionId}]`;
                const gamePrefix = log.gameId ? ` [Game:${log.gameId}]` : '';
                const componentPrefix = log.componentName ? ` [${log.componentName}]` : '';
                const levelPrefix = ` [${log.level.toUpperCase()}]`;
                return `${prefix}${gamePrefix}${componentPrefix}${levelPrefix}: ${log.message}`;
            })
            .join('\n');
    }, [state.logs]);

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
        if (state.logs.length === 0) {
            console.warn('No logs to send to Sentry');
            return;
        }

        if (!state.sentryManager) {
            console.warn('Sentry Manager not initialized');
            return;
        }

        try {
            // Send a summary log to Sentry
            const mergedLogs = getMergedLogs();
            const logSummary = {
                totalLogs: state.logs.length,
                sessionId: state.sessionId,
                gameId: state.gameId,
                logs: state.logs,
                mergedLogs,
                timestamp: Date.now(),
            };

            state.sentryManager.logInfo('Game session logs summary', logSummary);

            console.log(`Successfully sent ${state.logs.length} logs to Sentry`);
            clearLogs();
        } catch (error) {
            console.error('Failed to send logs to Sentry:', error);
            throw error;
        }
    }, [state.logs, state.sessionId, state.gameId, state.sentryManager, getMergedLogs, clearLogs]);

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

    const contextValue: SentryLogContextType = {
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
    };

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

    const gameLogger = useCallback((
        message: string,
        level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' = 'info',
        metadata?: Record<string, any>
    ) => {
        sentryLogContext.addLog(message, {
            level,
            componentName,
            metadata,
        });
    }, [sentryLogContext, componentName]);

    return {
        ...sentryLogContext,
        log: gameLogger,
        logTrace: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'trace', metadata),
        logDebug: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'debug', metadata),
        logInfo: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'info', metadata),
        logWarn: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'warn', metadata),
        logError: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'error', metadata),
        logFatal: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'fatal', metadata),
    };
};

// Export context for direct usage if needed
export { SentryLogContext }; 