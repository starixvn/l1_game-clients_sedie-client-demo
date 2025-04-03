import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';

import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { Result } from '../baccarat';
import { cardStateEmitter } from '../services/card-state-emitter';
import Styles from './baccarat-result-history.module.scss';
import { ResultCardSection } from './result-card-section';
import React from 'react';

export interface IBaccaratResultHistoryProps extends IPropsObserver {
    language: string;
}

export interface IBaccaratResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

const numberOfResult = 102;

export class BaccaratResultHistory extends ObserverComponent<IBaccaratResultHistoryProps, IBaccaratResultHistoryState> {
    private openedCardsHandler: (count: number) => void;

    constructor(props: IBaccaratResultHistoryProps) {
        super(props);
        this.openedCardsHandler = this.handleOpenedCardsChange.bind(this);
    }

    componentDidMount() {
        super.componentDidMount?.();
        cardStateEmitter.onOpenedCardsChange(this.openedCardsHandler);
    }

    componentWillUnmount() {
        super.componentWillUnmount?.();
        cardStateEmitter.removeOpenedCardsListener(this.openedCardsHandler);
    }

    private handleOpenedCardsChange(count: number) {
        if (count > 0) {
            this.updateRoundHistory();
        }
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.updateRoundHistory(rounds);
    }

    private updateRoundHistory(rounds?: gc.RoundHistories.RoundHistory[]) {
        if (rounds) {
            this.setState({ rounds: rounds.slice(0, numberOfResult) });
        }
    }

    private renderResultWithBreaks(texts: string[]) {
        return texts.map((text, index) => (
            <React.Fragment key={index}>
                {text}
                {index < texts.length - 1 && (
                    <>
                        ,{' '}
                        <br />
                    </>
                )}
            </React.Fragment>
        ));
    }

    renderRoundResult(roundHistory: gc.RoundHistories.RoundHistory, index: number) {
        const result = roundHistory?.result as Result;
        const settlement = roundHistory.settlementResult;
        let resultArray: string[] = [];

        const settlementKeys = ['player', 'banker', 'tie', 'playerPair', 'bankerPair'];
        const langTh = this.props.language === 'th'
        settlementKeys.forEach((key) => {
            if (settlement[key]) {
                resultArray.push(gc.Translator.t(`Baccarat.glossary_${key}`) || '');
            }
        });
        const resultString = langTh ? this.renderResultWithBreaks(resultArray) : resultArray.join(', ');
        return (
            <div className={Styles.historyRow} key={index}>
                <div className={Styles.contentWrapper}>
                    <span className={Styles.roundNumber}>{`${gc.Translator.t('Common.round')} ${roundHistory?.roundId}`}</span>
                    <ResultCardSection cards={result?.player} />
                    <span className={Styles.divider} />
                    <ResultCardSection cards={result?.banker} />
                    <span className={`${Styles.winner}`}>
                        {resultString}
                    </span>
                </div>
            </div>
        );
    }

    render() {
        const { rounds } = this.state;
        const { language } = this.props;

        if (!rounds || rounds.length === 0) {
            return <div />;
        }

        return (
            <div className={Styles.resultHistoryContainer}>
                <div className={Styles['result-title']}>{gc.Translator.t('Common.result')}</div>
                <div className={`c-ng-result ${Styles.resultHistory}`}>
                    <div className={Styles.header}>
                        <span />
                        <span>{gc.Translator.t('Baccarat.glossary_player')}</span>
                        <span />
                        <span>{gc.Translator.t('Baccarat.glossary_banker')}</span>
                        <span />
                    </div>
                    <div className={Styles.historyContent}>{rounds.map(this.renderRoundResult.bind(this))}</div>
                </div>
            </div>
        );
    }
}
