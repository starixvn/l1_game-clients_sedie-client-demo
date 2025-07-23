import { MessageType, WindowMessage, MessageEvent, MessageHandler, UpdateSettingsData, BettingBlockStateData, BetPanelStateData, HandleBetData, ShowConfirmBetData, HideConfirmBetData, ToggleStatisticData, SetHeightData, SetTokenData } from '../types/message-types';
import { EncryptedMessage, MessageEncryption } from '../../utils/encryption';
import { appSettings } from '../app-settings';

export interface MessageHandlerConfig {
    isLocalDevelopment: boolean;
    allowedOrigins: string[];
    encryptionKey?: string;
    enableEncryption: boolean;
}

export interface MessageHandlerOptions {
    onSetToken?: (data: SetTokenData) => void;
    onUpdateSettings?: (data: UpdateSettingsData) => void;
    onBettingBlockState?: (data: BettingBlockStateData) => void;
    onBetPanelState?: (data: BetPanelStateData) => void;
    onHandleBet?: (data: HandleBetData) => void;
    onShowConfirmBet?: (data: ShowConfirmBetData) => void;
    onHideConfirmBet?: (data: HideConfirmBetData) => void;
    onHandleClear?: () => void;
    onToggleStatistic?: (data: ToggleStatisticData) => void;
    onGetHeight?: () => void;
    onSetHeight?: (data: SetHeightData) => void;
    customHandlers?: Record<string, (data: any) => void>;
}

export class MessageHandlerManager {
    private config: MessageHandlerConfig;
    private options: MessageHandlerOptions;
    private messageEncryption?: MessageEncryption;
    private isInitialized = false;
    private messageHandler?: MessageHandler;

    constructor(config: MessageHandlerConfig, options: MessageHandlerOptions = {}) {
        this.config = config;
        this.options = options;

        if (config.enableEncryption && config.encryptionKey) {
            this.messageEncryption = new MessageEncryption(config.encryptionKey);
        }
    }

    public initialize(): void {
        if (this.isInitialized) {
            console.warn('MessageHandlerManager already initialized');
            return;
        }

        const handlers: Partial<Record<MessageType, (data: any) => void>> = {
            [MessageType.SET_TOKEN]: this.options.onSetToken,
            [MessageType.UPDATE_SETTINGS]: this.options.onUpdateSettings,
            [MessageType.BETTING_BLOCK_STATE]: this.options.onBettingBlockState,
            [MessageType.BET_PANEL_STATE]: this.options.onBetPanelState,
            [MessageType.HANDLE_BET]: this.options.onHandleBet,
            [MessageType.SHOW_CONFIRM_BET]: this.options.onShowConfirmBet,
            [MessageType.HIDE_CONFIRM_BET]: this.options.onHideConfirmBet,
            [MessageType.HANDLE_CLEAR]: this.options.onHandleClear,
            [MessageType.TOGGLE_STATISTIC]: this.options.onToggleStatistic,
            [MessageType.GET_HEIGHT]: this.options.onGetHeight,
            [MessageType.SET_HEIGHT]: this.options.onSetHeight,
        };

        const definedHandlers = Object.fromEntries(
            Object.entries(handlers).filter(([_, handler]) => handler !== undefined)
        );

        this.messageHandler = this.createMessageHandler(definedHandlers);

        window.addEventListener('message', this.handleMessage);
        this.isInitialized = true;

        console.log('MessageHandlerManager initialized with config:', {
            isLocalDevelopment: this.config.isLocalDevelopment,
            enableEncryption: this.config.enableEncryption,
            allowedOrigins: this.config.allowedOrigins
        });
    }

    public sendMessage(message: WindowMessage): void {
        let messageData: WindowMessage | EncryptedMessage = message;
        if (this.config.enableEncryption && this.messageEncryption) {
            messageData = this.messageEncryption.encrypt(message);
        }
        window.parent.postMessage(messageData, '*');
    }

    public sendMessageToSpecificIframe(message: WindowMessage, iframe: HTMLIFrameElement): void {
        let messageData: WindowMessage | EncryptedMessage = message;
        if (this.config.enableEncryption && this.messageEncryption) {
            messageData = this.messageEncryption.encrypt(message);
        }

        iframe.contentWindow?.postMessage(messageData, '*');
    }

    public destroy(): void {
        if (this.isInitialized) {
            window.removeEventListener('message', this.handleMessage);
            this.isInitialized = false;
            this.messageHandler = undefined;
        }
    }

    private createMessageHandler = (
        handlers: Partial<Record<MessageType, (data: any) => void>>
    ): MessageHandler => {
        return (event: MessageEvent) => {
            if (!this.config.allowedOrigins.some(origin =>
                origin === '*' || event.origin.includes(origin)
            )) {
                console.warn('Message from unauthorized origin:', event.origin);
                return;
            }

            const { type, data } = event.data;
            const handler = handlers[type as MessageType];

            if (handler) {
                handler(data);
            }
        };
    };

    private handleMessage = (event: MessageEvent) => {
        if (this.config.enableEncryption && this.messageEncryption) {
            try {
                if (!this.messageEncryption.validateMessage(event.data)) {
                    console.warn('Invalid encrypted message received');
                    return;
                }
                const decryptedData = this.messageEncryption.decrypt(event.data);
                event = { ...event, data: decryptedData };
            } catch (error) {
                console.error('Failed to decrypt message:', error);
                return;
            }
        }

        if (this.messageHandler) {
            this.messageHandler(event);
        }

        if (this.options.customHandlers && event.data.type) {
            const customHandler = this.options.customHandlers[event.data.type];
            if (customHandler) {
                customHandler(event.data);
            }
        }
    };
}

export const createMessageHandlerConfig = (environment: string, encryptionKey?: string): MessageHandlerConfig => {
    const isLocalDevelopment = environment === 'LOCAL' || environment === '';
    const currentOrigin = window.location.origin;

    let allowedOrigins: string[];
    if (isLocalDevelopment) {
        allowedOrigins = [
            'localhost:4551',
            appSettings.standaloneUrl,
            currentOrigin
        ];
    } else {
        // TODO: UAT, SIT, PROD
        allowedOrigins = ['*'];
    }

    return {
        isLocalDevelopment,
        allowedOrigins,
        encryptionKey,
        enableEncryption: !isLocalDevelopment && !!encryptionKey
    };
}; 