import * as gc from '@sg/sg-game-client';
import { IStateObserver } from '../observer-component/observer-component';

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

export interface BetPanelProps {
    namespace: string;
    clientRoundId: number;
    currency: string;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: gc.GameServiceMessage.MaxBetPerChoices;
    stakeLevel: gc.Player.IStakeLevel;
    clientSeed: string;
    handleBet: (amount: number, betChoice: string, clientSeed: string) => void;
}

export interface WarnMessageProps {
    warnMsg: string;
}

export interface BettingChipsProps {
    min: number;
    max: number;
    currentAmount: number;
    onAmountChange: (amount: number) => void;
    t: (key: string) => string;
    addCommas: (value: number) => string;
} 