import * as gc from '@sg/sg-game-client';
import { Auth, Connection, Rounds } from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React, { useEffect, useState, useRef } from 'react';
import {
    GameBettingOptionsContext,
    GameBettingZoneContext,
} from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import Styles from './bet-option.module.scss';
import { useBetPanel } from './hooks/use-bet-panel';
import { IBetPanelConfig } from './types/bet-panel.types';
import { BACCARAT_CHOICES, FISH_PRAWN_CRAB_CHOICES, SE_DIE_CHOICES, COLOR_GAME_CHOICES } from '../../../games/constants/saba-club';
import { checkValidAmount, parseInputValue, WarnMsgType, calculateMinMaxAmount } from '../../utils/betting-util';
import { useAppContext } from '../../../appProvider';
import { calculateBetPanelState } from './utils/bet-panel.utils';

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
    isAuthorized: boolean;
    isSignedIn: boolean;
    isFinishShowResult: boolean;
    isShowStaticHighlight?: boolean;
    roundState: string;
    clientRoundId: number;
    stakeLevel: gc.Player.IStakeLevel;
    currency: string;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    clientSeed: string;
    betChoice: string;
    odd: number;
}

interface BettingPanelContentProps {
    betPanelConfig: IBetPanelConfig;
    betChoice: string;
    odd: number;
    gameName: string;
    namespace: string;
    panelId: string;
    onBet: () => void;
    isAuthorized: boolean;
    roundState: string;
    autoCreateNickname: () => void;
    children: React.ReactNode;
    flashAnimationClass: string;
    bettingZoneState: {
        gameName: string;
        betChoice: string;
        odd: number;
    };
    waitForAuthorization: (betChoice: string, odd: number) => void;
}

const BettingPanelContent: React.FC<BettingPanelContentProps> = ({
    betPanelConfig,
    betChoice,
    odd,
    gameName,
    namespace,
    panelId,
    onBet,
    isAuthorized,
    roundState,
    autoCreateNickname,
    children,
    flashAnimationClass,
    bettingZoneState,
    waitForAuthorization
}) => {
    const {
        isShowBetSlip,
        setIsShowBetSlip,
        bettingBlockRef,
        sendBetPanelState
    } = useBetPanel(betPanelConfig, betChoice, odd, gameName, namespace);

    // Add effect to watch roundState changes
    useEffect(() => {
        if (roundState !== Rounds.ROUND_STATE.PLACING_BET && isShowBetSlip) {
            setIsShowBetSlip(false);
            sendBetPanelState();
        }
    }, [roundState, isShowBetSlip, setIsShowBetSlip, sendBetPanelState]);

    const handleOnClick = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (roundState !== Rounds.ROUND_STATE.PLACING_BET) {
            console.log(`onBet ${roundState}`);
            onBet();
            return;
        }

        const newIsShowBetSlip = !isShowBetSlip;
        console.log(`handleOnClick ${newIsShowBetSlip}`);
        setIsShowBetSlip(newIsShowBetSlip);
        sendBetPanelState();

        if (!isAuthorized) {
            autoCreateNickname();
            waitForAuthorization(betChoice, odd);
        }
    };

    return (
        <GameBettingZoneContext.Provider value={bettingZoneState}>
            <div
                ref={bettingBlockRef}
                className={classNames(`${Styles['betting-block']} ${Styles[flashAnimationClass]}`, {
                    [Styles['open-panel-background-color']]: panelId === betChoice,
                })}
                onClick={handleOnClick}
            >
                {children}
            </div>
        </GameBettingZoneContext.Provider>
    );
};

class BettingBlock extends ObserverComponent<BettingBlockProps, IBettingBlockState> {
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly maxTimeoutDuration = 10000;
    static contextType = GameBettingOptionsContext;

    constructor(props: BettingBlockProps) {
        super(props);

        this.state = {
            isAuthorized: false,
            isSignedIn: false,
            dispose: null,
            isFinishShowResult: false,
            isShowStaticHighlight: undefined,
            roundState: '',
            clientRoundId: 0,
            stakeLevel: { minBet: 0, maxBet: 0 },
            currency: '',
            minBet: 0,
            maxBet: 0,
            maxBetPerChoices: {},
            clientSeed: '',
            betChoice: '',
            odd: 0
        };

        // Add message event listener
        window.addEventListener('message', this.handleWindowMessage);
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        // Remove message event listener
        window.removeEventListener('message', this.handleWindowMessage);
        super.componentWillUnmount();
    }

    private handleWindowMessage = (event: MessageEvent) => {
        // Accept messages from any origin in development
        try {
            const data = event.data;
            if (data.type === 'HANDLE_BET') {
                console.log('Child: Received HANDLE_BET message:', data);
                this.handleBetFromParent(data.amount, data.betChoice, data.clientSeed);
            }
        } catch (error) {
            console.error('Child: Error processing message:', error);
        }
    };

    private handleBetFromParent = (amount: number, betChoice: string, clientSeed: string) => {
        if (this.state.roundState !== Rounds.ROUND_STATE.PLACING_BET) {
            console.log('Child: Cannot place bet - not in PLACING_BET state');
            console.log(`onBet ${this.state.roundState}`);
            this.props.onBet();
            return;
        }

        console.log('Child: Processing bet from parent:', { amount, betChoice, clientSeed });
        this.handleBet(amount, betChoice, clientSeed);
    };

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
            [Rounds.ROUND_STATE.SHOW_RESULT]: { isShowStaticHighlight: true },
            [Rounds.ROUND_STATE.STARTING_ROUND]: { isShowStaticHighlight: true },
            [Rounds.ROUND_STATE.LOCKING_BET]: { isShowStaticHighlight: false },
        };

        const update = stateUpdates[roundState] || {};
        this.setState(update);
        this.setState({ roundState });
    }

    @render(gc.Rounds.RoundStore, (store) => store.clientRoundId)
    renderRoundId(clientRoundId: number) {
        this.setState({ clientRoundId });
    }

    @render(gc.Player.MainPlayerStore, (store) => store.stakeLevel)
    setUserStakeLevel(stakeLevel: gc.Player.IStakeLevel) {
        if (stakeLevel) {
            this.setState({ stakeLevel });
        }
    }

    @render(gc.Player.MainPlayerStore, (store) => store.currency)
    setCurrency(currency: string) {
        this.setState({ currency });
    }

    @render(gc.GameConfigs.GameConfigStore, (store) => ({
        minBet: store.minBet,
        maxBet: store.maxBet,
        maxBetPerChoices: store.maxBetPerChoices,
    }))
    setMaxBetPerChoices({
        minBet,
        maxBet,
        maxBetPerChoices,
    }: {
        minBet: number;
        maxBet: number;
        maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    }) {
        this.setState({ maxBetPerChoices, minBet, maxBet });
    }

    @render(gc.RoundBasePF.ProvablyFairStore, (store) => store.clientSeed)
    handleClientSeed(clientSeed: string) {
        this.setState({ clientSeed });
    }

    @handle(Auth.AuthHandlers.Authorize, (handler) => handler.handleAutoGenerateName())
    protected autoCreateNickname() { }

    @handle(Connection.ConnectionHandlers.SignInHandler)
    protected signIn() { }

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

    @handle(gc.Bet.BetHandler)
    handleBet(amount: number, betChoice: string, clientSeed: string) {
        return { amount, betChoice, clientSeed };
    }

    render() {
        const { children, gameName, settlementResult, betChoice, odd, namespace } = this.props;
        const { isFinishShowResult, isShowStaticHighlight } = this.state;
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

        const betPanelConfig: IBetPanelConfig = {
            minBet: this.state.minBet,
            maxBet: this.state.maxBet,
            maxBetPerChoices: this.state.maxBetPerChoices,
            stakeLevel: this.state.stakeLevel,
            currency: this.state.currency,
            clientRoundId: this.state.clientRoundId,
            clientSeed: this.state.clientSeed
        };

        return (
            <GameBettingOptionsContext.Consumer>
                {({ panelId }) => (
                    <BettingPanelContent
                        betPanelConfig={betPanelConfig}
                        betChoice={betChoice}
                        odd={odd}
                        gameName={gameName}
                        namespace={namespace}
                        panelId={panelId}
                        onBet={this.props.onBet}
                        isAuthorized={this.state.isAuthorized}
                        roundState={this.state.roundState}
                        autoCreateNickname={this.autoCreateNickname.bind(this)}
                        children={children}
                        flashAnimationClass={flashAnimationClass}
                        bettingZoneState={bettingZoneState}
                        waitForAuthorization={this.waitForAuthorization.bind(this)}
                    />
                )}
            </GameBettingOptionsContext.Consumer>
        );
    }
}

export default BettingBlock;
