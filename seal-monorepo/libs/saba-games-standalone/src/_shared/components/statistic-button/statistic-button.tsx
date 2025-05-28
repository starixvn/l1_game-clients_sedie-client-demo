// statistic-button
import * as gc from '@sg/sg-game-client';
import classNames from 'classnames';
import Styles from './statistic-button.module.scss';

const StatisticButton = ({ isOpenStatistic ,handleToggle }) => {
    const statisticTitle = gc.Translator.translate("Common.statistic_title")
    const renderArrow = (isOpenStatistic: boolean) => {
        return (
            <i className={`${Styles["arrow-icon"]}`}>
                <svg
                    className={`${Styles["svg-icon"]}`}
                    width="16"
                    height="16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#2D4F8E"
                >
                    <path d={isOpenStatistic ?  "M6 15l6-6 6 6" :  "M18 9l-6 6-6-6"} />
                </svg>
            </i>
        );
    };
    
    return (
        <div className={classNames(Styles["statistic-button"], "c-match__option")} onClick={handleToggle}>
            <a className={classNames(Styles["c-btn-statistic"], "c-btn c-btn--more c-is-close")} title="Expand">
                <span className={Styles["text"]}>{statisticTitle}</span>
                {renderArrow(isOpenStatistic)}
                {/* <i className="c-icon c-icon--caret"></i> */}
            </a>
        </div>
    );
}


export default StatisticButton;