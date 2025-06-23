import React from 'react';
import Styles from '../styles/rng-soccer-settlement.module.scss';

interface LoadingProps {
    message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
    return (
        <div className={Styles['loading-container']}>
            <div className={Styles['loading-spinner']}></div>
            <p className={Styles['loading-message']}>{message}</p>
        </div>
    );
}; 