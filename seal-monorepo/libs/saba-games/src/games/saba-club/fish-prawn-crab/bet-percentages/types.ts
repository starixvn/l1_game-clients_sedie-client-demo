import * as gc from '@sg/sg-game-client';
import { FishPrawnCrabChoices } from '../type';

export interface BetResult {
    fish: boolean;
    prawn: boolean;
    crab: boolean;
    rooster: boolean;
    gourd: boolean;
    stag: boolean;
}

export interface BetCounts {
    fish: number;
    prawn: number;
    crab: number;
    rooster: number;
    gourd: number;
    stag: number;
}

export interface BetPercentagesProps {
    gameName: string;
    rounds: gc.RoundHistories.RoundHistory[];
    translator?: (key: string) => string;
    language?: string;
}

export interface BetPercentageItemProps {
    gameName: string;
    choice: FishPrawnCrabChoices;
    count: number;
    translateBetOption: (option: string) => string;
} 