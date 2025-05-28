import { CoinSymbol } from "../../../_shared/components/coin";
import { CoinTossChoices } from "./type";

export const resultMapper = {
    empty: -1,
    head: 0,
    tail: 1,
};

export const convertValueToSymbol = (value: number): CoinSymbol => {
    switch (value) {
        case resultMapper.head: return CoinSymbol.HEAD;
        case resultMapper.tail: return CoinSymbol.TAIL;
        default: return CoinSymbol.EMPTY;
    }
};

// Map choices to their display icons/patterns
export const choiceToSymbolMap: Record<CoinTossChoices, CoinSymbol> = {
    [CoinTossChoices.head]: CoinSymbol.HEAD,
    [CoinTossChoices.tail]: CoinSymbol.TAIL
};

// Create empty settlement result template
export const createEmptySettlementResult = () => ({
    winner: CoinTossChoices.head,
    [CoinTossChoices.head]: false,
    [CoinTossChoices.tail]: false,
});
