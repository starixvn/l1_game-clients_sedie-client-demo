import { ROUND_STATE, RoundTimeStore } from "@sg/sg-game-client/dist/game/rounds";
import { render } from "@sg/sg-observer";
import Styles from "./start-round-count-down-timer.module.scss";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";
import { formatSecondsOnly } from "../../utils/count-down-format";
import { setting } from "../../../games/saba-club/rng-soccer/game-settings";


export interface ICountDownTimerProps extends IPropsObserver {
    language?: string;
}

export interface ICountDownTimerState extends IStateObserver {
    countdownTimer: number;
    roundState: string;
}

export default class StartRoundCountDownTimer extends ObserverComponent<ICountDownTimerProps, ICountDownTimerState> {
    private countdownInterval: NodeJS.Timeout | null = null;
    private startRound = setting.durations?.startRound || 2;
    constructor(props: ICountDownTimerProps) {
        super(props);
        this.state = { dispose: null, countdownTimer: 0, roundState: ROUND_STATE.NONE };
    }

    @render(RoundTimeStore, (store) => store.roundState, { fireImmediately: false })
    private renderCountDownTimerState(roundState: string): void {
        if (roundState !== ROUND_STATE.STARTING_ROUND && this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        if (roundState === ROUND_STATE.STARTING_ROUND && !this.countdownInterval) {
            this.setState({ countdownTimer: this.startRound }, () => {
                this.countdownInterval = setInterval(() => {
                    this.setState((prevState) => {
                        const newCount = prevState.countdownTimer - 1;
                        return { countdownTimer: newCount };
                    });
                }, 1000);
            });
        }

        this.setState({ roundState });
    }

    componentWillUnmount() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        super.componentWillUnmount();
    }

    render() {
        const { countdownTimer, roundState } = this.state;
        const isStartingRound = roundState === ROUND_STATE.STARTING_ROUND;
        
        if (!isStartingRound) {
            return <></>;
        }

        return (
            <div className={Styles['count-down-wrapper']}>
                <div className={Styles['counting-text']}>
                    {formatSecondsOnly(countdownTimer)}
                </div>
            </div>
        );
    }
}
