import { CoinSymbol } from "../../../../_shared/components/coin";
import { choiceToSymbolMap } from "../coin-toss-utils";

// choiceToSymbol map moved to coin-toss-utils.tsx as choiceToSymbolMap
export const ANIMATION_DURATION_MS = 2000;

export const blinkRoundItem = {
    "dice1": CoinSymbol.HEAD,
    "dice2": CoinSymbol.TAIL
}


export const emptyRoundItem = {
    "dice1": CoinSymbol.EMPTY,
    "dice2": CoinSymbol.EMPTY,
}

export { choiceToSymbolMap };

export const MAX_DISPLAYED_ROUNDS = 10; 