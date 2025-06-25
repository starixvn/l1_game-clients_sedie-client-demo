import { MessageType, WindowMessage, MessageEvent, MessageHandler } from '../types/message-types';
import { MessageEncryption } from '../../utils/encryption';

export interface MessageHandlerConfig {
    isLocalDevelopment: boolean;
    allowedOrigins: string[];
    encryptionKey?: string;
    enableEncryption: boolean;
}

export interface MessageHandlerOptions {
    onUpdateSettings?: (settings: any) => void;
    onBettingBlockState?: (state: any) => void;
    onBetPanelState?: (state: any) => void;
    onHandleBet?: (data: any) => void;
    onHandleInputChange?: (value: string) => void;
    onHandleClear?: () => void;
    onHideAllBetPanels?: () => void;
    onToggleStatistic?: (isOpen: boolean) => void;
    onGetHeight?: () => void;
    onSetHeight?: (height: number) => void;
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
            [MessageType.UPDATE_SETTINGS]: this.options.onUpdateSettings,
            [MessageType.BETTING_BLOCK_STATE]: this.options.onBettingBlockState,
            [MessageType.BET_PANEL_STATE]: this.options.onBetPanelState,
            [MessageType.HANDLE_BET]: this.options.onHandleBet,
            [MessageType.HANDLE_INPUT_CHANGE]: this.options.onHandleInputChange,
            [MessageType.HANDLE_CLEAR]: this.options.onHandleClear,
            [MessageType.HIDE_ALL_BET_PANELS]: this.options.onHideAllBetPanels,
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
        if (this.config.enableEncryption && this.messageEncryption) {
            const encryptedMessage = this.messageEncryption.encrypt(message);
            window.parent.postMessage(encryptedMessage, '*');
        }
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

            const { type, ...data } = event.data;
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

    return {
        isLocalDevelopment,
        allowedOrigins: isLocalDevelopment 
            ? ['localhost:4551']
            : ['*'],
        encryptionKey,
        enableEncryption: !isLocalDevelopment && !!encryptionKey
    };
}; 