import React from 'react';
import styles from '../../rng-soccer.module.scss';

export enum TeamCardAnimation {
    NONE = 'none',
    POP_IN = 'pop-in',
    POP_OUT = 'pop-out'
}

export interface TeamCardProps {
    logo: string;
    isHomeTeam?: boolean;
    animation?: TeamCardAnimation;
}

export const TeamCard: React.FC<TeamCardProps> = ({
    logo,
    isHomeTeam = true,
    animation = TeamCardAnimation.NONE
}) => {
    const getAnimationClass = () => {
        switch (animation) {
            case TeamCardAnimation.POP_IN:
                return styles['pop-in-animation'];
            case TeamCardAnimation.POP_OUT:
                return styles['pop-out-animation'];
            default:
                return '';
        }
    };

    return (
        <div className={`${styles['sport-team']} ${isHomeTeam ? styles['home-team'] : styles['away-team']} ${getAnimationClass()}`}>
            <div className={styles['sport-team-img']}>
                <img src={logo} alt={`${isHomeTeam ? 'home' : 'away'}-team`} />
            </div>
        </div>
    );
};

export default TeamCard; 