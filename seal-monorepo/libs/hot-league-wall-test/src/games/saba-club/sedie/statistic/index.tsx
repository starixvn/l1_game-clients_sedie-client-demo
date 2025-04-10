import Styles from './statistic.module.scss';
import { SedieResultHistory } from '../result-history';
import { SedieScoreBoard } from '../scoreboard';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';

interface Props extends IPropsObserver {
    gameName?: string;
    language: string;
}

export type ISedieStatisticState = IStateObserver;

export class SedieStatistic extends ObserverComponent<Props, ISedieStatisticState> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { namespace, gameName, language } = this.props;
        return (
            <div className={`${Styles['statistic']}`}>
                <SedieScoreBoard namespace={namespace} gameName={gameName} language={language} />
                <SedieResultHistory namespace={namespace} language={language} />
            </div>
        );
    }
}

export default SedieStatistic;
