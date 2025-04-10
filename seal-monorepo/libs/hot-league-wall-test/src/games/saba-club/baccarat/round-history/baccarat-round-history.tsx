import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import Styles from './baccarat-round-history.module.scss';
import { BaccaratDot } from '../dot/baccarat-dot';
import { Choices } from '../baccarat-helper';
import { Translator } from '@sg/sg-game-client';
import { BaccaratRoundHistoryTooltip } from './tooltip';

interface Card {
    card: number;
    type: number;
}

interface BaccaratHand {
    card1: Card;
    card2: Card;
    card3?: Card | null;
}

interface BaccaratResult {
    player: BaccaratHand;
    banker: BaccaratHand;
}

export interface IBaccaratRoundHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

export default class BaccaratRoundHistory extends ObserverComponent<IPropsObserver, IBaccaratRoundHistoryState> {
    constructor(props: IPropsObserver) {
        super(props);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds: rounds.slice(0, 10) });
    }

    private getWinningChoice(settlementResult: gc.GameServiceMessage.TSettlementResult): string {
        return [Choices.player, Choices.banker, Choices.tie].find((choice) => settlementResult[choice]) ?? '';
    }

    private calculatePoints(cards: BaccaratHand): number {
        let total = 0;
        if (cards.card1) {
            total = (total + (cards.card1.card >= 9 ? 0 : cards.card1.card + 1)) % 10;
        }
        if (cards.card2) {
            total = (total + (cards.card2.card >= 9 ? 0 : cards.card2.card + 1)) % 10;
        }
        if (cards.card3) {
            total = (total + (cards.card3.card >= 9 ? 0 : cards.card3.card + 1)) % 10;
        }
        return total;
    }

    private RoundHistoryItem(roundHistory: gc.RoundHistories.RoundHistory): JSX.Element {
        if (!roundHistory.settlementResult || !roundHistory.result) {
            return <></>;
        }
        const winningChoice = this.getWinningChoice(roundHistory.settlementResult);
        const result = roundHistory.result as unknown as BaccaratResult;
        const playerPoints = this.calculatePoints(result.player);
        const bankerPoints = this.calculatePoints(result.banker);

        return (
            <div key={roundHistory.roundId} className={Styles['history-item']}>
                <BaccaratDot choice={winningChoice} value={Translator.t(`Baccarat.short_${winningChoice}`)} />
                <span className={Styles['arrow']}></span>
                <BaccaratRoundHistoryTooltip
                    roundId={roundHistory.roundId}
                    winningChoice={winningChoice}
                    playerPoints={playerPoints}
                    bankerPoints={bankerPoints}
                />
            </div>
        );
    }

    render() {
        const { rounds } = this.state;
        if (!rounds || rounds.length === 0) {
            return <></>;
        }
        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
        return (
            <div className={Styles['round-history']}>
                <div className={Styles['round']}>
                    <div className={Styles['text']}>{t('Common.previous_round')}:</div>
                    {rounds.toReversed().map((roundHistory) => {
                        return this.RoundHistoryItem(roundHistory);
                    })}
                    <BaccaratDot highlight={true} value={'?'} choice="next" />
                </div>
            </div>
        );
    }
}
