import * as gc from '@sg/sg-game-client';
import { Auth, Connection, Rounds } from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React from 'react';
import {
    GameBettingOptionsContext,
    GameBettingZoneContext,
} from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import BetPanelComponent from '../bet-panel/bet-panel';
import { IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import Styles from './bet-option.module.scss';
import { sendBettingBlockState, sendHideAllBetPanels } from '../../../_shared/utils/window-message-util';
import { useEffect, useRef } from 'react';

interface BettingBlockProps {
    odd: number;
    betChoice: string;
    gameName: string;
    namespace: string;
    children: React.ReactNode;
    settlementResult?: gc.GameServiceMessage.TSettlementResult;
    onBet: () => void;
}

interface IBettingBlockState extends IStateObserver {
    betChoice: string;
    odd: number;
    isAuthorized: boolean;
    isSignedIn: boolean;
    isFinishShowResult: boolean;
    isShowBetSlip: boolean;
    isShowStaticHighlight?: boolean;
}

class BettingBlock extends ObserverComponent<BettingBlockProps, IBettingBlockState> {
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly maxTimeoutDuration = 10000;
    private bettingBlockRef: React.RefObject<HTMLDivElement>;
    static contextType = GameBettingOptionsContext;

    constructor(props: BettingBlockProps) {
        super(props);

        this.state = {
            betChoice: '',
            odd: 0,
            isAuthorized: false,
            isSignedIn: false,
            dispose: null,
            isFinishShowResult: false,
            isShowStaticHighlight: undefined,
            isShowBetSlip: false,
        };

        this.bettingBlockRef = React.createRef();
        this.handleOnClick = this.handleOnClick.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        document.removeEventListener('mousedown', this.handleClickOutside);
        super.componentWillUnmount();
    }

    private handleClickOutside(event: MouseEvent) {
        const context = this.context as { panelId: string | null; setPanelId: (id: string | null) => void };
        if (
            this.bettingBlockRef.current &&
            !this.bettingBlockRef.current.contains(event.target as Node) &&
            context.panelId === this.props.betChoice
        ) {
            context.setPanelId(null);
            this.notifyParentState();
        }
    }

    @render(Auth.AuthStore, (store) => store.isAuthorized)
    protected handleAuthorized(isAuthorized: boolean) {
        this.setState({ isAuthorized });
    }

    @render(Connection.ConnectionStore, (store) => store.isSignedIn)
    protected handleSignIn(isSignedIn: boolean) {
        if (isSignedIn) {
            this.setState({ isSignedIn });
        }
    }

    @render(gc.Settlements.SettlementStore, (store) => store.isFinishedShowResult)
    finishShowResult(isFinishedShowResult: boolean) {
        this.setState({ isFinishShowResult: isFinishedShowResult });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState, { fireImmediately: false })
    renderCountDownTimerState(roundState: string) {
        if (roundState === Rounds.ROUND_STATE.SHOW_RESULT && this.state.isShowStaticHighlight === undefined) {
            this.setState({ isShowStaticHighlight: true, isShowBetSlip: false });
            this.notifyParentState();
            return;
        }

        switch (roundState) {
            case Rounds.ROUND_STATE.STARTING_ROUND:
                this.setState({ isShowStaticHighlight: true, isShowBetSlip: false });
                this.notifyParentState();
                break;
            case Rounds.ROUND_STATE.PLACING_BET:
                this.setState({ isShowStaticHighlight: true, isShowBetSlip: true });
                this.notifyParentState();
                break;
            case Rounds.ROUND_STATE.LOCKING_BET:
                this.setState({ isShowStaticHighlight: false, isShowBetSlip: false });
                this.notifyParentState();
                break;
            default:
                this.setState({ isShowBetSlip: false });
                this.notifyParentState();
                break;
        }
    }

    protected notifyParentState() {
        const { betChoice, odd } = this.props;
        const { isShowBetSlip } = this.state;

        sendBettingBlockState({
            isShowBetSlip,
            betChoice,
            odd
        });
    }

    protected handleOnClick({ panelId, setPanelId, show, setShow }) {
        return () => {
            const { betChoice, odd } = this.props;
            const { isAuthorized } = this.state;

            // Notify parent to hide all bet panels first
            sendHideAllBetPanels();

            if (!this.state.isShowBetSlip) {
                this.props.onBet();
            }

            if (!isAuthorized) {
                this.autoCreateNickname();
            }

            // Toggle panel state
            if (panelId === betChoice) {
                setPanelId(null);
            } else {
                setPanelId(betChoice);
            }

            this.waitForAuthorization(betChoice, odd);
            this.notifyParentState();
        };
    }

    protected updateBettingState(betChoice: string, odd: number) {
        this.setState({ betChoice, odd });
    }

    protected waitForAuthorization(betChoice: string, odd: number) {
        const interval = 100;
        const startTime = Date.now();
        this.clearTimeout();

        const checkAuthorization = () => {
            if (this.state.isAuthorized) {
                this.handleUserSignIn();
                this.updateBettingState(betChoice, odd);
                this.clearTimeout();
            } else if (Date.now() - startTime < this.maxTimeoutDuration) {
                this.timeoutId = setTimeout(checkAuthorization, interval);
            }
        };

        this.timeoutId = setTimeout(checkAuthorization, interval);
    }

    protected handleUserSignIn() {
        if (!this.state.isSignedIn) {
            this.signIn();
        }
    }

    protected clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    @handle(Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    protected autoCreateNickname() { }

    @handle(Connection.ConnectionHandlers.SignInHandler)
    protected signIn() { }

    render() {
        const { children, namespace, gameName, settlementResult, betChoice } = this.props;
        const { odd, isFinishShowResult, isShowStaticHighlight, isShowBetSlip } = this.state;
        let flashAnimationClass = '';
        const bettingZoneState = {
            gameName,
            betChoice,
            odd,
        };

        if (isFinishShowResult && settlementResult?.[betChoice]) {
            flashAnimationClass = 'flash-and-keep-background-color';
        } else if (isShowStaticHighlight && settlementResult?.[betChoice]) {
            flashAnimationClass = 'highlight-static-bet-choice';
        }

        return (
            <GameBettingOptionsContext.Consumer>
                {({ panelId, setPanelId, show, setShow }) => {
                    return (
                        <GameBettingZoneContext.Provider value={bettingZoneState}>
                            <div
                                ref={this.bettingBlockRef}
                                className={classNames(`${Styles['betting-block']} ${Styles[flashAnimationClass]}`, {
                                    [Styles['open-panel-background-color']]: panelId === betChoice,
                                })}
                                onClick={this.handleOnClick({ panelId, setPanelId, show, setShow })}
                            >
                                {children}
                            </div>
                            {isShowBetSlip && <BetPanelComponent namespace={namespace} />}
                        </GameBettingZoneContext.Provider>
                    );
                }}
            </GameBettingOptionsContext.Consumer>
        );
    }
}

export default BettingBlock;
