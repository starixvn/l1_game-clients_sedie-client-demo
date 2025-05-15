import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import Styles from './coin-toss-scoreboard.module.scss';
import { BigRoadScoreboard } from 'sc-scoreboards';
import { createRef } from 'react';
import React from 'react';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { ScoreboardItemContent } from '../../../../_shared/components/scoreboard/types';
import { choices } from '../../../../_shared/types/settlement-result';
import { BetPercentages } from '../../../../_shared/components/bet-percentages';
import {
  IPropsObserver,
  IStateObserver,
  ObserverComponent,
} from '../../../../_shared/components/observer-component/observer-component';
import {
  CoinTossResult,
  CoinTossRoundHistory,
  CoinTossSettlementResult,
} from '../type';
import { CoinTossBigRoadConverter } from '../../../../_shared/components/scoreboard/converters/coin-toss';
import CoinTossScoreBoardBody from './components/coin-toss-scoreboard-body';
import ScrollElement from '../../../../_shared/components/scroll-element';

export interface ICoinTossResultHistoryState extends IStateObserver {
  rounds: gc.RoundHistories.RoundHistory[];
  roundState: string;
}

type Props = IPropsObserver & {
  gameName?: string;
  language?: string;
};

export default class CoinTossScoreBoard extends ObserverComponent<
  Props,
  ICoinTossResultHistoryState
> {
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
      this.scrollDivRef.current.scrollLeft =
        this.scrollDivRef.current.scrollWidth;
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
      converter: CoinTossBigRoadConverter.instance,
      height: 6,
    });

    const settlements = rounds.map((round) => {
      return round.settlementResult as unknown as CoinTossSettlementResult;
    });

    const input = [...rounds]
      .map(
        (round) =>
          ({
            roundId: round.roundId,
            settlementResult:
              round.settlementResult as unknown as CoinTossSettlementResult,
            result: round.result as unknown as CoinTossResult,
          }) as CoinTossRoundHistory,
      )
      .reverse();

    const hasBlink =
      roundState === ROUND_STATE.LOCKING_BET ||
      roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
    bigRoad.initialize(input, hasBlink);
    const rows = bigRoad.rows();
    const scoreboardCharacter: ScoreboardItemContent = {
      positiveItemContent: `${choices.head}`,
      negativeItemContent: `${choices.tail}`,
    };

    const scoreboardDotClassName: ScoreboardItemContent = {
      positiveItemContent: 'dot-head',
      negativeItemContent: 'dot-tail',
    };

    const scoreboardText = gc.Translator.t('Common.scoreboard');

    return (
      <div className={Styles['scoreboard']}>
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
            <CoinTossScoreBoardBody
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
