import React, { useState, useCallback } from 'react';
import styles from './confirm-bet.module.scss';

const DEBUG_STYLE = 'color: red; font-weight: bold;';

export interface ConfirmBetState {
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
    panelRef: React.RefObject<HTMLDivElement>;
    onClose: (turnOffNotification: boolean) => void;
}

export const ConfirmBet: React.FC<ConfirmBetProps> = ({
    confirmBetState,
    panelRef,
    onClose
}) => {
    const [turnOffNotification, setTurnOffNotification] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        console.log('%c[CONFIRM_BET] Notification setting changed', DEBUG_STYLE, { isChecked });
        setTurnOffNotification(isChecked);
    };

    const handleClose = useCallback(() => {
        console.log('%c[CONFIRM_BET] Closing modal with notification setting:', DEBUG_STYLE, { turnOffNotification });
        onClose(turnOffNotification);
    }, [onClose, turnOffNotification]);

    const addCommas = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const totalStakeWithCommas = addCommas(confirmBetState.totalStake);

    return (
        <div className={styles.overlay}>
            <div
                ref={panelRef}
                className={styles['confirm-bet']}
                style={{
                    position: 'absolute',
                    top: confirmBetState.position?.top || '50%',
                    left: confirmBetState.position?.left || '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className={styles.heading}>
                    <i className="c-icon c-icon--info"></i>
                    <div className="c-text" title="INFORMATION">
                        INFORMATION
                    </div>
                </div>
                <div className="c-modal__container">
                    <div className="c-modal__content">
                        <div className="c-modal__section padding-top-10">
                            <div className={styles['bet-accepted']}>
                                <span className="c-text-label">
                                    BET ACCEPTED: {confirmBetState.betChoice}
                                </span>
                            </div>
                            <div className={styles['betting-results']}>
                                <div className={styles['betting-row']}>
                                    <span className="c-text-label">
                                        TOTAL BETS
                                    </span>
                                    <span className="colon"> : </span>
                                    <span className="c-text-value">&nbsp;1</span>
                                </div>

                                <div className={styles['betting-row']}>
                                    <span className="c-text-label">
                                        TOTAL STAKE
                                    </span>
                                    <span className="colon"> : </span>
                                    <span className="c-text-value">
                                        &nbsp;{totalStakeWithCommas}
                                    </span>
                                </div>
                            </div>
                            <label className={styles['noti-label']}>
                                <input
                                    id="notification"
                                    className={styles['noti-input']}
                                    type="checkbox"
                                    onChange={handleCheckboxChange}
                                    checked={turnOffNotification}
                                />
                                TURN OFF NOTIFICATION
                            </label>
                        </div>
                        <div className="c-btn-group">
                            <button
                                tabIndex={0}
                                id="popup_confirm_button"
                                className={styles['confirm-btn']}
                                title="OK"
                                onClick={handleClose}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 