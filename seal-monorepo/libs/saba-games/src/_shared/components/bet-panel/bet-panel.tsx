import * as gc from '@sg/sg-game-client';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { handle, render } from '@sg/sg-observer';
import classNames from 'classnames';
import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
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
import { getChoicesType } from '../../utils/choice-type';
import { BettingChips } from './betting-chips';
import Dice from '../dice';
import { RoundDot } from '../dot';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import './bet-panel.scss';
import { WarnMessage } from './warn-message';
import { useBetPanel } from './use-bet-panel';
import { BetPanelProps, IBetPanel } from './types';
import { createMessageHandler, MessageType, sendBetPanelState } from '../../../_shared/utils/window-message-util';
import { choiceToSymbolMap } from '../../../games/saba-club/fish-prawn-crab/fish-prawn-crab-utils';
import { choiceToSymbolMap as colorGameChoiceToSymbolMap } from '../../../games/saba-club/color-game/color-game-utils';
import { choiceToSymbolMap as coinTossChoiceToSymbolMap } from '../../../games/saba-club/coin-toss/coin-toss-utils';
import { Size } from '../../constants';
import FishPrawnCrabDice from '../fish-prawn-crab-dice';
import ColorGameDice from '../color-game-dice';
import Coin from '../coin';

const GAME_ICON_MAPPING = {
    [SE_DIE_GAME_NAMESPACE]: 'sedie-icon',
    [VIP_SE_DIE_GAME_NAMESPACE]: 'vip-sedie-icon',
    [UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE]: 'bigsmall-icon',
    [BACCARAT_GAME_NAMESPACE]: 'baccarat-icon',
    [FISH_PRAWN_CRAB_GAME_NAMESPACE]: 'fish-prawn-crab-icon',
    [COLOR_GAME_NAMESPACE]: 'color-game-icon',
    [COIN_TOSS_GAME_NAMESPACE]: 'coin-toss-icon',
} as const;

class BetPanelComponent<P extends IPropsObserver, S extends IBetPanel> extends ObserverComponent<IPropsObserver, IStateObserver> {
    private betPanelRef = React.createRef<any>();

    constructor(props: P) {
        super(props);
        this.state = {
            dispose: null,
            clientRoundId: 0,
            stakeLevel: { minBet: 0, maxBet: 0 },
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

    sendBetPanelState = () => {
        if (this.betPanelRef.current) {
            this.betPanelRef.current.sendBetPanelState();
        }
    }

    render() {
        const { clientRoundId, currency, minBet, maxBet, maxBetPerChoices, stakeLevel, clientSeed } = this.state as S;

        return (
            <BetPanel
                ref={this.betPanelRef}
                namespace={this.props.namespace}
                clientRoundId={clientRoundId}
                currency={currency}
                minBet={minBet}
                maxBet={maxBet}
                maxBetPerChoices={maxBetPerChoices}
                stakeLevel={stakeLevel}
                handleBet={this.handleBet.bind(this)}
                clientSeed={clientSeed}
            />
        );
    }
}

const BetPanel = forwardRef<any, BetPanelProps>((props, ref) => {
    const { namespace, clientRoundId, currency, minBet, maxBet, maxBetPerChoices, stakeLevel, handleBet, clientSeed } = props;
    const { panelId, setPanelId } = useGameBettingOptionsContext();
    const { gameName, betChoice, odd = 0 } = useGameBettingZoneContext();
    const { siteId } = useAppContext();
    const { minBet: stakeLevelMinBet = 0, maxBet: stakeLevelMaxBet = 0 } = stakeLevel || {};
    const betChoiceMax = maxBetPerChoices?.[betChoice] || 0;
    const panelRef = useRef<HTMLDivElement>(null);

    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
    const addCommas = gc.FormatUtils.numberWithCommas;

    const {
        amount,
        warnMsg,
        min,
        max,
        handleInputChange,
        handleClear,
        handleClickBet,
        setAmount
    } = useBetPanel(
        betChoice,
        minBet,
        maxBet,
        stakeLevel,
        betChoiceMax,
        maxBetPerChoices,
        namespace,
        clientRoundId,
        handleBet,
        clientSeed,
        t
    );

    const displayAmount = amount > 0 ? addCommas(amount) : '';
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

    const onHide = useCallback(() => {
        setPanelId(null);
    }, [setPanelId]);

    const sendBetPanelStateToParent = useCallback(() => {
        const state = {
            top: 0,
            left: 0,
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

        sendBetPanelState(state);
    }, [betChoice, odd, amount, currency, min, max, payout, gameName, namespace, clientRoundId, isSpecialChoice, warnMsg]);

    React.useImperativeHandle(ref, () => ({
        sendBetPanelState: sendBetPanelStateToParent
    }));

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

            sendBetPanelState(state);

            const hideTimeout = setTimeout(() => {
                onHide();
            }, 500);

            return () => clearTimeout(hideTimeout);
        }
    }, [panelId, betChoice, odd, amount, currency, min, max, payout, gameName, namespace, clientRoundId, isSpecialChoice, warnMsg, onHide]);

    useEffect(() => {
        const handleMessage = createMessageHandler({
            [MessageType.HANDLE_BET]: (data) => {
                handleBet?.(data.amount, data.betChoice, clientSeed);
                onHide?.();
            },
            [MessageType.HANDLE_INPUT_CHANGE]: (data) => {
                handleInputChange({ target: { value: data.value } } as any);
            },
            [MessageType.HANDLE_CLEAR]: () => {
                handleClear();
            }
        });

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleBet, handleInputChange, handleClear, onHide, clientSeed]);

    if (panelId !== betChoice) {
        return null;
    }

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
                                        {/* Ticket Header */}
                                        <div className="c-ticket__header">
                                            <span className="c-text-bettype sg-bet-panel__header-flex">
                                                <div className={classNames('sg-bet-panel__game-icon', GAME_ICON_MAPPING[namespace])}></div>
                                                <div>
                                                    <div className="game-name">{t(`${namespace}.game_name`)}</div>
                                                    <div className="bet-option">{t(getChoicesType(namespace, betChoice))}</div>
                                                </div>
                                            </span>
                                            <a className="c-btn c-btn--clear" aria-hidden="true" onClick={onHide}>
                                                <i className="c-icon c-icon--clear"></i>
                                            </a>
                                        </div>

                                        {/* Ticket Main */}
                                        <div className="c-ticket__main">
                                            <div className="c-ticket__choice">
                                                <span className="c-text-betchoice">{t(`${gameName}.glossary_${betChoice}`)}</span>
                                            </div>
                                            <div className="c-ticket__odds">
                                                <span className="c-text-balls">{renderGameElements(gameName, betChoice)}</span>
                                                <span className="c-text-odds">
                                                    @
                                                    <span className={`${'c-odds'} ${'sg-bet-panel__text-bold'}`} data-odds-status="default">
                                                        {odd || ''}
                                                    </span>
                                                </span>
                                                <span className="c-text-oddstype">({t('Common.decimal')})</span>
                                            </div>
                                        </div>

                                        {/* Ticket Info */}
                                        <div className="c-ticket__info">
                                            <div className="c-ticket-match-info">
                                                <div className="c-ticket-match-info__row">{vendorName}</div>
                                                <div className="c-ticket-match-info__row">{t(`${namespace}.game_name`)}</div>
                                                <div className="c-ticket-match-info__row">
                                                    {t(`Common.result_no`)} {clientRoundId}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warning Message */}
                                        {warnMsg && (
                                            <div className="c-ticket__status">
                                                <WarnMessage warnMsg={warnMsg} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Betting Stake */}
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

                                    {/* Betting Chips */}
                                    <BettingChips
                                        min={min}
                                        max={max}
                                        currentAmount={amount}
                                        onAmountChange={setAmount}
                                        t={t}
                                        addCommas={addCommas}
                                    />
                                </div>

                                {/* Betting Submit */}
                                <div className="c-betting-submit">
                                    <button
                                        className={`${'c-btn'} ${'c-btn--bet'}`}
                                        data-disabled={false}
                                        aria-hidden="true"
                                        onClick={handleClickBet}
                                    >
                                        <span className="c-text">{t('Common.btn_bet')}</span>
                                    </button>
                                    <button className={`${'c-btn'} ${'c-btn--default'}`} aria-hidden="true" onClick={onHide}>
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
});

const renderGameElements = (gameName: string, betChoice: string) => {
    switch (gameName) {
        case SE_DIE_GAME_NAMESPACE:
        case VIP_SE_DIE_GAME_NAMESPACE:
            return renderDots(betChoice);
        case UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE:
            return renderDices();
        case FISH_PRAWN_CRAB_GAME_NAMESPACE:
            return renderFishPrawnCrabDice(betChoice);
        case COLOR_GAME_NAMESPACE:
            return renderColorGameDice(betChoice);
        case COIN_TOSS_GAME_NAMESPACE:
            return renderCoin(betChoice);
        default:
            return null;
    }
};

const renderDots = (betChoice: string) => {
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

const renderFishPrawnCrabDice = (betChoice: string) => {
    const symbol = choiceToSymbolMap[betChoice];
    return (
        <FishPrawnCrabDice symbol={symbol} size={Size.small} />
    );
};

const renderColorGameDice = (betChoice: string) => {
    const symbol = colorGameChoiceToSymbolMap[betChoice];
    return (
        <ColorGameDice symbol={symbol} size={Size.small} />
    );
};

const renderCoin = (betChoice: string) => {
    const coinType = coinTossChoiceToSymbolMap[betChoice];
    return (
        <Coin coinType={coinType} size={Size.small} />
    );
};

export default BetPanelComponent;
