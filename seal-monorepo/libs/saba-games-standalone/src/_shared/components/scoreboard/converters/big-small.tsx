import { Converter } from "sc-scoreboards";
import { choices } from "../../../types/settlement-result";
import { BigSmallRoundHistory, BigSmallSettlementResult } from "../../../../games/saba-club/big-small/type";

export class BigSmallBigRoadConverter extends Converter<BigSmallRoundHistory> {
    static addBlinkNode(rounds: BigSmallRoundHistory[]) {
        const lastRound = rounds.find((round) => round.settlementResult.big || round.settlementResult.small);
        if (!lastRound) return;

        const blinkRound: BigSmallRoundHistory = {
            settlementResult: {
                big: lastRound.settlementResult.big,
                small: false
            } as BigSmallSettlementResult,
            result: lastRound.result,
            roundId: lastRound.roundId
        };

        rounds.unshift(blinkRound);
    }

    static instance = new BigSmallBigRoadConverter();

    protected positiveKey(): string {
        return choices.big;
    }

    protected specialKey(): string {
        return "";
    }

    group(items: BigSmallRoundHistory[]): BigSmallRoundHistory[][] {
        const groups: BigSmallRoundHistory[][] = [];
        let currentGroup: BigSmallRoundHistory[] = [];

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

    convert(group: BigSmallRoundHistory[]): boolean {
        if (group.length === 0) return false;
        const firstItem = group[0];
        return firstItem.settlementResult.big === true;
    }
}
