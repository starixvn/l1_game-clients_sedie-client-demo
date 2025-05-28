import React from "react";

import { Size } from "../../../_shared/constants";
import yellowImage from "../../../assets/color-game/yellow.png";
import redImage from "../../../assets/color-game/red.png";
import pinkImage from "../../../assets/color-game/pink.png";
import whiteImage from "../../../assets/color-game/white.png";
import blueImage from "../../../assets/color-game/blue.png";
import greenImage from "../../../assets/color-game/green.png";
import emptyImage from "../../../assets/color-game/empty.png";
import resultImage from "../../../assets/color-game/result.png";
import woodenYellowImage from "../../../assets/color-game/wooden-yellow.png";
import woodenRedImage from "../../../assets/color-game/wooden-red.png";
import woodenPinkImage from "../../../assets/color-game/wooden-pink.png";
import woodenWhiteImage from "../../../assets/color-game/wooden-white.png";
import woodenBlueImage from "../../../assets/color-game/wooden-blue.png";
import woodenGreenImage from "../../../assets/color-game/wooden-green.png";
import woodenEmptyImage from "../../../assets/color-game/wooden-empty.png";

import styles from "./color-game-dice.module.scss";

export enum ColorGameSymbol {
    EMPTY = -1, // Not in mapper, keeping for empty state
    YELLOW = 0,   // Updated to match resultMapper
    RED = 1,  // Updated to match resultMapper
    PINK = 2, // Updated to match resultMapper
    WHITE = 3,   // Updated to match resultMapper
    BLUE = 4,   // Updated to match resultMapper
    GREEN = 5,   // Updated to match resultMapper
    RESULT = 6, // Updated to match resultMapper
}

const diceImages: Record<number, string> = {
    [ColorGameSymbol.EMPTY]: emptyImage,
    [ColorGameSymbol.YELLOW]: yellowImage,
    [ColorGameSymbol.RED]: redImage,
    [ColorGameSymbol.PINK]: pinkImage,
    [ColorGameSymbol.WHITE]: whiteImage,
    [ColorGameSymbol.BLUE]: blueImage,
    [ColorGameSymbol.GREEN]: greenImage,
    [ColorGameSymbol.RESULT]: resultImage,
};

const woodenDiceImages: Record<number, string> = {
    [ColorGameSymbol.EMPTY]: woodenEmptyImage,
    [ColorGameSymbol.YELLOW]: woodenYellowImage,
    [ColorGameSymbol.RED]: woodenRedImage,
    [ColorGameSymbol.PINK]: woodenPinkImage,
    [ColorGameSymbol.WHITE]: woodenWhiteImage,
    [ColorGameSymbol.BLUE]: woodenBlueImage,
    [ColorGameSymbol.GREEN]: woodenGreenImage,
    [ColorGameSymbol.RESULT]: resultImage,
};


// Function to convert dice value (1-6) to symbol based on game rules
export const diceValueToSymbol = (value: number): ColorGameSymbol => {
    switch (value) {
        case 1:
            return ColorGameSymbol.YELLOW;
        case 2:
            return ColorGameSymbol.RED;
        case 3:
            return ColorGameSymbol.PINK;
        case 4:
            return ColorGameSymbol.WHITE;
        case 5:
            return ColorGameSymbol.BLUE;
        case 6:
            return ColorGameSymbol.GREEN;
        default:
            return ColorGameSymbol.EMPTY;
    }
};

interface IColorGameDiceProps {
    symbol: ColorGameSymbol;
    size?: typeof Size.large | typeof Size.medium | typeof Size.small | typeof Size.xLarge;
    isWooden?: boolean;
}

const ColorGameDice: React.FC<IColorGameDiceProps> = ({
    symbol,
    size = Size.large,
    isWooden = false
}) => {
    const diceImageUrl = isWooden ? woodenDiceImages[symbol] : diceImages[symbol];

    return (
        <img
            className={styles[`dice-${size}`]}
            src={diceImageUrl}
            alt={`color-game-${ColorGameSymbol[symbol]?.toLowerCase() || 'empty'}`}
        />
    );
};

export default ColorGameDice; 