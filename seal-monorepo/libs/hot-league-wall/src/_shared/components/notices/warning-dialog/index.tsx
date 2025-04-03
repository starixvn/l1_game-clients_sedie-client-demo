import React, { useRef } from 'react';
// import Toast from 'react-bootstrap/Toast';

import Styles from './warning.module.scss';

export type Props = {
    children: React.ReactNode;
};

const WarningDialog: React.FC<Props> = ({ children }: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    return (
        <div className={Styles['wrapper-dialog']} ref={wrapperRef}>
            <div className={Styles['warning-container']}>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default WarningDialog;
