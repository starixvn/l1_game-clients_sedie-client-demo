import * as gc from "@sg/sg-game-client";
import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { render } from "@sg/sg-observer";
import classnames from "classnames";

import Styles from "../game-base/game-base.module.scss";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";
import Timer from "./timer";

export interface ICountDownTimerProps extends IPropsObserver {
    onComplete?: () => void;
}

export interface ICountDownTimerState extends IStateObserver {
    countdownTimer: number;
    roundState: string;
}

export default class CountDownTimer extends ObserverComponent<ICountDownTimerProps, ICountDownTimerState> {
    constructor(props: ICountDownTimerProps) {
        super(props);
        this.state = { dispose: null, countdownTimer: 0, roundState: ROUND_STATE.NONE };
    }

    @render(RoundTimeStore, (store) => store.countdownTimer)
    private renderCountDownTimer(countdownTimer: number): void {
        this.setState({ countdownTimer });
    }
    @render(RoundTimeStore, (store) => store.roundState, { fireImmediately: false })
    private renderCountDownTimerState(roundState: string): void {
        this.setState({ roundState });
    }

    private getTimerContentConfig(roundState: string) {
        const { PLACING_BET, LOCKING_BET, SHOW_ANIMATION_RESULT, SHOW_RESULT, STOP_GAME_LOOP } = ROUND_STATE;
        return {
            showTimer: [PLACING_BET].includes(roundState),
            showNoMoreBet: [LOCKING_BET].includes(roundState),
            showResult: [SHOW_ANIMATION_RESULT, STOP_GAME_LOOP, SHOW_RESULT].includes(roundState),
        };
    }

    private getTimerContent(countdownTimer: number, roundState: string) {
        const config = this.getTimerContentConfig(roundState);

        const shouldTriggerComplete = config.showTimer || config.showNoMoreBet || config.showResult;
        if (shouldTriggerComplete) {
            this.props.onComplete?.();
        }

        if (config.showTimer) return countdownTimer;
        if (config.showNoMoreBet) return gc.Translator.t('Common.message_stop_bet');
        if (config.showResult) return gc.Translator.t('Common.open_result');

        return null;
    }


    render() {
        const { countdownTimer, roundState } = this.state;
        const isBettingRound = roundState === ROUND_STATE.PLACING_BET;

        if (roundState === ROUND_STATE.NONE || roundState === ROUND_STATE.STARTING_ROUND) {
            return <></>;
        }

        return (
            <div className={Styles['count-down']}>
                <div
                    className={classnames(Styles['timer-wrapper'], {
                        [Styles['placing-bet-state']]: roundState === ROUND_STATE.PLACING_BET,
                        [Styles['no-more-bet-state']]: roundState !== ROUND_STATE.PLACING_BET,
                    })}
                >
                    {isBettingRound && (
                        <div className={Styles['timer-badge']}>
                            <Timer className={Styles.clock} />
                        </div>
                    )}
                    <div className={Styles['counting-text']}>
                        <span
                            className={classnames({
                                [Styles['no-more-bet-state']]: !isBettingRound,
                            })}
                        >
                            {this.getTimerContent(countdownTimer, roundState)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
