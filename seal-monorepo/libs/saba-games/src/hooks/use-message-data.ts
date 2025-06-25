import { useCallback } from 'react';
import { MessageType } from '../_shared/types/message-types';
import { useMessageContext } from '../_shared/contexts/message-context';

export const useMessageData = <T extends MessageType>(messageType: T) => {
    const { getMessageData } = useMessageContext();
    return getMessageData(messageType);
};

export const useBetPanelData = () => {
    return useMessageData(MessageType.BET_PANEL_STATE);
};

export const useStatisticData = () => {
    return useMessageData(MessageType.TOGGLE_STATISTIC);
};

export const useSettingsData = () => {
    return useMessageData(MessageType.UPDATE_SETTINGS);
};

export const useBettingBlockData = () => {
    return useMessageData(MessageType.BETTING_BLOCK_STATE);
};

export const useHandleBetData = () => {
    return useMessageData(MessageType.HANDLE_BET);
};

export const useInputChangeData = () => {
    return useMessageData(MessageType.HANDLE_INPUT_CHANGE);
};

export const useHeightData = () => {
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