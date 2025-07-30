import * as gc from '@sg/sg-game-client';
import React from 'react';
import classNames from 'classnames';
import AnimationBalance from '../../../_shared/components/anim-balance';
import { ConfirmBet } from '../../../_shared/components/bet-option/confirm-bet';
import Notice from '../../../_shared/components/notices/notice';
import Warning from '../../../_shared/components/notices/warning';
import WarningDialog from '../../../_shared/components/notices/warning-dialog';
import { RoundId } from '../../../_shared/components/round-id';
import CountDownTimer from '../../../_shared/components/count-down-timer';
import Styles from '../game-base.module.scss';
import rngSoccerStyles from '../../saba-club/rng-soccer/rng-soccer.module.scss';
import { IGameBaseState } from '../interfaces';
import { GameBaseProps } from '../type';
import StartRoundCountDownTimer from '../../../_shared/components/start-round-count-down-timer';
import { getMessage as getGameMessage } from '../game-logic/message-logic';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds/round-time-store';

export interface UIExtensionOptions {
    classes?: {
        gameContainer?: string;
        header?: string;
        content?: string;
        footer?: string;
        betOptions?: string;
        popup?: string;
        resultBlock?: string;
        statisticBlock?: string;
        gameNameText?: string;
        gameNameRound?: string;
        liveIcon?: string;
        timer?: string;
        statsIcon?: string;
    };
    components?: {
        customHeader?: (props: any, state: any) => JSX.Element;
        customContent?: (props: any, state: any) => JSX.Element;
        customFooter?: (props: any, state: any) => JSX.Element;
        customHistory?: (props: any, state: any) => JSX.Element;
        customBetting?: (props: any, state: any) => JSX.Element;
        customResult?: (props: any, state: any) => JSX.Element;
        customStatistic?: (props: any, state: any) => JSX.Element;
        customRoundHistory?: (props: any, state: any) => JSX.Element;
    };
    config?: {
        enableHeaderSection?: boolean;
        enableFooterSection?: boolean;
        enableContentSection?: boolean;
        enablePopupSection?: boolean;
        disableDefaultStyles?: boolean;
        gameName?: string;
        liveIconUrl?: string;
        statsIconUrl?: string;
        onStatsIconClick?: () => void;
    };
}

export class GameUIRenderer<P extends GameBaseProps, S extends IGameBaseState> {
    protected extensionOptions: UIExtensionOptions = {};

    constructor(options?: UIExtensionOptions) {
        this.extensionOptions = options || {};
    }

    setExtensionOptions(options: UIExtensionOptions): void {
        this.extensionOptions = { ...this.extensionOptions, ...options };
    }

    getExtensionClass(key: string): string {
        const result = this.extensionOptions.classes?.[key as keyof UIExtensionOptions['classes']] || '';
        return result;
    }

    // Helper method to resolve JSX elements, handling null/undefined values
    protected resolveCustomSection(customSection: JSX.Element | null | undefined, defaultRenderer: () => JSX.Element): JSX.Element {
        return customSection || defaultRenderer();
    }

    renderNotice(props: P, state: S): JSX.Element {
        return <Notice namespace={props.namespace} isDisableGame={state.showDisabledPopup} language={props.language} />;
    }

    renderWarning(props: P): JSX.Element {
        return <Warning namespace={props.namespace} />;
    }

    renderRoundIdSection(state: S) {
        const { roundId, roundState } = state;
        return <RoundId clientRoundId={roundId} roundState={roundState} />;
    }

    renderCountDownTimer(props: P, setState: (state: Partial<S>) => void) {
        return (
            <CountDownTimer
                namespace={props.namespace}
                language={props.language}
                onComplete={() => {
                    setState({ isAllowedBet: true } as Partial<S>);
                }}
                onCountdownTimerChange={(countdownTimer: number) => {
                    setState({ countdownTimer } as Partial<S>);
                }}
            />
        );
    }

    renderResultBlock(props?: P, state?: S): JSX.Element {
        if (this.extensionOptions.components?.customResult && props && state) {
            return this.extensionOptions.components.customResult(props, state);
        }
        return <></>;
    }

    renderStatistic(props?: P, state?: S): JSX.Element {
        if (this.extensionOptions.components?.customStatistic && props && state) {
            return this.extensionOptions.components.customStatistic(props, state);
        }
        return <></>;
    }

    renderWaitingForNextRound(state: S) {
        const message = getGameMessage(state, gc.Translator);
        if (!message) return null;
        return <WarningDialog key="warning-bet" message={message} duration={1000} />;
    }

    renderBettingBlock(props?: P, state?: S): JSX.Element {
        if (this.extensionOptions.components?.customBetting && props && state) {
            return this.extensionOptions.components.customBetting(props, state);
        }
        return <></>;
    }

    renderRoundHistory(props?: P, state?: S): JSX.Element {
        if (this.extensionOptions.components?.customRoundHistory && props && state) {
            return this.extensionOptions.components.customRoundHistory(props, state);
        }
        return <></>;
    }

    renderAnimationBalance(state: S) {
        const { statusSettlement, isFinishShowResult } = state;

        if (!statusSettlement || !statusSettlement.win) {
            return <></>;
        }

        if (isFinishShowResult) {
            return <AnimationBalance winBet={statusSettlement?.bet} />;
        }

        return null;
    }

    renderGameHeaderSection(props: P, state: S, setState: (state: Partial<S>) => void, overrideClasses?: any): JSX.Element {
        if (this.extensionOptions.components?.customHeader) {
            return this.extensionOptions.components.customHeader(props, state);
        }

        if (this.extensionOptions.config?.enableHeaderSection === false) {
            return <></>;
        }

        const headerClass = classNames(Styles['game-header'], this.getExtensionClass('header'), overrideClasses?.header);

        if (this.extensionOptions.config?.liveIconUrl) {
            return this.renderStandardGameHeader(props, state, setState, overrideClasses);
        }

        return (
            <div className={headerClass}>
                <div className={Styles['game-name']}>
                    {state.gameId && <div className={Styles['game-name-text']}>{state.gameId}</div>}
                    {this.renderRoundIdSection(state)}
                </div>
                {this.renderCountDownTimer(props, setState)}
            </div>
        );
    }

    renderStandardGameHeader(props: P, state: S, setState: (state: Partial<S>) => void, overrideClasses?: any): JSX.Element {
        const headerClass = classNames(Styles['game-header'], this.getExtensionClass('header'), overrideClasses?.header);

        const gameNameTextClass = classNames(Styles['game-name-text'], this.getExtensionClass('gameNameText'));

        const gameNameRoundClass = classNames(Styles['game-name-round'], this.getExtensionClass('gameNameRound'));

        const timerClass = classNames(Styles['timer'], this.getExtensionClass('timer'));

        const gameName = gc.Translator.translate(`${this.extensionOptions.config?.gameName}.game_name`) || state.gameId;
        const liveIconUrl = this.extensionOptions.config?.liveIconUrl;

        const toggleStatistic = () => {
            if (typeof this.extensionOptions.config?.onStatsIconClick === 'function') {
                this.extensionOptions.config.onStatsIconClick();
            }
        };

        return (
            <div className={headerClass}>
                <div className={Styles['game-name']}>
                    <div className={gameNameTextClass}>
                        {gameName}
                        {liveIconUrl && (
                            <img
                                src={liveIconUrl}
                                alt="live"
                                className={classNames(Styles['live-icon'], this.getExtensionClass('liveIcon'))}
                            />
                        )}
                    </div>
                    <RoundId clientRoundId={state.roundId} roundState={state.roundState} className={gameNameRoundClass} />
                </div>
                <CountDownTimer
                    namespace={props.namespace}
                    language={props.language}
                    onComplete={() => {
                        setState({ isAllowedBet: true } as Partial<S>);
                    }}
                    onCountdownTimerChange={(countdownTimer: number) => {
                        setState({ countdownTimer } as Partial<S>);
                    }}
                    customStyles={{
                        wrapper: timerClass,
                    }}
                />
            </div>
        );
    }

    renderGameContentSection(props: P, state: S, overrideClasses?: any): JSX.Element {
        if (this.extensionOptions.components?.customContent) {
            return this.extensionOptions.components.customContent(props, state);
        }

        if (this.extensionOptions.config?.enableContentSection === false) {
            return <></>;
        }

        const contentClass = classNames(Styles['game-content'], this.getExtensionClass('content'), overrideClasses?.content);

        return <div className={contentClass}>{this.renderResultBlock(props, state)}</div>;
    }

    renderGameFooterSection(props: P, state: S, overrideClasses?: any): JSX.Element {
        if (this.extensionOptions.config?.enableFooterSection === false) {
            return <></>;
        }

        const footerClass = classNames(Styles['game-footer'], this.getExtensionClass('footer'), overrideClasses?.footer);

        const betOptionsClass = classNames(
            Styles['bet-options'],
            {
                [Styles['disabled']]: !state.isAllowedBet,
            },
            this.getExtensionClass('betOptions'),
            overrideClasses?.betOptions,
        );

        const customFooter = this.extensionOptions?.components?.customFooter?.(props, state);
        return (
            <div className={footerClass}>
                <div className={betOptionsClass}>
                    {customFooter ? customFooter : this.renderBettingBlock(props, state)}
                    <ConfirmBet namespace={props.namespace} />
                </div>
                <div className={Styles['animation-balance']}>{this.renderAnimationBalance(state)}</div>
            </div>
        );
    }

    renderGameHistorySection(props: P, state: S, overrideClasses?: any): JSX.Element {
        if (this.extensionOptions.components?.customHistory) {
            return this.extensionOptions.components.customHistory(props, state);
        }

        if (this.extensionOptions.config?.enablePopupSection === false) {
            return <></>;
        }

        const popupClass = classNames(Styles['game-popup'], this.getExtensionClass('popup'), overrideClasses?.popup);

        return <div className={popupClass}>{this.renderStatistic(props, state)}</div>;
    }

    applyBaseStyles(): React.CSSProperties {
        if (this.extensionOptions.config?.disableDefaultStyles) {
            return {};
        }

        return {
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        };
    }

    renderGameBackground(customBackgroundImage?: string): React.CSSProperties {
        const baseStyles = this.applyBaseStyles();

        if (!customBackgroundImage) {
            return baseStyles;
        }

        return {
            ...baseStyles,
            background: `url(${customBackgroundImage}) no-repeat center`,
            backgroundSize: 'cover',
        };
    }

    renderGameMessages(props: P, state: S): JSX.Element {
        return (
            <div className={Styles['game-messages']}>
                {this.renderNotice(props, state)}
                {this.renderWarning(props)}
                {this.renderWaitingForNextRound(state)}
            </div>
        );
    }

    renderGameContainer(
        props: P,
        state: S,
        setStateCallback: (state: Partial<S>) => void,
        overrideClasses?: any,
        customHeaderSection?: JSX.Element | null,
        customContentSection?: JSX.Element | null,
        customFooterSection?: JSX.Element | null,
        customRoundHistorySection?: JSX.Element | null,
        customHistorySection?: JSX.Element | null,
    ): JSX.Element {
        return (
            <>
                {this.resolveCustomSection(customHeaderSection, () =>
                    this.renderGameHeaderSection(props, state, setStateCallback, overrideClasses),
                )}
                {this.resolveCustomSection(customContentSection, () => this.renderGameContentSection(props, state, overrideClasses))}
                {this.resolveCustomSection(customFooterSection, () => this.renderGameFooterSection(props, state, overrideClasses))}
                {this.resolveCustomSection(customRoundHistorySection, () => this.renderRoundHistory(props, state))}
                {this.resolveCustomSection(customHistorySection, () => this.renderGameHistorySection(props, state, overrideClasses))}
                {this.renderGameMessages(props, state)}
            </>
        );
    }

    renderGameLayout(
        props: P,
        state: S,
        setStateCallback: (state: Partial<S>) => void,
        overrideClasses?: any,
        customBackgroundImage?: string,
        customHeaderSection?: JSX.Element | null,
        customContentSection?: JSX.Element | null,
        customFooterSection?: JSX.Element | null,
        customHistorySection?: JSX.Element | null,
        customRoundHistorySection?: JSX.Element | null,
    ): JSX.Element {
        const gameContainerWrapperClass = classNames(Styles['game-container-wrapper'], {
            [Styles['overflow-hidden']]: state.roundState === ROUND_STATE.STARTING_ROUND,
        });

        const containerStyle = this.renderGameBackground(customBackgroundImage);

        const containerClass = classNames(
            Styles['game-container'],
            this.getExtensionClass('gameContainer'),
            overrideClasses?.gameContainer,
        );

        return (
            <div className={gameContainerWrapperClass}>
                <div className={containerClass} style={containerStyle}>
                    {this.renderGameContainer(
                        props,
                        state,
                        setStateCallback,
                        overrideClasses,
                        customHeaderSection,
                        customContentSection,
                        customFooterSection,
                        customRoundHistorySection,
                        customHistorySection,
                    )}
                </div>
                {state.roundState == ROUND_STATE.STARTING_ROUND && <div className={rngSoccerStyles['shine']}></div>}
            </div>
        );
    }
}

export default GameUIRenderer;
