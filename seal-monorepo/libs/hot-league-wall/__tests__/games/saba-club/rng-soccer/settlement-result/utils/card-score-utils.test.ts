import { calculateScore, SCORE_MAP, CardScoreUtils } from '../../../../../../src/games/saba-club/rng-soccer/settlement-result/utils/card-score-utils';
import { CardResult } from "../../../../../../src/_shared/components/card/type";

describe('CardScoreUtils', () => {
    describe('calculateScore', () => {
        // Happy path tests
        it('should return correct score for Ace (rank 0)', () => {
            // Arrange
            const cardResult: CardResult = { rank: 0, suit: 0 };

            // Act
            const score = calculateScore(cardResult);

            // Assert
            expect(score).toEqual(1);
        });

        it('should return correct score for each rank', () => {
            // Arrange & Act & Assert
            for (let rank = 0; rank < SCORE_MAP.length; rank++) {
                const cardResult: CardResult = { rank, suit: 0 };
                const score = calculateScore(cardResult);
                expect(score).toEqual(SCORE_MAP[rank]);
            }
        });

        // Edge cases
        it('should return 0 for undefined card result', () => {
            // Arrange
            const cardResult = undefined;

            // Act
            const score = calculateScore(cardResult);

            // Assert
            expect(score).toEqual(0);
        });

        it('should return 0 for null rank', () => {
            // Arrange
            const cardResult = { rank: null, suit: 0 } as unknown as CardResult;

            // Act
            const score = calculateScore(cardResult);

            // Assert
            expect(score).toEqual(0);
        });

        it('should return 0 for undefined rank', () => {
            // Arrange
            const cardResult = { rank: undefined, suit: 0 } as unknown as CardResult;

            // Act
            const score = calculateScore(cardResult);

            // Assert
            expect(score).toEqual(0);
        });

        it('should return 0 for invalid rank (outside of range)', () => {
            // Arrange
            const cardResult: CardResult = { rank: 99, suit: 0 };

            // Act
            const score = calculateScore(cardResult);

            // Assert
            expect(score).toEqual(0);
        });
    });

    describe('getCardPointValue', () => {
        // Happy path tests
        it('should return correct score for each rank', () => {
            // Arrange & Act & Assert
            for (let rank = 0; rank < SCORE_MAP.length; rank++) {
                const score = CardScoreUtils.getCardPointValue(rank);
                expect(score).toEqual(SCORE_MAP[rank]);
            }
        });

        // Edge cases
        it('should return 0 for undefined card', () => {
            // Arrange
            const card = undefined;

            // Act
            const score = CardScoreUtils.getCardPointValue(card);

            // Assert
            expect(score).toEqual(0);
        });

        it('should return 0 when functions internally handle null', () => {
            // We're testing the internal null handling logic 
            // even though TypeScript doesn't allow null directly

            // Act - use any to bypass TypeScript type checking
            const scoreFunction = CardScoreUtils.getCardPointValue as any;
            const score = scoreFunction(null);

            // Assert
            expect(score).toEqual(0);
        });

        it('should return 0 for invalid card rank (outside of range)', () => {
            // Arrange
            const card = 99;

            // Act
            const score = CardScoreUtils.getCardPointValue(card);

            // Assert
            expect(score).toEqual(0);
        });
    });
}); 