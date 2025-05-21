import * as gc from '@sg/sg-game-client';
import { IStateObserver } from '../observer-component/observer-component';

export interface BettingBlockProps {
    odd: number;
    betChoice: string;
    gameName: string;
    namespace: string;
    children: React.ReactNode;
    settlementResult?: gc.GameServiceMessage.TSettlementResult;
    onBet: () => void;
}

export interface IBettingBlockState extends IStateObserver {
    betChoice: string;
    odd: number;
    isAuthorized: boolean;
    isSignedIn: boolean;
    isFinishShowResult: boolean;
    isShowBetSlip: boolean;
    isShowStaticHighlight?: boolean;
} 