import { CardResult } from "../../../../../_shared/components/card/type";

/**
 * Maps card ranks directly to scores using a lookup table
 * This simplifies the calculation without needing to add 1 to the rank
 */
export const SCORE_MAP = [
    1,  // Ace (rank 0)
    2,  // 2 (rank 1)
    3,  // 3 (rank 2)
    4,  // 4 (rank 3)
    5,  // 5 (rank 4)
    6,  // 6 (rank 5)
    7,  // 7 (rank 6)
    8,  // 8 (rank 7)
    9,  // 9 (rank 8)
    10, // 10 (rank 9)
    11, // Jack (rank 10)
    12, // Queen (rank 11)
    13  // King (rank 12)
];

/**
 * Calculate score directly from a card result object
 * Uses the SCORE_MAP for direct lookup instead of rank + 1
 * @param cardResult The card result object containing rank
 * @returns The point value of the card
 */
export const calculateScore = (cardResult?: CardResult): number => {
    // If no card or invalid rank, return 0
    if (!cardResult || cardResult.rank === undefined || cardResult.rank === null) {
        return 0;
    }

    // Use the score map to get the score directly
    return SCORE_MAP[cardResult.rank] || 0;
};

// For backward compatibility
export const CardScoreUtils = {
    calculateScore,
    getCardPointValue: (card?: number): number => {
        if (card === undefined || card === null) return 0;
        return SCORE_MAP[card] || 0;
    }
};

export default CardScoreUtils; 