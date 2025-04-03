export enum WarnMsgType {
    NOT_NUMBER = 'notNumber',
    LESS_THAN_MIN = 'lessThanMin',
    MORE_THAN_MAX = 'moreThanMax',
}


export type ValidationResult = {
    newAmount: number;
    msg: '' | WarnMsgType.NOT_NUMBER | WarnMsgType.LESS_THAN_MIN | WarnMsgType.MORE_THAN_MAX;
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