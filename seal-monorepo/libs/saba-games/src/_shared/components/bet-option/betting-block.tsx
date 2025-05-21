import * as gc from '@sg/sg-game-client';
import { Auth, Connection, Rounds } from '@sg/sg-game-client';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import {
    GameBettingOptionsContext,
    GameBettingZoneContext,
} from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import BetPanelComponent from '../bet-panel/bet-panel';
import { IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import Styles from './bet-option.module.scss';
import { sendBettingBlockState, sendHideAllBetPanels } from '../../../_shared/utils/window-message-util';
import { BettingBlockProps, IBettingBlockState } from './types';
import { useBettingBlock } from './use-betting-block';

const BettingBlockWrapper: React.FC<{
    betChoice: string;
    odd: number;
    isAuthorized: boolean;
    isSignedIn: boolean;
    isShowBetSlip: boolean;
    onBet: () => void;
    setPanelId: (id: string | null) => void;
    panelId: string | null;
    bettingBlockRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
    namespace: string;
    className: string;
}> = ({
    betChoice,
    odd,
    isAuthorized,
    isSignedIn,
    isShowBetSlip,
    onBet,
    setPanelId,
    panelId,
    bettingBlockRef,
    children,
    namespace,
    className
}) => {
        const { handleOnClick } = useBettingBlock(
            betChoice,
            odd,
            isAuthorized,
            isSignedIn,
            isShowBetSlip,
            onBet,
            setPanelId,
            panelId,
            bettingBlockRef
        );

        return (
            <GameBettingZoneContext.Provider value={{ gameName: namespace, betChoice, odd }}>
                <div
                    ref={bettingBlockRef}
                    className={className}
                    onClick={handleOnClick}
                >
                    {children}
                </div>
                {isShowBetSlip && <BetPanelComponent namespace={namespace} />}
            </GameBettingZoneContext.Provider>
        );
    };

class BettingBlock extends ObserverComponent<BettingBlockProps, IBettingBlockState> {
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
    }

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        super.componentWillUnmount();
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

    private handleClickOutside = (event: MouseEvent) => {
        const context = this.context as { panelId: string | null; setPanelId: (id: string | null) => void };
        if (
            this.bettingBlockRef.current &&
            !this.bettingBlockRef.current.contains(event.target as Node) &&
            context.panelId === this.props.betChoice
        ) {
            context.setPanelId(null);
            this.notifyParentState();
        }
    };

    render() {
        const { children, namespace, gameName, settlementResult, betChoice } = this.props;
        const { odd, isFinishShowResult, isShowStaticHighlight, isShowBetSlip } = this.state;
        let flashAnimationClass = '';

        if (isFinishShowResult && settlementResult?.[betChoice]) {
            flashAnimationClass = 'flash-and-keep-background-color';
        } else if (isShowStaticHighlight && settlementResult?.[betChoice]) {
            flashAnimationClass = 'highlight-static-bet-choice';
        }

        return (
            <GameBettingOptionsContext.Consumer>
                {({ panelId, setPanelId }) => (
                    <BettingBlockWrapper
                        betChoice={betChoice}
                        odd={odd}
                        isAuthorized={this.state.isAuthorized}
                        isSignedIn={this.state.isSignedIn}
                        isShowBetSlip={isShowBetSlip}
                        onBet={this.props.onBet}
                        setPanelId={setPanelId}
                        panelId={panelId}
                        bettingBlockRef={this.bettingBlockRef}
                        namespace={namespace}
                        className={classNames(`${Styles['betting-block']} ${Styles[flashAnimationClass]}`, {
                            [Styles['open-panel-background-color']]: panelId === betChoice,
                        })}
                    >
                        {children}
                    </BettingBlockWrapper>
                )}
            </GameBettingOptionsContext.Consumer>
        );
    }
}

export default BettingBlock;
