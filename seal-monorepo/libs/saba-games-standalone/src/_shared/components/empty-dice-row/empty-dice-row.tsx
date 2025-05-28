import React from "react";
import { Size } from "../../constants";
import styles from "./empty-dice-row.module.scss";

export interface EmptyDiceRowProps {
    count?: number;
    size?: typeof Size[keyof typeof Size];
    isFinishedShowResult?: boolean;
    blinking?: boolean;
    renderDice: (props: { index: number; size: typeof Size[keyof typeof Size] }) => React.ReactNode;
}

export const EmptyDiceRow: React.FC<EmptyDiceRowProps> = ({
    count = 3,
    size = Size.medium,
    isFinishedShowResult = false,
    blinking = false,
    renderDice
}) => {
    return (
        <>
            {Array(count).fill(0).map((_, index) => (
                <div
                    key={`empty-dice-container-${index}`}
                    className={`${styles.diceContainer} 
                        ${isFinishedShowResult ? styles.animated : ''} 
                        ${blinking ? styles.blinking : ''} 
                        ${styles[`animationDelay-${index}`]}`}
                >
                    {renderDice({ index, size })}
                </div>
            ))}
        </>
    );
};

export default EmptyDiceRow; 