import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmBet } from './ConfirmBet';
import { ConfirmBetState } from './ConfirmBet';

const DEBUG_STYLE = 'color: red; font-weight: bold;';

interface ConfirmBetPortalProps {
    iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const ConfirmBetPortal: React.FC<ConfirmBetPortalProps> = ({
    iframeRef
}) => {
    const [isContainerReady, setIsContainerReady] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [confirmBetState, setConfirmBetState] = useState<ConfirmBetState>({
        isVisible: false,
        totalStake: 0,
        betChoice: '',
        namespace: '',
        position: {
            top: 0,
            left: 0
        }
    });
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback((turnOffNotification: boolean) => {
        console.log('%c[PORTAL] Closing confirm bet with notification setting:', DEBUG_STYLE, { turnOffNotification });

        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'HIDE_CONFIRM_BET',
                turnOffNotification
            }, '*');
        }

        setConfirmBetState(prev => ({
            ...prev,
            isVisible: false
        }));
        setIsVisible(false);
    }, [iframeRef]);

    useEffect(() => {
        console.log('%c[PORTAL] Initializing portal container', DEBUG_STYLE);
        // Create container immediately
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
        portalContainerRef.current = container;
        setIsContainerReady(true);

        const handleMessage = (event: MessageEvent) => {
            console.log('%c[PORTAL] Received message', DEBUG_STYLE, event.data);

            switch (event.data.type) {
                case 'SHOW_CONFIRM_BET':
                    console.log('%c[PORTAL] Showing confirm bet', DEBUG_STYLE, event.data.payload);
                    const { top = 0, left = 0 } = event.data.payload.position || {};
                    setConfirmBetState({
                        ...event.data.payload,
                        isVisible: true,
                        position: { top, left }
                    });
                    setIsVisible(true);
                    break;
                case 'HIDE_CONFIRM_BET':
                    console.log('%c[PORTAL] Hiding confirm bet', DEBUG_STYLE);
                    setConfirmBetState(prev => ({
                        ...prev,
                        isVisible: false
                    }));
                    setIsVisible(false);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            console.log('%c[PORTAL] Cleaning up portal container', DEBUG_STYLE);
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
                setIsContainerReady(false);
            }
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Log state changes
    useEffect(() => {
        console.log('%c[PORTAL] Visibility changed', DEBUG_STYLE, { isVisible });
    }, [isVisible]);

    useEffect(() => {
        console.log('%c[PORTAL] Confirm bet state changed', DEBUG_STYLE, confirmBetState);
    }, [confirmBetState]);

    if (!isContainerReady || !isVisible || !portalContainerRef.current) {
        console.log('%c[PORTAL] Not rendering portal', DEBUG_STYLE, {
            isContainerReady,
            isVisible,
            hasContainer: !!portalContainerRef.current
        });
        return null;
    }

    console.log('%c[PORTAL] Rendering portal', DEBUG_STYLE);
    return createPortal(
        <div style={{
            position: 'absolute',
            top: `${confirmBetState.position.top}px`,
            left: `${confirmBetState.position.left}px`,
            pointerEvents: 'auto',
            zIndex: 9999
        }}>
            <ConfirmBet
                confirmBetState={confirmBetState}
                isPanelVisible={isVisible}
                panelRef={panelRef}
                iframeRef={iframeRef}
                onClose={handleClose}
            />
        </div>,
        portalContainerRef.current
    );
}; 