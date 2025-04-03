import React from 'react';
import Styles from './tooltip.module.scss';

interface TooltipProps {
    children: React.ReactNode;
    roundId?: number;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, roundId, className }) => {
    return (
        <div className={Styles['tooltip'] + (className ? ` ${className}` : '')}>
            <div className={Styles['tooltip-content']}>
                <div className={Styles['tooltip-title']}>#{roundId}</div>
                <div className={Styles['tooltip-body']}>
                    <div className={Styles['tooltip-item']}>
                        <div className={Styles['tooltip-points']}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Tooltip;