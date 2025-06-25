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
interface ToggleStatisticMessage {
    isOpen: boolean;
}

interface UpdateSettingsMessage {
    settings: {
        theme: string;
        isDarkMode: boolean;
        language: string;
    };
}

interface BettingBlockStateMessage {
    state: {
        isShowBetSlip: boolean;
        betChoice: string;
        odd: number;
    };
}

interface BetPanelStateMessage {
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
    data: {
        amount: number;
        betChoice: string;
        clientSeed: string;
    }
}

interface HandleInputChangeMessage {
    value: string;
}

export interface MessageData {
    [MessageType.UPDATE_SETTINGS]?: UpdateSettingsMessage;
    [MessageType.BETTING_BLOCK_STATE]?: BettingBlockStateMessage;
    [MessageType.BET_PANEL_STATE]?: BetPanelStateMessage;
    [MessageType.HANDLE_BET]?: HandleBetMessage;
    [MessageType.HANDLE_INPUT_CHANGE]?: HandleInputChangeMessage;
    [MessageType.TOGGLE_STATISTIC]?: ToggleStatisticMessage;
    [MessageType.HIDE_ALL_BET_PANELS]?: any;
    [MessageType.GET_HEIGHT]?: any;
    [MessageType.SET_HEIGHT]?: any;
    [MessageType.HANDLE_CLEAR]?: any;
}


export type WindowMessage =
    | ToggleStatisticMessage
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