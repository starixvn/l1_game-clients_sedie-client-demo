import React, { FC, useEffect, useState } from 'react';

import Styles from './ball.module.scss';
import { getBallColor } from './ball-color-helper';
import { TURN_ROUND_STATE } from '@sg/sg-game-client/dist/game-turn-base/rounds';

export enum BallStatus {
    NONE = 0,
    LOADING,
    SHOW,
}
export interface IBall {
    number: number;
    status?: BallStatus;
    delayTime: number;
    ballIndex?: number;
    isRoundBase?: boolean;
    roundState?: string;
    incrementTotalPoint?: Function;
    delayClassName?: string;
}

const Ball: FC<IBall> = (props) => {
    const { number, delayTime, status, ballIndex, isRoundBase, roundState, incrementTotalPoint, delayClassName } =
        props;

    const color = getBallColor(number);
    const ballStyleName = `${Styles['ball-bg']} ${Styles[color]} ${status === BallStatus.SHOW ? Styles['display-right-now'] : ''}`;

    const delayStyle = delayTime > 0 ? Styles['delay'] : '';
    const blurStyle = status === BallStatus.NONE ? Styles.blur : Styles.active;

    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!isDelayShowResult && (!isRoundBase || (isRoundBase && roundState === TURN_ROUND_STATE.SHOW_RESULT))) {
            timeOut = setTimeout(() => {
                setIsDelayShowResult(true);
                incrementTotalPoint && incrementTotalPoint(number);
            }, delayTime);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [delayTime, isDelayShowResult]);

    return (
        <div className={`${Styles.ball} ${blurStyle} ${isRoundBase ? '' : delayStyle}`}>
            {isDelayShowResult && number > 0 && (
                <div className={`${ballStyleName} ${delayClassName}`}>
                    {<span className={`${Styles['ball-number']} ball-index-${(ballIndex || 0) + 1}`}>{number}</span>}
                </div>
            )}
        </div>
    );
};

export default Ball;
