import { SettlementService, IWinningResult } from '../../../../../src/games/saba-club/fish-prawn-crab/services/settlement-service';
import { FishPrawnCrabChoices } from '../../../../../src/games/saba-club/fish-prawn-crab/type';

describe('SettlementService', () => {
    describe('getSettlementResult', () => {
        // Happy path test
        it('should correctly process settlement result with a winning choice', () => {
            // Arrange
            const mockSettlementResult = {
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.prawn]: false
            };

            // Act
            const result = SettlementService.getSettlementResult(mockSettlementResult);

            // Assert
            expect(result.winner).toBe(FishPrawnCrabChoices.fish);
            expect(result[FishPrawnCrabChoices.fish]).toBe(true);
            expect(result[FishPrawnCrabChoices.prawn]).toBe(false);
            expect(result[FishPrawnCrabChoices.crab]).toBe(false);
            expect(result[FishPrawnCrabChoices.rooster]).toBe(false);
            expect(result[FishPrawnCrabChoices.gourd]).toBe(false);
            expect(result[FishPrawnCrabChoices.stag]).toBe(false);
        });

        // Test with multiple winning choices (edge case)
        it('should set the last true choice as winner when multiple winning choices exist', () => {
            // Arrange
            const mockSettlementResult = {
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.prawn]: true,
                [FishPrawnCrabChoices.crab]: true
            };

            // Act
            const result = SettlementService.getSettlementResult(mockSettlementResult);

            // Assert
            expect(result.winner).toBe(FishPrawnCrabChoices.crab);
            expect(result[FishPrawnCrabChoices.fish]).toBe(true);
            expect(result[FishPrawnCrabChoices.prawn]).toBe(true);
            expect(result[FishPrawnCrabChoices.crab]).toBe(true);
        });

        // Test with null or undefined input (error handling/boundary condition)
        it('should return default result with fish as winner for null/undefined input', () => {
            // Arrange & Act
            const resultWithNull = SettlementService.getSettlementResult(null as any);
            const resultWithUndefined = SettlementService.getSettlementResult(undefined as any);

            // Assert
            expect(resultWithNull.winner).toBe(FishPrawnCrabChoices.fish);
            expect(resultWithUndefined.winner).toBe(FishPrawnCrabChoices.fish);

            Object.values(FishPrawnCrabChoices).forEach(choice => {
                expect(resultWithNull[choice]).toBe(false);
                expect(resultWithUndefined[choice]).toBe(false);
            });
        });

        // Test with empty object (boundary condition)
        it('should return default result with fish as winner for empty object', () => {
            // Arrange
            const mockSettlementResult = {};

            // Act
            const result = SettlementService.getSettlementResult(mockSettlementResult);

            // Assert
            expect(result.winner).toBe(FishPrawnCrabChoices.fish);
            Object.values(FishPrawnCrabChoices).forEach(choice => {
                expect(result[choice]).toBe(false);
            });
        });

        // Test with non-object input (error handling)
        it('should return default result for non-object input', () => {
            // Arrange & Act
            const result = SettlementService.getSettlementResult("not an object" as any);

            // Assert
            expect(result.winner).toBe(FishPrawnCrabChoices.fish);
            Object.values(FishPrawnCrabChoices).forEach(choice => {
                expect(result[choice]).toBe(false);
            });
        });
    });

    describe('getWinningSymbols', () => {
        // Happy path test
        it('should correctly extract winning symbols from a settlement result', () => {
            // Arrange
            const mockWinningResult: IWinningResult = {
                winner: FishPrawnCrabChoices.fish,
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.prawn]: false,
                [FishPrawnCrabChoices.crab]: true,
                [FishPrawnCrabChoices.rooster]: false,
                [FishPrawnCrabChoices.gourd]: false,
                [FishPrawnCrabChoices.stag]: false
            };

            // Act
            const winningSymbols = SettlementService.getWinningSymbols(mockWinningResult);

            // Assert
            expect(winningSymbols).toEqual([FishPrawnCrabChoices.fish, FishPrawnCrabChoices.crab]);
        });

        // Test with no winning symbols (edge case)
        it('should return empty array when no winning symbols exist', () => {
            // Arrange
            const mockWinningResult: IWinningResult = {
                winner: FishPrawnCrabChoices.fish, // Default winner despite no true values
                [FishPrawnCrabChoices.fish]: false,
                [FishPrawnCrabChoices.prawn]: false,
                [FishPrawnCrabChoices.crab]: false,
                [FishPrawnCrabChoices.rooster]: false,
                [FishPrawnCrabChoices.gourd]: false,
                [FishPrawnCrabChoices.stag]: false
            };

            // Act
            const winningSymbols = SettlementService.getWinningSymbols(mockWinningResult);

            // Assert
            expect(winningSymbols).toEqual([]);
        });

        // Test with all winning symbols (boundary condition)
        it('should return all choices when all symbols are winning', () => {
            // Arrange
            const mockWinningResult: IWinningResult = {
                winner: FishPrawnCrabChoices.stag,
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.prawn]: true,
                [FishPrawnCrabChoices.crab]: true,
                [FishPrawnCrabChoices.rooster]: true,
                [FishPrawnCrabChoices.gourd]: true,
                [FishPrawnCrabChoices.stag]: true
            };

            // Act
            const winningSymbols = SettlementService.getWinningSymbols(mockWinningResult);

            // Assert
            expect(winningSymbols.length).toBe(Object.values(FishPrawnCrabChoices).length);
            expect(new Set(winningSymbols)).toEqual(new Set(Object.values(FishPrawnCrabChoices)));
        });
    });
}); 