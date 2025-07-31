// Game cron example usage file - placeholder
// This file is used for demonstration purposes
import React from 'react';
import { useGameCronSentry, SentryLogLevel } from '../../../sentry';
import { sentryGameCronBatchManager } from './sentry-game-cron-batch-manager';

export const GameCronExampleUsage: React.FC = () => {
    const { logInfo, logError } = useGameCronSentry({
        gameCronId: 'example-game-cron-001',
        gameName: 'Example Game',
        systemType: 'SG',
        environment: 'LOCAL1'
    });

    const handleGameCron = () => {
        logInfo('Game cron executed');
    };

    return (
        <div>
            <button onClick={handleGameCron}>Test Game Cron</button>
        </div>
    );
}; 