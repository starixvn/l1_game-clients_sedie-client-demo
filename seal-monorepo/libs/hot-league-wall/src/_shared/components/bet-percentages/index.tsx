import { Translator } from '@sg/sg-game-client';
import Styles from './bet-percentages.module.scss';

type Props = {
    gameName: any;
    settlements: any[];
    scoreboardCharacter: {
        [key: string]: string;
    };
};

const BetPercentages: React.FunctionComponent<Props> = ({ gameName, settlements, scoreboardCharacter }) => {
    const translateBetOption = (option) => Translator.t(`${gameName}.glossary_${option}`);
    
    const calPercentage = (settlements: any[]) => {
        const totalCount = settlements.length;
        const percentages: { [key: string]: number } = {};

        Object.keys(scoreboardCharacter).forEach((key) => {
            const count = settlements.filter((entry) => entry[scoreboardCharacter[key]]).length;
            percentages[key] = totalCount > 0 ? parseFloat(((count / totalCount) * 100).toFixed(0)) : 0;
        });

        return percentages;
    };

    const percentages = calPercentage(settlements);

    return (
        <div className={Styles['scoreboard-percentage']}>
            {Object.entries(scoreboardCharacter).map(([key, value]) => (
                <div key={key} className={Styles['scoreboard-percentage-item']}>
                    {`${translateBetOption(value)} ${percentages[key]}%`}
                </div>
            ))}
        </div>
    );
};

export { BetPercentages };

