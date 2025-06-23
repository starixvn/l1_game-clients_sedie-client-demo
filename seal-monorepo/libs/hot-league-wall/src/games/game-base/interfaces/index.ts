import * as gc from '@sg/sg-game-client';

// Breaking down the state into smaller interfaces for better organization
export interface ConnectionState {
    isConnected: boolean;
    isConnectFailed: boolean;
    initialized: boolean;
}

export interface GameState {
    gameId: number;
    roundId: number;
    roundState: string;
    isAllowedBet: boolean;
    isShowNextRoundMessage: boolean;
    settlementResultDuration: number;
    countdownTimer: number;
    placingBetStartTime: number;
}

export interface UIState {
    showDisabledPopup: boolean;
    isOpenStatistic: boolean;
    activePanelId: any;
    showBetPanel: boolean;
    isPopupVisible?: boolean;
}

export interface SettlementState {
    statusSettlement?: gc.GameServiceMessage.Status;
    isFinishShowResult: boolean;
}

export interface IGameBaseState extends ConnectionState, GameState, UIState, SettlementState { }

export interface GameStyleOverrides {
    [key: string]: string;
}

// Export common types
export * from './common-types';

// Export gateway types
export * from './gateway-types';

// Export game types
export * from './game-types'; 