export type OverUnderSettlementResult = {
    over: boolean | undefined;
    under: boolean | undefined;
};

export type OddEvenSettlementResult = {
    odd: boolean | undefined;
    even: boolean | undefined;
};

export type BigSmallSettlementResult = {
    big: boolean | undefined;
    small: boolean | undefined;
};

export const choices = { 
    over: "over", 
    under: "under", 
    odd: "odd", 
    even: "even", 
    big: "big", 
    small: "small",
    head: "head",
    tail: "tail"
};
