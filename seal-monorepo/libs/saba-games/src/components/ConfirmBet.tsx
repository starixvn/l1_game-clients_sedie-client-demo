import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import './ConfirmBet.scss';

const DEBUG_STYLE = 'color: red; font-weight: bold;';

export interface ConfirmBetState {
    isVisible: boolean;
    totalStake: number;
    betChoice: string;
    namespace: string;
    position?: {
        top: number;
        left: number;
    };
}

interface ConfirmBetProps {
    confirmBetState: ConfirmBetState;
    isPanelVisible: boolean;
    panelRef: React.RefObject<HTMLDivElement>;
    iframeRef: React.RefObject<HTMLIFrameElement>;
    onClose: (turnOffNotification: boolean) => void;
}

const NOTIF_KEY = 'turnOffNotification';

export const ConfirmBet: React.FC<ConfirmBetProps> = ({
    confirmBetState,
    isPanelVisible,
    panelRef,
    iframeRef,
    onClose
}) => {
    const [turnOffNotification, setTurnOffNotification] = useState(
        sessionStorage.getItem(NOTIF_KEY) === 'true'
    );

    useEffect(() => {
        console.log('%c[CONFIRM_BET] Component mounted', DEBUG_STYLE);
        setTurnOffNotification(sessionStorage.getItem(NOTIF_KEY) === 'true');
    }, []);

    useEffect(() => {
        console.log('%c[CONFIRM_BET] Props changed', DEBUG_STYLE, {
            isPanelVisible,
            confirmBetState
        });
    }, [isPanelVisible, confirmBetState]);

    if (!isPanelVisible || !confirmBetState.isVisible) {
        console.log('%c[CONFIRM_BET] Not rendering', DEBUG_STYLE, {
            isPanelVisible,
            isVisible: confirmBetState.isVisible
        });
        return null;
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        console.log('%c[CONFIRM_BET] Notification setting changed', DEBUG_STYLE, { isChecked });
        sessionStorage.setItem(NOTIF_KEY, isChecked ? 'true' : 'false');
        setTurnOffNotification(isChecked);
    };

    const handleClose = useCallback(() => {
        console.log('%c[CONFIRM_BET] Closing modal with notification setting:', DEBUG_STYLE, { turnOffNotification });
        onClose(turnOffNotification);
    }, [onClose, turnOffNotification]);

    const addCommas = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const totalStakeWithCommas = addCommas(confirmBetState.totalStake);

    console.log('%c[CONFIRM_BET] Rendering modal', DEBUG_STYLE, {
        totalStake: totalStakeWithCommas,
        betChoice: confirmBetState.betChoice
    });

    return (
        <div className="seal-vg-sg-index" style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
        }}>
            <div
                ref={panelRef}
                className="overlay"
                style={{
                    pointerEvents: 'auto',
                    position: 'absolute',
                    top: confirmBetState.position?.top || '50%',
                    left: confirmBetState.position?.left || '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="c-modal">
                    <div className="c-modal__heading">
                        <i className="c-icon c-icon--info"></i>
                        <div className="c-text" title="INFORMATION">
                            INFORMATION
                        </div>
                    </div>
                    <div className="c-modal__container">
                        <div className="c-modal__content">
                            <div className="c-modal__section padding-top-10">
                                <div className="c-text-group">
                                    <span className="c-text-label">
                                        BET ACCEPTED: {confirmBetState.betChoice}
                                    </span>
                                </div>
                                <div className="result-flex">
                                    <div className="betting-row">
                                        <span className="c-text-label">
                                            TOTAL BETS
                                        </span>
                                        <span className="colon"> : </span>
                                        <span className="c-text-value">&nbsp;1</span>
                                    </div>

                                    <div className="betting-row">
                                        <span className="c-text-label">
                                            TOTAL STAKE
                                        </span>
                                        <span className="colon"> : </span>
                                        <span className="c-text-value">
                                            &nbsp;{totalStakeWithCommas}
                                        </span>
                                    </div>
                                </div>
                                <label className="noti-label">
                                    <input
                                        id="notification"
                                        className="noti-input"
                                        type="checkbox"
                                        onChange={handleCheckboxChange}
                                        checked={turnOffNotification}
                                    />
                                    TURN OFF NOTIFICATION
                                </label>
                            </div>
                            <div className="c-btn-group">
                                <div
                                    tabIndex={0}
                                    id="popup_confirm_button"
                                    className="c-btn c-btn--primary confirm-btn"
                                    title="OK"
                                    onClick={handleClose}
                                >
                                    OK
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 