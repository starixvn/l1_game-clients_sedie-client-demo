import * as gc from '@sg/sg-game-client';
import { RoundStore } from '@sg/sg-game-client/dist/game/rounds';
import { handle, render } from '@sg/sg-observer';
import { BACCARAT_GAME_NAMESPACE, COLOR_GAME_NAMESPACE, FISH_PRAWN_CRAB_GAME_NAMESPACE, COIN_TOSS_GAME_NAMESPACE, SABA_GAMES, SE_DIE_GAME_NAMESPACE, UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE, VGAMING, VIP_SE_DIE_GAME_NAMESPACE, VIVA88_SITE_ID } from '../../../../constant/app';
import { useAppContext } from '../../../appProvider';
import { BACCARAT_CHOICES, FISH_PRAWN_CRAB_CHOICES, SE_DIE_CHOICES, COLOR_GAME_CHOICES } from '../../../games/constants/saba-club';
import { ChoiceSeDieIconMapper, SeDieChoices } from '../../../games/saba-club/sedie/type';
import { useGameBettingOptionsContext, useGameBettingZoneContext } from '../../react-contexts/game-betting-zone-context/game-betting-zone-context';
import { checkValidAmount, parseInputValue, WarnMsgType, calculateMinMaxAmount } from '../../utils/betting-util';
import { getChoicesType } from '../../utils/choice-type';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import { localStorageKeys, StorageManager } from '../../utils/storage-manager';
import { createMessageHandler, MessageType, sendBetPanelState, sendHandleBet, sendHandleInputChange, sendHandleClear } from '../../../_shared/utils/window-message-util';

const WARNING_CLOSE_DELAY = 60000;

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
        this.sendBetPanelState();
    }

    @render(gc.Player.MainPlayerStore, (store) => store.stakeLevel)
    setUserStakeLevel(stakeLevel: gc.Player.IStakeLevel) {
        if (stakeLevel) {
            this.setState({ stakeLevel } as IBetPanel);
            this.sendBetPanelState();
        }
    }

    @render(gc.Player.MainPlayerStore, (store) => store.currency)
    setCurrency(currency: string) {
        this.setState({ currency } as IBetPanel);
        this.sendBetPanelState();
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
        this.sendBetPanelState();
    }

    @handle(gc.Bet.BetHandler)
    handleBet(amount: number, betChoice: string, clientSeed: string) {
        return { amount, betChoice, clientSeed };
    }

    @render(gc.RoundBasePF.ProvablyFairStore, (store) => store.clientSeed)
    handleClientSeed(clientSeed: string) {
        this.setState({ clientSeed } as IBetPanel);
        this.sendBetPanelState();
    }

    // Add method to send bet panel state without showing panel
    sendBetPanelState = () => {
        const { clientRoundId, stakeLevel, currency, minBet, maxBet, maxBetPerChoices, clientSeed } = this.state as S;
        const { gameName, betChoice, odd = 0 } = useGameBettingZoneContext();
        const { siteId } = useAppContext();
        const { minBet: stakeLevelMinBet = 0, maxBet: stakeLevelMaxBet = 0 } = stakeLevel || {};
        const betChoiceMax = maxBetPerChoices?.[betChoice] || 0;

        // calculate min and max using helper
        const { min: newMin, max: newMax } = calculateMinMaxAmount(
            minBet,
            stakeLevelMinBet,
            maxBet,
            stakeLevel.maxBet,
            betChoiceMax,
            maxBetPerChoices,
            this.props.namespace
        );

        const isSpecialChoice = [
            SE_DIE_CHOICES.RED2,
            BACCARAT_CHOICES.PLAYER_PAIR,
            BACCARAT_CHOICES.BANKER_PAIR,
            FISH_PRAWN_CRAB_CHOICES.PRAWN,
            FISH_PRAWN_CRAB_CHOICES.ROOSTER,
            COLOR_GAME_CHOICES.PINK,
            COLOR_GAME_CHOICES.GREEN
        ].includes(betChoice);

        // Get position from betting block state
        const bettingBlockState = (window as any).__BETTING_BLOCK_STATE__ || {};
        const position = bettingBlockState.position || { top: 0, left: 0 };

        const state = {
            top: position.top,
            left: position.left,
            betChoice,
            odd,
            amount: 0,
            currency,
            min: newMin,
            max: newMax,
            payout: '0.00',
            gameName,
            namespace: this.props.namespace,
            clientRoundId,
            isSpecialChoice,
            warnMsg: ''
        };

        // Send state to parent window
        window.parent.postMessage({
            type: 'BET_PANEL_STATE',
            state
        }, '*');
    }

    render() {
        return <></>; // No UI rendering in iframe
    }
}

export default BetPanelComponent;
