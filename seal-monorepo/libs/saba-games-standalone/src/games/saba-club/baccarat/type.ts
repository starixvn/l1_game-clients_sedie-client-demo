import { IGameBaseState } from "../../../_shared/components/game-base";

export type BaccaratWinner = 'player' | 'banker' | 'tie';

export interface IBaccaratResult {
    playerValue: number;
    bankerValue: number;
}

export interface BaccaratSettlementResult {
    winner: BaccaratWinner;
    player: boolean;
    banker: boolean;
    tie: boolean;
    playerPair: boolean;
    bankerPair: boolean;
    natural?: boolean;
    isBlink?: boolean;
}

export interface BaccaratRoadConverterResult {
    isPlayer: boolean;
    isBanker: boolean;
    isTie: boolean;
}

export interface IBaccaratBet {
    type: "player" | "banker" | "tie" | "playerPair" | "bankerPair";
    amount: number;
}

export interface IBaccaratState extends IGameBaseState {
    currentBets: IBaccaratBet[];
    lastResult?: IBaccaratResult;
    roundHistory: IBaccaratResult[];
    totalWin: number;
    isRoundOpen: boolean;
    timeRemaining: number;
}

export interface IBaccaratProps {
    namespace: string;
    language: string;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
} 