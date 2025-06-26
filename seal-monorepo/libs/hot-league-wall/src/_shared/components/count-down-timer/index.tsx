import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { render } from "@sg/sg-observer";
import classnames from "classnames";
import Styles from "./count-down-timer.module.scss";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";
import { formatSecondsToTime } from "../../utils/count-down-format";

export interface ICountDownTimerProps extends IPropsObserver {
    onComplete?: () => void;
    onCountdownTimerChange?: (countdownTimer: number) => void;
    language?: string;
    customStyles?: {
        wrapper?: string;
        timer?: string;
        text?: string;
    };
    // Add simulator mode props
    simulatorMode?: boolean;
    simulatorCountdownTimer?: number;
    simulatorRoundState?: string;
}

export interface ICountDownTimerState extends IStateObserver {
    countdownTimer: number;
    roundState: string;
}

export default class CountDownTimer extends ObserverComponent<ICountDownTimerProps, ICountDownTimerState> {
    private simulatorUpdateInterval: NodeJS.Timeout | null = null;

    constructor(props: ICountDownTimerProps) {
        super(props);
        this.state = { dispose: null, countdownTimer: 0, roundState: ROUND_STATE.NONE };
    }

    @render(RoundTimeStore, (store) => store.countdownTimer)
    private renderCountDownTimer(countdownTimer: number): void {
        // Only update if not in simulator mode
        if (!this.props.simulatorMode) {
            this.setState({ countdownTimer });
            this.props.onCountdownTimerChange?.(countdownTimer);
        }
    }

    @render(RoundTimeStore, (store) => store.roundState, { fireImmediately: false })
    private renderCountDownTimerState(roundState: string): void {
        // Only update if not in simulator mode
        if (!this.props.simulatorMode) {
            this.setState({ roundState });
        }
    }

    // Update state when simulator props change
    componentDidUpdate(prevProps: ICountDownTimerProps) {
        if (this.props.simulatorMode && (
            prevProps.simulatorCountdownTimer !== this.props.simulatorCountdownTimer ||
            prevProps.simulatorRoundState !== this.props.simulatorRoundState
        )) {
            this.setState({
                countdownTimer: this.props.simulatorCountdownTimer || 0,
                roundState: this.props.simulatorRoundState || ROUND_STATE.NONE
            });
        }
    }

    // Start simulator update interval when in simulator mode
    componentDidMount() {
        if (this.props.simulatorMode) {
            this.startSimulatorUpdates();
        }
    }

    componentWillUnmount() {
        if (this.simulatorUpdateInterval) {
            clearInterval(this.simulatorUpdateInterval);
        }
    }

    private startSimulatorUpdates() {
        // Update every 100ms to get real-time simulator data for smoother updates
        this.simulatorUpdateInterval = setInterval(() => {
            if (this.props.simulatorMode) {
                // Get the latest simulator state from the global mock store
                const globalStore = (window as any).__ROUND_TIME_STORE__;
                if (globalStore) {
                    this.setState({
                        countdownTimer: globalStore.countdownTimer,
                        roundState: globalStore.roundState
                    });
                    this.props.onCountdownTimerChange?.(globalStore.countdownTimer);
                }
            }
        }, 100);
    }

    protected getTimerContentConfig(roundState: string) {
        const { PLACING_BET, LOCKING_BET, SHOW_ANIMATION_RESULT, SHOW_RESULT, STOP_GAME_LOOP, STARTING_ROUND } = ROUND_STATE;
        return {
            showTimer: [PLACING_BET].includes(roundState),
            showNoMoreBet: [LOCKING_BET].includes(roundState),
            showResult: [SHOW_ANIMATION_RESULT, STOP_GAME_LOOP, SHOW_RESULT].includes(roundState),
            startRound: [STARTING_ROUND].includes(roundState),
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
                        className={classnames(Styles['timer-wrapper'], {
                            [Styles['placing-bet-state']]: roundState === ROUND_STATE.PLACING_BET,
                            [Styles['no-more-bet-state']]: roundState === ROUND_STATE.LOCKING_BET,
                            [Styles['show-result-state']]: isShowResult,
                        }, customStyles?.timer)}
                    >
                        <div className={Styles['counting-text']}>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
