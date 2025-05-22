import * as gc from '@sg/sg-game-client';
import { Auth, Connection, Rounds } from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React from 'react';
import {
    GameBettingOptionsContext,
    GameBettingZoneContext,
} from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import Styles from './bet-option.module.scss';
import { BACCARAT_CHOICES, FISH_PRAWN_CRAB_CHOICES, SE_DIE_CHOICES, COLOR_GAME_CHOICES } from '../../../games/constants/saba-club';
import { checkValidAmount, parseInputValue, WarnMsgType, calculateMinMaxAmount } from '../../utils/betting-util';
import { useAppContext } from '../../../appProvider';

interface BettingBlockProps {
    odd: number;
    betChoice: string;
    gameName: string;
    namespace: string;
    children: React.ReactNode;
    settlementResult?: gc.GameServiceMessage.TSettlementResult;
    onBet: () => void;
}

interface IBetPanel extends IStateObserver {
    clientRoundId: number;
    stakeLevel: gc.Player.IStakeLevel;
    currency: string;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    clientSeed: string;
    isShowBetSlip: boolean;
}

interface IBettingBlockState extends IStateObserver {
    isAuthorized: boolean;
    isSignedIn: boolean;
    isFinishShowResult: boolean;
    isShowBetSlip: boolean;
    isShowStaticHighlight?: boolean;
    roundState: string;
    // Add bet panel state
    clientRoundId: number;
    stakeLevel: gc.Player.IStakeLevel;
    currency: string;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    clientSeed: string;
}

class BettingBlock extends ObserverComponent<BettingBlockProps, IBettingBlockState> {
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly maxTimeoutDuration = 10000;
    private bettingBlockRef: React.RefObject<HTMLDivElement>;
    static contextType = GameBettingOptionsContext;

    constructor(props: BettingBlockProps) {
        super(props);

        this.state = {
            isAuthorized: false,
            isSignedIn: false,
            dispose: null,
            isFinishShowResult: false,
            isShowStaticHighlight: undefined,
            isShowBetSlip: false,
            roundState: '',
            // Initialize bet panel state
            clientRoundId: 0,
            stakeLevel: { minBet: 0, maxBet: 0 },
            currency: '',
            minBet: 0,
            maxBet: 0,
            maxBetPerChoices: {},
            clientSeed: '',
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
        // const context = this.context as { panelId: string | null; setPanelId: (id: string | null) => void };
        // if (
        //     this.bettingBlockRef.current &&
        //     !this.bettingBlockRef.current.contains(event.target as Node) &&
        //     context.panelId === this.props.betChoice
        // ) {
        //     context.setPanelId(null);
        //     this.setState({ isShowBetSlip: false });
        // }

        this.setState({ isShowBetSlip: false });
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
        const stateUpdates = {
            [Rounds.ROUND_STATE.SHOW_RESULT]: { isShowStaticHighlight: true, isShowBetSlip: false },
            [Rounds.ROUND_STATE.STARTING_ROUND]: { isShowStaticHighlight: true, isShowBetSlip: false },
            // [Rounds.ROUND_STATE.PLACING_BET]: { isShowStaticHighlight: true, isShowBetSlip: true },
            [Rounds.ROUND_STATE.LOCKING_BET]: { isShowStaticHighlight: false, isShowBetSlip: false },
        };

        const update = stateUpdates[roundState] || { isShowBetSlip: false };
        this.setState(update);
        this.setState({ roundState });
    }

    protected handleOnClick({ panelId, setPanelId, show, setShow }) {
        return () => {
            const { isAuthorized, isShowBetSlip } = this.state;

            if (this.state.roundState !== Rounds.ROUND_STATE.PLACING_BET) {
                return;
            }
            // Get the position of the betting block
            if (this.bettingBlockRef.current) {
                const rect = this.bettingBlockRef.current.getBoundingClientRect();
                const position = {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX
                };

                // Store position in window object for parent frame access
                (window as any).__BETTING_BLOCK_STATE__ = {
                    ...(window as any).__BETTING_BLOCK_STATE__,
                    position
                };
            }

            // Toggle bet slip state
            this.setState((prevState) => ({ ...prevState, isShowBetSlip: !prevState.isShowBetSlip }));

            // Handle bet and authorization
            if (!isShowBetSlip) {
                this.props.onBet();
            }

            if (!isAuthorized) {
                this.autoCreateNickname();
            }
        };
    }

    @handle(Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    protected autoCreateNickname() { }

    @handle(Connection.ConnectionHandlers.SignInHandler)
    protected signIn() { }

    private sendBetPanelStateToParent() {
        const { clientRoundId, stakeLevel, currency, minBet, maxBet, maxBetPerChoices, clientSeed } = this.state;
        const { minBet: stakeLevelMinBet = 0, maxBet: stakeLevelMaxBet = 0 } = stakeLevel || {};
        const betChoiceMax = maxBetPerChoices?.[this.props.betChoice] || 0;

        const { min: newMin, max: newMax } = calculateMinMaxAmount(
            minBet,
            stakeLevelMinBet,
            maxBet,
            stakeLevel.maxBet,
            betChoiceMax,
            maxBetPerChoices,
            this.props.namespace
        );

        const isSpecialChoice = [
            SE_DIE_CHOICES.RED2,
            BACCARAT_CHOICES.PLAYER_PAIR,
            BACCARAT_CHOICES.BANKER_PAIR,
            FISH_PRAWN_CRAB_CHOICES.PRAWN,
            FISH_PRAWN_CRAB_CHOICES.ROOSTER,
            COLOR_GAME_CHOICES.PINK,
            COLOR_GAME_CHOICES.GREEN
        ].includes(this.props.betChoice);

        const bettingBlockState = (window as any).__BETTING_BLOCK_STATE__ || {};
        const position = bettingBlockState.position || { top: 0, left: 0 };

        const panelState = {
            top: position.top,
            left: position.left,
            betChoice: this.props.betChoice,
            odd: this.props.odd,
            amount: 0,
            currency,
            min: newMin,
            max: newMax,
            payout: '0.00',
            gameName: this.props.gameName,
            namespace: this.props.namespace,
            clientRoundId,
            isSpecialChoice,
            warnMsg: '',
            isShowBetSlip: this.state.isShowBetSlip
        };

        window.parent.postMessage({
            type: 'BET_PANEL_STATE',
            state: panelState
        }, '*');
    }

    componentDidUpdate(prevProps: BettingBlockProps, prevState: IBettingBlockState) {
        if (prevState.isShowBetSlip !== this.state.isShowBetSlip) {
            this.sendBetPanelStateToParent();
        }
    }

    render() {
        const { children, gameName, settlementResult, betChoice } = this.props;
        const { isFinishShowResult, isShowStaticHighlight } = this.state;
        let flashAnimationClass = '';
        const bettingZoneState = {
            gameName,
            betChoice,
            odd: this.props.odd,
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
                        </GameBettingZoneContext.Provider>
                    );
                }}
            </GameBettingOptionsContext.Consumer>
        );
    }
}

export default BettingBlock;
