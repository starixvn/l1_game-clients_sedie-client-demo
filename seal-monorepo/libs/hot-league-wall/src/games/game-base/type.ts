// import { WithRouterProps } from 'next/dist/client/with-router';

export interface GameConfigs {
    odds: { [key: string]: number };
    minBet: number;
    maxBet: number;
    maxBetPerChoices: any;
    enableFreeBet: boolean;
    margin: any;
    chips: string[];
}

export type GamePropsContext = {
    namespace: string;
    language: string;
    overrideClasses?: string;
};

export type GameBaseProps = GamePropsContext;
