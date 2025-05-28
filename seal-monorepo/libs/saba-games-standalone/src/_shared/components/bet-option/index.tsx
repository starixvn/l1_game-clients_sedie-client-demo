import * as gc from '@sg/sg-game-client';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { render } from '@sg/sg-observer';
import { isEmpty } from 'lodash';

import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';

export interface IBetOptionsState extends IStateObserver {
    roundOdds: gc.Rounds.RoundOdds;
    ownBets: gc.GameServiceMessage.OwnBets;
    totalBets: gc.GameServiceMessage.TotalBets;
    userBetPercentage: gc.GameServiceMessage.UserBetPercentage;
    betPercentage: gc.GameServiceMessage.BetPercentage;
    isShowBetPanel: boolean;
    roundState?: string;
    boostedOdds?: gc.GameServiceMessage.BoostedOddsType | null;
    settlementResult?: gc.GameServiceMessage.TSettlementResult;
}

export interface IBetOptionsProps extends IPropsObserver {
    language: string;
    gameName: string;
    onBet: () => void;
}

export default class BetOptions extends ObserverComponent<IBetOptionsProps, IBetOptionsState> {
    constructor(props: IBetOptionsProps) {
        super(props);
        this.state = {
            dispose: null,
            roundOdds: {},
            ownBets: {},
            totalBets: {},
            userBetPercentage: {},
            betPercentage: {},
            isShowBetPanel: false,
            roundState: ROUND_STATE.NONE,
            boostedOdds: null,
            settlementResult: {},
        } as IBetOptionsState;
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string) {
        this.setState({ roundState });
        if (roundState === ROUND_STATE.LOCKING_BET) {
            this.setState({ settlementResult: {} });
        }
    }

    @render(gc.Rounds.RoundStore, (store) => store.ownBets, { fireImmediately: false })
    setOwnBets(ownBets: gc.GameServiceMessage.OwnBets) {
        this.setState({ ownBets });
    }

    @render(gc.Rounds.RoundStore, (store) => store, { fireImmediately: true })
    setOdds(roundStore: any) {
        this.setState({
            roundOdds: roundStore.roundOdds,
            boostedOdds: roundStore.boostedOdds,
        });
    }

    @render(gc.Rounds.RoundStore, (store) => store, { fireImmediately: true })
    setBoostedOdds(roundStore: any) {
        this.setState({
            roundOdds: roundStore.roundOdds,
            boostedOdds: roundStore.boostedOdds,
        });
    }

    @render(gc.Rounds.RoundStore, (store) => store.totalBets)
    renderTotalBets(totalBets: gc.GameServiceMessage.TotalBets) {
        this.setState({ totalBets });
    }

    @render(gc.Rounds.RoundStore, (store) => store.userBetPercentage)
    handleUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        this.setState({ userBetPercentage });
    }

    @render(gc.Rounds.RoundStore, (store) => store.betPercentage)
    handleBetPercentage(betPercentage: gc.GameServiceMessage.BetPercentage) {
        this.setState({ betPercentage });
    }

    @render(gc.Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        this.clearHighlightStatic();
        this.clearHighlightAnim();

        const { result, settlementResult } = currentFinish;

        if (!result || !settlementResult) {
            return;
        }
        this.setState({ settlementResult });
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.firstJoinGameHistory)
    renderStaticResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        if (!firstJoinGameHistory) {
            return;
        }
        const { roundHistory, staticHighlight, animationHighlight } = firstJoinGameHistory;
        roundHistory && this.setHighlightStatic(staticHighlight, animationHighlight, roundHistory);
    }

    protected setHighlightStatic(staticHighlight: boolean, animationHighlight: boolean, roundHistory: gc.RoundHistories.RoundHistory) {
        if (staticHighlight || animationHighlight) {
            this.showHighlightStatic(roundHistory.settlementResult);
        }
    }

    @render(gc.Rounds.RoundStore, (store) => store.isResetHighlight)
    handleResetHighlight(isResetHighlight: boolean) {
        if (isResetHighlight) {
            this.clearHighlightStatic();
        }
    }

    @render(gc.Rounds.RoundStore, (store) => store.highlightStatic, { fireImmediately: false })
    handleHighlightStatic(highlightStatic: gc.Rounds.THighlightStatic) {
        if (!isEmpty(highlightStatic?.settlementResult)) {
            this.showHighlightStatic(highlightStatic.settlementResult);
        } else {
            this.clearHighlightStatic();
        }
    }

    protected showHighlightStatic(settlementResult: gc.GameServiceMessage.TSettlementResult) {
        this.setState({ settlementResult });
    }
    protected showAnimationHighlight(settlementResult: gc.GameServiceMessage.TSettlementResult) {}
    protected clearHighlightStatic() {}
    protected clearHighlightAnim() {}

    renderSubOptions(choice: string, odd: number, fractional: boolean, name = '', isBoostedChoice: boolean) {
        return <></>;
    }

    renderMainOption(name: string, odd: number, choice: string, fractional: boolean, isBoostedChoice: boolean) {
        return <></>;
    }

    renderTotalBet(choice: string) {
        return <></>;
    }

    renderOwnBet(choice: string) {
        return <></>;
    }

    render() {
        return <></>;
    }
}
