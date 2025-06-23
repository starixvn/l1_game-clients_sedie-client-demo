import React, { useEffect, useState, useRef } from 'react';

import Styles from './warning.module.scss';

export type Props = {
    message: string;
    duration?: number;
};

const WarningDialog: React.FC<Props> = ({ message, duration }: Props) => {
    const [isHiding, setIsHiding] = useState(false);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setIsHiding(false);

        if (duration) {
            timerRef.current = setTimeout(() => {
                setIsHiding(true);
            }, duration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [message, duration]);

    return (
        <div className={`${Styles['wrapper-dialog']} ${isHiding ? Styles.hide : ''}`} >
            <div className={Styles['warning-container']}>
                {message}
            </div>
        </div>
    );
};

export default WarningDialog;
