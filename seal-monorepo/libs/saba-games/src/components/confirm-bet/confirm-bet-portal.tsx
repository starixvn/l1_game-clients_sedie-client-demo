import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmBet } from '.';
import { useShowConfirmBetData } from '../../hooks/use-message-data';
import { useMessageContext } from '../../_shared/contexts/message-context';
import { MessageType } from '../../_shared/types/message-types';

interface ConfirmBetPortalProps {
    iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const ConfirmBetPortal: React.FC<ConfirmBetPortalProps> = ({
    iframeRef
}) => {
    const { sendMessageToSpecificIframe } = useMessageContext();
    const confirmBetData = useShowConfirmBetData();
    const [isContainerReady, setIsContainerReady] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback((turnOffNotification: boolean) => {
        sendMessageToSpecificIframe({
            type: MessageType.HIDE_CONFIRM_BET,
            data: {
                turnOffNotification
            }
        }, iframeRef.current);

        setIsVisible(false);
    }, [iframeRef]);

    useEffect(() => {
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

        return () => {
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
                setIsContainerReady(false);
            }
        };
    }, []);

    useEffect(() => {
        if (confirmBetData) {
            setIsVisible(true);
        }
    }, [confirmBetData]);

    if (!isContainerReady || !portalContainerRef.current || !confirmBetData || !isVisible) {
        return null;
    }

    return createPortal(
        <div style={{
            position: 'absolute',
            top: `${confirmBetData?.position?.top}px`,
            left: `${confirmBetData?.position?.left}px`,
            pointerEvents: 'auto',
            zIndex: 9999
        }}>
            <ConfirmBet
                confirmBetState={confirmBetData}
                panelRef={panelRef}
                onClose={handleClose}
            />
        </div>,
        portalContainerRef.current
    );
}; 