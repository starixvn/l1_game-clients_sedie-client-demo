import { GameServiceMessage } from "../models/game-messages";
export const getCardValue = (card: GameServiceMessage.Card) => {
    if (!card) {
        return 0;
    }

    let cardValue = card.rank + 1;

    if (cardValue >= 10) {
        cardValue = 0;
    }

    return cardValue;
};

export const getTotalScore = (cards: GameServiceMessage.Card[]) => {
    return cards.reduce((result, card) => {
        const cardValue = getCardValue(card);

        return (result + cardValue) % 10;
    }, 0);
};
