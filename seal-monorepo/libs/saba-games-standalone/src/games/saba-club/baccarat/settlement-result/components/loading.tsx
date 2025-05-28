import React, { memo } from 'react';
import Styles from "../styles/baccarat-animations.module.scss";

interface LoadingProps {
    message?: string;
}

export const Loading: React.FC<LoadingProps> = memo(({
    message = 'Loading...'
}) => (
    <div className={Styles['loading-container']}>
        <div className={Styles['loading-spinner']} />
        <p>{message}</p>
    </div>
));

Loading.displayName = 'Loading'; 