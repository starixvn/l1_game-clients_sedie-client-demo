import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';

// Types for the logging system
export interface LogEntry {
    id: string;
    timestamp: number;
    message: string;
    sessionId?: string;
    gameId?: string;
    componentName?: string;
    level?: 'info' | 'warn' | 'error' | 'debug';
    metadata?: Record<string, any>;
}

export interface LogState {
    logs: LogEntry[];
    sessionId: string;
    gameId?: string;
    isEnabled: boolean;
}

export interface LogContextType {
    // State
    logs: LogEntry[];
    sessionId: string;
    gameId?: string;
    isEnabled: boolean;

    // Actions
    addLog: (message: string, options?: Partial<Omit<LogEntry, 'id' | 'timestamp'>>) => void;
    getMergedLogs: () => string;
    clearLogs: () => void;
    setSessionId: (sessionId: string) => void;
    setGameId: (gameId: string) => void;
    setEnabled: (enabled: boolean) => void;
    sendLogsToBackend: (endpoint?: string) => Promise<void>;
}

// Action types for the reducer
type LogAction =
    | { type: 'ADD_LOG'; payload: LogEntry }
    | { type: 'CLEAR_LOGS' }
    | { type: 'SET_SESSION_ID'; payload: string }
    | { type: 'SET_GAME_ID'; payload: string }
    | { type: 'SET_ENABLED'; payload: boolean };

// Initial state
const initialState: LogState = {
    logs: [],
    sessionId: generateSessionId(),
    gameId: undefined,
    isEnabled: true,
};

// Generate a unique session ID
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Reducer function
function logReducer(state: LogState, action: LogAction): LogState {
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
        default:
            return state;
    }
}

// Create the context
const LogContext = createContext<LogContextType | undefined>(undefined);
LogContext.displayName = 'LogContext';

// Provider component
interface LogProviderProps {
    children: React.ReactNode;
    sessionId?: string;
    gameId?: string;
    enabled?: boolean;
    maxLogs?: number;
    autoSendOnUnmount?: boolean;
    sendEndpoint?: string;
}

export const LogProvider: React.FC<LogProviderProps> = ({
    children,
    sessionId,
    gameId,
    enabled = true,
    maxLogs = 1000,
    autoSendOnUnmount = false,
    sendEndpoint = '/api/send-logs',
}) => {
    const [state, dispatch] = useReducer(logReducer, {
        ...initialState,
        sessionId: sessionId || initialState.sessionId,
        gameId,
        isEnabled: enabled,
    });

    const maxLogsRef = useRef(maxLogs);
    const sendEndpointRef = useRef(sendEndpoint);
    const autoSendOnUnmountRef = useRef(autoSendOnUnmount);

    // Update maxLogs when prop changes
    useEffect(() => {
        maxLogsRef.current = maxLogs;
    }, [maxLogs]);

    // Update sendEndpoint when prop changes
    useEffect(() => {
        sendEndpointRef.current = sendEndpoint;
    }, [sendEndpoint]);

    // Update autoSendOnUnmount when prop changes
    useEffect(() => {
        autoSendOnUnmountRef.current = autoSendOnUnmount;
    }, [autoSendOnUnmount]);

    // Auto-send logs on unmount if enabled
    useEffect(() => {
        return () => {
            if (autoSendOnUnmountRef.current && state.logs.length > 0) {
                sendLogsToBackend(sendEndpointRef.current).catch(console.error);
            }
        };
    }, [state.logs.length]);

    // Add a log entry
    const addLog = useCallback((
        message: string,
        options: Partial<Omit<LogEntry, 'id' | 'timestamp'>> = {}
    ) => {
        if (!state.isEnabled) return;

        const logEntry: LogEntry = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message,
            sessionId: state.sessionId,
            gameId: state.gameId,
            level: 'info',
            ...options,
        };

        dispatch({ type: 'ADD_LOG', payload: logEntry });

        // Trim logs if they exceed maxLogs
        if (state.logs.length >= maxLogsRef.current) {
            const trimmedLogs = state.logs.slice(-maxLogsRef.current + 1);
            dispatch({ type: 'CLEAR_LOGS' });
            trimmedLogs.forEach(log => dispatch({ type: 'ADD_LOG', payload: log }));
        }
    }, [state.isEnabled, state.sessionId, state.gameId, state.logs.length]);

    // Get merged logs as a string
    const getMergedLogs = useCallback(() => {
        return state.logs
            .map(log => {
                const timestamp = new Date(log.timestamp).toISOString();
                const prefix = `[${timestamp}] [${log.sessionId}]`;
                const gamePrefix = log.gameId ? ` [Game:${log.gameId}]` : '';
                const componentPrefix = log.componentName ? ` [${log.componentName}]` : '';
                const levelPrefix = log.level ? ` [${log.level.toUpperCase()}]` : '';
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

    // Send logs to backend
    const sendLogsToBackend = useCallback(async (endpoint?: string) => {
        if (state.logs.length === 0) {
            console.warn('No logs to send');
            return;
        }

        const targetEndpoint = endpoint || sendEndpointRef.current;
        const mergedLogs = getMergedLogs();

        try {
            const response = await fetch(targetEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: state.sessionId,
                    gameId: state.gameId,
                    logs: state.logs,
                    mergedLogs,
                    timestamp: Date.now(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send logs: ${response.status} ${response.statusText}`);
            }

            console.log(`Successfully sent ${state.logs.length} logs to backend`);
            clearLogs();
        } catch (error) {
            console.error('Failed to send logs to backend:', error);
            throw error;
        }
    }, [state.logs, state.sessionId, state.gameId, getMergedLogs, clearLogs]);

    const contextValue: LogContextType = {
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
        sendLogsToBackend,
    };

    return (
        <LogContext.Provider value={contextValue}>
            {children}
        </LogContext.Provider>
    );
};

// Hook to use the log context
export const useLog = (): LogContextType => {
    const context = useContext(LogContext);
    if (context === undefined) {
        throw new Error('useLog must be used within a LogProvider');
    }
    return context;
};

// Utility hook for game-specific logging
export const useGameLogger = (componentName?: string) => {
    const logContext = useLog();

    const gameLogger = useCallback((
        message: string,
        level: 'info' | 'warn' | 'error' | 'debug' = 'info',
        metadata?: Record<string, any>
    ) => {
        logContext.addLog(message, {
            level,
            componentName,
            metadata,
        });
    }, [logContext, componentName]);

    return {
        ...logContext,
        log: gameLogger,
        logInfo: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'info', metadata),
        logWarn: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'warn', metadata),
        logError: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'error', metadata),
        logDebug: (message: string, metadata?: Record<string, any>) =>
            gameLogger(message, 'debug', metadata),
    };
};

// Export context for direct usage if needed
export { LogContext }; 