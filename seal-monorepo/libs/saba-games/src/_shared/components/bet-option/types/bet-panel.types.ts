import { GameServiceMessage } from '@sg/sg-game-client';

export interface IBetPanelState {
    top: number;
    left: number;
    betChoice: string;
    odd: number;
    amount: number;
    currency: string;
    min: number;
    max: number;
    payout: string;
    gameName: string;
    namespace: string;
    clientRoundId: number;
    isSpecialChoice: boolean;
    warnMsg: string;
    isShowBetSlip: boolean;
    clientSeed: string;
}

export interface IBetPanelConfig {
    minBet: number;
    maxBet: number;
    maxBetPerChoices: GameServiceMessage.MaxBetPerChoices;
    stakeLevel: {
        minBet: number;
        maxBet: number;
    };
    currency: string;
    clientRoundId: number;
    clientSeed: string;
}

export interface IBetPanelPosition {
    top: number;
    left: number;
} 