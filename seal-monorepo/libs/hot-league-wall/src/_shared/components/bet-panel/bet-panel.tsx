import * as gc from '@sg/sg-game-client';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    BACCARAT_GAME_NAMESPACE,
    COLOR_GAME_NAMESPACE,
    FISH_PRAWN_CRAB_GAME_NAMESPACE,
    COIN_TOSS_GAME_NAMESPACE,
    SABA_GAMES,
    SE_DIE_GAME_NAMESPACE,
    UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE,
    VGAMING,
    VIP_SE_DIE_GAME_NAMESPACE,
    VIVA88_SITE_ID,
} from '../../../../constant/app';
import { useAppContext } from '../../../appProvider';
import { BACCARAT_CHOICES, FISH_PRAWN_CRAB_CHOICES, SE_DIE_CHOICES, COLOR_GAME_CHOICES } from '../../../games/constants/saba-club';
import { ChoiceSeDieIconMapper, SeDieChoices } from '../../../games/saba-club/sedie/type';
import {
    useGameBettingOptionsContext,
    useGameBettingZoneContext,
} from '../../react-contexts/game-betting-zone-context/game-betting-zone-context';
import { checkValidAmount, parseInputValue, WarnMsgType, calculateMinMaxAmount } from '../../utils/betting-util';
import { getChoicesType } from '../../utils/choice-type';
import BettingChips from '../betting-chips';
import Dice from '../dice';
import { RoundDot } from '../dot';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import './bet-panel.scss';
import { localStorageKeys, StorageManager } from '../../utils/storage-manager';
import { choiceToSymbolMap } from '../../../games/saba-club/fish-prawn-crab/fish-prawn-crab-utils';
import { choiceToSymbolMap as colorGameChoiceToSymbolMap } from '../../../games/saba-club/color-game/color-game-utils';
import { Size } from '../../constants';
import FishPrawnCrabDice from '../fish-prawn-crab-dice';
import ColorGameDice from '../color-game-dice';
import Coin from '../coin'
import { choiceToSymbolMap as coinTossChoiceToSymbolMap } from '../../../games/saba-club/coin-toss/coin-toss-utils';

const WARNING_CLOSE_DELAY = 60000;

// Game icon mapping constant
const GAME_ICON_MAPPING = {
    [SE_DIE_GAME_NAMESPACE]: 'sedie-icon',
    [VIP_SE_DIE_GAME_NAMESPACE]: 'vip-sedie-icon',
    [UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE]: 'bigsmall-icon',
    [BACCARAT_GAME_NAMESPACE]: 'baccarat-icon',
    [FISH_PRAWN_CRAB_GAME_NAMESPACE]: 'fish-prawn-crab-icon',
    [COLOR_GAME_NAMESPACE]: 'color-game-icon',
    [COIN_TOSS_GAME_NAMESPACE]: 'coin-toss-icon',
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
        console.log('clientSeed', clientSeed);
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
    const { panelId, setPanelId, setShow } = useGameBettingOptionsContext();
    const { gameName, betChoice, odd = 0 } = useGameBettingZoneContext();
    const { siteId } = useAppContext();
    const { minBet: stakeLevelMinBet = 0, maxBet: stakeLevelMaxBet = 0 } = stakeLevel || {};
    const betChoiceMax = maxBetPerChoices?.[betChoice] || 0;
    const panelRef = useRef<HTMLDivElement>(null);

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

    const isSpecialChoice = [
        SE_DIE_CHOICES.RED2,
        BACCARAT_CHOICES.PLAYER_PAIR,
        BACCARAT_CHOICES.BANKER_PAIR,
        FISH_PRAWN_CRAB_CHOICES.PRAWN,
        FISH_PRAWN_CRAB_CHOICES.ROOSTER,
        COLOR_GAME_CHOICES.PINK,
        COLOR_GAME_CHOICES.GREEN
    ].includes(betChoice);

    const handleInputChange = (event: any) => {
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
    };

    const handleClear = () => {
        setAmount(0);
    };

    const onHide = () => {
        setPanelId(null);
        setWarnMsg('');
    };

    const setWarningWithTimeout = (message: string) => {
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        setWarnMsg(message);

        warningTimeoutRef.current = setTimeout(() => {
            setWarnMsg('');
        }, WARNING_CLOSE_DELAY);
    };

    const updateLatestBetToStorage = (namespace: string, clientRoundId: number) => {
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
    };

    const handleClickBet = () => {
        const { newAmount: validatedAmount, msg } = checkValidAmount(amount, min, max);

        if (msg) {
            setAmount(validatedAmount);
            if (msg === WarnMsgType.LESS_THAN_MIN) {
                setWarningWithTimeout(t('Common.lessthanmin'));
            }
            if (msg === WarnMsgType.MORE_THAN_MAX) {
                setWarningWithTimeout(t('Common.morethanmax'));
            }
            return;
        }

        if (betChoice) {
            handleBet?.(validatedAmount, betChoice, clientSeed);
            onHide?.();
            updateLatestBetToStorage(namespace, clientRoundId);
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

    useEffect(() => {
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
    }, [betChoice, minBet, maxBet, stakeLevelMinBet, betChoiceMax, stakeLevel.maxBet, maxBetPerChoices, namespace]);

    useEffect(() => {
        if (panelId === betChoice && panelRef.current) {
            const rect = panelRef.current.getBoundingClientRect();
            const state = {
                top: rect.top,
                left: rect.left,
                betChoice,
                odd,
                amount,
                currency,
                min,
                max,
                payout,
                gameName,
                namespace,
                clientRoundId,
                isSpecialChoice,
                warnMsg
            };

            // Send state to parent window
            window.parent.postMessage({
                type: 'BET_PANEL_STATE',
                state
            }, '*');
        }
    }, [panelId, betChoice, odd, amount, currency, min, max, payout, gameName, namespace, clientRoundId, isSpecialChoice, warnMsg]);

    // Handle messages from parent window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'HANDLE_BET') {
                handleBet?.(event.data.amount, event.data.betChoice, clientSeed);
                onHide?.();
            } else if (event.data.type === 'HANDLE_INPUT_CHANGE') {
                handleInputChange({ target: { value: event.data.value } } as any);
            } else if (event.data.type === 'HANDLE_CLEAR') {
                handleClear();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleBet, handleInputChange, handleClear, onHide, clientSeed]);

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
                    <div className="c-ticket-match-info__row">
                        {t(`Common.result_no`)} {clientRoundId}
                    </div>
                </div>
            </div>
        );
    };

    const renderDots = () => {
        const hasDots: boolean = betChoice ? Object.keys(ChoiceSeDieIconMapper).includes(betChoice) : false;
        const dots = hasDots ? ChoiceSeDieIconMapper[betChoice as string] : [false, false, false, false];
        return dots.map((isRed, index) => (
            <RoundDot
                key={index}
                highlight={!hasDots}
                choice={isRed ? SeDieChoices.odd : SeDieChoices.even}
                size="small"
                value={hasDots ? '' : '?'}
            />
        ));
    };

    const renderDices = () => {
        return (
            <>
                <Dice diceNumber={0} size="small" />
                <Dice diceNumber={0} size="small" />
                <Dice diceNumber={0} size="small" />
            </>
        );
    };

    const renderFishPrawnCrabDice = () => {
        const symbol = choiceToSymbolMap[betChoice];
        return (
            <FishPrawnCrabDice symbol={symbol} size={Size.small} />
        );
    };

    const renderColorGameDice = () => {
        const symbol = colorGameChoiceToSymbolMap[betChoice];
        return (
            <ColorGameDice symbol={symbol} size={Size.small} />
        );
    };

    const renderCoin = () => {
        const coinType = coinTossChoiceToSymbolMap[betChoice];
        return (
            <Coin coinType={coinType} size={Size.small} />
        )
    }

    const renderGameElements = (gameName: string) => {
        switch (gameName) {
            case SE_DIE_GAME_NAMESPACE:
            case VIP_SE_DIE_GAME_NAMESPACE:
                return renderDots();
            case UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE:
                return renderDices();
            case FISH_PRAWN_CRAB_GAME_NAMESPACE:
                return renderFishPrawnCrabDice();
            case COLOR_GAME_NAMESPACE:
                return renderColorGameDice();
            case COIN_TOSS_GAME_NAMESPACE:
                return renderCoin();
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
                    ['sg-bet-panel__left-dec-100']: isSpecialChoice,
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
