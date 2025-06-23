import { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import { GatewayGameBase } from '../../../games/game-base';
import { IGatewayGameBaseState } from '../../../games/game-base/interfaces/gateway-types';
import { configGameContainer } from '../../../games/game-base/startup';
import type { GameBaseProps } from '../../../games/game-base/type';
import { UIExtensionOptions } from '../../../games/game-base/ui/game-ui-renderer';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import styles from './rng-soccer.module.scss';
import { containerOptions, setting } from './game-settings';
import RNGSoccerBetOptions from './bet-option/rng-soccer-bet-options';
import liveIcon from '../../../assets/rng-soccer/live-icon.svg';
import historyBtnIcon from '../../../assets/rng-soccer/history-btn.svg';
import bgGame from '../../../assets/rng-soccer/bg-game.webp';
import blurBgGame from '../../../assets/rng-soccer/blur-bg-game.png';
import RNGSoccerSettlementResult from './settlement-result/rng-soccer-settlement-result';
import RNGSoccerStatistic from './statistic/rng-soccer-statistic';

interface IRNGSoccerPageState extends IGatewayGameBaseState {
    isTimerActive: boolean;
    isPopupVisible: boolean;
}

@observer(setting.mainObserverNamespace)
export default class RNGSoccerPage extends GatewayGameBase<GameBaseProps, IRNGSoccerPageState> {
    constructor(props: GameBaseProps) {
        super(props);

        const { placingBet } = setting.durations;
        this.state = {
            ...this.state,
            gameId: setting.id,
            isTimerActive: true,
            isPopupVisible: false,
            roundId: 0,
            placingBetStartTime: placingBet,
        } as IRNGSoccerPageState;

        this.uiRenderer.setExtensionOptions(this.getUIExtensionOptions());

        try {
            configGameContainer(setting.name, containerOptions);
        } catch (error) {
            // Silent fail on initialization error
        }
    }

    // State management methods
    togglePopup = () => {
        this.setState({
            isPopupVisible: !this.state.isPopupVisible
        });
    }

    setShowBetPanel = (show: boolean) => {
        this.setState({ showBetPanel: show });
    };

    setPanelId = (id: string) => {
        this.setState({ activePanelId: id });
    };

    // Game lifecycle and event handlers
    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    override closeConnect() { }

    override getGameBackgroundImage(): string {
        return bgGame;
    }

    override getDisconnectViewBackground(): string {
        return blurBgGame;
    }

    // UI configuration and rendering methods
    getUIExtensionOptions(): UIExtensionOptions {
        return {
            classes: {
                gameContainer: styles['sport-item'],
                header: styles['wrapper-sport-top'],
                content: styles['wrapper-sport-content'],
                footer: styles['wrapper-sport-bottom'],
                popup: styles['statistic-popup'],
                gameNameText: styles['game-name-text'],
                gameNameRound: styles['game-name-round'],
                liveIcon: styles['live-icon'],
                timer: styles['timer'],
                statsIcon: styles['score-board-img']
            },
            components: {
                customContent: () => this.renderCustomContent(),
                customFooter: () => this.renderCustomFooter(),
                customHistory: (props, state) => this.renderCustomHistory(state as IRNGSoccerPageState),
                customBetting: () => this.renderCustomBetting()
            },
            config: {
                gameName: 'RNGSoccer',
                liveIconUrl: liveIcon,
                statsIconUrl: historyBtnIcon,
                onStatsIconClick: this.togglePopup
            }
        };
    }

    renderCustomContent(): JSX.Element {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <RNGSoccerSettlementResult
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                />
            </Suspense>
        );
    }

    renderCustomFooter(): JSX.Element {
        return (
            <div className={styles['wrapper-sport-bottom']}>
                {this.renderCustomBetting()}
            </div>
        );
    }

    renderCustomBetting(): JSX.Element {
        return (
            <GameBettingOptionsContext.Provider
                value={{
                    panelId: this.state.activePanelId,
                    setPanelId: this.setPanelId,
                    show: this.state.showBetPanel,
                    setShow: this.setShowBetPanel,
                }}
            >
                <RNGSoccerBetOptions
                    gameName={setting.gameName}
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                    onBet={() => {
                        this.resetBettingPanel();
                        this.setState({ isShowNextRoundMessage: true } as Pick<IRNGSoccerPageState, keyof IRNGSoccerPageState>);
                        setTimeout(() => {
                            this.setState({ isShowNextRoundMessage: false } as Pick<IRNGSoccerPageState, keyof IRNGSoccerPageState>);
                        }, 3000);
                    }}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderCustomHistory(state: IRNGSoccerPageState): JSX.Element {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <RNGSoccerStatistic
                    namespace={this.props.namespace}
                    language={this.props.language}
                    isPopupVisible={state.isPopupVisible ?? false}
                    togglePopup={this.togglePopup}
                />
            </Suspense>
        );
    }
}