import { FishPrawnCrabSymbol } from "../../../_shared/components/fish-prawn-crab-dice";

export enum FishPrawnOddsType {
    single = 'single',
    double = 'double',
    triple = 'triple'
}

export enum FishPrawnCrabChoices {
    fish = 'fish',
    prawn = 'prawn',
    crab = 'crab',
    rooster = 'rooster',
    gourd = 'gourd',
    stag = 'stag'
}

export const topChoices = [
    FishPrawnCrabChoices.stag,
    FishPrawnCrabChoices.gourd,
    FishPrawnCrabChoices.rooster

];

export const bottomChoices = [
    FishPrawnCrabChoices.fish,
    FishPrawnCrabChoices.crab,
    FishPrawnCrabChoices.prawn

];

export type FishPrawnCrabSymbolType = keyof typeof FishPrawnCrabChoices;

export type FishPrawnCrabResult = {
    [key in FishPrawnCrabSymbolType]?: boolean;
};

export type FishPrawnCrabSettlementResult = {
    [key in FishPrawnCrabSymbolType]?: boolean;
};

export type BetChoices = {
    [key in FishPrawnCrabChoices]?: number
}

export interface FishPrawnCrabDice {
    index: number;
    symbol: FishPrawnCrabSymbol;
}

export interface FishPrawnCrabDiceRolled {
    dice: FishPrawnCrabDice[];
    isFinishedRolling: boolean;
}

export interface FishPrawnCrabBet {
    symbol: FishPrawnCrabSymbolType;
    amount: number;
}

export interface FishPrawnCrabRound {
    roundId: string;
    status: 'placingBets' | 'lockingBet' | 'showingResult' | 'finished';
    startTime: number;
    endTime: number;
    result?: FishPrawnCrabResult;
    bets?: FishPrawnCrabBet[];
} 