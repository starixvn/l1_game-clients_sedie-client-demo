import React from 'react';
import { WarnMessageProps } from './types';

export const WarnMessage: React.FC<WarnMessageProps> = ({ warnMsg }) => {
    if (!warnMsg) return null;

    return (
        <div className="c-betting-msg sg-bet-panel__betting-msg">
            <i className="c-icon c-icon--warning" data-icon="warning" />
            <span className="c-text">{warnMsg}</span>
        </div>
    );
}; 