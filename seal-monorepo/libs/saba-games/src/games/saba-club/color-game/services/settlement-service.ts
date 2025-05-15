import * as gc from "@sg/sg-game-client";
import { ColorGameChoices, ColorGameSettlementResult } from "../type";
import { createEmptySettlementResult } from "../color-game-utils";

export interface IWinningResult extends ColorGameSettlementResult {
    winner: ColorGameChoices;
}

export class SettlementService {
    public static getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): IWinningResult {
        const result = createEmptySettlementResult();

        if (settlementResult && typeof settlementResult === "object") {
            const data = settlementResult as Record<string, unknown>;

            Object.values(ColorGameChoices).forEach(choice => {
                result[choice] = !!data[choice];
                if (result[choice]) {
                    result.winner = choice;
                }
            });
        }

        return result;
    }

    public static getWinningSymbols(settlement: IWinningResult): ColorGameChoices[] {
        return Object.entries(settlement)
            .filter(([key, value]) => key !== 'winner' && value === true)
            .map(([key]) => key as ColorGameChoices);
    }
}