import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import classNames from 'classnames';

import { RoundDot } from '../../../../_shared/components/dot';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { SeDieChoices, SedieResult, SedieSettlementResult } from '../type';
import Styles from './result-history.module.scss';

export interface ISiedieResultHistoryProps extends IPropsObserver {
    language: string;
}

export interface ISeDieResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

interface ISeDieRoundHistoryComponentProps {
    roundHistory: gc.RoundHistories.RoundHistory;
    index: number;
}

const numberOfResult = 100;
export class SedieResultHistory extends ObserverComponent<ISiedieResultHistoryProps, ISeDieResultHistoryState> {
    constructor(props: ISiedieResultHistoryProps) {
        super(props);
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds: rounds.slice(0, numberOfResult) });
    }

    render() {
        const { rounds } = this.state;
        const { language } = this.props;

        if (!rounds || rounds.length === 0) {
            return <></>;
        }
        const roundHistories = rounds as gc.RoundHistories.RoundHistory[];
        const resultTitle = gc.Translator.translate('Common.result_title');

        return (
            <div className={classNames('c-ng-result', Styles['result-history'])}>
                <div className={Styles['result-title']}>{resultTitle}</div>
                <div className={Styles['result-wrapper-content']}>
                    <div className={Styles['result-content']}>
                        {roundHistories.map((roundHistory, index) => {
                            return <SeDieRoundHistoryComponent key={index} roundHistory={roundHistory} index={index} />;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export const SeDieRoundHistoryComponent: React.FC<ISeDieRoundHistoryComponentProps> = ({ roundHistory, index }) => {
    const settlement = roundHistory.settlementResult as SedieSettlementResult;
    const trueKey = Object.keys(settlement).find((key) => settlement[key] && !['odd', 'even'].includes(key));
    // TODO: move to constant
    const gameName = 'SeDie';
    const oddEven = settlement.odd ? 'odd' : 'even';
    const resultText = `${gc.Translator.t(`${gameName}.glossary_${oddEven}`)}, ${gc.Translator.t(`${gameName}.glossary_${trueKey}`)}`;

    return (
        <div
            className={classNames(Styles['result-item'], {
                [Styles['first-result-item']]: index === 0,
            })}
            key={index}
        >
            <div className={Styles['left-content']}>
                <RoundTitle roundId={roundHistory.roundId} />
                <DotGroup result={roundHistory.result as SedieResult} />
            </div>
            <div className={Styles['right-content']}>
                <BetModeText resultText={resultText} />
            </div>
        </div>
    );
};

interface DotGroupProps {
    result: SedieResult;
}

export const DotGroup: React.FC<DotGroupProps> = ({ result }) => {
    const dots = [result.red1, result.red2, result.red3, result.red4];

    return (
        <div className={Styles['item-dot']}>
            {dots.map((isRed, index) => (
                <RoundDot key={index} choice={isRed ? SeDieChoices.odd : SeDieChoices.even} size="medium" />
            ))}
        </div>
    );
};

export const BetModeText: React.FC<{ resultText: string }> = ({ resultText }) => {
    return <div className={Styles['result-text']}>{resultText}</div>;
};
BetModeText.displayName = 'BetModeText';

export const RoundTitle: React.FC<{ roundId: number }> = ({ roundId }) => (
    <div>{`${gc.Translator.translate('Common.result_no')} ${roundId}`}</div>
);
RoundTitle.displayName = 'RoundTitle';
