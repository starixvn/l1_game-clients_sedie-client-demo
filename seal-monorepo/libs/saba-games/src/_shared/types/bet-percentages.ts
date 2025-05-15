import * as gc from '@sg/sg-game-client';

export interface BaseBetPercentagesProps {
    gameName: string;
    rounds: gc.RoundHistories.RoundHistory[];
    translator?: (key: string) => string;
    language?: string;
}

export interface BaseBetPercentageItemProps<T extends string> {
    gameName: string;
    choice: T;
    count: number;
    translateBetOption: (option: string) => string;
} 