export interface BetPanelState {
    isShowBetSlip: boolean;
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
    position?: {
        top: number;
        left: number;
    };
}

export interface BettingChip {
    value: number;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

export interface MessageHandler {
    handleMessage: (event: MessageEvent) => void;
}

export interface IframeMessage {
    type: string;
    data?: any;
} 