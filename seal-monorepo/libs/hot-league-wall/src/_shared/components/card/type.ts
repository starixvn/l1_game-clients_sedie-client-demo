export type Props = {
    result: CardResult;
    isSmall?: boolean;
    isAnimation?: boolean;
    customClassName?: string;
    viewMode?: string;
};

export interface CardResult {
    rank: number;
    suit: number;
}
