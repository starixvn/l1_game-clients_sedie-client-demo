import * as gc from '@sg/sg-game-client';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSentryHelper } from '../../hooks/useSentryHelper';
import { SentryLogLevel } from '../../utils/sentry-helper';
import {
    RNGSoccer_GAME_NAMESPACE,
    SABA_GAMES,
    VGAMING,
    VIVA88_SITE_ID,
} from '../../../../constant/app';
import { useAppContext } from '../../../appProvider';
import { RNG_SOCCER_CHOICES } from '../../../games/constants/saba-club';
import {
    useGameBettingOptionsContext,
    useGameBettingZoneContext,
} from '../../react-contexts/game-betting-zone-context/game-betting-zone-context';
import { checkValidAmount, parseInputValue, WarnMsgType, calculateMinMaxAmount } from '../../utils/betting-util';
import { getChoicesType } from '../../utils/choice-type';
import BettingChips from '../betting-chips';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import './bet-panel.scss';
import { localStorageKeys, StorageManager } from '../../utils/storage-manager';

const WARNING_CLOSE_DELAY = 60000;

// Game icon mapping constant
const GAME_ICON_MAPPING = {
    [RNGSoccer_GAME_NAMESPACE]: 'rng-soccer-icon',
} as const;

export interface IBetPanel extends IStateObserver {
    clientRoundId: number;
    stakeLevel: gc.Player.IStakeLevel;
    currency: string;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    clientSeed: string;
}

export interface ILatestBetRecord {
    namespace: string;
    roundId: number;
}

class BetPanelComponent<P extends IPropsObserver, S extends IBetPanel> extends ObserverComponent<IPropsObserver, IStateObserver> {

    constructor(props: P) {
        super(props);
        this.state = {
            dispose: null,
            clientRoundId: 0,
            stakeLevel: {},
            currency: '',
            minBet: 0,
            maxBet: 0,
            maxBetPerChoices: {},
            clientSeed: '',
        } as S;
    }

    @render(RoundStore, (store) => store.clientRoundId)
    renderRoundId(clientRoundId: number) {
        this.setState({ clientRoundId } as IBetPanel);
    }

    @render(gc.Player.MainPlayerStore, (store) => store.stakeLevel)
    setUserStakeLevel(stakeLevel: gc.Player.IStakeLevel) {
        if (stakeLevel) {
            this.setState({ stakeLevel } as IBetPanel);
        }
    }

    @render(gc.Player.MainPlayerStore, (store) => store.currency)
    setCurrency(currency: string) {
        this.setState({ currency } as IBetPanel);
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
        this.setState({ maxBetPerChoices, minBet, maxBet } as IBetPanel);
    }

    @handle(gc.Bet.BetHandler)
    handleBet(amount: number, betChoice: string, clientSeed: string) {
        return { amount, betChoice, clientSeed };
    }

    @render(gc.RoundBasePF.ProvablyFairStore, (store) => store.clientSeed)
    handleClientSeed(clientSeed: string) {
        this.setState({ clientSeed } as IBetPanel);
    }

    render() {
        const { clientRoundId, currency, minBet, maxBet, maxBetPerChoices, stakeLevel, clientSeed } = this.state as S;

        return (
            <BetPanel
                namespace={this.props.namespace}
                clientRoundId={clientRoundId}
                currency={currency}
                minBet={minBet}
                maxBet={maxBet}
                maxBetPerChoices={maxBetPerChoices}
                stakeLevel={stakeLevel}
                handleBet={this.handleBet.bind(this)}
                clientSeed={clientSeed}
            ></BetPanel>
        );
    }
}

const BetPanel: React.FC<{
    namespace: string;
    clientRoundId: number;
    currency: string;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    stakeLevel: gc.Player.IStakeLevel;
    clientSeed: string;
    handleBet: (amount: number, betChoice: string, clientSeed: string) => void;
}> = ({ namespace, clientRoundId, currency, minBet, maxBet, maxBetPerChoices, stakeLevel, handleBet, clientSeed }) => {
    // Initialize SentryHelper for BetPanel
    const { logError, logWarning, logInfo, workflow } = useSentryHelper({
        componentName: 'BetPanel',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: true
    });
    const { panelId, setPanelId, setShow } = useGameBettingOptionsContext();
    const { gameName, betChoice, odd = 0 } = useGameBettingZoneContext();
    const { siteId } = useAppContext();
    const { minBet: stakeLevelMinBet = 0, maxBet: stakeLevelMaxBet = 0 } = stakeLevel || {};
    const betChoiceMax = maxBetPerChoices?.[betChoice] || 0;

    const [amount, setAmount] = useState(stakeLevelMinBet);
    const [warnMsg, setWarnMsg] = useState('');
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const warningTimeoutRef = useRef<NodeJS.Timeout>();

    // TODO: 紅白翻譯要再跟ＰＭ要其他語系
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
    const addCommas = gc.FormatUtils.numberWithCommas;
    const displayAmount = amount > 0 ? gc.FormatUtils.numberWithCommas(amount) : '';
    const payout = amount > 0 ? addCommas(amount * odd, 2, false) : '0.00';
    const vendorName = siteId === VIVA88_SITE_ID ? SABA_GAMES : VGAMING;
    const panelRef = useRef<HTMLDivElement>(null);

    const isSpecialChoice = [
        RNG_SOCCER_CHOICES.AWAY
    ].includes(betChoice);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            try {
                if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                    setPanelId(null);
                    setShow(false);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logError(`Click outside handler failed: ${errorMessage}`, {
                    error,
                    operation: 'click_outside_handler'
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setPanelId, logError]);

    useEffect(() => {
        try {
            if (!betChoice) return;
            // calculate min and max using helper
            const { min: newMin, max: newMax } = calculateMinMaxAmount(
                minBet,
                stakeLevelMinBet,
                maxBet,
                stakeLevel.maxBet,
                betChoiceMax,
                maxBetPerChoices,
                namespace
            );

            setMin(newMin);
            setMax(newMax);

            setAmount((prev) => {
                if (prev < newMin) return newMin;
                if (prev > newMax) return newMax;
                return prev;
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(`Bet amount calculation failed: ${errorMessage}`, {
                error,
                operation: 'bet_amount_calculation',
                betChoice,
                minBet,
                maxBet,
                stakeLevelMinBet,
                betChoiceMax
            });
        }
    }, [betChoice, minBet, maxBet, stakeLevelMinBet, betChoiceMax, stakeLevel.maxBet, maxBetPerChoices, namespace, logError]);

    const setWarningWithTimeout = (message: string) => {
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        setWarnMsg(message);

        warningTimeoutRef.current = setTimeout(() => {
            setWarnMsg('');
        }, WARNING_CLOSE_DELAY);
    };

    const onHide = () => {
        setPanelId(null);
        setWarnMsg('');
    };

    const handleInputChange = (event: any) => {
        try {
            const numericValue = parseInputValue(event.target.value);

            const { msg } = checkValidAmount(numericValue, min, max);

            if (msg) {
                if (msg === WarnMsgType.LESS_THAN_MIN) {
                    setWarnMsg(t('Common.lessthanmin'));
                }

                if (msg === WarnMsgType.MORE_THAN_MAX) {
                    setWarnMsg(t('Common.morethanmax'));
                }
            } else {
                setWarnMsg('');
            }

            setAmount(numericValue);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(`Input change handler failed: ${errorMessage}`, {
                error,
                operation: 'input_change_handler',
                inputValue: event.target.value,
                min,
                max
            });
        }
    };

    const handleClear = () => {
        setAmount(0);
    };

    const updateLatestBetToStorage = (namespace: string, clientRoundId: number) => {
        try {
            const existingHistory = StorageManager.get(localStorageKeys.betHistory) as ILatestBetRecord[];
            let betHistory = Array.isArray(existingHistory) ? existingHistory : [];

            const newBet = { namespace, roundId: clientRoundId };
            const existingNamespaceIndex = betHistory.findIndex(bet => bet.namespace === namespace);

            if (existingNamespaceIndex !== -1) {
                betHistory[existingNamespaceIndex].roundId = clientRoundId;
            } else {
                betHistory.push(newBet);
            }

            StorageManager.set(localStorageKeys.betHistory, betHistory);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(`Failed to update latest bet record to storage: ${errorMessage}`, {
                error,
                operation: 'update_latest_bet_storage',
                namespace,
                clientRoundId
            });
        }
    };

    const handleClickBet = () => {
        const workflowId = workflow.start('Bet Placement', {
            betChoice,
            amount,
            namespace,
            clientRoundId,
            timestamp: Date.now()
        });

        logInfo('Bet button clicked', {
            betChoice,
            amount,
            namespace,
            clientRoundId,
            timestamp: Date.now()
        });

        const { newAmount: validatedAmount, msg } = checkValidAmount(amount, min, max);

        if (msg) {
            setAmount(validatedAmount);
            let warning = '';
            if (msg === WarnMsgType.LESS_THAN_MIN) {
                warning = t('Common.lessthanmin');
                setWarningWithTimeout(warning);
            }
            if (msg === WarnMsgType.MORE_THAN_MAX) {
                warning = t('Common.morethanmax');
                setWarningWithTimeout(warning);
            }

            logError('Bet validation failed', {
                msg,
                amount,
                validatedAmount,
                min,
                max,
                namespace,
                clientRoundId,
                timestamp: Date.now(),
                operation: 'bet_validation'
            });

            workflow.complete(workflowId, false, {
                reason: 'validation_failed',
                msg,
                warning
            });
            return;
        }

        if (betChoice) {
            try {
                logInfo('Processing bet', {
                    validatedAmount,
                    betChoice,
                    namespace,
                    clientRoundId,
                    timestamp: Date.now()
                });

                handleBet?.(validatedAmount, betChoice, clientSeed);
                onHide?.();
                updateLatestBetToStorage(namespace, clientRoundId);

                workflow.complete(workflowId, true, {
                    validatedAmount,
                    betChoice,
                    namespace,
                    clientRoundId,
                    success: true
                });

                logInfo('Bet placed successfully', {
                    validatedAmount,
                    betChoice,
                    namespace,
                    clientRoundId,
                    timestamp: Date.now()
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logError(`Bet handling error: ${errorMessage}`, {
                    error,
                    validatedAmount,
                    betChoice,
                    namespace,
                    clientRoundId,
                    timestamp: Date.now()
                });
                workflow.complete(workflowId, false, {
                    error: errorMessage,
                    validatedAmount,
                    betChoice
                });
            }
        } else {
            logError('Bet validation failed: no bet choice', {
                namespace,
                clientRoundId,
                timestamp: Date.now(),
                operation: 'bet_validation_no_choice'
            });
            workflow.complete(workflowId, false, {
                reason: 'no_bet_choice'
            });
        }
    };

    const handleChipAmountChange = useCallback(
        (addAmount: number) => {
            const { newAmount, msg } = checkValidAmount(addAmount, min, max);

            if (!msg) {
                setWarnMsg('');
            }
            setAmount(newAmount);
        },
        [min, max],
    );

    const renderTicketHeader = () => {
        const gameIconClass = GAME_ICON_MAPPING[namespace] || '';

        return (
            <div className="c-ticket__header">
                <span className="c-text-bettype sg-bet-panel__header-flex">
                    <div className={classNames('sg-bet-panel__game-icon', gameIconClass)}></div>
                    <div>
                        <div className="game-name">{t(`${namespace}.game_name`)}</div>
                        <div className="bet-option">{t(getChoicesType(namespace, betChoice))}</div>
                    </div>
                </span>

                <a className="c-btn c-btn--caret" aria-hidden="true">
                    <i className="c-icon c-icon--caret"></i>
                </a>
                <a className="c-btn c-btn--clear" aria-hidden="true" onClick={() => onHide()}>
                    <i className="c-icon c-icon--clear"></i>
                </a>
            </div>
        );
    };

    const renderTicketMain = () => {
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
        return (
            <div className="c-ticket__main">
                <div className="c-ticket__choice">
                    <span className="c-text-betchoice">{t(`${gameName}.glossary_${betChoice}`)}</span>
                </div>
                <div className="c-ticket__odds">
                    <span className="c-text-balls">{renderGameElements(gameName)}</span>
                    <span className="c-text-odds">
                        @
                        <span className={`${'c-odds'} ${'sg-bet-panel__text-bold'}`} data-odds-status="default">
                            {odd || ''}
                        </span>
                    </span>
                    <span className="c-text-oddstype">({t('Common.decimal')})</span>
                </div>
            </div>
        );
    };

    const renderTicektInfo = () => {
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
        const vendorName = siteId === VIVA88_SITE_ID ? SABA_GAMES : VGAMING;
        const game = t(`${namespace}.game_name`);

        return (
            <div className="c-ticket__info">
                <div className="c-ticket-match-info">
                    <div className="c-ticket-match-info__row">{vendorName}</div>
                    <div className="c-ticket-match-info__row">{game}</div>
                    <div className="c-ticket-match-info__row">{t(`Common.result_no`)} {clientRoundId}</div>
                </div>
            </div>
        );
    };


    const renderGameElements = (gameName: string) => {
        switch (gameName) {
            default:
                return null;
        }
    };

    const renderWarnMessage = ({ warnMsg }) => {
        if (!warnMsg) return;
        return (
            <div className="c-ticket__status">
                <WarnMessage warnMsg={warnMsg} />
            </div>
        );
    };

    if (panelId !== betChoice) {
        return <></>;
    }

    // TODO: 接上memberSite時，className不用style，直接接上memberSite class
    return (
        <div className="c-quick-bet c-quick-bet--bottom-left">
            <div className="c-quick-bet__btn"></div>
            <div
                ref={panelRef}
                className={classNames('c-quick-bet__panel', {
                    ['sg-bet-panel__left-dec-130']: isSpecialChoice,
                })}
            >
                <div className="c-betslip">
                    <div className="c-betslip__content">
                        <div className="c-betting-scroller">
                            <div className="c-betting-group" data-status="default">
                                <div className="c-betting" data-open="true">
                                    <div className="c-ticket" data-status="default" data-open="true">
                                        {renderTicketHeader()}

                                        {renderTicketMain()}

                                        {renderTicektInfo()}
                                        {renderWarnMessage({ warnMsg })}
                                    </div>
                                    <div className="c-betting-stake-group">
                                        <div className="c-betting-stake">
                                            <div className={`${'c-textfield'} ${'c-textfield--stake'}`} data-focus="true">
                                                <input
                                                    type="text"
                                                    className="c-textfield__input"
                                                    placeholder={`${addCommas(min)} - ${addCommas(max)}`}
                                                    value={displayAmount}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="c-textfield__currency">{currency}</span>
                                                <span className="c-textfield__bg"></span>
                                                <a className={`${'c-btn'} ${'c-btn--clear'}`} aria-hidden="true" onClick={handleClear}>
                                                    <i className={`${'c-icon'} ${'c-icon--clear-solid'}`}></i>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="c-betting-stake-info">
                                            <span className="c-text-group">
                                                <span className="c-text-label">{t('Common.payout')} : </span>
                                                <span className="c-text-value">{payout}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <BettingChips
                                        min={min}
                                        max={max}
                                        currentAmount={amount}
                                        onAmountChange={handleChipAmountChange}
                                        t={t}
                                        addCommas={addCommas}
                                    />
                                </div>
                                <div className="c-betting-submit">
                                    <button
                                        className={`${'c-btn'} ${'c-btn--bet'}`}
                                        data-disabled={false}
                                        aria-hidden="true"
                                        onClick={handleClickBet}
                                    >
                                        <span className="c-text">{t('Common.btn_bet')}</span>
                                    </button>
                                    <button className={`${'c-btn'} ${'c-btn--default'}`} aria-hidden="true" onClick={() => onHide()}>
                                        <span className="c-text">{t('Common.btn_cancel')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WarnMessage = ({ warnMsg }) => {
    if (!warnMsg) return null;

    return (
        <div className="c-betting-msg sg-bet-panel__betting-msg">
            <i className="c-icon c-icon--warning" data-icon="warning" />
            <span className="c-text">{warnMsg}</span>
        </div>
    );
};

export default BetPanelComponent;
