import { useState, useCallback } from 'react';
import { SSOControlState } from './types';

/**
 * Custom Hook for SSO Simulation State Management
 * 
 * Single Responsibility: Manages SSO simulation state and logic
 * Open/Closed: Extensible through composition
 * Interface Segregation: Provides specific state management interface
 */
export const useSSOSimulator = (initialState?: Partial<SSOControlState>) => {
    const [state, setState] = useState<SSOControlState>({
        showControls: false,
        failureCount: 0,
        isFailureMode: false,
        isFirstClickInvalidTokenMode: false,
        ...initialState
    });

    /**
     * Generate a random failed token
     */
    const generateFailedToken = useCallback(() => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        return `INVALID_TOKEN_${timestamp}_${randomString}`;
    }, []);

    /**
     * Generate a random first click invalid token for simulation
     */
    const generateFirstClickInvalidToken = useCallback(() => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const randomLength = Math.floor(Math.random() * 30) + 15; // 15-45 characters
        const randomChars = Math.random().toString(36).substring(2, randomLength);
        return `FIRST_CLICK_INVALID_TOKEN_${timestamp}_${randomString}_${randomChars}`;
    }, []);

    /**
     * Toggle failure mode and generate new failed token when enabled
     */
    const toggleFailureMode = useCallback(() => {
        setState(prev => {
            const newFailureMode = !prev.isFailureMode;
            return {
                ...prev,
                isFailureMode: newFailureMode,
                // Generate a new failed token when enabling failure mode
                failedToken: newFailureMode ? generateFailedToken() : null
            };
        });
    }, [generateFailedToken]);

    /**
     * Toggle first click invalid token mode and generate new token when enabled
     */
    const toggleFirstClickInvalidTokenMode = useCallback(() => {
        setState(prev => {
            const newFirstClickInvalidTokenMode = !prev.isFirstClickInvalidTokenMode;
            return {
                ...prev,
                isFirstClickInvalidTokenMode: newFirstClickInvalidTokenMode,
                // Generate a new first click invalid token when enabling mode
                firstClickInvalidToken: newFirstClickInvalidTokenMode ? generateFirstClickInvalidToken() : null
            };
        });
    }, [generateFirstClickInvalidToken]);

    /**
     * Reset failure count
     */
    const resetFailureCount = useCallback(() => {
        setState(prev => ({
            ...prev,
            failureCount: 0
        }));
    }, []);

    /**
     * Increment failure count
     */
    const incrementFailureCount = useCallback(() => {
        setState(prev => ({
            ...prev,
            failureCount: prev.failureCount + 1
        }));
    }, []);

    /**
     * Toggle controls visibility
     */
    const toggleControls = useCallback(() => {
        setState(prev => ({
            ...prev,
            showControls: !prev.showControls
        }));
    }, []);

    /**
     * Check if should simulate failure
     */
    const shouldSimulateFailure = useCallback(() => {
        return state.isFailureMode;
    }, [state.isFailureMode]);

    /**
     * Check if should simulate first click invalid token
     */
    const shouldSimulateFirstClickInvalidToken = useCallback(() => {
        return state.isFirstClickInvalidTokenMode;
    }, [state.isFirstClickInvalidTokenMode]);

    /**
     * Get next failure message based on count
     */
    const getNextFailureMessage = useCallback(() => {
        const failureNumber = state.failureCount + 1;

        switch (failureNumber) {
            case 1:
                return 'Network timeout - Please check your connection';
            case 2:
                return 'Authentication failed - Invalid credentials';
            default:
                return 'Server error - Please try again later';
        }
    }, [state.failureCount]);

    /**
     * Get current failed token or generate new one if in failure mode
     */
    const getFailedToken = useCallback(() => {
        if (!state.isFailureMode) {
            return null;
        }
        return state.failedToken || generateFailedToken();
    }, [state.isFailureMode, state.failedToken, generateFailedToken]);

    /**
     * Get current first click invalid token or generate new one if in first click invalid token mode
     */
    const getFirstClickInvalidToken = useCallback(() => {
        if (!state.isFirstClickInvalidTokenMode) {
            return null;
        }
        return state.firstClickInvalidToken || generateFirstClickInvalidToken();
    }, [state.isFirstClickInvalidTokenMode, state.firstClickInvalidToken, generateFirstClickInvalidToken]);

    return {
        // State
        ...state,

        // Actions
        toggleFailureMode,
        toggleFirstClickInvalidTokenMode,
        resetFailureCount,
        incrementFailureCount,
        toggleControls,

        // Computed values
        shouldSimulateFailure,
        shouldSimulateFirstClickInvalidToken,
        getNextFailureMessage,
        getFailedToken,
        getFirstClickInvalidToken
    };
}; 