import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import styles from './fish-prawn-crab-scoreboard.module.scss';
import { createRef } from 'react';
import React from 'react';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { ScoreboardItemContent } from '../../../../_shared/components/scoreboard/types';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { FishPrawnCrabChoices, FishPrawnCrabResult, FishPrawnCrabSettlementResult } from '../type';
import ScrollElement from '../../../../_shared/components/scroll-element';
import FishPrawnCrabScoreBoardBody from './components/fish-prawn-crab-scoreboard-body';
import { BigRoadScoreboard } from 'sc-scoreboards';
import { FishPrawnCrabBigRoadConverter, FishPrawnCrabRoundHistory } from '../../../../_shared/components/scoreboard/converters/fish-prawn-crab';
import { FishPrawnCrabBetPercentages } from '../bet-percentages';

export interface IFishPrawnCrabResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
}

type Props = IPropsObserver & {
    gameName?: string;
    language: string;
};

export default class FishPrawnCrabScoreBoard extends ObserverComponent<Props, IFishPrawnCrabResultHistoryState> {
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
        if (!rounds || rounds.length === 0) {
            return <></>;
        }

        const bigRoad = new BigRoadScoreboard({
            converter: FishPrawnCrabBigRoadConverter.instance,
            height: 6,
        });

        const settlements = rounds.map((round) => {
            return round.settlementResult as unknown as FishPrawnCrabSettlementResult;
        });

        const input = [...rounds]
            .map((round) => ({
                roundId: round.roundId,
                settlementResult: round.settlementResult as unknown as FishPrawnCrabSettlementResult,
                result: round.result as unknown as FishPrawnCrabResult,
            }))
            .reverse();

        const hasBlink = roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
        bigRoad.initialize(input, hasBlink);
        const rows = bigRoad.rows() as unknown as string[][];

        // Define content for scoreboard display
        const scoreboardCharacter: ScoreboardItemContent = {
            positiveItemContent: `${FishPrawnCrabChoices.fish}`,
            negativeItemContent: `${FishPrawnCrabChoices.crab}`,
        };

        const scoreboardDotClassName: ScoreboardItemContent = {
            positiveItemContent: 'dot-fish',
            negativeItemContent: 'dot-crab',
        };

        const scoreboardText = gc.Translator.translate('Common.scoreboard');

        return (
            <div className={styles['scoreboard']}>
                <div className={styles['scoreboard-title']}>{scoreboardText}</div>
                {
                    <FishPrawnCrabBetPercentages
                        gameName={this.props.gameName || ''}
                        rounds={rounds}
                        language={this.props.language}
                    />
                }
                <ScrollElement className={styles['scoreboard-content']} refData={this.scrollDivRef}>
                    {
                        <FishPrawnCrabScoreBoardBody
                            gameName={this.props.gameName || ''}
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