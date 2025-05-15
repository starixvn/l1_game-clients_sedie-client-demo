import { UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE, COIN_TOSS_GAME_NAMESPACE } from '../../../constant/app';

export enum WarnMsgType {
    NOT_NUMBER = 'notNumber',
    LESS_THAN_MIN = 'lessThanMin',
    MORE_THAN_MAX = 'moreThanMax',
}


export type ValidationResult = {
    newAmount: number;
    msg: '' | WarnMsgType.NOT_NUMBER | WarnMsgType.LESS_THAN_MIN | WarnMsgType.MORE_THAN_MAX;
};

export interface MinMaxResult {
    min: number;
    max: number;
}

/**
 * Calculate min and max betting amounts based on provided limits and game namespace.
 */
export const calculateMinMaxAmount = (
    minBet: number,
    stakeLevelMinBet: number,
    maxBet: number,
    stakeLevelMaxBet: number,
    betChoiceMax: number,
    maxBetPerChoices: Record<string, number>,
    namespace: string,
): MinMaxResult => {
    const newMin = Math.max(minBet, stakeLevelMinBet);
    let newMax: number;

    if (
        Object.keys(maxBetPerChoices).length <= 0 &&
        (namespace === UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE ||
            namespace === COIN_TOSS_GAME_NAMESPACE)
    ) {
        newMax = Math.min(maxBet, stakeLevelMaxBet);
    } else {
        newMax = Math.min(betChoiceMax, maxBet, stakeLevelMaxBet);
    }

    return { min: newMin, max: newMax };
};

export const checkValidAmount = (amount: number, min: number, max: number): ValidationResult => {
    if (isNaN(amount)) {
        return {
            newAmount: min,
            msg: WarnMsgType.NOT_NUMBER
        };
    }
    if (amount < min) {
        return {
            newAmount: min,
            msg: WarnMsgType.LESS_THAN_MIN
        };
    }
    if (amount > max) {
        return {
            newAmount: max,
            msg: WarnMsgType.MORE_THAN_MAX
        };
    }
    return {
        newAmount: amount,
        msg: ''
    };
};


export const parseInputValue = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue ? parseInt(numericValue, 10) : 0;
};