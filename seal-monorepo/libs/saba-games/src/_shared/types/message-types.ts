// Message types enum
export enum MessageType {
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
    BETTING_BLOCK_STATE = 'BETTING_BLOCK_STATE',
    BET_PANEL_STATE = 'BET_PANEL_STATE',
    HANDLE_BET = 'HANDLE_BET',
    HANDLE_INPUT_CHANGE = 'HANDLE_INPUT_CHANGE',
    HANDLE_CLEAR = 'HANDLE_CLEAR',
    TOGGLE_STATISTIC = 'TOGGLE_STATISTIC',
    GET_HEIGHT = 'GET_HEIGHT',
    SET_HEIGHT = 'SET_HEIGHT',
    SHOW_CONFIRM_BET = 'SHOW_CONFIRM_BET',
    HIDE_CONFIRM_BET = 'HIDE_CONFIRM_BET',
}

// toggle statistic data
interface ToggleStatisticData {
    isOpen: boolean;
}

interface ToggleStatisticMessage {
    type: MessageType.TOGGLE_STATISTIC;
    data: ToggleStatisticData;
}

// update settings data
interface UpdateSettingsData {
    theme: string;
    isDarkMode: boolean;
    language: string;
}

interface UpdateSettingsMessage {
    type: MessageType.UPDATE_SETTINGS;
    data: UpdateSettingsData;
}

// betting block state data
interface BettingBlockStateData {
    isShowBetSlip: boolean;
    betChoice: string;
    odd: number;
}

interface BettingBlockStateMessage {
    type: MessageType.BETTING_BLOCK_STATE;
    data: BettingBlockStateData;
}

// bet panel state data
interface BetPanelStateData {
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
}
interface BetPanelStateMessage {
    type: MessageType.BET_PANEL_STATE;
    data: BetPanelStateData;
}

// handle bet data
interface HandleBetData {
    amount: number;
    betChoice: string;
    clientSeed: string;
}

interface HandleBetMessage {
    type: MessageType.HANDLE_BET;
    data: HandleBetData;
}

// show confirm bet data
interface ShowConfirmBetData {
    totalStake: number;
    betChoice: string;
    namespace: string;
    position?: {
        top: number;
        left: number;
    };
}
interface ShowConfirmBetMessage {
    type: MessageType.SHOW_CONFIRM_BET;
    data: ShowConfirmBetData;
}

interface HideConfirmBetData {
    turnOffNotification: boolean;
}
// hide confirm bet data
interface HideConfirmBetMessage {
    type: MessageType.HIDE_CONFIRM_BET;
    data: HideConfirmBetData;
}

// handle input change data
interface HandleInputChangeData {
    value: string;
}
interface HandleInputChangeMessage {
    type: MessageType.HANDLE_INPUT_CHANGE;
    data: HandleInputChangeData;
}

// set height data
interface SetHeightData {
    height: number;
}
interface SetHeightMessage {
    type: MessageType.SET_HEIGHT;
    data: SetHeightData;
}

interface GetHeightMessage {
    type: MessageType.GET_HEIGHT;
}

export interface MessageData {
    [MessageType.UPDATE_SETTINGS]: UpdateSettingsData;
    [MessageType.BETTING_BLOCK_STATE]: BettingBlockStateData;
    [MessageType.BET_PANEL_STATE]: BetPanelStateData;
    [MessageType.HANDLE_BET]: HandleBetData;
    [MessageType.HANDLE_INPUT_CHANGE]: HandleInputChangeData;
    [MessageType.SHOW_CONFIRM_BET]: ShowConfirmBetData;
    [MessageType.HIDE_CONFIRM_BET]: HideConfirmBetData;
    [MessageType.TOGGLE_STATISTIC]: ToggleStatisticData;
    [MessageType.SET_HEIGHT]: SetHeightData;
    [MessageType.GET_HEIGHT]: any;
    [MessageType.HANDLE_CLEAR]: any;
}


export type WindowMessage =
    | ToggleStatisticMessage
    | UpdateSettingsMessage
    | BettingBlockStateMessage
    | BetPanelStateMessage
    | HandleBetMessage
    | ShowConfirmBetMessage
    | HideConfirmBetMessage
    | HandleInputChangeMessage
    | GetHeightMessage
    | SetHeightMessage
    | { type: MessageType.HANDLE_CLEAR };

// Message event type
export type MessageEvent = {
    data: any;
    origin: string;
};

// Message handler type
export type MessageHandler = (event: MessageEvent) => void; 