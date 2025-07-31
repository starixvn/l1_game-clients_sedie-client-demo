import Styles from './reconnecting.module.scss';
import blurBgGame from '../../../assets/rng-soccer/blur-bg-game.png';
import { useSentryHelper } from '../../hooks/useSentryHelper';
import { SentryLogLevel } from '../../utils/sentry/sentry-types';
import React from 'react';

export const Loading: React.FC = () => {
    const { logInfo } = useSentryHelper({
        componentName: 'Loading',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Log component render in useEffect to prevent infinite re-renders
    React.useEffect(() => {
        logInfo('Loading component rendered', {
            timestamp: Date.now()
        });
    }, []);

    return (
        <div className={Styles['reconnecting-container']}>
            <img src={blurBgGame} alt="Blurred background" />
            <div className={Styles['spinner']}></div>
        </div>
    );
};

export default Loading;
