import { useCallback } from 'react';
import { MessageData, MessageType } from '../_shared/types/message-types';
import { useMessageContext } from '../_shared/contexts/message-context';

export const useMessageData = <T extends MessageType>(messageType: T) => {
    const { getMessageData } = useMessageContext();
    return getMessageData(messageType);
};

export const useBetPanelData = (): MessageData[MessageType.BET_PANEL_STATE] | undefined => {
    return useMessageData(MessageType.BET_PANEL_STATE);
};

export const useStatisticData = (): MessageData[MessageType.TOGGLE_STATISTIC] | undefined => {
    return useMessageData(MessageType.TOGGLE_STATISTIC);
};

export const useSettingsData = (): MessageData[MessageType.UPDATE_SETTINGS] | undefined => {
    return useMessageData(MessageType.UPDATE_SETTINGS);
};

export const useBettingBlockData = (): MessageData[MessageType.BETTING_BLOCK_STATE] | undefined => {
    return useMessageData(MessageType.BETTING_BLOCK_STATE);
};

export const useHandleBetData = (): MessageData[MessageType.HANDLE_BET] | undefined => {
    return useMessageData(MessageType.HANDLE_BET);
};

export const useShowConfirmBetData = (): MessageData[MessageType.SHOW_CONFIRM_BET] | undefined => {
    return useMessageData(MessageType.SHOW_CONFIRM_BET);
};

export const useHideConfirmBetData = (): MessageData[MessageType.HIDE_CONFIRM_BET] | undefined => {
    return useMessageData(MessageType.HIDE_CONFIRM_BET);
};

export const useInputChangeData = (): MessageData[MessageType.HANDLE_INPUT_CHANGE] | undefined => {
    return useMessageData(MessageType.HANDLE_INPUT_CHANGE);
};

export const useHeightData = (): MessageData[MessageType.SET_HEIGHT] | undefined => {
    return useMessageData(MessageType.SET_HEIGHT);
};

export const useClearMessageData = () => {
    const { clearMessageData, clearAllMessageData } = useMessageContext();
    
    const clearSpecificData = useCallback((type: MessageType) => {
        clearMessageData(type);
    }, [clearMessageData]);

    return {
        clearData: clearSpecificData,
        clearAllData: clearAllMessageData
    };
}; 