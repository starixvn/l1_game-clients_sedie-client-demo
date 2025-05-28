import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../../_shared/components/observer-component/observer-component';
import Styles from './baccarat-statistics.module.scss';
import { BaccaratResultHistory } from '../result-history';
import { BaccaratScoreboard } from '../scoreboard/baccarat-scoreboard';

type Props = IPropsObserver & {
    gameName: string;
    language: string;
};

export class BaccaratStatistic extends ObserverComponent<Props, IStateObserver> {
    render() {
        return (
            <div className={`${Styles['statistic']}`}>
                <BaccaratScoreboard namespace={this.props.namespace} gameName={this.props.gameName} language={this.props.language} />
                <BaccaratResultHistory namespace={this.props.namespace} language={this.props.language} />
            </div>
        );
    }
}

export default BaccaratStatistic;
