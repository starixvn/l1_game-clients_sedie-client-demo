import React from 'react';
import { RNGSoccerChoices } from '../type';
import styles from './dot.module.scss';

interface RNGSoccerRoundDotProps {
    choice: RNGSoccerChoices | 'next';
    value: string;
    highlight?: boolean;
}

export const RNGSoccerRoundDot: React.FC<RNGSoccerRoundDotProps> = ({ choice, value, highlight = false }) => {
    const getChoiceClass = () => {
        switch (choice) {
            case RNGSoccerChoices.home:
                return styles['dot-home'];
            case RNGSoccerChoices.away:
                return styles['dot-away'];
            case RNGSoccerChoices.draw:
                return styles['dot-draw'];
            case 'next':
                return styles['dot-next'];
            default:
                return '';
        }
    };

    return (
        <div
            className={`
                ${styles['round-dot']} 
                ${getChoiceClass()} 
                ${styles['dot-small']}
                ${highlight ? styles['highlight'] : ''}
            `}
        >
            {choice === 'next' ? value : ''}
        </div>
    );
};
