import React from 'react';
import styles from './coin-toss-statistic.module.scss';
import { CoinTossScoreBoard } from '../scoreboard';
import { CoinTossResultHistory } from '../result-history';

interface Props {
    namespace: string;
    gameName?: string;
    language: string;
}

export default function CoinTossStatistic({ namespace, gameName, language }: Props) {
    return (
        <div className={styles.statistic}>
            <CoinTossScoreBoard
                namespace={namespace}
                gameName={gameName}
                language={language}
            />
            <CoinTossResultHistory
                namespace={namespace}
                language={language}
            />
        </div>
    );
}