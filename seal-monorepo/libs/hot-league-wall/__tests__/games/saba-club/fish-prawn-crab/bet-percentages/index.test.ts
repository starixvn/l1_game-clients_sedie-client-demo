import {
    FishPrawnCrabBetPercentages,
    BetPercentageItem,
    calculateBetStatistics,
    countResult,
    BetCounts,
    BetResult,
    BetPercentagesProps,
    BetPercentageItemProps
} from 'libs/saba-games/src/games/saba-club/fish-prawn-crab/bet-percentages';

describe('Index Barrel Exports', () => {
    test('should export FishPrawnCrabBetPercentages component', () => {
        // Assert
        expect(FishPrawnCrabBetPercentages).toBeDefined();
    });

    test('should export BetPercentageItem component', () => {
        // Assert
        expect(BetPercentageItem).toBeDefined();
    });

    test('should export calculateBetStatistics utility function', () => {
        // Assert
        expect(calculateBetStatistics).toBeDefined();
        expect(typeof calculateBetStatistics).toBe('function');
    });

    test('should export countResult utility function', () => {
        // Assert
        expect(countResult).toBeDefined();
        expect(typeof countResult).toBe('function');
    });

    // Verify types are exported correctly by using them in type definitions
    test('should export types correctly', () => {
        // These will not generate runtime errors even if types are missing
        // But they will fail to compile if types are not exported correctly

        // Type declarations using the exported types (TypeScript compile-time check)
        type TestBetCounts = BetCounts;
        type TestBetResult = BetResult;
        type TestBetPercentagesProps = BetPercentagesProps;
        type TestBetPercentageItemProps = BetPercentageItemProps;

        // Assert - this just verifies the test runs without compilation errors
        expect(true).toBe(true);
    });
}); 