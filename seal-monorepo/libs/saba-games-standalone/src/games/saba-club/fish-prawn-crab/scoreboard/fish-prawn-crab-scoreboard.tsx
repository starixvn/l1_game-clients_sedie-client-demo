import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import styles from './fish-prawn-crab-scoreboard.module.scss';
import { createRef, RefObject } from 'react';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import ScrollElement from '../../../../_shared/components/scroll-element';
import { FishPrawnCrabBetPercentages } from '../bet-percentages';
import { ResultHistory } from './components';
import { getScoreboardTitle, shouldShowBlinkingDice } from './utils/scoreboard-utils';

export interface IFishPrawnCrabResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
    roundState: string;
}

interface ScoreBoardProps extends IPropsObserver {
    gameName?: string;
    language: string;
}

export default class FishPrawnCrabScoreBoard extends ObserverComponent<ScoreBoardProps, IFishPrawnCrabResultHistoryState> {
    private scrollDivRef: RefObject<HTMLDivElement>;

    constructor(props: ScoreBoardProps) {
        super(props);
        this.scrollDivRef = createRef<HTMLDivElement>();
        this.state = {
            rounds: [],
            roundState: '',
            dispose: null
        };
    }

    componentDidUpdate(prevProps: ScoreBoardProps, prevState: IFishPrawnCrabResultHistoryState) {
        if (prevState.rounds !== this.state.rounds) {
            this.scrollToRight();
        }
    }

    scrollToRight = (): void => {
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
        const { gameName = '', language } = this.props;

        if (!rounds || rounds.length === 0) {
            return <></>;
        }

        const hasBlink = shouldShowBlinkingDice(roundState);
        const scoreboardTitle = getScoreboardTitle();

        return (
            <div className={styles['scoreboard']}>
                <div className={styles['scoreboard-title']}>{scoreboardTitle}</div>
                <FishPrawnCrabBetPercentages
                    gameName={gameName}
                    rounds={rounds}
                    language={language}
                />
                <ScrollElement className={styles['scoreboard-content']} refData={this.scrollDivRef}>
                    <ResultHistory rounds={rounds} hasBlink={hasBlink} />
                </ScrollElement>
            </div>
        );
    }
}