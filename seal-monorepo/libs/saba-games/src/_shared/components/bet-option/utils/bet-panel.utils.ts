import { IBetPanelConfig, IBetPanelState, IBetPanelPosition } from '../types/bet-panel.types';
import { calculateMinMaxAmount } from '../../../utils/betting-util';
import {
    SE_DIE_CHOICES,
    BACCARAT_CHOICES,
    FISH_PRAWN_CRAB_CHOICES,
    COLOR_GAME_CHOICES
} from '../../../../games/constants/saba-club';

export const isSpecialBetChoice = (betChoice: string): boolean => {
    return [
        SE_DIE_CHOICES.RED2,
        BACCARAT_CHOICES.PLAYER_PAIR,
        BACCARAT_CHOICES.BANKER_PAIR,
        FISH_PRAWN_CRAB_CHOICES.PRAWN,
        FISH_PRAWN_CRAB_CHOICES.ROOSTER,
        COLOR_GAME_CHOICES.PINK,
        COLOR_GAME_CHOICES.GREEN
    ].includes(betChoice);
};

export const calculateBetPanelState = (
    config: IBetPanelConfig,
    betChoice: string,
    odd: number,
    gameName: string,
    namespace: string,
    position: IBetPanelPosition,
    isShowBetSlip: boolean
): IBetPanelState => {
    const { minBet, maxBet, maxBetPerChoices, stakeLevel, currency, clientRoundId, clientSeed } = config;
    const { minBet: stakeLevelMinBet = 0, maxBet: stakeLevelMaxBet = 0 } = stakeLevel || {};
    const betChoiceMax = maxBetPerChoices?.[betChoice] || 0;

    const { min: newMin, max: newMax } = calculateMinMaxAmount(
        minBet,
        stakeLevelMinBet,
        maxBet,
        stakeLevel.maxBet,
        betChoiceMax,
        maxBetPerChoices,
        namespace
    );

    return {
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
        namespace,
        clientRoundId,
        isSpecialChoice: isSpecialBetChoice(betChoice),
        warnMsg: '',
        isShowBetSlip,
        clientSeed
    };
}; 