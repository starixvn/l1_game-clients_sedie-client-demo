import { ROUND_STATE, RoundTimeStore } from '@sg/sg-game-client/dist/game/rounds';
import { render } from '@sg/sg-observer';
import classnames from 'classnames';
import Styles from './count-down-timer.module.scss';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import { formatSecondsToTime } from '../../utils/count-down-format';
import { useSentryHelper, SentryLogLevel } from '../../../sentry';
import React from 'react';

export interface ICountDownTimerProps extends IPropsObserver {
    onComplete?: () => void;
    onCountdownTimerChange?: (countdownTimer: number) => void;
    language?: string;
    customStyles?: {
        wrapper?: string;
        timer?: string;
        text?: string;
    };
}

export interface ICountDownTimerState extends IStateObserver {
    countdownTimer: number;
    roundState: string;
}

class CountDownTimerComponent extends ObserverComponent<ICountDownTimerProps, ICountDownTimerState> {
    constructor(props: ICountDownTimerProps) {
        super(props);
        this.state = { dispose: null, countdownTimer: 0, roundState: ROUND_STATE.NONE };
    }

    @render(RoundTimeStore, (store) => store.countdownTimer)
    private renderCountDownTimer(countdownTimer: number): void {
        this.setState({ countdownTimer });
        this.props.onCountdownTimerChange?.(countdownTimer);
    }

    @render(RoundTimeStore, (store) => store.roundState, { fireImmediately: false })
    private renderCountDownTimerState(roundState: string): void {
        this.setState({ roundState });
    }

    protected getTimerContentConfig(roundState: string) {
        const { PLACING_BET, LOCKING_BET, SHOW_ANIMATION_RESULT, SHOW_RESULT, STOP_GAME_LOOP, STARTING_ROUND, NONE } = ROUND_STATE;
        return {
            showTimer: [PLACING_BET].includes(roundState),
            showNoMoreBet: [LOCKING_BET].includes(roundState),
            showResult: [SHOW_ANIMATION_RESULT, STOP_GAME_LOOP, SHOW_RESULT].includes(roundState),
            startRound: [STARTING_ROUND, NONE].includes(roundState),
        };
    }

    protected getTimerContent(countdownTimer: number, roundState: string) {
        const config = this.getTimerContentConfig(roundState);

        const shouldTriggerComplete = config.showTimer || config.showNoMoreBet || config.showResult;
        if (shouldTriggerComplete) {
            this.props.onComplete?.();
        }

        if (config.showTimer || config.showNoMoreBet) {
            return formatSecondsToTime(countdownTimer);
        }

        if (config.startRound) {
            return <></>;
        }

        return (
            <div className={Styles['waiting-container']}>
                <div className={Styles['dot-elastic']}></div>
            </div>
        );
    }

    render() {
        const { countdownTimer, roundState } = this.state;
        const { customStyles } = this.props;
        const isShowResult = roundState !== ROUND_STATE.PLACING_BET && roundState !== ROUND_STATE.LOCKING_BET;

        // Determine content
        const content = this.getTimerContent(countdownTimer, roundState);

        // Use game layout if specified
        return (
            <div className={classnames(Styles['game-countdown-wrapper'], customStyles?.wrapper)}>
                <div className={Styles['count-down']}>
                    <div
                        className={classnames(
                            Styles['timer-wrapper'],
                            {
                                [Styles['placing-bet-state']]: roundState === ROUND_STATE.PLACING_BET,
                                [Styles['no-more-bet-state']]: roundState === ROUND_STATE.LOCKING_BET,
                                [Styles['show-result-state']]: isShowResult,
                            },
                            customStyles?.timer,
                        )}
                    >
                        <div className={Styles['counting-text']}>{content}</div>
                    </div>
                </div>
            </div>
        );
    }
}

// Wrapper component to provide SentryHelper to the class component
const CountDownTimer: React.FC<ICountDownTimerProps> = (props) => {
    const { logInfo } = useSentryHelper({
        componentName: 'CountDownTimer',
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Memoize the log data to prevent infinite re-renders
    const logData = React.useMemo(() => ({
        countdownTimer: props.onCountdownTimerChange ? 'dynamic' : 'static',
        language: props.language,
        timestamp: Date.now()
    }), [props.onCountdownTimerChange, props.language]);

    // Log component render in useEffect to prevent infinite re-renders
    React.useEffect(() => {
        logInfo('CountDownTimer rendered', logData);
    }, [logData]);

    return <CountDownTimerComponent {...props} />;
};

export default CountDownTimer;
