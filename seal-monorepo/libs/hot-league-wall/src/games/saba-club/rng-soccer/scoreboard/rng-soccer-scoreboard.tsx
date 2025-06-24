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
        console.log('🟠 RNGSoccerBigRoadConverter: addBlinkNode called with rounds:', rounds);
        const lastRound = rounds.find((round) => round?.home || round?.draw || round?.away);
        if (!lastRound) return;

        const blinkRound = {
            home: lastRound?.home || false,
            draw: lastRound?.draw || false,
            away: lastRound?.away || false
        };

        console.log('🟠 RNGSoccerBigRoadConverter: Adding blink round:', blinkRound);
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
        console.log('🟠 RNGSoccerBigRoadConverter: convert called with group:', group, 'result:', result);
        return result;
    }
}

export class RNGSoccerScoreboard extends ObserverComponent<Props, IBaccaratScoreboardState> {
    private readonly DEFAULT_MAX_ROWS = 6;
    private readonly bigRoad: BigRoadScoreboard<RNGSoccerSettlementItemResult>;

    constructor(props: Props) {
        console.log('🟠 RNGSoccerScoreboard: Constructor called with props:', props);
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
        console.log('🟠 RNGSoccerScoreboard: Initial state set:', this.state);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    private onRoundHistoryUpdate(rounds: gc.RoundHistories.RoundHistory[]) {
        console.log('🟠 RNGSoccerScoreboard: onRoundHistoryUpdate called with rounds:', rounds);
        this.setState({ rounds, isLockingBet: false });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isLocking)
    private renderCountDownTimerState(isLocking: boolean) {
        console.log('🟠 RNGSoccerScoreboard: renderCountDownTimerState called with isLocking:', isLocking);
        if (isLocking) {
            this.setState({ isLockingBet: true });
        }
    }

    render(): React.ReactElement {
        const { noRender, gameName, maxRows = this.DEFAULT_MAX_ROWS } = this.props;
        const { rounds, isLockingBet } = this.state;

        console.log('🟠 RNGSoccerScoreboard: render called with props:', { noRender, gameName, maxRows }, 'state:', { rounds: rounds?.length, isLockingBet });

        if (noRender || !rounds?.length) {
            console.log('🟠 RNGSoccerScoreboard: Early return due to noRender or no rounds');
            return <div />;
        }

        const input = [...rounds].map((round) => round.settlementResult as unknown as RNGSoccerSettlementItemResult).reverse();
        console.log('🟠 RNGSoccerScoreboard: Processed input data:', input);

        this.bigRoad.initialize(input, isLockingBet);
        const rows = this.bigRoad.rows();
        console.log('🟠 RNGSoccerScoreboard: Big road rows generated:', rows);

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
