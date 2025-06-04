// Remove the React import and use the correct type
type MessageEvent = {
    data: any;
    origin: string;
};

// Message types enum
export enum MessageType {
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
    BETTING_BLOCK_STATE = 'BETTING_BLOCK_STATE',
    BET_PANEL_STATE = 'BET_PANEL_STATE',
    HIDE_ALL_BET_PANELS = 'HIDE_ALL_BET_PANELS',
    HANDLE_BET = 'HANDLE_BET',
    HANDLE_INPUT_CHANGE = 'HANDLE_INPUT_CHANGE',
    HANDLE_CLEAR = 'HANDLE_CLEAR',
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

// Message sender utility
export const sendMessage = (message: WindowMessage) => {
    window.parent.postMessage(message, '*');
};

// Message handler type
export type MessageHandler = (event: MessageEvent) => void;

// Message handler creator
export const createMessageHandler = (
    handlers: Partial<Record<MessageType, (data: any) => void>>,
    allowedOrigins: string[] = ['localhost:4551']
): MessageHandler => {
    return (event: MessageEvent) => {
        // Check if origin is allowed
        if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
            return;
        }

        const { type, ...data } = event.data;
        const handler = handlers[type as MessageType];

        if (handler) {
            handler(data);
        }
    };
};

// Helper functions for specific message types
export const sendUpdateSettings = (settings: UpdateSettingsMessage['settings']) => {
    sendMessage({
        type: MessageType.UPDATE_SETTINGS,
        settings
    });
};

export interface BettingBlockState {
    isShowBetSlip: boolean;
    betChoice: string;
    odd: number;
    position?: {
        top: number;
        left: number;
    };
}

export const sendBettingBlockState = (state: BettingBlockState) => {
    window.parent.postMessage({
        type: 'BETTING_BLOCK_STATE',
        state
    }, '*');
};

export const sendBetPanelState = (state: BetPanelStateMessage['state']) => {
    sendMessage({
        type: MessageType.BET_PANEL_STATE,
        state
    });
};

export const sendHideAllBetPanels = () => {
    sendMessage({
        type: MessageType.HIDE_ALL_BET_PANELS
    });
};

export const sendHandleBet = (amount: number, betChoice: string, clientSeed: string) => {
    sendMessage({
        type: MessageType.HANDLE_BET,
        amount,
        betChoice,
        clientSeed
    });
};

export const sendHandleInputChange = (value: string) => {
    sendMessage({
        type: MessageType.HANDLE_INPUT_CHANGE,
        value
    });
};

export const sendHandleClear = () => {
    sendMessage({
        type: MessageType.HANDLE_CLEAR
    });
}; 