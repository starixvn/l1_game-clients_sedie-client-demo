import React, { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer } from '@sg/sg-observer';
import GatewayGameBase, { IGatewayGameBaseState } from '../../../_shared/components/game-base/gateway-gamebase';
import { configGameContainer } from '../../../_shared/components/game-base/startup';
import type { GameBaseProps } from '../../../_shared/components/game-base/type';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';
import { BigSmallBetOptions } from './bet-option';
import styles from './big-small.module.scss';
import { containerOptions, setting } from './game-settings';
import { BigSmallSettlementResult } from './settlement-result';

const BigSmallStatistic = React.lazy(() => import('./statistic/big-small-statistic'));
const BigSmallRoundHistory = React.lazy(() => import('./round-history/big-small-round-history'));

interface IBigSmallPageState extends IGatewayGameBaseState {
    activePanelId: any;
    showBetPanel: boolean;
    gameId: number;
}

interface IBigSmallPageProps extends GameBaseProps {
    language: string;
}

@observer(setting.mainObserverNamespace)
export default class BigSmallPage extends GatewayGameBase<IBigSmallPageProps, IBigSmallPageState> {
    override overrideClasses = {
        blockWrapper: styles['block-wrapper'],
        info: styles['info'],
        result: styles['result'],
        betOptions: styles['bet-options'],
    };

    constructor(props: IBigSmallPageProps) {
        super(props);
        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
            // Silent fail on initialization error
        }

        this.state = {
            ...this.state,
            gameId: setting.id,
        };
    }

    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    closeConnect() {}

    renderRoundHistory() {
        return (
            <Suspense>
                <BigSmallRoundHistory namespace={this.props.namespace} language={this.props.language} />
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
                <BigSmallBetOptions
                    gameName={setting.gameName}
                    namespace={this.props.namespace}
                    language={this.props.language}
                    onBet={this.handleBetOption}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderResultBlock() {
        return <BigSmallSettlementResult namespace={this.props.namespace} language={this.props.language} />;
    }

    renderStatistic() {
        return (
            <Suspense>
                <BigSmallStatistic namespace={this.props.namespace} gameName={setting.gameName} language={this.props.language} />
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

        await FunctionUtils.delay(2000);
        this.finishShowResult();
    }
}
