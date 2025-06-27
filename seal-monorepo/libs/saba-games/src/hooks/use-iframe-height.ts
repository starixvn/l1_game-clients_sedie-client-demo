import { useState, useRef, useCallback, useEffect } from 'react';
import { useHeightData } from './use-message-data';
import { useMessageContext } from '../_shared/contexts/message-context';
import { MessageType } from '../_shared/types/message-types';

interface UseIframeHeightProps {
    initialHeight?: number;
    minHeightChange?: number;
    requestInterval?: number;
    maxRequests?: number;
    resetInterval?: number;
}

export const useIframeHeight = ({
    initialHeight = 264,
    minHeightChange = 5,
    requestInterval = 500,
    maxRequests = 10,
    resetInterval = 5000
}: UseIframeHeightProps = {}) => {
    const appHeight = useHeightData()?.height;
    const [iframeHeight, setIframeHeight] = useState<number>(initialHeight);
    const lastRequestTimeRef = useRef<number>(0);
    const updateCountRef = useRef<number>(0);
    const { sendMessageToSpecificIframe } = useMessageContext();

    const requestIframeHeight = useCallback((iframe: HTMLIFrameElement | null) => {
        if (!iframe?.contentWindow) return;

        // Prevent requesting height too frequently
        const now = Date.now();
        if (now - lastRequestTimeRef.current < requestInterval) return;
        lastRequestTimeRef.current = now;

        // Prevent too many requests
        updateCountRef.current++;
        if (updateCountRef.current > maxRequests) {
            console.warn('Too many height requests, stopping');
            return;
        }

        sendMessageToSpecificIframe({
            type: MessageType.GET_HEIGHT
        }, iframe);
    }, [requestInterval, maxRequests, sendMessageToSpecificIframe]);

    useEffect(() => {
        if (appHeight) {
            setIframeHeight(appHeight);
        }
    }, [appHeight]);

    // Reset update count periodically
    useEffect(() => {
        const interval = setInterval(() => {
            updateCountRef.current = 0;
        }, resetInterval);

        return () => clearInterval(interval);
    }, [resetInterval]);

    return {
        iframeHeight,
        requestIframeHeight
    };
}; 