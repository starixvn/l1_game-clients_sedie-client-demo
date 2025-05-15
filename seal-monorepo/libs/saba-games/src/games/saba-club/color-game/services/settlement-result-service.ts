import * as gc from '@sg/sg-game-client';
import { ColorGameChoices, ColorGameSettlementResult } from '../type';
import { createEmptySettlementResult } from '../color-game-utils';

export interface ISettlementResultService {
    getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): ColorGameSettlementResult & { winner: ColorGameChoices };
    getWinningChoices(settlementResult: gc.GameServiceMessage.TSettlementResult): ColorGameChoices[];
    getWinningTextList(settlementResult: gc.GameServiceMessage.TSettlementResult): string[];
    getWinningTextListByResult(result: gc.GameServiceMessage.TResult): string[];
}

export class SettlementResultService implements ISettlementResultService {
    getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): ColorGameSettlementResult & { winner: ColorGameChoices } {
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

    getWinningChoices(settlementResult: gc.GameServiceMessage.TSettlementResult): ColorGameChoices[] {
        if (!settlementResult) return [];

        const settlement = this.getSettlementResult(settlementResult);
        return Object.entries(settlement)
            .filter(([key, value]) => key !== 'winner' && value === true)
            .map(([key]) => key as ColorGameChoices);
    }

    getWinningTextList(settlementResult: gc.GameServiceMessage.TSettlementResult): string[] {
        if (!settlementResult) return [];

        const winningSymbols = this.getWinningChoices(settlementResult)
            .map(choice => gc.Translator.translate(`ColorGame.glossary_${choice}`));

        return winningSymbols;
    }

    getWinningTextListByResult(result: gc.GameServiceMessage.TResult): string[] {
        if (!result || typeof result !== 'object' || Object.keys(result).length === 0) return [];

        const diceResult = result as Record<string, number>;

        const diceValues = [
            diceResult.dice1,
            diceResult.dice2,
            diceResult.dice3
        ];

        return diceValues
            .map(value => this.diceValueToSymbolName(value))
            .filter(Boolean)
            .map(choice => gc.Translator.translate(`ColorGame.glossary_${choice}`));
    }

    private diceValueToSymbolName(value: number): ColorGameChoices | null {
        switch (value) {
            case 0: return ColorGameChoices.yellow;
            case 1: return ColorGameChoices.red;
            case 2: return ColorGameChoices.pink;
            case 3: return ColorGameChoices.white;
            case 4: return ColorGameChoices.blue;
            case 5: return ColorGameChoices.green;
            default: return null;
        }
    }
} 