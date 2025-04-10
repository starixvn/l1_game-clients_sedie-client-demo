import React, { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { handle, observer, render } from '@sg/sg-observer';
import GatewayGameBase, { IGatewayGameBaseState } from '../../../_shared/components/game-base/gateway-gamebase';
import { configGameContainer } from '../../../_shared/components/game-base/startup';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';
import Styles from './baccarat.module.scss';
import BaccaratBetOptions from './bet-option/baccarat-bet-options';
import { containerOptions, setting } from './game-settings';
import BaccaratSettlementResult from './settlement-result/baccarat-settlement-result';
import { IBaccaratBet } from './type';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import type { GameBaseProps } from '../../../_shared/components/game-base/type';

const BaccaratStatistic = React.lazy(() => import('./statistic/baccarat-statistics'));
const BaccaratRoundHistory = React.lazy(() => import('./round-history/baccarat-round-history'));

interface IBaccaratState extends IGatewayGameBaseState {
    previousWinningBet?: IBaccaratBet['type'];
    roundState: string;
    isExpanded: boolean;
}

@observer(setting.mainObserverNamespace)
export default class Baccarat extends GatewayGameBase<GameBaseProps, IBaccaratState> {
    override overrideClasses = {
        blockWrapper: Styles['block-wrapper'],
        betOptions: Styles['baccarat-bet-options-block'],
        info: Styles['baccarat-info-block'],
        result: Styles['baccarat-result-block'],
    };

    constructor(props: GameBaseProps) {
        super(props);
        this.state = {
            ...this.state,
            previousWinningBet: undefined,
            isExpanded: false,
            gameId: setting.id,
        };

        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
            // Silent fail on initialization error
        }
    }

    handleToggleExpand = () => {
        this.setState({ isExpanded: !this.state.isExpanded });
    };

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() { }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    handleRoundStateChange(roundState: string) {
        this.setState({ roundState });
    }

    renderRoundHistory() {
        return (
            <Suspense>
                <BaccaratRoundHistory namespace={this.props.namespace} language={this.props.language} />
            </Suspense>
        );
    }

    renderBettingBlock() {
        return (
            <GameBettingOptionsContext.Provider
                value={{
                    panelId: this.state.activePanelId,
                    setPanelId: this.setPanelId,
                    show: this.state.showBetPanel,
                    setShow: this.setShowBetPanel,
                }}
            >
                <BaccaratBetOptions
                    namespace={this.props.namespace}
                    previousWinningBet={this.state.previousWinningBet}
                    language={this.props.language}
                    gameName={setting.gameName}
                    onBet={this.handleBetOption}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderResultBlock() {
        return <BaccaratSettlementResult namespace={this.props.namespace} language={this.props.language} />;
    }

    renderStatistic() {
        return (
            <Suspense>
                <BaccaratStatistic namespace={this.props.namespace} gameName={setting.gameName} language={this.props.language} />
            </Suspense>
        );
    }

    async showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ) {
        if (!result) return;

        // Update the previous winning bet based on the settlement result
        if (settlementResult && this.state.roundState == ROUND_STATE.LOCKING_BET) {
            const winningBet = Object.entries(settlementResult).find(([_, value]) => Number(value) > 0)?.[0] as IBaccaratBet['type'];
            this.setState({ previousWinningBet: winningBet });
        }

        const { banker, player } = result as any;
        const numberCards =
            Object.keys(banker).filter((key) => banker[key] !== null).length +
            Object.keys(player).filter((key) => player[key] !== null).length;
        await FunctionUtils.delay((numberCards + 1) * 1000);
    }
}
