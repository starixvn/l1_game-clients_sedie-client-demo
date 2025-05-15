import { ColorGameChoices } from '../type';
import styles from './statistic.module.scss';

interface Props {
    namespace: string;
    gameName?: string;
    language: string;
}

export default function ColorGameStatistic({ namespace, gameName, language }: Props) {
    return (
        <div className={styles.statistics}>
            <div className={styles.title}>Statistics</div>
            <div className={styles.content}>
                {Object.values(ColorGameChoices).map((choice) => (
                    <div key={choice} className={styles.statItem}>
                        <div className={styles.symbol}>{choice}</div>
                        <div className={styles.percentage}>0%</div>
                    </div>
                ))}
            </div>
        </div>
    );
} 