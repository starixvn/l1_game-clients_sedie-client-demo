import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { MessageHandlerManager, MessageHandlerConfig, MessageHandlerOptions } from '../utils/message-handler-manager';
import { WindowMessage, MessageType, MessageData, UpdateSettingsData, BettingBlockStateData, BetPanelStateData, HandleBetData, ShowConfirmBetData, HideConfirmBetData, ToggleStatisticData, SetHeightData, SetTokenData, SyncBalanceData } from '../types/message-types';
import { SyncMemberSiteBalance } from '../utils/sync-member-site-balance';

interface MessageContextType {
    sendMessage: (message: WindowMessage) => void;
    sendMessageToSpecificIframe: (message: WindowMessage, iframe: HTMLIFrameElement | null) => void;
    messageManager: MessageHandlerManager | null;
    messageData: MessageData;
    getMessageData: <T extends MessageType>(type: T) => MessageData[T] | undefined;
    clearMessageData: (type: MessageType) => void;
    clearAllMessageData: () => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

interface MessageProviderProps {
    children: React.ReactNode;
    config: MessageHandlerConfig;
    options: MessageHandlerOptions;
    renewToken?: Function;
}

const MessageManagerProvider: React.FC<MessageProviderProps> = ({
    children,
    config,
    options,
    renewToken
}) => {
    const messageManagerRef = useRef<MessageHandlerManager | null>(null);
    const [messageData, setMessageData] = useState<MessageData>({} as MessageData);

    const handleMessage = useCallback((data: any, type: MessageType) => {
        setMessageData(prev => ({
            ...prev,
            [type]: data
        }));
    }, []);

    const getMessageData = useCallback(<T extends MessageType>(type: T): MessageData[T] | undefined => {
        return messageData[type];
    }, [messageData]);

    const clearMessageData = useCallback((type: MessageType) => {
        setMessageData(prev => {
            const newData = { ...prev };
            delete newData[type];
            return newData;
        });
    }, []);

    const clearAllMessageData = useCallback(() => {
        setMessageData({} as MessageData);
    }, []);

    useEffect(() => {
        const enhancedOptions: MessageHandlerOptions = {
            ...options,
            onSetToken: (data: SetTokenData) => {
                handleMessage(data, MessageType.SET_TOKEN);
                options.onSetToken?.(data);
            },
            onUpdateSettings: (data: UpdateSettingsData) => {
                handleMessage(data, MessageType.UPDATE_SETTINGS);
                options.onUpdateSettings?.(data);
            },
            onBettingBlockState: (data: BettingBlockStateData) => {
                handleMessage(data, MessageType.BETTING_BLOCK_STATE);
                options.onBettingBlockState?.(data);
            },
            onBetPanelState: (data: BetPanelStateData) => {
                handleMessage(data, MessageType.BET_PANEL_STATE);
                options.onBetPanelState?.(data);
            },
            onHandleBet: (data: HandleBetData) => {
                handleMessage(data, MessageType.HANDLE_BET);
                options.onHandleBet?.(data);
            },
            onShowConfirmBet: (data: ShowConfirmBetData) => {
                handleMessage(data, MessageType.SHOW_CONFIRM_BET);
                options.onShowConfirmBet?.(data);
            },
            onHideConfirmBet: (data: HideConfirmBetData) => {
                handleMessage(data, MessageType.HIDE_CONFIRM_BET);
                options.onHideConfirmBet?.(data);
            },
            onHandleClear: () => {
                handleMessage(undefined, MessageType.HANDLE_CLEAR);
                options.onHandleClear?.();
            },
            onToggleStatistic: (data: ToggleStatisticData) => {
                handleMessage(data, MessageType.TOGGLE_STATISTIC);
                options.onToggleStatistic?.(data);
            },
            onSetHeight: (data: SetHeightData) => {
                handleMessage(data, MessageType.SET_HEIGHT);
                options.onSetHeight?.(data);
            },
            onSyncBalance: (data: SyncBalanceData) => {
                const { totalStake, winBet } = data;
                SyncMemberSiteBalance.getInstance().executeSyncBalance(totalStake, winBet);
                handleMessage(data, MessageType.SYNC_BALANCE);
                options.onSyncBalance?.(data);
            },
            onRenewToken: () => {
                renewToken?.();
                options.onRenewToken?.();
            }
        };

        const manager = new MessageHandlerManager(config, enhancedOptions);
        messageManagerRef.current = manager;

        manager.initialize();

        return () => {
            manager.destroy();
            messageManagerRef.current = null;
        };
    }, []);

    const sendMessage = (message: WindowMessage) => {
        messageManagerRef.current?.sendMessage(message);
    };

    const sendMessageToSpecificIframe = (message: WindowMessage, iframe: HTMLIFrameElement | null) => {
        if (iframe) {
            messageManagerRef.current?.sendMessageToSpecificIframe(message, iframe);
        }
    };

    return (
        <MessageContext.Provider value={{
            sendMessage,
            sendMessageToSpecificIframe,
            messageManager: messageManagerRef.current,
            messageData,
            getMessageData,
            clearMessageData,
            clearAllMessageData
        }}>
            {children}
        </MessageContext.Provider>
    );
};

export const MessageProvider: React.FC<MessageProviderProps> = ({
    children,
    config,
    options,
    renewToken
}) => {
    return (
        <MessageManagerProvider config={config} options={options} renewToken={renewToken}>
            {children}
        </MessageManagerProvider>
    );
};

export const useMessageContext = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessageContext must be used within a MessageProvider');
    }
    return context;
};