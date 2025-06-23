import * as gc from '@sg/sg-game-client';
import React, { useEffect, useRef } from 'react';
import Styles from './notice-dialog.module.scss';

export type Props = {
    title?: string;
    onClose?: any;
    children: React.ReactNode;
    type?: gc.Notices.NoticeType;
    showBtnConfirmButton?: boolean;
    noticeInfo?: gc.Notices.NoticeInfo;
};

const NoticeDialog: React.FC<Props> = ({ title, children, onClose, type, showBtnConfirmButton, noticeInfo }: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isError = type === gc.Notices.NoticeType.Error;
    const disabledGame = noticeInfo === gc.Notices.NoticeInfo.DisabledGame;
    const classType = isError ? Styles['error'] : Styles['warning'];
    const disabledGameClass = disabledGame ? Styles['disabled-game'] : '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (disabledGame) {
                return;
            }

            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={wrapperRef}>
            <div className={Styles['wrapper-dialog']}>
                <div className={`${Styles['notice-container']} ${classType ? classType : ''} ${disabledGameClass ? disabledGameClass : ''}`}>
                    <div className={Styles['notice-info']}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeDialog;
