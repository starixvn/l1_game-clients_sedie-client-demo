import * as gc from '@sg/sg-game-client';
import { SettlementResultService } from '../../../../../src/games/saba-club/fish-prawn-crab/services/settlement-result-service';
import { FishPrawnCrabChoices } from '../../../../../src/games/saba-club/fish-prawn-crab/type';

// Mock dependencies
jest.mock('@sg/sg-game-client', () => ({
    Translator: {
        translate: jest.fn((key) => `translated_${key}`)
    },
    GameServiceMessage: {}
}));

// Mock the dice component
jest.mock('../../../../../src/_shared/components/fish-prawn-crab-dice', () => {
    return {
        FishPrawnCrabSymbol: {
            FISH: 'FISH',
            PRAWN: 'PRAWN',
            CRAB: 'CRAB',
            ROOSTER: 'ROOSTER',
            GOURD: 'GOURD',
            STAG: 'STAG'
        }
    };
});

describe('SettlementResultService', () => {
    let service: SettlementResultService;

    beforeEach(() => {
        service = new SettlementResultService();
        jest.clearAllMocks();
    });

    describe('getSettlementResult', () => {
        test('should return default result when input is null', () => {
            // Arrange
            const nullResult = null as unknown as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getSettlementResult(nullResult);

            // Assert
            expect(result.winner).toBe(FishPrawnCrabChoices.fish);
            Object.values(FishPrawnCrabChoices).forEach(choice => {
                expect(result[choice]).toBe(false);
            });
        });

        test('should correctly parse settlement result with winning choices', () => {
            // Arrange
            const mockResult = {
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.crab]: true
            } as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getSettlementResult(mockResult);

            // Assert
            expect(result[FishPrawnCrabChoices.fish]).toBe(true);
            expect(result[FishPrawnCrabChoices.crab]).toBe(true);
            expect(result[FishPrawnCrabChoices.prawn]).toBe(false);
            expect(result.winner).toBe(FishPrawnCrabChoices.crab); // Last winner in the iteration
        });

        test('should handle non-object input safely', () => {
            // Arrange
            const invalidInput = 'not an object' as unknown as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getSettlementResult(invalidInput);

            // Assert
            expect(result.winner).toBe(FishPrawnCrabChoices.fish);
            Object.values(FishPrawnCrabChoices).forEach(choice => {
                expect(result[choice]).toBe(false);
            });
        });
    });

    describe('getWinningChoices', () => {
        test('should return empty array when input is null', () => {
            // Arrange
            const nullInput = null as unknown as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getWinningChoices(nullInput);

            // Assert
            expect(result).toEqual([]);
        });

        test('should return array of winning choices', () => {
            // Arrange
            const mockResult = {
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.crab]: true
            } as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getWinningChoices(mockResult);

            // Assert
            expect(result).toContain(FishPrawnCrabChoices.fish);
            expect(result).toContain(FishPrawnCrabChoices.crab);
            expect(result).toHaveLength(2);
        });
    });

    describe('getWinningTextList', () => {
        test('should return empty string when input is null', () => {
            // Arrange
            const nullInput = null as unknown as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getWinningTextList(nullInput);

            // Assert
            expect(result).toEqual([]);
        });

        test('should return translated comma-separated list of winners', () => {
            // Arrange
            const mockResult = {
                [FishPrawnCrabChoices.fish]: true,
                [FishPrawnCrabChoices.crab]: true
            } as gc.GameServiceMessage.TSettlementResult;

            // Act
            const result = service.getWinningTextList(mockResult);

            // Assert
            expect(gc.Translator.translate).toHaveBeenCalledWith(`FishPrawnCrab.glossary_${FishPrawnCrabChoices.fish}`);
            expect(gc.Translator.translate).toHaveBeenCalledWith(`FishPrawnCrab.glossary_${FishPrawnCrabChoices.crab}`);
            expect(result).toEqual([
                'translated_FishPrawnCrab.glossary_fish',
                'translated_FishPrawnCrab.glossary_crab'
            ]);
        });
    });

    describe('getWinningTextListByResult', () => {
        test('should return empty array when input is null', () => {
            // Arrange
            const nullInput = null as unknown as gc.GameServiceMessage.TResult;

            // Act
            const result = service.getWinningTextListByResult(nullInput);

            // Assert
            expect(result).toEqual([]);
        });

        test('should return empty array when input is not an object', () => {
            // Arrange
            const nonObjectInput = 42 as gc.GameServiceMessage.TResult;

            // Act
            const result = service.getWinningTextListByResult(nonObjectInput);

            // Assert
            expect(result).toEqual([]);
        });

        test('should return empty array when input object is empty', () => {
            // Arrange
            const emptyInput = {} as gc.GameServiceMessage.TResult;

            // Act
            const result = service.getWinningTextListByResult(emptyInput);

            // Assert
            expect(result).toEqual([]);
        });

        test('should return translated symbols for all three dice in order', () => {
            // Arrange
            const mockResult = {
                dice1: 3, // fish (value 3 in resultMapper)
                dice2: 4, // crab (value 4 in resultMapper)
                dice3: 5  // prawn (value 5 in resultMapper)
            } as gc.GameServiceMessage.TResult;

            // Act
            const result = service.getWinningTextListByResult(mockResult);

            // Assert
            expect(gc.Translator.translate).toHaveBeenCalledWith('FishPrawnCrab.glossary_fish');
            expect(gc.Translator.translate).toHaveBeenCalledWith('FishPrawnCrab.glossary_crab');
            expect(gc.Translator.translate).toHaveBeenCalledWith('FishPrawnCrab.glossary_prawn');
            expect(result).toHaveLength(3);
            expect(result).toEqual([
                'translated_FishPrawnCrab.glossary_fish',
                'translated_FishPrawnCrab.glossary_crab',
                'translated_FishPrawnCrab.glossary_prawn'
            ]);
        });

        test('should skip invalid dice values', () => {
            // Arrange
            const mockResult = {
                dice1: 3,    // fish (value 3 in resultMapper)
                dice2: 999,  // invalid
                dice3: 5     // prawn (value 5 in resultMapper)
            } as gc.GameServiceMessage.TResult;

            // Act
            const result = service.getWinningTextListByResult(mockResult);

            // Assert
            expect(gc.Translator.translate).toHaveBeenCalledWith('FishPrawnCrab.glossary_fish');
            expect(gc.Translator.translate).toHaveBeenCalledWith('FishPrawnCrab.glossary_prawn');
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                'translated_FishPrawnCrab.glossary_fish',
                'translated_FishPrawnCrab.glossary_prawn'
            ]);
        });
    });
}); 