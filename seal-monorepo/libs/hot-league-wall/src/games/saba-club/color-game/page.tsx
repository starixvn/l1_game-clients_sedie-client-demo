import React, { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import GatewayGameBase, { IGatewayGameBaseState } from '../../../_shared/components/game-base/gateway-gamebase';
import { configGameContainer } from '../../../_shared/components/game-base/startup';
import type { GameBaseProps } from '../../../_shared/components/game-base/type';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { FunctionUtils } from '../../../_shared/utils/funtion-utils';
import ColorGameBetOptions from './bet-option/color-game-bet-options';
import styles from './color-game.module.scss';
import { containerOptions, setting } from './game-settings';
import ColorGameSettlementResult from './settlement-result';
import { ANIMATION_DURATION_MS } from './constants';
import ColorGameRoundHistory from './round-history/color-game-round-history';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

const ColorGameStatistic = React.lazy(() => import('./statistic/color-game-statistic'));

interface IColorGamePageState extends IGatewayGameBaseState {
    activePanelId: any;
    roundState: string;
    showBetPanel: boolean;
    gameId: number;
}

interface IColorGamePageProps extends GameBaseProps {
    language: string;
}

@observer(setting.mainObserverNamespace)
export default class ColorGamePage extends GatewayGameBase<IColorGamePageProps, IColorGamePageState> {
    override overrideClasses = {
        blockWrapper: styles['block-wrapper'],
        betOptions: styles['bet-options-block'],
        info: styles['info-block'],
        result: styles['result-block'],
    };

    constructor(props: IColorGamePageProps) {
        super(props);
        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
        }
        this.state = {
            ...this.state,
            gameId: setting.id
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
                <ColorGameRoundHistory namespace={this.props.namespace} language={this.props.language} />
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
                <ColorGameBetOptions
                    gameName={setting.gameName}
                    namespace={this.props.namespace}
                    language={this.props.language}
                    onBet={this.handleBetOption}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderResultBlock() {
        return <ColorGameSettlementResult namespace={this.props.namespace} language={this.props.language} />;
    }

    renderStatistic() {
        return (
            <Suspense>
                <ColorGameStatistic namespace={this.props.namespace} gameName={setting.gameName} language={this.props.language} />
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

        await FunctionUtils.delay(ANIMATION_DURATION_MS);
        this.finishShowResult();
    }
} 