import React from 'react';
import { ScenarioResetWrapperProps } from '../types';

export const ScenarioResetWrapper: React.FC<ScenarioResetWrapperProps> = ({
    scenarioKey,
    children
}) => {
    return <>{children(scenarioKey)}</>;
}; 