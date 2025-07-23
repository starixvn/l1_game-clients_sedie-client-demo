import React from 'react';
import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import styles from './rng-soccer-scoreboard.module.scss';
import { BigRoadScoreboard, Converter } from 'sc-scoreboards';
import { RNGSoccerChoices, RNGSoccerSettlementItemResult } from '../type';
import { BetPercentages } from '../../../../_shared/components/bet-percentages';
import RNGSoccerBigRoad from './rng-soccer-big-road';

interface Props extends IPropsObserver {
    noRender?: boolean;
    gameName: string;
    maxRows?: number;
}

interface IBaccaratScoreboardState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    isLockingBet: boolean;
}

class RNGSoccerBigRoadConverter extends Converter<RNGSoccerSettlementItemResult> {
    static addBlinkNode(rounds: RNGSoccerSettlementItemResult[]) {
        const lastRound = rounds.find((round) => round?.home || round?.draw || round?.away);
        if (!lastRound) return;

        const blinkRound = {
            home: lastRound?.home || false,
            draw: lastRound?.draw || false,
            away: lastRound?.away || false
        };

        rounds.unshift(blinkRound);
    }

    static readonly instance = new RNGSoccerBigRoadConverter();

    protected positiveKey(): string {
        return RNGSoccerChoices.home;
    }

    protected specialKey(): string {
        return RNGSoccerChoices.draw;
    }

    convert(group: RNGSoccerSettlementItemResult[]): boolean {
        const result = group.filter((result) => (result as any)[this.positiveKey()]).length !== 0;
        return result;
    }
}

export class RNGSoccerScoreboard extends ObserverComponent<Props, IBaccaratScoreboardState> {
    private readonly DEFAULT_MAX_ROWS = 6;
    private readonly bigRoad: BigRoadScoreboard<RNGSoccerSettlementItemResult>;

    constructor(props: Props) {
        super(props);
        this.state = {
            rounds: [],
            isLockingBet: false,
            dispose: () => { },
        };
        this.bigRoad = new BigRoadScoreboard({
            converter: RNGSoccerBigRoadConverter.instance,
            height: this.DEFAULT_MAX_ROWS,
        });
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    private onRoundHistoryUpdate(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds, isLockingBet: false });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isLocking)
    private renderCountDownTimerState(isLocking: boolean) {
        if (isLocking) {
            this.setState({ isLockingBet: true });
        }
    }

    render(): React.ReactElement {
        const { noRender, gameName, maxRows = this.DEFAULT_MAX_ROWS } = this.props;
        const { rounds, isLockingBet } = this.state;

        if (noRender || !rounds?.length) {
            return <div />;
        }

        const input = [...rounds].map((round) => round.settlementResult as unknown as RNGSoccerSettlementItemResult).reverse();

        this.bigRoad.initialize(input, isLockingBet);
        const rows = this.bigRoad.rows();

        return (
            <div className={styles.scoreboard}>
                <BetPercentages
                    gameName={gameName}
                    scoreboardCharacter={{
                        home: RNGSoccerChoices.home,
                        draw: RNGSoccerChoices.draw,
                        away: RNGSoccerChoices.away,
                    }}
                    settlements={input.map(item => item)}
                />

                <RNGSoccerBigRoad maxRows={maxRows} rows={rows} />
            </div>
        );
    }
}
