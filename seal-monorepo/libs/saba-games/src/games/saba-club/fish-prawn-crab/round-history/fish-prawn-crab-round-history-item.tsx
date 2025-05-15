import * as gc from "@sg/sg-game-client";
import React from "react";
import FishPrawnCrabDice from "../../../../_shared/components/fish-prawn-crab-dice";
import { Size } from "../../../../_shared/constants";
import styles from "./fish-prawn-crab-round-history.module.scss";

interface IFishPrawnCrabRoundHistoryItemProps {
    roundHistory: gc.RoundHistories.RoundHistory;
    showArrow?: boolean;
}

export const FishPrawnCrabRoundHistoryItem: React.FC<IFishPrawnCrabRoundHistoryItemProps> = ({
    roundHistory,
    showArrow = true
}) => {
    if (!roundHistory.settlementResult || !roundHistory.result) {
        return <React.Fragment />;
    }

    return (
        <div key={roundHistory.roundId} className={styles["history-item"]}>
            <FishPrawnCrabDice
                symbol={roundHistory.result["dice1"]}
                size={Size.medium}
            />
            <FishPrawnCrabDice
                symbol={roundHistory.result["dice2"]}
                size={Size.medium}
            />
            <FishPrawnCrabDice
                symbol={roundHistory.result["dice3"]}
                size={Size.medium}
            />
            {showArrow && <span className={styles["arrow"]}></span>}
        </div>
    );
};

export default FishPrawnCrabRoundHistoryItem;