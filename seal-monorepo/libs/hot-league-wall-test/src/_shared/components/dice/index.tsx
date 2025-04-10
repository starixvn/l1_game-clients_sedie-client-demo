import React from "react";

import { Size } from "../../../_shared/constants";
import dice1 from "../../../assets/big-small/dice-1.png";
import dice2 from "../../../assets/big-small/dice-2.png";
import dice3 from "../../../assets/big-small/dice-3.png";
import dice4 from "../../../assets/big-small/dice-4.png";
import dice5 from "../../../assets/big-small/dice-5.png";
import dice6 from "../../../assets/big-small/dice-6.png";
import diceQuestionMark from "../../../assets/big-small/dice-question-mark.png";
import styles from "./dice.module.scss";

const diceImages: Record<number, string> = {
    0: diceQuestionMark,
    1: dice1,
    2: dice2,
    3: dice3,
    4: dice4,
    5: dice5,
    6: dice6,
};

interface IDiceProps {
    diceNumber: number;
    size?: typeof Size.large | typeof Size.medium | typeof Size.small;
}

const Dice: React.FC<IDiceProps> = ({ diceNumber, size = Size.large }) => {
    const diceImageUrl = diceImages[diceNumber];

    return <img className={styles[`dice-${size}`]} src={diceImageUrl} alt={`dice-${diceNumber || 'unknown'}`} />;
};

export default Dice;
