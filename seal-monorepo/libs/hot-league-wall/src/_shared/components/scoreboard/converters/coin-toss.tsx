import { Converter } from "sc-scoreboards";
import { choices } from "../../../types/settlement-result";
import { CoinTossResult, CoinTossSettlementResult, CoinTossRoundHistory } from "../../../../games/saba-club/coin-toss/type";

export class CoinTossBigRoadConverter extends Converter<CoinTossRoundHistory> {
    static addBlinkNode(rounds: CoinTossRoundHistory[]) {
        const lastRound = rounds.find((round) => round.settlementResult.head || round.settlementResult.tail);
        if (!lastRound) return;

        const blinkRound: CoinTossRoundHistory = {
            settlementResult: {
                head: lastRound.settlementResult.head,
                tail: false
            } as CoinTossSettlementResult,
            result: lastRound.result,
            roundId: lastRound.roundId
        };

        rounds.unshift(blinkRound);
    }

    static instance = new CoinTossBigRoadConverter();

    protected positiveKey(): string {
        return choices.head;
    }

    protected specialKey(): string {
        return choices.tail;
    }

    group(items: CoinTossRoundHistory[]): CoinTossRoundHistory[][] {
        const groups: CoinTossRoundHistory[][] = [];
        let currentGroup: CoinTossRoundHistory[] = [];

        for (const item of items) {
            if (currentGroup.length === 0 || currentGroup[0].settlementResult === item.settlementResult) {
                currentGroup.push(item);
            } else {
                groups.push(currentGroup);
                currentGroup = [item];
            }
        }

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }

    convert(group: CoinTossRoundHistory[]): boolean {
        if (group.length === 0) return false;
        const firstItem = group[0];
        return firstItem.settlementResult.head === true;
    }
}
