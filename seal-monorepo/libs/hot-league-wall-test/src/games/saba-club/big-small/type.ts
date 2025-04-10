export const BigSmallChoices = {
    big: "big",
    small: "small",
};

export const mainChoices = [BigSmallChoices.big, BigSmallChoices.small];

export type BigSmallResult = {
    dice1: number;
    dice2: number;
    dice3: number;
};

export type BigSmallSettlementResult = {
    big: boolean;
    small: boolean;
};

export type BigSmallRoundHistory = {
    settlementResult: BigSmallSettlementResult;
    result: BigSmallResult;
    roundId: number;
};
