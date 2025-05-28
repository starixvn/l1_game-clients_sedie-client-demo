import * as gc from "@sg/sg-game-client";
import React from "react";
import { Size } from "../../constants";

export interface RoundHistoryItemProps<T> {
    roundHistory: gc.RoundHistories.RoundHistory;
    showArrow?: boolean;
    renderDice: (props: { symbol: T; size: typeof Size[keyof typeof Size] }) => React.ReactNode;
    styles: {
        [key: string]: string;
    };
}

export const RoundHistoryItem = <T,>({
    roundHistory,
    showArrow = true,
    renderDice,
    styles
}: RoundHistoryItemProps<T>) => {
    if (!roundHistory.settlementResult || !roundHistory.result) {
        return <React.Fragment />;
    }

    return (
        <div key={roundHistory.roundId} className={styles["history-item"]}>
            {renderDice({ symbol: roundHistory.result["dice1"] as T, size: Size.medium })}
            {renderDice({ symbol: roundHistory.result["dice2"] as T, size: Size.medium })}
            {renderDice({ symbol: roundHistory.result["dice3"] as T, size: Size.medium })}
            {showArrow && <span className={styles["arrow"]}></span>}
        </div>
    );
};

export default RoundHistoryItem; 