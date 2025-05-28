import { MAX_DISPLAYED_ROUNDS } from '../../../../../src/games/saba-club/fish-prawn-crab/constants/fish-prawn-crab-constants';
import { choiceToSymbolMap } from '../../../../../src/games/saba-club/fish-prawn-crab/fish-prawn-crab-utils';
import { FishPrawnCrabChoices } from '../../../../../src/games/saba-club/fish-prawn-crab/type';
import { FishPrawnCrabSymbol } from '../../../../../src/_shared/components/fish-prawn-crab-dice';

describe('Fish Prawn Crab Constants', () => {
    // Test the choiceToSymbolMap mapping
    describe('choiceToSymbolMap', () => {
        it('should correctly map each FishPrawnCrabChoice to the corresponding symbol', () => {
            // Arrange & Act & Assert
            expect(choiceToSymbolMap[FishPrawnCrabChoices.fish]).toBe(FishPrawnCrabSymbol.FISH);
            expect(choiceToSymbolMap[FishPrawnCrabChoices.prawn]).toBe(FishPrawnCrabSymbol.PRAWN);
            expect(choiceToSymbolMap[FishPrawnCrabChoices.crab]).toBe(FishPrawnCrabSymbol.CRAB);
            expect(choiceToSymbolMap[FishPrawnCrabChoices.rooster]).toBe(FishPrawnCrabSymbol.ROOSTER);
            expect(choiceToSymbolMap[FishPrawnCrabChoices.gourd]).toBe(FishPrawnCrabSymbol.GOURD);
            expect(choiceToSymbolMap[FishPrawnCrabChoices.stag]).toBe(FishPrawnCrabSymbol.STAG);
        });

        it('should have a mapping for all FishPrawnCrabChoices values', () => {
            // Arrange
            const allChoices = Object.values(FishPrawnCrabChoices);

            // Act
            const mappedChoices = Object.keys(choiceToSymbolMap) as FishPrawnCrabChoices[];

            // Assert
            // Check that all choices have a mapping
            expect(mappedChoices.length).toBe(allChoices.length);
            allChoices.forEach(choice => {
                expect(choiceToSymbolMap[choice]).toBeDefined();
            });
        });
    });

    // Test MAX_DISPLAYED_ROUNDS
    describe('MAX_DISPLAYED_ROUNDS', () => {
        it('should be set to 3', () => {
            // Arrange & Act & Assert
            expect(MAX_DISPLAYED_ROUNDS).toBe(3);
        });
    });
}); 