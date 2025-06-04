import { useState, useRef, useCallback, useEffect } from 'react';

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
    const [iframeHeight, setIframeHeight] = useState<number>(initialHeight);
    const lastRequestTimeRef = useRef<number>(0);
    const lastHeightRef = useRef<number>(initialHeight);
    const updateCountRef = useRef<number>(0);

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

        iframe.contentWindow.postMessage({ type: 'GET_HEIGHT' }, '*');
    }, [requestInterval, maxRequests]);

    const handleHeightMessage = useCallback((data: any) => {
        if (data.type === 'SET_HEIGHT' && typeof data.height === 'number') {
            // Only update if height changed significantly
            if (Math.abs(data.height - lastHeightRef.current) >= minHeightChange) {
                lastHeightRef.current = data.height;
                setIframeHeight(data.height);
            }
        }
    }, [minHeightChange]);

    // Reset update count periodically
    useEffect(() => {
        const interval = setInterval(() => {
            updateCountRef.current = 0;
        }, resetInterval);

        return () => clearInterval(interval);
    }, [resetInterval]);

    return {
        iframeHeight,
        requestIframeHeight,
        handleHeightMessage
    };
}; 