import { CardType, Result } from "../../baccarat";

export const sumScore = (score: number, card: number): number => {
    const cardValue = card >= 9 ? 0 : card + 1;
    const newScore = (score + cardValue) % 10;
    return newScore;
};

export const calculateTotalScore = (cards: number[]): number => {
    if (!cards || cards.length === 0) {
        throw new Error('Cards array cannot be empty');
    }

    if (cards.some(card => card < 0 || card > 12)) {
        throw new Error('Card values must be between 0 and 12');
    }

    return cards.reduce((score, card) => sumScore(score, card), 0);
};

export const getCardValues = (cards: (CardType | undefined)[]): number[] => {
    const validCards = cards.filter((card): card is CardType => card !== undefined);
    return validCards.map(card => card.card);
};

export const determineWinner = (playerScore: number, bankerScore: number): string => {
    if (playerScore > bankerScore) {
        return 'player_win';
    } else if (bankerScore > playerScore) {
        return 'banker_win';
    } else {
        return 'tie_win';
    }
};


export const CardAnimationConfig = {
    baseDelay: 50,
    intervalDelay: 200,
    orders: {
        playerCard1: 1,
        bankerCard1: 2,
        playerCard2: 3,
        bankerCard2: 4,
        playerCard3: 5,
        bankerCard3: 6
    },
    getAnimationTime: (order: number) => {
        const baseTime = 50;
        const cardInterval = 200;
        const pairDelay = 100;
        const thirdCardExtraDelay = 300; // Extra delay for third cards

        const pairIndex = Math.floor((order - 1) / 2);
        const positionInPair = (order - 1) % 2;
        const isThirdCard = order >= 5; // Check if it's a third card (order 5 or 6)

        return baseTime +
            (pairIndex * (cardInterval + pairDelay)) +
            (positionInPair * cardInterval) +
            (isThirdCard ? thirdCardExtraDelay : 0);
    }
};

export interface CardOrderWithTiming {
    value: any;
    order: number;
    animationDelay: number;
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
}

export const GetPlayerCardsResult = (result: Result): CardOrderWithTiming[] => {
    const { orders, getAnimationTime } = CardAnimationConfig;
    let runningScore = 0;
    const hasThirdCard = !!result.player.card3;
    const playerCards = [
        {
            value: result.player.card1,
            order: orders.playerCard1,
            animationDelay: getAnimationTime(orders.playerCard1),
            accumulatedScore: runningScore = sumScore(0, result.player.card1.card),
            playerHasThirdCard: hasThirdCard
        },
        {
            value: result.player.card2,
            order: orders.playerCard2,
            animationDelay: getAnimationTime(orders.playerCard2),
            accumulatedScore: runningScore = sumScore(runningScore, result.player.card2.card),
            playerHasThirdCard: hasThirdCard
        }
    ];

    // Only add third card if it exists
    if (result.player.card3) {
        playerCards.push({
            value: result.player.card3,
            order: orders.playerCard3,
            animationDelay: getAnimationTime(orders.playerCard3),
            accumulatedScore: sumScore(runningScore, result.player.card3.card),
            playerHasThirdCard: hasThirdCard
        });
    }

    return playerCards;
};

export const GetBankerCardsResult = (result: Result): CardOrderWithTiming[] => {
    const { orders, getAnimationTime } = CardAnimationConfig;
    let runningScore = 0;
    const hasThirdCard = !!result.player.card3;
    const bankerCards = [
        {
            value: result.banker.card1,
            order: orders.bankerCard1,
            animationDelay: getAnimationTime(orders.bankerCard1),
            accumulatedScore: runningScore = sumScore(0, result.banker.card1.card),
            playerHasThirdCard: hasThirdCard
        },
        {
            value: result.banker.card2,
            order: orders.bankerCard2,
            animationDelay: getAnimationTime(orders.bankerCard2),
            accumulatedScore: runningScore = sumScore(runningScore, result.banker.card2.card),
            playerHasThirdCard: hasThirdCard
        }
    ];

    // Only add third card if it exists
    if (result.banker.card3) {
        bankerCards.push({
            value: result.banker.card3,
            order: hasThirdCard ? orders.bankerCard3 : orders.playerCard3,
            animationDelay: getAnimationTime(hasThirdCard ? orders.bankerCard3 : orders.playerCard3),
            accumulatedScore: sumScore(runningScore, result.banker.card3.card),
            playerHasThirdCard: hasThirdCard
        });
    }

    return bankerCards;
};
