import * as gc from '@sg/sg-game-client';
import React, { useEffect, useState } from 'react';
import Loading from '../../../_shared/components/loading';
import Styles from '../game-base.module.scss';
import { useSentryHelper } from '../../../_shared/hooks/useSentryHelper';
import { SentryLogLevel } from '../../../_shared/utils/sentry/sentry-types';

// Rendering components for different game states
export const GameLoadingView: React.FC = () => {
    return (
        <div className="col-md-1 mx-auto mt-5">
            <Loading />
        </div>
    );
};

export const GameDisconnectView: React.FC<{
    onReconnect: () => void;
    backgroundImage?: string | null;
    // SSO-specific props
    isSSOFailure?: boolean;
    customMessage?: string;
    customButtonText?: string;
    isLoading?: boolean;
    language?: string;
}> = ({ onReconnect, backgroundImage, isSSOFailure = false, customMessage, customButtonText, isLoading = false, language = 'en' }) => {
    // Initialize SentryHelper for GameDisconnectView
    const { logInfo, logWarning } = useSentryHelper({
        componentName: 'GameDisconnectView',
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });
    // Add minimum loading duration to prevent flashing
    const [stableLoading, setStableLoading] = useState(false);
    const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
    const MIN_LOADING_DURATION = 1000; // 1 second minimum

    useEffect(() => {
        if (isLoading && !stableLoading) {
            // Start loading
            setStableLoading(true);
            setLoadingStartTime(Date.now());
            logInfo('Game disconnect view loading started', {
                isSSOFailure,
                customMessage,
                timestamp: Date.now()
            });
        } else if (!isLoading && stableLoading) {
            // Check if minimum duration has passed
            const elapsed = Date.now() - (loadingStartTime || 0);
            if (elapsed >= MIN_LOADING_DURATION) {
                setStableLoading(false);
                setLoadingStartTime(null);
                logInfo('Game disconnect view loading completed', {
                    elapsed,
                    isSSOFailure,
                    timestamp: Date.now()
                });
            } else {
                // Wait for remaining time
                const remainingTime = MIN_LOADING_DURATION - elapsed;
                setTimeout(() => {
                    setStableLoading(false);
                    setLoadingStartTime(null);
                    logInfo('Game disconnect view loading completed after delay', {
                        totalElapsed: elapsed + remainingTime,
                        isSSOFailure,
                        timestamp: Date.now()
                    });
                }, remainingTime);
            }
        }
    }, [isLoading, stableLoading, loadingStartTime, logInfo, isSSOFailure, customMessage]);

    // Show loading view when requesting new token
    if (stableLoading) {
        return <GameLoadingView />;
    }

    // Use custom text for SSO failures, fallback to default for connection failures
    const messageText = customMessage || gc.Translator.t('Common.connect_failed');

    const buttonText = customButtonText || gc.Translator.t('Common.reconnect');

    return (
        <div className={`${Styles['disconnect-container']} ${backgroundImage ? Styles['has-background'] : ''}`}
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        >
            <div className={Styles['block-wrapper']}>
                <div className={Styles['reconnect-btn-container']}>
                    <p className={Styles['reconnect-text']}>{messageText}</p>
                    <button
                        className={`${'c-btn'} ${'c-btn--bet'} ${Styles['reconnect-btn']}`}
                        data-disabled={isLoading}
                        disabled={isLoading}
                        onClick={() => {
                            logInfo('Reconnect button clicked', {
                                isSSOFailure,
                                customMessage,
                                timestamp: Date.now()
                            });
                            onReconnect();
                        }}
                    >
                        <span className="c-text">{buttonText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}; 