// Message types enum
export enum MessageType {
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
    BETTING_BLOCK_STATE = 'BETTING_BLOCK_STATE',
    BET_PANEL_STATE = 'BET_PANEL_STATE',
    HIDE_ALL_BET_PANELS = 'HIDE_ALL_BET_PANELS',
    HANDLE_BET = 'HANDLE_BET',
    HANDLE_INPUT_CHANGE = 'HANDLE_INPUT_CHANGE',
    HANDLE_CLEAR = 'HANDLE_CLEAR',
    TOGGLE_STATISTIC = 'TOGGLE_STATISTIC',
    GET_HEIGHT = 'GET_HEIGHT',
    SET_HEIGHT = 'SET_HEIGHT',
}

// Message interfaces
export interface UpdateSettingsMessage {
    type: MessageType.UPDATE_SETTINGS;
    settings: {
        theme: string;
        isDarkMode: boolean;
        language: string;
    };
}

export interface BettingBlockStateMessage {
    type: MessageType.BETTING_BLOCK_STATE;
    state: {
        isShowBetSlip: boolean;
        betChoice: string;
        odd: number;
    };
}

export interface BetPanelStateMessage {
    type: MessageType.BET_PANEL_STATE;
    state: {
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
    };
}

export interface HandleBetMessage {
    type: MessageType.HANDLE_BET;
    amount: number;
    betChoice: string;
    clientSeed: string;
}

export interface HandleInputChangeMessage {
    type: MessageType.HANDLE_INPUT_CHANGE;
    value: string;
}

export type WindowMessage =
    | UpdateSettingsMessage
    | BettingBlockStateMessage
    | BetPanelStateMessage
    | HandleBetMessage
    | HandleInputChangeMessage
    | { type: MessageType.HIDE_ALL_BET_PANELS | MessageType.HANDLE_CLEAR };

// Message event type
export type MessageEvent = {
    data: any;
    origin: string;
};

// Message handler type
export type MessageHandler = (event: MessageEvent) => void; 