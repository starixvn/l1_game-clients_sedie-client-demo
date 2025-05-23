import { useCallback, useEffect } from 'react';
import { MessageHandler } from '../types/betting';

interface UseIframeMessageHandlerProps {
    onHeightMessage: (data: any) => void;
    onBettingMessage: (data: any) => void;
}

export const useIframeMessageHandler = ({
    onHeightMessage,
    onBettingMessage
}: UseIframeMessageHandlerProps): MessageHandler => {
    const handleMessage = useCallback((event: MessageEvent) => {
        // Only process messages from expected origins
        if (!event.origin.includes('localhost:4200') && !event.origin.includes('localhost:4551')) {
            return;
        }

        try {
            const data = event.data;
            console.log('Parent: Received message from iframe:', data);

            // Handle height update message
            onHeightMessage(data);

            // Handle betting related messages
            onBettingMessage(data);
        } catch (error) {
            console.error('Parent: Error processing message:', error);
        }
    }, [onHeightMessage, onBettingMessage]);

    useEffect(() => {
        console.log('Parent: Setting up message listener');
        window.addEventListener('message', handleMessage);

        return () => {
            console.log('Parent: Cleaning up message listener');
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);

    return { handleMessage };
}; 