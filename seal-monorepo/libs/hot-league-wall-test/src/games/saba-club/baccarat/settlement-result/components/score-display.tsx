import React from "react";

import Styles from "../styles/score-display.module.scss";

interface ScoreDisplayProps {
    score: number;
    type: 'player' | 'banker';
    visible: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, type, visible }) => {
    if (!visible) return null;

    return (
        <div className={`${Styles.score} ${Styles[`${type}-score`]}`}>
            <span className={Styles['score-number']}>{score}</span>
        </div>
    );
};
