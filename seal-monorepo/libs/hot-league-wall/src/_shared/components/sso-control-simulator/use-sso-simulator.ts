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
        ...initialState
    });

    /**
     * Toggle failure mode
     */
    const toggleFailureMode = useCallback(() => {
        setState(prev => ({
            ...prev,
            isFailureMode: !prev.isFailureMode
        }));
    }, []);

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

    return {
        // State
        ...state,

        // Actions
        toggleFailureMode,
        resetFailureCount,
        incrementFailureCount,
        toggleControls,

        // Computed values
        shouldSimulateFailure,
        getNextFailureMessage
    };
}; 