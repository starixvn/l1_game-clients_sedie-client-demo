// Message types enum
export enum MessageType {
    SET_TOKEN = 'SET_TOKEN',
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
    BETTING_BLOCK_STATE = 'BETTING_BLOCK_STATE',
    BET_PANEL_STATE = 'BET_PANEL_STATE',
    HANDLE_BET = 'HANDLE_BET',
    HANDLE_CLEAR = 'HANDLE_CLEAR',
    TOGGLE_STATISTIC = 'TOGGLE_STATISTIC',
    GET_HEIGHT = 'GET_HEIGHT',
    SET_HEIGHT = 'SET_HEIGHT',
    SHOW_CONFIRM_BET = 'SHOW_CONFIRM_BET',
    HIDE_CONFIRM_BET = 'HIDE_CONFIRM_BET',
    SYNC_BALANCE = 'SYNC_BALANCE',
    RENEW_TOKEN = 'RENEW_TOKEN',
}

// set token data
export interface SetTokenData {
    token: string;
}

interface SetTokenMessage {
    type: MessageType.SET_TOKEN;
    data: SetTokenData;
}

// toggle statistic data
export interface ToggleStatisticData {
    isOpen: boolean;
}

interface ToggleStatisticMessage {
    type: MessageType.TOGGLE_STATISTIC;
    data: ToggleStatisticData;
}

// update settings data
export interface UpdateSettingsData {
    theme: string;
    isDarkMode: boolean;
    language: string;
}

interface UpdateSettingsMessage {
    type: MessageType.UPDATE_SETTINGS;
    data: UpdateSettingsData;
}

// betting block state data
export interface BettingBlockStateData {
    isShowBetSlip: boolean;
    betChoice: string;
    odd: number;
}

interface BettingBlockStateMessage {
    type: MessageType.BETTING_BLOCK_STATE;
    data: BettingBlockStateData;
}

// bet panel state data
export interface BetPanelStateData {
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
export interface HandleBetData {
    amount: number;
    betChoice: string;
    clientSeed: string;
}

interface HandleBetMessage {
    type: MessageType.HANDLE_BET;
    data: HandleBetData;
}

// show confirm bet data
export interface ShowConfirmBetData {
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

export interface HideConfirmBetData {
    turnOffNotification: boolean;
}
// hide confirm bet data
interface HideConfirmBetMessage {
    type: MessageType.HIDE_CONFIRM_BET;
    data: HideConfirmBetData;
}

// set height data
export interface SetHeightData {
    height: number;
}
interface SetHeightMessage {
    type: MessageType.SET_HEIGHT;
    data: SetHeightData;
}

interface GetHeightMessage {
    type: MessageType.GET_HEIGHT;
}

// sync balance data
export interface SyncBalanceData {
    totalStake?: number;
    winBet?: number;
}

interface SyncBalanceMessage {
    type: MessageType.SYNC_BALANCE;
    data: SyncBalanceData;
}

export interface MessageData {
    [MessageType.SET_TOKEN]: SetTokenData;
    [MessageType.UPDATE_SETTINGS]: UpdateSettingsData;
    [MessageType.BETTING_BLOCK_STATE]: BettingBlockStateData;
    [MessageType.BET_PANEL_STATE]: BetPanelStateData;
    [MessageType.HANDLE_BET]: HandleBetData;
    [MessageType.SHOW_CONFIRM_BET]: ShowConfirmBetData;
    [MessageType.HIDE_CONFIRM_BET]: HideConfirmBetData;
    [MessageType.TOGGLE_STATISTIC]: ToggleStatisticData;
    [MessageType.SET_HEIGHT]: SetHeightData;
    [MessageType.GET_HEIGHT]: any;
    [MessageType.HANDLE_CLEAR]: any;
    [MessageType.SYNC_BALANCE]: SyncBalanceData;
    [MessageType.RENEW_TOKEN]: any;
}


export type WindowMessage =
    | SetTokenMessage
    | ToggleStatisticMessage
    | UpdateSettingsMessage
    | BettingBlockStateMessage
    | BetPanelStateMessage
    | HandleBetMessage
    | ShowConfirmBetMessage
    | HideConfirmBetMessage
    | GetHeightMessage
    | SetHeightMessage
    | SyncBalanceMessage
    | { type: MessageType.HANDLE_CLEAR }
    | { type: MessageType.RENEW_TOKEN };

// Message event type
export type MessageEvent = {
    data: any;
    origin: string;
};

// Message handler type
export type MessageHandler = (event: MessageEvent) => void; 