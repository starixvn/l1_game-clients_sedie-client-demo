import { Converter } from "sc-scoreboards";
import { FishPrawnCrabChoices, FishPrawnCrabSettlementResult } from "../../../../games/saba-club/fish-prawn-crab/type";

// Define the round history interface matching what's used in the scoreboard
export interface FishPrawnCrabRoundHistory {
    roundId: number;
    settlementResult: FishPrawnCrabSettlementResult;
    result: any;
}

export class FishPrawnCrabBigRoadConverter extends Converter<FishPrawnCrabRoundHistory> {
    static addBlinkNode(rounds: FishPrawnCrabRoundHistory[]) {
        const lastRound = rounds.find((round) => {
            return Object.values(FishPrawnCrabChoices).some(choice =>
                round.settlementResult[choice] === true
            );
        });

        if (!lastRound) return;

        // Copy the settlementResult for the blink node
        const blinkSettlement: FishPrawnCrabSettlementResult = {} as FishPrawnCrabSettlementResult;

        // Find which choice was the winner in the last round
        let winningChoice: string | null = null;
        for (const choice of Object.values(FishPrawnCrabChoices)) {
            if (lastRound.settlementResult[choice]) {
                winningChoice = choice;
                blinkSettlement[choice] = true;
                break;
            }
        }

        const blinkRound: FishPrawnCrabRoundHistory = {
            settlementResult: blinkSettlement,
            result: lastRound.result,
            roundId: lastRound.roundId
        };

        rounds.unshift(blinkRound);
    }

    static instance = new FishPrawnCrabBigRoadConverter();

    protected positiveKey(): string {
        return FishPrawnCrabChoices.fish;
    }

    protected specialKey(): string {
        return "";
    }

    group(items: FishPrawnCrabRoundHistory[]): FishPrawnCrabRoundHistory[][] {
        const groups: FishPrawnCrabRoundHistory[][] = [];
        let currentGroup: FishPrawnCrabRoundHistory[] = [];

        for (const item of items) {
            // Find the winning choice in the current item
            const itemWinner = this.getWinningChoice(item);

            if (currentGroup.length === 0) {
                currentGroup.push(item);
            } else {
                // Find the winning choice in the first item of the current group
                const groupWinner = this.getWinningChoice(currentGroup[0]);

                // If they have the same winner, add to current group
                if (itemWinner === groupWinner) {
                    currentGroup.push(item);
                } else {
                    // Otherwise start a new group
                    groups.push(currentGroup);
                    currentGroup = [item];
                }
            }
        }

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }

    convert(group: FishPrawnCrabRoundHistory[]): boolean {
        if (group.length === 0) return false;
        const firstItem = group[0];
        // Return true if the winning choice is fish (the positive choice)
        return firstItem.settlementResult[FishPrawnCrabChoices.fish] === true;
    }

    // Helper method to get the winning choice from a round
    private getWinningChoice(item: FishPrawnCrabRoundHistory): string | null {
        if (!item || !item.settlementResult) return null;

        for (const choice of Object.values(FishPrawnCrabChoices)) {
            if (item.settlementResult[choice]) {
                return choice;
            }
        }

        return null;
    }
} 