import React from 'react';
import styles from '../../rng-soccer.module.scss';

interface ScoreDisplayProps {
    homeScore: number | string;
    awayScore: number | string;
    showWinningHighlight?: boolean;
    showDefaultScore?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
    homeScore = '',
    awayScore = '',
    showWinningHighlight = false,
    showDefaultScore = false,
}) => {
    const DEFAULT_SCORE = 0;

    const homeScoreValue = showDefaultScore ? DEFAULT_SCORE : homeScore;
    const awayScoreValue = showDefaultScore ? DEFAULT_SCORE : awayScore;
    const isHomeHigher = homeScoreValue > awayScoreValue;
    const isAwayHigher = awayScoreValue > homeScoreValue;

    return (
        <div className={styles['result-section']}>
            <div className={`${styles['result']} ${isHomeHigher && showWinningHighlight ? styles['higher-score'] : ''}`}>
                {!showDefaultScore && (
                    <span className={`${+homeScoreValue > DEFAULT_SCORE ? styles['score-slide-up'] : ''}`}>{homeScoreValue}</span>
                )}
            </div>
            <div className={`${styles['result']} ${isAwayHigher && showWinningHighlight ? styles['higher-score'] : ''}`}>
                {!showDefaultScore && (
                    <span className={`${+awayScoreValue > DEFAULT_SCORE ? styles['score-slide-up'] : ''}`}>{awayScoreValue}</span>
                )}
            </div>
        </div>
    );
};

export default ScoreDisplay;
