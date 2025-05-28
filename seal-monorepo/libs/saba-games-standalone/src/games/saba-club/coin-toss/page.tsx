import React, { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import GatewayGameBase, { IGatewayGameBaseState } from '../../../_shared/components/game-base/gateway-gamebase';
import { configGameContainer } from '../../../_shared/components/game-base/startup';
import type { GameBaseProps } from '../../../_shared/components/game-base/type';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';
import CoinTossBetOptions from './bet-option/coin-toss-bet-options';
import styles from './coin-toss.module.scss';
import { containerOptions, setting } from './game-settings';
import  CoinTossSettlementResult  from './settlement-result';
import { ANIMATION_DURATION_MS } from './constants/coin-toss-constants';

const CoinTossStatistic = React.lazy(() => import('./statistic/coin-toss-statistic'));
const CoinTossRoundHistory = React.lazy(() => import('./round-history/coin-toss-round-history'));

interface ICoinTossPageState extends IGatewayGameBaseState {
    activePanelId: any;
    roundState: string;
    showBetPanel: boolean;
    gameId: number;
}

interface ICoinTossPageProps extends GameBaseProps {
    language: string;
}

@observer(setting.mainObserverNamespace)
export default class CoinTossPage extends GatewayGameBase<ICoinTossPageProps, ICoinTossPageState> {
    override overrideClasses = {
        blockWrapper: styles['block-wrapper'],
        betOptions: styles['bet-options-block'],
        info: styles['info-block'],
        result: styles['result-block'],
    };

    constructor(props: ICoinTossPageProps) {
        super(props);
        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
        }
        this.state = {
            ...this.state,
            gameId: setting.id,
        };
    }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() { }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    handleRoundStateChange(roundState: string) {
        this.setState({ roundState });
    }

    renderRoundHistory() {
        return (
            <Suspense>
                <CoinTossRoundHistory namespace={this.props.namespace} language={this.props.language} />
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
                <CoinTossBetOptions
                    gameName={setting.gameName}
                    namespace={this.props.namespace}
                    language={this.props.language}
                    onBet={this.handleBetOption}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderResultBlock() {
        return <CoinTossSettlementResult namespace={this.props.namespace} language={this.props.language} />;
    }

    renderStatistic() {
        return (
            <Suspense>
                <CoinTossStatistic namespace={this.props.namespace} gameName={setting.gameName} language={this.props.language} />
            </Suspense>
        );
    }

    async showResult(
        hasAnimation: boolean,
        result?: gc.GameServiceMessage.TResult,
        settlementResult?: gc.GameServiceMessage.TSettlementResult,
    ) {
        if (!this.isValidResult(result, settlementResult)) {
            return;
        }

        // 1s delay after coin animation
        await FunctionUtils.delay(ANIMATION_DURATION_MS);
        this.finishShowResult();
    }
} 