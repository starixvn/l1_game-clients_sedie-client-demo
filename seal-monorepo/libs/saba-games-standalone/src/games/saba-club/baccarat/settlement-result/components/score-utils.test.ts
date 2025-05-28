import { calculateTotalScore, CardAnimationConfig, GetBankerCardsResult, GetPlayerCardsResult, sumScore } from './score-utils';
import { Result } from '../../baccarat';

describe('sumScore', () => {
    // Individual card rank tests
    describe('number cards (Ace through 9)', () => {
        it('should handle Ace through 5 correctly', () => {
            expect(sumScore(0, 0)).toBe(1);  // Ace = 1
            expect(sumScore(0, 1)).toBe(2);  // 2
            expect(sumScore(0, 2)).toBe(3);  // 3
            expect(sumScore(0, 3)).toBe(4);  // 4
            expect(sumScore(0, 4)).toBe(5);  // 5
        });

        it('should handle 6 through 9 correctly', () => {
            expect(sumScore(0, 5)).toBe(6);  // 6
            expect(sumScore(0, 6)).toBe(7);  // 7
            expect(sumScore(0, 7)).toBe(8);  // 8
            expect(sumScore(0, 8)).toBe(9);  // 9
        });
    });

    describe('face cards (10, J, Q, K)', () => {
        it('should handle all face cards as zero', () => {
            expect(sumScore(0, 9)).toBe(0);   // 10 = 0
            expect(sumScore(0, 10)).toBe(0);  // Jack = 0
            expect(sumScore(0, 11)).toBe(0);  // Queen = 0
            expect(sumScore(0, 12)).toBe(0);  // King = 0
        });

        it('should maintain existing score with face cards', () => {
            expect(sumScore(5, 9)).toBe(5);   // 5 + 10(0) = 5
            expect(sumScore(7, 10)).toBe(7);  // 7 + Jack(0) = 7
            expect(sumScore(3, 11)).toBe(3);  // 3 + Queen(0) = 3
            expect(sumScore(8, 12)).toBe(8);  // 8 + King(0) = 8
        });
    });

    // Progressive sum tests with different ranks
    describe('progressive sums with number cards', () => {
        it('should handle ascending sequences', () => {
            let score = 0;
            score = sumScore(score, 0);  // 0 -> 1 (Ace)
            expect(score).toBe(1);
            score = sumScore(score, 1);  // 1 + 2 = 3
            expect(score).toBe(3);
            score = sumScore(score, 2);  // 3 + 3 = 6
            expect(score).toBe(6);
            score = sumScore(score, 3);  // 6 + 4 = 0
            expect(score).toBe(0);
        });

        it('should handle descending sequences', () => {
            let score = 0;
            score = sumScore(score, 8);  // 0 + 9 = 9
            expect(score).toBe(9);
            score = sumScore(score, 7);  // 9 + 8 = 7
            expect(score).toBe(7);
            score = sumScore(score, 6);  // 7 + 7 = 4
            expect(score).toBe(4);
        });
    });

    describe('combinations with face cards', () => {
        it('should handle number card followed by face cards', () => {
            let score = 0;
            score = sumScore(score, 4);   // 0 + 5 = 5
            expect(score).toBe(5);
            score = sumScore(score, 9);   // 5 + 0 = 5 (10)
            expect(score).toBe(5);
            score = sumScore(score, 10);  // 5 + 0 = 5 (Jack)
            expect(score).toBe(5);
        });

        it('should handle face cards followed by number cards', () => {
            let score = 0;
            score = sumScore(score, 12);  // 0 + 0 = 0 (King)
            expect(score).toBe(0);
            score = sumScore(score, 3);   // 0 + 4 = 4
            expect(score).toBe(4);
            score = sumScore(score, 11);  // 4 + 0 = 4 (Queen)
            expect(score).toBe(4);
        });
    });

    // Modulo tests with different ranks
    describe('modulo operations with different ranks', () => {
        it('should handle pairs of same rank', () => {
            // Number cards
            expect(sumScore(0, 0)).toBe(1);         // Ace + 0 = 1
            expect(sumScore(1, 0)).toBe(2);         // 1 + 1 = 2
            expect(sumScore(0, 8)).toBe(9);         // 0 + 9 = 9
            expect(sumScore(9, 8)).toBe(8);         // 9 + 9 = 18 % 10 = 8

            // Face cards
            expect(sumScore(0, 9)).toBe(0);         // 0 + 0 = 0 (10)
            expect(sumScore(0, 12)).toBe(0);        // 0 + 0 = 0 (King)
        });

        it('should handle combinations causing modulo', () => {
            expect(sumScore(8, 7)).toBe(6);         // 8 + 8 = 16 % 10 = 6
            expect(sumScore(7, 8)).toBe(6);         // 7 + 9 = 16 % 10 = 6
            expect(sumScore(9, 6)).toBe(6);         // 9 + 7 = 16 % 10 = 6
            expect(sumScore(5, 8)).toBe(4);         // 5 + 9 = 14 % 10 = 4
        });
    });
});

describe('calculateTotalScore', () => {
    // Single card tests
    describe('single card scenarios', () => {
        it('should handle single number cards correctly', () => {
            expect(calculateTotalScore([0])).toBe(1);  // Ace = 1
            expect(calculateTotalScore([4])).toBe(5);  // 5
            expect(calculateTotalScore([8])).toBe(9);  // 9
        });

        it('should handle single face cards correctly', () => {
            expect(calculateTotalScore([9])).toBe(0);   // 10 = 0
            expect(calculateTotalScore([10])).toBe(0);  // Jack = 0
            expect(calculateTotalScore([11])).toBe(0);  // Queen = 0
            expect(calculateTotalScore([12])).toBe(0);  // King = 0
        });
    });

    // Two card combinations
    describe('two card combinations', () => {
        it('should calculate correct total for single digit sum', () => {
            expect(calculateTotalScore([0, 1])).toBe(3);   // 1 + 2 = 3
            expect(calculateTotalScore([3, 4])).toBe(9);   // 4 + 5 = 9
            expect(calculateTotalScore([0, 0])).toBe(2);   // 1 + 1 = 2
        });

        it('should handle combinations with face cards', () => {
            expect(calculateTotalScore([4, 9])).toBe(5);   // 5 + 0 = 5
            expect(calculateTotalScore([9, 4])).toBe(5);   // 0 + 5 = 5
            expect(calculateTotalScore([9, 10])).toBe(0);  // 0 + 0 = 0
        });

        it('should calculate correct total when sum exceeds 10', () => {
            expect(calculateTotalScore([7, 6])).toBe(5);   // 8 + 7 = 15 % 10 = 5
            expect(calculateTotalScore([8, 8])).toBe(8);   // 9 + 9 = 18 % 10 = 8
        });
    });

    // Three or more card combinations
    describe('multiple card combinations', () => {
        it('should handle three card combinations correctly', () => {
            expect(calculateTotalScore([0, 1, 2])).toBe(6);  // 1 + 2 + 3 = 6
            expect(calculateTotalScore([8, 8, 8])).toBe(7);  // 9 + 9 + 9 = 27 % 10 = 7
        });

        it('should handle combinations with face cards', () => {
            expect(calculateTotalScore([9, 10, 11, 12])).toBe(0);  // 0 + 0 + 0 + 0 = 0
            expect(calculateTotalScore([4, 10, 2])).toBe(8);  // 5 + 0 + 3 = 8
        });

        it('should handle large combinations correctly', () => {
            const manyCards = Array(10).fill(1);  // Ten 2's
            expect(calculateTotalScore(manyCards)).toBe(0); // 10 * 2 = 20 % 10 = 0

            const mixedCards = [0, 9, 2, 10, 4];
            expect(calculateTotalScore(mixedCards)).toBe(9); // 1 + 0 + 3 + 0 + 5 = 9
        });
    });

    // Error cases
    describe('error handling', () => {
        it('should throw error for empty array', () => {
            expect(() => calculateTotalScore([])).toThrow('Cards array cannot be empty');
        });

        it('should throw error for null/undefined array', () => {
            expect(() => calculateTotalScore(null as any)).toThrow('Cards array cannot be empty');
            expect(() => calculateTotalScore(undefined as any)).toThrow('Cards array cannot be empty');
        });

        // it('should throw error for invalid card values', () => {
        //     expect(() => calculateTotalScore([-1])).toThrow('Card values must be between 0 and 12');
        //     expect(() => calculateTotalScore([13])).toThrow('Card values must be between 0 and 12');
        //     expect(() => calculateTotalScore([1, -1, 2])).toThrow('Card values must be between 0 and 12');
        //     expect(() => calculateTotalScore([1, 15, 2])).toThrow('Card values must be between 0 and 12');
        // });
    });

    // Boundary tests
    describe('boundary conditions', () => {
        it('should handle minimum valid card values', () => {
            expect(calculateTotalScore([0])).toBe(1);  // Minimum card value
            expect(calculateTotalScore([0, 0])).toBe(2);  // Two minimum values
        });

        it('should handle maximum valid card values', () => {
            expect(calculateTotalScore([12])).toBe(0);  // Maximum card value
            expect(calculateTotalScore([12, 12])).toBe(0);  // Two maximum values
        });

        it('should handle mixed boundary values', () => {
            expect(calculateTotalScore([0, 12])).toBe(1);  // Min + Max = 1 + 0 = 1
            expect(calculateTotalScore([12, 0, 12])).toBe(1);  // Max + Min + Max = 0 + 1 + 0 = 1
        });
    });
});


describe('Baccarat Helper Functions', () => {
    // Mock data setup
    const createMockCard = (card: number) => ({
        card,
        type: 0
    });

    const createMockResult = (playerCards: number[], bankerCards: number[]): Result => ({
        player: {
            card1: createMockCard(playerCards[0]),
            card2: createMockCard(playerCards[1]),
            card3: playerCards[2] !== undefined ? createMockCard(playerCards[2]) : undefined,
        },
        banker: {
            card1: createMockCard(bankerCards[0]),
            card2: createMockCard(bankerCards[1]),
            card3: bankerCards[2] !== undefined ? createMockCard(bankerCards[2]) : undefined,
        }
    });

    describe('GetPlayerCardsResult', () => {
        it('should return correct card order and timing for two cards', () => {
            // Arrange
            const result = createMockResult([1, 2], [3, 4]);

            // Act
            const playerCards = GetPlayerCardsResult(result);

            // Assert
            expect(playerCards).toHaveLength(2);
            expect(playerCards[0].value).toBe(result.player.card1);
            expect(playerCards[1].value).toBe(result.player.card2);
            expect(playerCards[0].order).toBe(CardAnimationConfig.orders.playerCard1);
            expect(playerCards[1].order).toBe(CardAnimationConfig.orders.playerCard2);
            expect(playerCards[0].playerHasThirdCard).toBe(false);
        });

        it('should handle third card correctly', () => {
            // Arrange
            const result = createMockResult([1, 2, 5], [3, 4]);

            // Act
            const playerCards = GetPlayerCardsResult(result);

            // Assert
            expect(playerCards).toHaveLength(3);
            expect(playerCards[2].value).toBe(result.player.card3);
            expect(playerCards[2].order).toBe(CardAnimationConfig.orders.playerCard3);
            expect(playerCards[0].playerHasThirdCard).toBe(true);
        });

        it('should calculate accumulated scores correctly', () => {
            // Arrange
            const result = createMockResult([8, 9, 5], [3, 4]); // 9, 10(0), 6

            // Act
            const playerCards = GetPlayerCardsResult(result);

            // Assert
            expect(playerCards[0].accumulatedScore).toBe(9); // First card (8 + 1 = 9)
            expect(playerCards[1].accumulatedScore).toBe(9); // Second card (9 + 0 = 9)
            expect(playerCards[2].accumulatedScore).toBe(5); // Third card (9 + 6 = 15 % 10 = 5)
        });

        it('should handle face cards (value >= 9) correctly', () => {
            // Arrange
            const result = createMockResult([9, 10], [3, 4]); // 10(0), J(0)

            // Act
            const playerCards = GetPlayerCardsResult(result);

            // Assert
            expect(playerCards[1].accumulatedScore).toBe(0); // First card (10 = 0)
            expect(playerCards[0].accumulatedScore).toBe(0); // Second card (0 + 0 = 0)
        });
    });

    describe('GetBankerCardsResult', () => {
        it('should return correct card order and timing for two cards', () => {
            // Arrange
            const result = createMockResult([1, 2], [3, 4]);

            // Act
            const bankerCards = GetBankerCardsResult(result);

            // Assert
            expect(bankerCards).toHaveLength(2);
            expect(bankerCards[0].value).toBe(result.banker.card1);
            expect(bankerCards[1].value).toBe(result.banker.card2);
            expect(bankerCards[0].order).toBe(CardAnimationConfig.orders.bankerCard1);
            expect(bankerCards[1].order).toBe(CardAnimationConfig.orders.bankerCard2);
        });

        it('should handle banker third card with player third card', () => {
            // Arrange
            const result = createMockResult([1, 2, 5], [3, 4, 6]);

            // Act
            const bankerCards = GetBankerCardsResult(result);

            // Assert
            expect(bankerCards).toHaveLength(3);
            expect(bankerCards[2].value).toBe(result.banker.card3);
            expect(bankerCards[2].order).toBe(CardAnimationConfig.orders.bankerCard3);
            expect(bankerCards[0].playerHasThirdCard).toBe(true);
        });

        it('should handle banker third card without player third card', () => {
            // Arrange
            const result = createMockResult([1, 2], [3, 4, 6]);

            // Act
            const bankerCards = GetBankerCardsResult(result);

            // Assert
            expect(bankerCards).toHaveLength(3);
            expect(bankerCards[2].value).toBe(result.banker.card3);
            expect(bankerCards[2].order).toBe(CardAnimationConfig.orders.playerCard3);
            expect(bankerCards[0].playerHasThirdCard).toBe(false);
        });
    });

    describe('CardAnimationConfig.getAnimationTime', () => {
        it('should calculate correct timing for first pair of cards', () => {
            expect(CardAnimationConfig.getAnimationTime(1)).toBe(50); // First card
            expect(CardAnimationConfig.getAnimationTime(2)).toBe(250); // Second card
        });

        it('should calculate correct timing for second pair of cards', () => {
            expect(CardAnimationConfig.getAnimationTime(3)).toBe(350); // Third card
            expect(CardAnimationConfig.getAnimationTime(4)).toBe(550); // Fourth card
        });

        it('should calculate correct timing for third cards with extra delay', () => {
            expect(CardAnimationConfig.getAnimationTime(5)).toBe(950); // Fifth card
            expect(CardAnimationConfig.getAnimationTime(6)).toBe(1150); // Sixth card
        });
    });
});