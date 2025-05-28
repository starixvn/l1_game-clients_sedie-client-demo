import React from "react";
import styles from "./game-header-center-texts.module.scss";

export interface GameHeaderCenterTextsProps {
    texts: string[];
}

export const GameHeaderCenterTexts: React.FC<GameHeaderCenterTextsProps> = ({ texts = [] }) => {
    return (
        <div className={styles["game-title-text-center-container"]} style={{ gridTemplateColumns: `repeat(${texts.length}, 1fr)` }}>
            {texts.map((text, index) => (
                <div key={index} className={styles["game-title-text-center"]}>
                    {text}
                </div>
            ))}
        </div>
    );
};

export default GameHeaderCenterTexts; 