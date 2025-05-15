import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { FishPrawnCrabScoreBoard } from "../scoreboard";
import { FishPrawnCrabResultHistory } from "../result-history/fish-prawn-crab-result-history";
import styles from "./fish-prawn-crab-statistic.module.scss";

interface Props extends IPropsObserver {
    gameName?: string;
    language: string;
}

export interface IFishPrawnCrabStatisticState extends IStateObserver { }

export default class FishPrawnCrabStatistic extends ObserverComponent<Props, IFishPrawnCrabStatisticState> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className={`${styles["statistic"]}`}>
                <FishPrawnCrabScoreBoard namespace={this.props.namespace} gameName={this.props.gameName} language={this.props.language} />
                <FishPrawnCrabResultHistory namespace={this.props.namespace} language={this.props.language} />
            </div>
        );
    }
} 