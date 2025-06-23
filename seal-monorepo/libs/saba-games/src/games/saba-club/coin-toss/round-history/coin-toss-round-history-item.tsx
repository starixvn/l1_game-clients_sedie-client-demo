import * as gc from "@sg/sg-game-client";
import React from "react";
import CoinHistory from "../../../../_shared/components/coin-history"
import { CoinSymbol } from "../../../../_shared/components/coin";
import styles from "./coin-toss-round-history.module.scss";
import { CoinTossRoundHistoryTooltip } from "./tooltip";
import { CoinTossChoices } from "../type";
import { Size } from "../../../../_shared/constants";

interface ICoinTossRoundHistoryItemProps {
    roundHistory: gc.RoundHistories.RoundHistory;
    showArrow?: boolean;
}

export const CoinTossRoundHistoryItem: React.FC<ICoinTossRoundHistoryItemProps> = ({
    roundHistory,
    showArrow = true
}) => {
    if (!roundHistory.settlementResult || !roundHistory.result) {
        return <React.Fragment />;
    }

    const coinType = roundHistory.result["head"] ? CoinSymbol.HEAD : CoinSymbol.TAIL;
    const winner = roundHistory.result["head"] ? CoinTossChoices.head : CoinTossChoices.tail;
    return (
        <div key={roundHistory.roundId} className={styles["history-item"]}>
            <CoinHistory
                coinType={coinType}
                size={Size.medium}
            />
            {showArrow && <span className={styles["arrow"]}></span>}
            <CoinTossRoundHistoryTooltip
                roundId={roundHistory.roundId}
                winner={winner}
            />
        </div>
    );
};

export default CoinTossRoundHistoryItem;