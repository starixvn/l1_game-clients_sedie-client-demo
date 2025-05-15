import * as gc from '@sg/sg-game-client';
import { FishPrawnCrabChoices, FishPrawnCrabSettlementResult } from '../type';
import { createEmptySettlementResult } from '../fish-prawn-crab-utils';

export interface ISettlementResultService {
    getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): FishPrawnCrabSettlementResult & { winner: FishPrawnCrabChoices };
    getWinningChoices(settlementResult: gc.GameServiceMessage.TSettlementResult): FishPrawnCrabChoices[];
    getWinningTextList(settlementResult: gc.GameServiceMessage.TSettlementResult): string[];
    getWinningTextListByResult(result: gc.GameServiceMessage.TResult): string[];
}

export class SettlementResultService implements ISettlementResultService {
    getSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult): FishPrawnCrabSettlementResult & { winner: FishPrawnCrabChoices } {
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

    getWinningChoices(settlementResult: gc.GameServiceMessage.TSettlementResult): FishPrawnCrabChoices[] {
        if (!settlementResult) return [];

        const settlement = this.getSettlementResult(settlementResult);
        return Object.entries(settlement)
            .filter(([key, value]) => key !== 'winner' && value === true)
            .map(([key]) => key as FishPrawnCrabChoices);
    }

    getWinningTextList(settlementResult: gc.GameServiceMessage.TSettlementResult): string[] {
        if (!settlementResult) return [];

        const winningSymbols = this.getWinningChoices(settlementResult)
            .map(choice => gc.Translator.translate(`FishPrawnCrab.glossary_${choice}`));
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
            .map(choice => gc.Translator.translate(`FishPrawnCrab.glossary_${choice}`));
    }

    private diceValueToSymbolName(value: number): FishPrawnCrabChoices | null {
        switch (value) {
            case 0: return FishPrawnCrabChoices.stag;
            case 1: return FishPrawnCrabChoices.gourd;
            case 2: return FishPrawnCrabChoices.rooster;
            case 3: return FishPrawnCrabChoices.fish;
            case 4: return FishPrawnCrabChoices.crab;
            case 5: return FishPrawnCrabChoices.prawn;
            default: return null;
        }
    }
} 