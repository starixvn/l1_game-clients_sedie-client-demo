import { ColorGameSymbol } from "../../../_shared/components/color-game-dice";

export enum ColorGameOddsType {
    single = 'single',
    double = 'double',
    triple = 'triple'
}

export enum ColorGameChoices {
    yellow = 'yellow',
    white = 'white',
    pink = 'pink',
    blue = 'blue',
    red = 'red',
    green = 'green'
}

export type ColorGameSymbolType = keyof typeof ColorGameChoices;

export const topChoices = [
    ColorGameChoices.yellow,
    ColorGameChoices.white,
    ColorGameChoices.pink
];

export const bottomChoices = [
    ColorGameChoices.blue,
    ColorGameChoices.red,
    ColorGameChoices.green
];

export type ColorGameResult = {
    [key in ColorGameSymbolType]?: boolean;
};

export type ColorGameSettlementResult = {
    [key in ColorGameSymbolType]?: boolean;
};

export type BetChoices = {
    [key in ColorGameChoices]?: number
}

export interface ColorGameDice {
    index: number;
    symbol: ColorGameSymbol;
}

export interface ColorGameDiceRolled {
    dice: ColorGameDice[];
    isFinishedRolling: boolean;
}

export interface ColorGameBet {
    symbol: ColorGameSymbolType;
    amount: number;
}

export interface ColorGameRound {
    roundId: string;
    status: 'placingBets' | 'lockingBet' | 'showingResult' | 'finished';
    startTime: number;
    endTime: number;
    result?: ColorGameResult;
    bets?: ColorGameBet[];
} 