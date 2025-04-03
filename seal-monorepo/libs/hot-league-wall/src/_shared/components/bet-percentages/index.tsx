import { Translator } from '@sg/sg-game-client';
import Styles from './bet-percentages.module.scss';
// import { ScoreboardItemContent } from '../scoreboard/types';
type Props = {
    gameName: any;
    settlements: any[];
    scoreboardCharacter: any;
    // scoreboardCharacter: ScoreboardItemContent;
};

const BetPercentages: React.FunctionComponent<Props> = ({ gameName, settlements, scoreboardCharacter }) => {
    const { positiveItemContent, negativeItemContent } = scoreboardCharacter;
    const translateBetOption = (option) => Translator.t(`${gameName}.glossary_${option}`);
    const calPercentage = (settlements: any[]) => {
        const totalCount = settlements.length;

        const leftCount = settlements.filter((entry) => entry[positiveItemContent]).length;
        const rightCount = settlements.filter((entry) => entry[negativeItemContent]).length;

        const leftPercentage = totalCount > 0 ? parseFloat(((leftCount / totalCount) * 100).toFixed(2)) : 0;
        const rightPercentage = totalCount > 0 ? parseFloat(((rightCount / totalCount) * 100).toFixed(2)) : 0;

        return {
            positiveItemContentPercentage: leftPercentage,
            negativeItemContentPercentage: rightPercentage,
        };
    };

    const { positiveItemContentPercentage, negativeItemContentPercentage } = calPercentage(settlements);

    return (
        <div className={Styles['scoreboard-percentage']}>
            <div className={Styles['left-percentage']}>{`${translateBetOption(
                scoreboardCharacter.positiveItemContent,
            )} ${positiveItemContentPercentage}%`}</div>
            <div className={Styles['right-percentage']}>{`${translateBetOption(
                scoreboardCharacter.negativeItemContent,
            )} ${negativeItemContentPercentage}%`}</div>
        </div>
    );
};

export { BetPercentages };

