import React, { useEffect, useState } from 'react';

import { TURN_ROUND_STATE } from '@sg/sg-game-client/dist/game-turn-base/rounds';
import Ball, { BallStatus, IBall } from '../ball';
import Style from './turn-base-result-container.module.scss';

export type IResultSlotContainer = {
    delayTime: number;
    betChoice: string;
    className?: string;
    defaultRoundData: IBall[];
    betChoiceBalls: string;
    groupType?: number;
    delayClassName?: string;
    roundState: any;
    roundData: any;
    turnCounter: number;
    playResultAnimation?: boolean;
};

export const TurnBaseResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const {
        delayTime,
        betChoice,
        className,
        roundState,
        roundData,
        turnCounter,
        defaultRoundData,
        betChoiceBalls,
        playResultAnimation,
        groupType,
        delayClassName,
    } = props;

    const [ballsData, setBallsData] = useState<IBall[]>([]);

    const updateLoadingIcon = (data: any) => {
        const currentRound = data?.find((ball: any) => ball.number === 0);
        if (currentRound) {
            currentRound.status = BallStatus.LOADING;
        }
    };

    useEffect(() => {
        const cloneDefaultData = () => {
            return defaultRoundData.map((data: any) => {
                return { ...data };
            });
        };

        const getBallsDataFromRoundData = () => {
            const clonedData = cloneDefaultData();

            if (roundData?.[betChoiceBalls]?.length > 0) {
                for (let i = 0; i < clonedData.length; i++) {
                    const number = roundData[betChoiceBalls][i];
                    if (number) {
                        clonedData[i].number = number;

                        if (
                            playResultAnimation &&
                            ((!groupType && i === turnCounter - 1) ||
                                (groupType && Math.floor(i / groupType) + 1 === turnCounter))
                        ) {
                            clonedData[i].status = BallStatus.LOADING;
                            clonedData[i].delayTime = playResultAnimation ? delayTime : 0;
                        } else {
                            clonedData[i].status = BallStatus.SHOW;
                            clonedData[i].delayTime = 0;
                        }
                    }
                }
            }
            return clonedData;
        };

        const data = getBallsDataFromRoundData();
        updateLoadingIcon(data);
        setBallsData(data);
    }, [roundData]);

    useEffect(() => {
        if (roundState === TURN_ROUND_STATE.LOCKING_BET || roundState === TURN_ROUND_STATE.PLACING_BET) {
            updateLoadingIcon([...ballsData]);
        }
    }, [roundState]);

    if (betChoice === null) {
        return (
            <div className={`${Style['ball-container']} ${className}`}>
                {defaultRoundData.map((result: any, index: any) => {
                    return <Ball key={index} ballIndex={index} {...result} />;
                })}
            </div>
        );
    }

    return (
        <div className={`${Style['ball-container']} ${className}`}>
            {ballsData.map((result, index) => {
                return (
                    <Ball
                        key={index}
                        ballIndex={index}
                        {...result}
                        delayTime={0}
                        delayClassName={result.delayTime > 0 ? delayClassName : ''}
                    />
                );
            })}
        </div>
    );
};
