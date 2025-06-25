import React from 'react';
import GameContainerStyles from '../../game-base/game-container/game-container.module.scss';
import GameBaseStyles from '../../game-base/game-base.module.scss';
import RNGSoccerStyles from '../rng-soccer/rng-soccer.module.scss';
import RoundIdStyles from '../../../_shared/components/round-id/round-id.module.scss';
import CountDownTimerStyles from '../../../_shared/components/count-down-timer/count-down-timer.module.scss';

import liveIcon from '../../../assets/rng-soccer/live-icon.svg';
import classNames from 'classnames';
import { RoundId } from 'libs/hot-league-wall/src/_shared/components/round-id';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

const RNGSoccerBeforeStartGame: React.FC = () => {
    return (
        <div className={`${GameContainerStyles['game-container']} ${RNGSoccerStyles['sport-item']}`}>
            <div className={`${GameBaseStyles['game-header']} ${RNGSoccerStyles['wrapper-sport-top']}`}>
                <div className={GameBaseStyles['game-name']}>
                    <div className={`${GameBaseStyles['game-name-text']} ${RNGSoccerStyles['game-name-text']}`}>
                        RNGSoccer
                        <img src={liveIcon} alt="live" className={classNames(GameBaseStyles['live-icon'], RNGSoccerStyles['live-icon'])} />
                    </div>
                    <div
                        data-testid="round-id"
                        className={classNames(
                            RoundIdStyles['round-id'],
                            `${GameBaseStyles['game-name-round']} ${RNGSoccerStyles['game-name-round']}`,
                        )}
                    >
                        12
                    </div>
                </div>
                <div
                    className={classNames(
                        CountDownTimerStyles['game-countdown-wrapper'],
                        GameBaseStyles['timer'],
                        RNGSoccerStyles['timer'],
                    )}
                >
                    <div className={CountDownTimerStyles['count-down']}>
                        <div
                            className={classNames(
                                CountDownTimerStyles['timer-wrapper'],
                                {
                                    [CountDownTimerStyles['show-result-state']]: true,
                                },
                                GameBaseStyles['timer'],
                                RNGSoccerStyles['timer'],
                            )}
                        >
                            <div className={CountDownTimerStyles['counting-text']}>
                                <div className={CountDownTimerStyles['waiting-container']}>
                                    <div className={CountDownTimerStyles['dot-elastic']}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className={statsIconClass} onClick={toggleStatistic}>
                        <img src={statsIconUrl} alt="statistics" />
                    </div>
                
                <StartRoundCountDownTimer namespace={props.namespace} language={props.language} /> */}
            </div>
        </div>
    );
};

export default RNGSoccerBeforeStartGame;
