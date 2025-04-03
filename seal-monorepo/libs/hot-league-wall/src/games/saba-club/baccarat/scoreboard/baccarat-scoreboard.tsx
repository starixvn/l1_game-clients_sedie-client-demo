import React from 'react';
import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import styles from './baccarat-scoreboard.module.scss';
import { BaccaratBetPercentages } from '../baccarat-bet-percentages';

import { BigRoadScoreboard, Converter } from 'sc-scoreboards';
import BaccaratBigRoad from './baccarat-big-road';
import { BaccaratSettlementResult } from '../type';

interface IBaccaratScoreboardState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    isLockingBet: boolean;
}

interface Props extends IPropsObserver {
    gameName: string;
    maxRows?: number;
    noRender?: boolean;
    language: string;
}
class BaccaratBigRoadConverter extends Converter<BaccaratSettlementResult> {
    static readonly instance = new BaccaratBigRoadConverter();
}
export class BaccaratScoreboard extends ObserverComponent<Props, IBaccaratScoreboardState> {
    private readonly DEFAULT_MAX_ROWS = 6;
    private readonly bigRoad: BigRoadScoreboard<BaccaratSettlementResult>;

    constructor(props: Props) {
        super(props);
        this.state = {
            rounds: [],

            isLockingBet: false,
            dispose: () => {},
        };
        this.bigRoad = new BigRoadScoreboard({
            converter: BaccaratBigRoadConverter.instance,
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

        const input = [...rounds].map((round) => round.settlementResult as unknown as BaccaratSettlementResult).reverse();
        this.bigRoad.initialize(input, isLockingBet);
        const rows = this.bigRoad.rows();

        return (
            <div className={styles.scoreboard}>
                <div className={styles['scoreboard-title']}>{gc.Translator.t('Common.scoreboard')}</div>
                <div className={styles['scoreboard-percentage']}>
                    <div className={styles['split-percentage']}>
                        <BaccaratBetPercentages gameName={gameName} rounds={rounds} language={this.props.language} />
                    </div>
                </div>

                <BaccaratBigRoad maxRows={maxRows} rows={rows} />
            </div>
        );
    }
}
