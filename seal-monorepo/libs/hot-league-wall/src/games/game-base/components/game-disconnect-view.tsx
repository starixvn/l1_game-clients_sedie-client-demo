import * as gc from '@sg/sg-game-client';
import React, { useEffect, useState } from 'react';
import Loading from '../../../_shared/components/loading';
import Styles from '../game-base.module.scss';

// Rendering components for different game states
export const GameLoadingView: React.FC = () => {
    console.log('🔴 GameLoadingView: Component rendered');
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
    // Add minimum loading duration to prevent flashing
    const [stableLoading, setStableLoading] = useState(false);
    const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
    const MIN_LOADING_DURATION = 1000; // 1 second minimum

    useEffect(() => {
        if (isLoading && !stableLoading) {
            // Start loading
            setStableLoading(true);
            setLoadingStartTime(Date.now());
        } else if (!isLoading && stableLoading) {
            // Check if minimum duration has passed
            const elapsed = Date.now() - (loadingStartTime || 0);
            if (elapsed >= MIN_LOADING_DURATION) {
                setStableLoading(false);
                setLoadingStartTime(null);
            } else {
                // Wait for remaining time
                const remainingTime = MIN_LOADING_DURATION - elapsed;
                setTimeout(() => {
                    setStableLoading(false);
                    setLoadingStartTime(null);
                }, remainingTime);
            }
        }
    }, [isLoading, stableLoading, loadingStartTime]);

    console.log('🔴 GameDisconnectView: Component rendered with props:', {
        backgroundImage: !!backgroundImage,
        isSSOFailure,
        customMessage: !!customMessage,
        isLoading,
        stableLoading,
        language
    });

    // Debug translation keys
    console.log('🔴 GameDisconnectView: Translation debug:', {
        language,
        sessionExpiredKey: gc.Translator.t('Common.message_session_expired'),
        connectFailedKey: gc.Translator.t('Common.connect_failed'),
        reconnectKey: gc.Translator.t('Common.reconnect')
    });

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
                            console.log('🔴 GameDisconnectView: Reconnect/Retry button clicked', { isSSOFailure });
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