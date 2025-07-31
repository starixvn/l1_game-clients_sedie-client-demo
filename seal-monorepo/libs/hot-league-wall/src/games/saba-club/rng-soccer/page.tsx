import React, { Suspense } from 'react';
import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import { GatewayGameBase } from '../../../games/game-base';
import { IGatewayGameBaseState } from '../../../games/game-base/interfaces/gateway-types';
import { configGameContainer } from '../../../games/game-base/startup';
import type { GameBaseProps } from '../../../games/game-base/type';
import { UIExtensionOptions } from '../../../games/game-base/ui/game-ui-renderer';
import { GameBettingOptionsContext } from '../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import { SentryLogProvider, useGameSentryLogger, useSentryLog } from '../../../_shared/react-contexts/log-context/sentry-log-context';
import { SentryLogLevel } from '../../../_shared/utils/sentry/sentry-types';
import styles from './rng-soccer.module.scss';
import { containerOptions, setting } from './game-settings';
import RNGSoccerBetOptions from './bet-option/rng-soccer-bet-options';
import liveIcon from '../../../assets/rng-soccer/live-icon.svg';
import bgGame from '../../../assets/rng-soccer/bg-game.webp';
import blurBgGame from '../../../assets/rng-soccer/blur-bg-game.png';
import RNGSoccerSettlementResult from './settlement-result/rng-soccer-settlement-result';
import RNGSoccerStatistic from './statistic/rng-soccer-statistic';
import { RNGSoccerRoundHistory } from './round-history';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds/round-time-store';
import { useSentryHelper } from '../../../_shared/hooks/useSentryHelper';
import { useGameCronSentry } from '../../../_shared/hooks/useGameCronSentry';

// Extended props for RNG Soccer with logging support
interface IRNGSoccerPageProps extends GameBaseProps {
    onSendLogsToSentry?: () => Promise<void>;
    onTrackEvent?: (event: string, metadata?: Record<string, any>) => void;
}

interface IRNGSoccerPageState extends IGatewayGameBaseState {
    isTimerActive: boolean;
    isPopupVisible: boolean;
    logsSentToSentry: boolean; // Track if logs have been sent for current round
}

@observer(setting.mainObserverNamespace)
class RNGSoccerPageComponent extends GatewayGameBase<IRNGSoccerPageProps, IRNGSoccerPageState> {
    constructor(props: IRNGSoccerPageProps) {
        super(props);

        const { placingBet } = setting.durations;
        this.state = {
            ...this.state,
            gameId: setting.id,
            isTimerActive: true,
            isPopupVisible: false,
            roundId: 0,
            placingBetStartTime: placingBet,
            logsSentToSentry: false,
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
            isPopupVisible: !this.state.isPopupVisible,
        });
    };

    setShowBetPanel = (show: boolean) => {
        this.setState({ showBetPanel: show });
    };

    setPanelId = (id: string) => {
        this.setState({ activePanelId: id });
    };

    // Method to send logs to Sentry when game ends
    sendLogsToSentry = async () => {
        try {
            // This will be called by the SentryLogProvider when needed
            if (this.props.onSendLogsToSentry) {
                await this.props.onSendLogsToSentry();
                this.setState({ logsSentToSentry: true });
            }
        } catch (error) {
            console.error('Failed to send logs to Sentry:', error);
        }
    };

    // Log game events to Sentry
    logGameEvent = (event: string, metadata?: Record<string, any>) => {
        if (this.props.onSendLogsToSentry) {
            // This will be handled by the SentryLogProvider
            console.log(`RNG Soccer Event: ${event}`, metadata);
        }
    };

    // Track game events in Session Replay
    trackGameEvent = (event: string, metadata?: Record<string, any>) => {
        // This will be called by the parent component to track events in Session Replay
        if (this.props.onTrackEvent) {
            this.props.onTrackEvent(event, metadata);
        }
    };

    // Game lifecycle and event handlers
    @handle(gc.Connection.ConnectionHandlers.CloseConnectHandler, (handler) => handler.handleGateway())
    override closeConnect() {
        // Handled by decorator
    }

    // Override round state handler to detect STOP_GAME_LOOP and send logs
    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    override renderCountDownTimerState(roundState: string): void {
        // Call parent implementation first
        super.renderCountDownTimerState(roundState);

        // Log round state changes
        this.logGameEvent('round_state_changed', {
            roundId: this.state.roundId,
            roundState,
            previousRoundState: this.state.roundState,
            timestamp: Date.now()
        });

        // Track round state changes in Session Replay
        this.trackGameEvent('round_state_changed', {
            roundId: this.state.roundId,
            roundState,
            previousRoundState: this.state.roundState,
            timestamp: Date.now()
        });

        // Check if round state is STOP_GAME_LOOP and logs haven't been sent yet
        if (roundState === ROUND_STATE.STOP_GAME_LOOP && !this.state.logsSentToSentry) {
            this.logGameEvent('game_ending', {
                roundId: this.state.roundId,
                roundState,
                timestamp: Date.now()
            });

            // Track game ending in Session Replay
            this.trackGameEvent('game_ending', {
                roundId: this.state.roundId,
                roundState,
                timestamp: Date.now()
            });

            // Send logs to Sentry when game ends
            this.sendLogsToSentry();
        }

        // Reset logs sent flag when a new round starts
        if (roundState === ROUND_STATE.STARTING_ROUND) {
            this.logGameEvent('new_round_starting', {
                roundId: this.state.roundId,
                roundState,
                timestamp: Date.now()
            });

            // Track new round starting in Session Replay
            this.trackGameEvent('new_round_starting', {
                roundId: this.state.roundId,
                roundState,
                timestamp: Date.now()
            });

            this.setState({ logsSentToSentry: false });
        }
    }

    // Override round ID change handler to add logging
    @render(gc.Rounds.RoundStore, (store) => store.clientRoundId)
    override handleRoundIdChange(roundId: number): void {
        if (this.state.roundState !== ROUND_STATE.NONE) {
            this.logGameEvent('round_id_changed', {
                previousRoundId: this.state.roundId,
                newRoundId: roundId,
                roundState: this.state.roundState,
                timestamp: Date.now()
            });
        }

        // Call parent implementation
        super.handleRoundIdChange(roundId);
    }

    override getGameBackgroundImage(): string {
        return bgGame;
    }

    override getGameRoundHistorySection(): JSX.Element {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <RNGSoccerRoundHistory
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                    togglePopup={this.togglePopup}
                />
            </Suspense>
        );
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
                footer: styles['wrapper-sport-bottom'],
                popup: styles['statistic-popup'],
                gameNameText: styles['game-name-text'],
                gameNameRound: styles['game-name-round'],
                liveIcon: styles['live-icon'],
                timer: styles['timer'],
                statsIcon: styles['score-board-img'],
            },
            components: {
                customContent: () => this.renderCustomContent(),
                customFooter: () => this.renderCustomFooter(),
                customHistory: (props, state) => this.renderCustomHistory(state as IRNGSoccerPageState),
                customBetting: () => this.renderCustomBetting(),
            },
            config: {
                gameName: 'RNGSoccer',
                liveIconUrl: liveIcon,
            },
        };
    }

    renderCustomContent(): JSX.Element {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <RNGSoccerSettlementResult namespace={setting.mainObserverNamespace} language={this.props.language} />
            </Suspense>
        );
    }

    renderCustomFooter(): JSX.Element {
        return <div className={styles['wrapper-sport-bottom']}>{this.renderCustomBetting()}</div>;
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
                        this.logGameEvent('bet_placed', {
                            roundId: this.state.roundId,
                            timestamp: Date.now()
                        });

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

// Wrapper component to provide Sentry logging context to the class component
const RNGSoccerPage: React.FC<GameBaseProps> = (props) => {
    const { logInfo } = useSentryHelper({
        componentName: 'RNGSoccerPage',
        logLevel: SentryLogLevel.WARN,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });

    // Initialize Game Cron Batch Manager for RNG Soccer
    const {
        logInfo: gameLogInfo,
        logWarning: gameLogWarning,
        logError: gameLogError,
        startGameCron,
        completeGameCron
    } = useGameCronSentry({
        gameCronId: 'sg-rng-soccer-page',
        gameName: 'RNG Soccer',
        systemType: 'SG',
        environment: 'LOCAL1',
        onlySendOnIssues: true
    });

    // Start game cron when component mounts
    React.useEffect(() => {
        startGameCron({
            gameId: '118',
            component: 'RNGSoccerPage',
            props: { language: props.language }
        });
        gameLogInfo('RNG Soccer page mounted', { component: 'RNGSoccerPage' });

        // Complete game cron when component unmounts
        return () => {
            completeGameCron(true, { reason: 'component_unmounted' });
        };
    }, [props.language]);

    logInfo('RNGSoccerPage rendered', {
        namespace: props.namespace,
        language: props.language,
        timestamp: Date.now()
    });

    return (
        <SentryLogProvider
            sessionId={`rng-soccer-${Date.now()}`}
            gameId="118"
            enabled={true}
            maxLogs={1000}
            autoSendOnUnmount={false}
            sentryConfig={{
                dsn: "https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056",
                environment: "LOCAL1",
                componentName: "RNGSoccerPage",
                debug: false,
                logLevel: SentryLogLevel.INFO
            }}
        >
            <RNGSoccerPageWithLogging {...props} />
        </SentryLogProvider>
    );
};

// Inner component that provides logging callback
const RNGSoccerPageWithLogging: React.FC<GameBaseProps> = (props) => {
    const { logInfo, logError } = useGameSentryLogger('RNGSoccerPage');
    const {
        startSessionReplay,
        stopSessionReplay,
        trackInteraction,
        trackLifecycle,
        trackPerformance,
        trackError,
        sendLogsToSentry,
        isRecording
    } = useSentryLog();

    // Log game events and start Session Replay
    React.useEffect(() => {
        logInfo('RNG Soccer game session started', {
            namespace: props.namespace,
            language: props.language,
            gameId: '118',
            timestamp: Date.now()
        });

        // Start Session Replay for RNG Soccer
        startSessionReplay('RNG Soccer Game Session', {
            namespace: props.namespace,
            language: props.language,
            gameId: '118',
            sessionType: 'rng_soccer_game'
        });

        // Track component lifecycle
        trackLifecycle('mount', {
            component: 'RNGSoccerPage',
            namespace: props.namespace,
            language: props.language,
            gameId: '118'
        });

        // Cleanup on unmount
        return () => {
            trackLifecycle('unmount', {
                component: 'RNGSoccerPage',
                namespace: props.namespace,
                language: props.language,
                gameId: '118'
            });
            stopSessionReplay();
        };
    }, [props.namespace, props.language, logInfo, startSessionReplay, stopSessionReplay, trackLifecycle]);

    const handleSendLogsToSentry = async () => {
        try {
            logInfo('Sending RNG Soccer game logs to Sentry', {
                roundState: 'STOP_GAME_LOOP',
                gameId: '118',
                timestamp: Date.now()
            });

            // Track log sending in Session Replay
            trackInteraction('sending_logs_to_sentry', {
                roundState: 'STOP_GAME_LOOP',
                gameId: '118',
                timestamp: Date.now()
            });

            await sendLogsToSentry();

            logInfo('RNG Soccer game logs sent to Sentry successfully', {
                gameId: '118',
                timestamp: Date.now()
            });

            // Track successful log sending in Session Replay
            trackInteraction('logs_sent_successfully', {
                gameId: '118',
                timestamp: Date.now()
            });
        } catch (error) {
            logError('Failed to send RNG Soccer game logs to Sentry', {
                error: error instanceof Error ? error.message : 'Unknown error',
                gameId: '118',
                timestamp: Date.now()
            });

            // Track error in Session Replay
            trackError('Failed to send logs to Sentry', {
                error: error instanceof Error ? error.message : 'Unknown error',
                gameId: '118',
                timestamp: Date.now()
            });
        }
    };

    const handleTrackEvent = (event: string, metadata?: Record<string, any>) => {
        trackInteraction(event, {
            ...metadata,
            gameId: '118',
            timestamp: Date.now()
        });
    };

    return <RNGSoccerPageComponent {...props} onSendLogsToSentry={handleSendLogsToSentry} onTrackEvent={handleTrackEvent} />;
};

export default RNGSoccerPage;
