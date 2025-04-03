export const SeDieChoices = {
    odd: 'odd',
    even: 'even',
    red4: 'red4',
    red3: 'red3',
    red2: 'red2',
    white4: 'white4',
    white3: 'white3',
};

// TODO: type 歸 type，constants 寫到 constants，大小寫要統一
export const mainChoices = [SeDieChoices.odd, SeDieChoices.even];
export const topChoices = [SeDieChoices.red4, SeDieChoices.red3, SeDieChoices.red2];
export const bottomChoices = [SeDieChoices.white4, SeDieChoices.white3];

export const ChoiceSeDieIconMapper: Record<string, boolean[]> = {
    red4: [true, true, true, true],
    red2: [true, true, false, false],
    white4: [false, false, false, false],
    red3: [true, true, true, false],
    white3: [true, false, false, false],
};

export type SedieResult = {
    red1: boolean;
    red2: boolean;
    red3: boolean;
    red4: boolean;
};

export type SedieSettlementResult = {
    odd: boolean;
    even: boolean;
    red2: boolean;
    red3: boolean;
    red4: boolean;
    white3: boolean;
    white4: boolean;
};
