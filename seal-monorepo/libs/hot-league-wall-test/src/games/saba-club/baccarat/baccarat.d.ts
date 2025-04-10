import { GameBaseState } from "../../shared/game-base/type";

export type SettlementResult = {
    banker: boolean;
    bankerPair: boolean;
    natural: boolean;
    player: boolean;
    playerPair: boolean;
    tie: boolean;
};

export type CardType = {
    card: number;
    type: number;
};

export type Cards = {
    card1: CardType;
    card2: CardType;
    card3?: CardType;
};

export type Result = {
    banker: Cards;
    player: Cards;
};

export type Odd = {
    banker: number;
    bankerPair: number;
    big: number;
    player: number;
    playerPair: number;
};

export type CardOrder = {
    value: CardType;
    order: number;
    animationDuration?: number;
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
};

export interface BaccaratState<Result, SettlementResult> extends GameBaseState<any, any> {
    isOpenCardThree?: boolean;
}
