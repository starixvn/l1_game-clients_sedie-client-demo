import React, { useCallback } from 'react';
import { SSOFailureModeLogicProps } from '../types';

export const SSOFailureModeLogic: React.FC<SSOFailureModeLogicProps> = ({
    showSSOControls,
    ssoSimulator,
    playButtonClickCount
}) => {
    const shouldShowSSOFailureMode = useCallback(() => {
        if (!showSSOControls) return false;

        if (ssoSimulator.isFailureMode) {
            return true;
        }

        if (ssoSimulator.isFirstClickInvalidTokenMode) {
            return playButtonClickCount > 0;
        }

        return false;
    }, [showSSOControls, ssoSimulator.isFailureMode, ssoSimulator.isFirstClickInvalidTokenMode, playButtonClickCount]);

    return null; // This component is for logic organization only
}; 