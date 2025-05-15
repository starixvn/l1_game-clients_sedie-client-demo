import React from "react";

import { Size } from "../../../_shared/constants";
import fishImage from "../../../assets/fish-prawn-crab/fish.png";
import prawnImage from "../../../assets/fish-prawn-crab/prawn.png";
import crabImage from "../../../assets/fish-prawn-crab/crab.png";
import gourdImage from "../../../assets/fish-prawn-crab/gourd.png";
import roosterImage from "../../../assets/fish-prawn-crab/rooster.png";
import stagImage from "../../../assets/fish-prawn-crab/stag.png";
import emptyImage from "../../../assets/fish-prawn-crab/empty.png";
import resultImage from "../../../assets/fish-prawn-crab/result.png";
import styles from "./fish-prawn-crab-dice.module.scss";

export enum FishPrawnCrabSymbol {
    EMPTY = -1, // Not in mapper, keeping for empty state
    STAG = 0,   // Updated to match resultMapper
    GOURD = 1,  // Updated to match resultMapper
    ROOSTER = 2, // Updated to match resultMapper
    FISH = 3,   // Updated to match resultMapper
    CRAB = 4,   // Updated to match resultMapper
    PRAWN = 5,   // Updated to match resultMapper
    RESULT = 6, // Updated to match resultMapper
}

const diceImages: Record<number, string> = {
    [FishPrawnCrabSymbol.EMPTY]: emptyImage,
    [FishPrawnCrabSymbol.STAG]: stagImage,
    [FishPrawnCrabSymbol.GOURD]: gourdImage,
    [FishPrawnCrabSymbol.ROOSTER]: roosterImage,
    [FishPrawnCrabSymbol.FISH]: fishImage,
    [FishPrawnCrabSymbol.CRAB]: crabImage,
    [FishPrawnCrabSymbol.PRAWN]: prawnImage,
    [FishPrawnCrabSymbol.RESULT]: resultImage,
};

// Function to convert dice value (1-6) to symbol based on game rules
export const diceValueToSymbol = (value: number): FishPrawnCrabSymbol => {
    switch (value) {
        case 1:
            return FishPrawnCrabSymbol.FISH;
        case 2:
            return FishPrawnCrabSymbol.CRAB;
        case 3:
            return FishPrawnCrabSymbol.PRAWN;
        case 4:
            return FishPrawnCrabSymbol.GOURD;
        case 5:
            return FishPrawnCrabSymbol.ROOSTER;
        case 6:
            return FishPrawnCrabSymbol.STAG;
        default:
            return FishPrawnCrabSymbol.EMPTY;
    }
};

interface IFishPrawnCrabDiceProps {
    symbol: FishPrawnCrabSymbol;
    size?: typeof Size.large | typeof Size.medium | typeof Size.small;
}

const FishPrawnCrabDice: React.FC<IFishPrawnCrabDiceProps> = ({
    symbol,
    size = Size.large
}) => {
    const diceImageUrl = diceImages[symbol];
    return (
        <img
            className={styles[`dice-${size}`]}
            src={diceImageUrl}
            alt={`fish-prawn-crab-${FishPrawnCrabSymbol[symbol]?.toLowerCase() || 'empty'}`}
        />
    );
};

export default FishPrawnCrabDice; 