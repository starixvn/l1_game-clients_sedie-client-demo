import * as gc from '@sg/sg-game-client';
import React from 'react';
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
}> = ({ onReconnect, backgroundImage, isSSOFailure = false, customMessage, customButtonText }) => {
    console.log('🔴 GameDisconnectView: Component rendered with props:', {
        backgroundImage: !!backgroundImage,
        isSSOFailure,
        customMessage: !!customMessage
    });

    // Use custom text for SSO failures, fallback to default for connection failures
    const messageText = customMessage || (isSSOFailure
        ? 'Login failed. Please try again.'
        : gc.Translator.t('Common.connect_failed'));

    const buttonText = customButtonText || (isSSOFailure
        ? 'Retry Login'
        : gc.Translator.translate('Common.reconnect'));

    return (
        <div className={`${Styles['disconnect-container']} ${backgroundImage ? Styles['has-background'] : ''}`}
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        >
            <div className={Styles['block-wrapper']}>
                <div className={Styles['reconnect-btn-container']}>
                    <p className={Styles['reconnect-text']}>{messageText}</p>
                    <button
                        className={`${'c-btn'} ${'c-btn--bet'} ${Styles['reconnect-btn']}`}
                        data-disabled={false}
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