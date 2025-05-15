import { IPropsObserver, IStateObserver, ObserverComponent } from "../../../../_shared/components/observer-component/observer-component";
import { ColorGameScoreBoard } from "../scoreboard";
import { ColorGameResultHistory } from "../result-history/color-game-result-history";
import styles from "./color-game-statistic.module.scss";

interface Props extends IPropsObserver {
    gameName?: string;
    language: string;
}

export interface IColorGameStatisticState extends IStateObserver { }

export default class ColorGameStatistic extends ObserverComponent<Props, IColorGameStatisticState> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className={`${styles["statistic"]}`}>
                <ColorGameScoreBoard namespace={this.props.namespace} gameName={this.props.gameName} language={this.props.language} />
                <ColorGameResultHistory namespace={this.props.namespace} language={this.props.language} />
            </div>
        );
    }
} 