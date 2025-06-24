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
}> = ({ onReconnect, backgroundImage }) => {
    console.log('🔴 GameDisconnectView: Component rendered with props:', { backgroundImage: !!backgroundImage });

    const reconnectText = gc.Translator.translate('Common.reconnect');
    return (
        <div className={`${Styles['disconnect-container']} ${backgroundImage ? Styles['has-background'] : ''}`}
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        >
            <div className={Styles['block-wrapper']}>
                <div className={Styles['reconnect-btn-container']}>
                    <p className={Styles['reconnect-text']}>{gc.Translator.t('Common.connect_failed')}</p>
                    <button
                        className={`${'c-btn'} ${'c-btn--bet'} ${Styles['reconnect-btn']}`}
                        data-disabled={false}
                        onClick={() => {
                            console.log('🔴 GameDisconnectView: Reconnect button clicked');
                            onReconnect();
                        }}
                    >
                        <span className="c-text">{reconnectText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}; 