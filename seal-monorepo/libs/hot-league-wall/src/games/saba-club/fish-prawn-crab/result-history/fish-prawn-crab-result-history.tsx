import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import { ISettlementResultService, SettlementResultService, ITranslationService, TranslationService } from '../services';
import { ResultRow } from './components';
import styles from './fish-prawn-crab-result-history.module.scss';

export interface IFishPrawnCrabResultHistoryProps extends IPropsObserver {
    language: string;
    settlementService?: ISettlementResultService;
    translationService?: ITranslationService;
}

export interface IFishPrawnCrabResultHistoryState extends IStateObserver {
    rounds: gc.RoundHistories.RoundHistory[];
}

export class FishPrawnCrabResultHistory extends ObserverComponent<IFishPrawnCrabResultHistoryProps, IFishPrawnCrabResultHistoryState> {
    private settlementService: ISettlementResultService;
    private translationService: ITranslationService;

    constructor(props: IFishPrawnCrabResultHistoryProps) {
        super(props);
        this.state = {
            dispose: null,
            rounds: [],
        };

        this.settlementService = props.settlementService || new SettlementResultService();
        this.translationService = props.translationService || new TranslationService();
    }

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderRoundHistory(rounds: gc.RoundHistories.RoundHistory[]) {
        this.setState({ rounds });
    }

    render() {
        const { rounds } = this.state;
        if (!rounds || rounds.length === 0) {
            return <></>;
        }

        const roundHistories = rounds as gc.RoundHistories.RoundHistory[];
        const resultTitle = this.translationService.translate('Common.result_title');

        return (
            <div className={styles['resultHistoryContainer']}>
                <div className={styles['result-title']}>{resultTitle}</div>
                <div className={styles['resultHistory']}>
                    <div className={styles['result-wrapper-content']}>
                        <table className={styles['result-table']}>
                            <tbody>
                                {roundHistories.map((roundHistory, index) => (
                                    <ResultRow
                                        key={index}
                                        roundHistory={roundHistory}
                                        settlementService={this.settlementService}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}