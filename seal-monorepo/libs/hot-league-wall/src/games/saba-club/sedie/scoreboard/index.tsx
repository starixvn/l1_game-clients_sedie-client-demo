import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import {
    IPropsObserver,
    IStateObserver,
    ObserverComponent,
} from '../../../../_shared/components/observer-component/observer-component';
import Styles from './scoreboard.module.scss';
import { SedieSettlementResult } from '../type';
import { BigRoadScoreboard } from 'sc-scoreboards';
import { createRef } from 'react';
import React from 'react';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { ScoreboardItemContent } from '../../../../_shared/components/scoreboard/types';
import { choices } from '../../../../_shared/types/settlement-result';
import { BetPercentages } from '../../../../_shared/components/bet-percentages';
import { OddEvenBigRoadConverter, ScoreBoard } from '../../../../_shared/components/scoreboard';
import classNames from 'classnames';
import ScrollElement from '../../../../_shared/components/scroll-element';

export interface ISeDieResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
}

type Props = IPropsObserver & {
    gameName?: string;
    language?: string;
};

export class SedieScoreBoard extends ObserverComponent<Props, ISeDieResultHistoryState> {
    private scrollDivRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);

        this.scrollDivRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState) {
        // Scroll to right if items have changed
        if (prevState.rounds !== this.state.rounds) {
            this.scrollToRight();
        }
    }

    scrollToRight = () => {
        if (this.scrollDivRef.current) {
            this.scrollDivRef.current.scrollLeft = this.scrollDivRef.current.scrollWidth;
        }
    };

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds });
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderCountDownTimerState(roundState: string) {
        this.setState({ roundState });
    }

    render() {
        const { rounds, roundState } = this.state;
        const { gameName, language } = this.props;

        if (!rounds || rounds.length === 0) {
            return <></>;
        }


        const bigRoad = new BigRoadScoreboard({ converter: OddEvenBigRoadConverter.instance, height: 6 });
        const settlements = rounds.map((round) => {
            return round.settlementResult as SedieSettlementResult;
        });
        const input = [...settlements].reverse();
        const hasBlink = roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;

        bigRoad.initialize(input, hasBlink);
        const rows = bigRoad.rows();

        const scoreboardCharacter: ScoreboardItemContent = {
            positiveItemContent: `${choices.odd}`,
            negativeItemContent: `${choices.even}`,
        };

        const scoreboardDotClassName: ScoreboardItemContent = {
            positiveItemContent: 'dot-odd',
            negativeItemContent: `dot-even`,
        };

        const scoreboardText = gc.Translator.t('Common.scoreboard')

        return (
            <div className={classNames(Styles['scoreboard'], 'c-ng-score')}>
                <div className={Styles['scoreboard-title']}>{scoreboardText}</div>
                {
                    <BetPercentages
                        gameName={this.props.gameName}
                        scoreboardCharacter={scoreboardCharacter}
                        settlements={settlements}
                    />
                }
                <ScrollElement className={Styles['scoreboard-content']} refData={this.scrollDivRef}>
                    {
                        <ScoreBoard
                            gameName={this.props.gameName}
                            rows={rows}
                            scoreboardCharacter={scoreboardCharacter}
                            scoreboardDotClassName={scoreboardDotClassName}
                        />
                    }
                </ScrollElement>
            </div>
        );
    }
}
