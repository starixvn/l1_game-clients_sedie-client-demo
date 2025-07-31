// Example usage file - placeholder
// This file is used for demonstration purposes
import React from 'react';
import { useSentryHelperBatched, SentryLogLevel } from '../../../sentry';

export const ExampleUsage: React.FC = () => {
    const { logInfo, logError } = useSentryHelperBatched({
        componentName: 'ExampleUsage',
        logLevel: SentryLogLevel.INFO
    });

    const handleClick = () => {
        logInfo('Button clicked');
    };

    return (
        <div>
            <button onClick={handleClick}>Test Sentry</button>
        </div>
    );
}; 