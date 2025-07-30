import { useCallback, useEffect, useRef } from 'react';
import {
    startCustomSessionReplay,
    stopSessionReplay,
    addSessionReplayData,
    setUserContext,
    setTags,
    setExtra,
    blockElement,
    ignoreElement,
    unblockElement,
    unignoreElement,
    Sentry
} from '../utils/sentry/sentry-session-replay';

/**
 * React hook for Session Replay functionality
 * Provides easy access to Session Replay features throughout the application
 */
export const useSessionReplay = (componentName?: string) => {
    const sessionReplayRef = useRef<{
        isRecording: boolean;
        sessionId?: string;
        startTime?: number;
    }>({
        isRecording: false
    });

    // Start a custom session replay
    const startReplay = useCallback((name: string, context?: Record<string, any>) => {
        try {
            startCustomSessionReplay(name, {
                componentName,
                ...context,
                timestamp: Date.now()
            });

            sessionReplayRef.current = {
                isRecording: true,
                startTime: Date.now()
            };

            console.log(`Session replay context set: ${name}`, { componentName, context });
        } catch (error) {
            console.error('Failed to set session replay context:', error);
        }
    }, [componentName]);

    // Stop the current session replay
    const stopReplay = useCallback(() => {
        try {
            stopSessionReplay();

            sessionReplayRef.current = {
                isRecording: false,
                startTime: undefined
            };

            console.log('Session replay context cleared', { componentName });
        } catch (error) {
            console.error('Failed to clear session replay context:', error);
        }
    }, [componentName]);

    // Add data to the current session replay
    const addData = useCallback((data: Record<string, any>) => {
        try {
            addSessionReplayData({
                componentName,
                ...data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to add session replay data:', error);
        }
    }, [componentName]);

    // Set user context
    const setUser = useCallback((user: {
        id?: string;
        email?: string;
        username?: string;
        [key: string]: any;
    }) => {
        try {
            setUserContext({
                ...user,
                componentName: componentName || 'unknown'
            });
        } catch (error) {
            console.error('Failed to set user context:', error);
        }
    }, [componentName]);

    // Set tags
    const setComponentTags = useCallback((tags: Record<string, string>) => {
        try {
            setTags({
                componentName: componentName || 'unknown',
                ...tags
            });
        } catch (error) {
            console.error('Failed to set tags:', error);
        }
    }, [componentName]);

    // Set extra context
    const setExtraContext = useCallback((extra: Record<string, any>) => {
        try {
            setExtra({
                componentName,
                ...extra
            });
        } catch (error) {
            console.error('Failed to set extra context:', error);
        }
    }, [componentName]);

    // Block an element from being recorded
    const blockElementFromReplay = useCallback((element: HTMLElement) => {
        try {
            blockElement(element);
            console.log('Element blocked from session replay', { componentName });
        } catch (error) {
            console.error('Failed to block element:', error);
        }
    }, [componentName]);

    // Ignore an element from being recorded
    const ignoreElementFromReplay = useCallback((element: HTMLElement) => {
        try {
            ignoreElement(element);
            console.log('Element ignored in session replay', { componentName });
        } catch (error) {
            console.error('Failed to ignore element:', error);
        }
    }, [componentName]);

    // Unblock an element
    const unblockElementFromReplay = useCallback((element: HTMLElement) => {
        try {
            unblockElement(element);
            console.log('Element unblocked from session replay', { componentName });
        } catch (error) {
            console.error('Failed to unblock element:', error);
        }
    }, [componentName]);

    // Unignore an element
    const unignoreElementFromReplay = useCallback((element: HTMLElement) => {
        try {
            unignoreElement(element);
            console.log('Element unignored in session replay', { componentName });
        } catch (error) {
            console.error('Failed to unignore element:', error);
        }
    }, [componentName]);

    // Track user interactions
    const trackInteraction = useCallback((interaction: string, data?: Record<string, any>) => {
        try {
            addSessionReplayData({
                type: 'user_interaction',
                interaction,
                componentName,
                ...data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to track interaction:', error);
        }
    }, [componentName]);

    // Track component lifecycle
    const trackLifecycle = useCallback((lifecycle: 'mount' | 'unmount' | 'update', data?: Record<string, any>) => {
        try {
            addSessionReplayData({
                type: 'component_lifecycle',
                lifecycle,
                componentName,
                ...data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to track lifecycle:', error);
        }
    }, [componentName]);

    // Track errors
    const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
        try {
            addSessionReplayData({
                type: 'error',
                error: error instanceof Error ? error.message : error,
                componentName,
                ...context,
                timestamp: Date.now()
            });
        } catch (err) {
            console.error('Failed to track error:', err);
        }
    }, [componentName]);

    // Track performance
    const trackPerformance = useCallback((operation: string, duration: number, data?: Record<string, any>) => {
        try {
            addSessionReplayData({
                type: 'performance',
                operation,
                duration,
                componentName,
                ...data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to track performance:', error);
        }
    }, [componentName]);

    // Auto-track component lifecycle
    useEffect(() => {
        if (componentName) {
            trackLifecycle('mount', { autoTracked: true });

            return () => {
                trackLifecycle('unmount', { autoTracked: true });
            };
        }
    }, [componentName, trackLifecycle]);

    return {
        // Session replay controls
        startReplay,
        stopReplay,
        addData,

        // Context management
        setUser,
        setTags: setComponentTags,
        setExtra: setExtraContext,

        // Privacy controls
        blockElement: blockElementFromReplay,
        ignoreElement: ignoreElementFromReplay,
        unblockElement: unblockElementFromReplay,
        unignoreElement: unignoreElementFromReplay,

        // Tracking utilities
        trackInteraction,
        trackLifecycle,
        trackError,
        trackPerformance,

        // State
        isRecording: sessionReplayRef.current.isRecording,
        sessionId: sessionReplayRef.current.sessionId,
        startTime: sessionReplayRef.current.startTime,

        // Direct Sentry access
        Sentry
    };
};

/**
 * Hook for tracking specific user journeys
 */
export const useUserJourneyTracking = (journeyName: string) => {
    const { startReplay, stopReplay, addData, trackInteraction } = useSessionReplay(journeyName);

    const startJourney = useCallback((context?: Record<string, any>) => {
        startReplay(`User Journey: ${journeyName}`, context);
    }, [journeyName, startReplay]);

    const endJourney = useCallback((success = true, context?: Record<string, any>) => {
        addData({
            type: 'journey_end',
            success,
            ...context
        });
        stopReplay();
    }, [addData, stopReplay]);

    const trackJourneyStep = useCallback((step: string, data?: Record<string, any>) => {
        trackInteraction(`journey_step_${step}`, {
            journeyName,
            step,
            ...data
        });
    }, [journeyName, trackInteraction]);

    return {
        startJourney,
        endJourney,
        trackJourneyStep
    };
};

/**
 * Hook for tracking form interactions
 */
export const useFormTracking = (formName: string) => {
    const { trackInteraction, addData } = useSessionReplay(formName);

    const trackFormStart = useCallback((data?: Record<string, any>) => {
        trackInteraction('form_start', {
            formName,
            ...data
        });
    }, [formName, trackInteraction]);

    const trackFormField = useCallback((fieldName: string, action: 'focus' | 'blur' | 'change', data?: Record<string, any>) => {
        trackInteraction(`form_field_${action}`, {
            formName,
            fieldName,
            action,
            ...data
        });
    }, [formName, trackInteraction]);

    const trackFormSubmit = useCallback((success: boolean, data?: Record<string, any>) => {
        trackInteraction('form_submit', {
            formName,
            success,
            ...data
        });
    }, [formName, trackInteraction]);

    const trackFormError = useCallback((error: string, fieldName?: string, data?: Record<string, any>) => {
        addData({
            type: 'form_error',
            formName,
            error,
            fieldName,
            ...data
        });
    }, [formName, addData]);

    return {
        trackFormStart,
        trackFormField,
        trackFormSubmit,
        trackFormError
    };
};

/**
 * Hook for tracking game interactions
 */
export const useGameTracking = (gameName: string) => {
    const { trackInteraction, addData, trackPerformance } = useSessionReplay(gameName);

    const trackGameStart = useCallback((data?: Record<string, any>) => {
        trackInteraction('game_start', {
            gameName,
            ...data
        });
    }, [gameName, trackInteraction]);

    const trackGameAction = useCallback((action: string, data?: Record<string, any>) => {
        trackInteraction(`game_action_${action}`, {
            gameName,
            action,
            ...data
        });
    }, [gameName, trackInteraction]);

    const trackGameEnd = useCallback((result: string, data?: Record<string, any>) => {
        trackInteraction('game_end', {
            gameName,
            result,
            ...data
        });
    }, [gameName, trackInteraction]);

    const trackGamePerformance = useCallback((operation: string, duration: number, data?: Record<string, any>) => {
        trackPerformance(`game_${operation}`, duration, {
            gameName,
            ...data
        });
    }, [gameName, trackPerformance]);

    const trackGameError = useCallback((error: string, data?: Record<string, any>) => {
        addData({
            type: 'game_error',
            gameName,
            error,
            ...data
        });
    }, [gameName, addData]);

    return {
        trackGameStart,
        trackGameAction,
        trackGameEnd,
        trackGamePerformance,
        trackGameError
    };
};

export default useSessionReplay; 