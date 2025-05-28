import * as gc from "@sg/sg-game-client";
import { FishPrawnCrabChoices, FishPrawnCrabSettlementResult } from "../type";
import { createEmptySettlementResult } from "../fish-prawn-crab-utils";

export interface IWinningResult extends FishPrawnCrabSettlementResult {
    winner: FishPrawnCrabChoices;
}

export class SettlementService {
    public static getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): IWinningResult {
        const result = createEmptySettlementResult();

        if (settlementResult && typeof settlementResult === "object") {
            const data = settlementResult as Record<string, unknown>;

            Object.values(FishPrawnCrabChoices).forEach(choice => {
                result[choice] = !!data[choice];
                if (result[choice]) {
                    result.winner = choice;
                }
            });
        }

        return result;
    }

    public static getWinningSymbols(settlement: IWinningResult): FishPrawnCrabChoices[] {
        return Object.entries(settlement)
            .filter(([key, value]) => key !== 'winner' && value === true)
            .map(([key]) => key as FishPrawnCrabChoices);
    }
}