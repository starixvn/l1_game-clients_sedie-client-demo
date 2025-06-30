import React from 'react';
import * as gc from '@sg/sg-game-client';
import { RNGSoccerChoices, RNGSoccerResult } from '../type';
import styles from './rng-soccer-round-history.module.scss';

interface RNGSoccerRoundHistoryTooltipProps {
    roundId: number;
    winner: string;
    result: RNGSoccerResult;
}

export const RNGSoccerRoundHistoryTooltip: React.FC<RNGSoccerRoundHistoryTooltipProps> = ({ roundId, winner, result }) => {
    const t = (key: string) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

    const getWinnerText = () => {
        switch (winner) {
            case RNGSoccerChoices.home:
                return t('RNGSoccer.home_win');
            case RNGSoccerChoices.away:
                return t('RNGSoccer.away_win');
            case RNGSoccerChoices.draw:
                return t('RNGSoccer.draw');
            default:
                return '';
        }
    };

    return (
        <div className={styles['tooltip']}>
            <div className={styles['tooltip-content']}>
                <div className={styles['tooltip-header']}>
                    <span className={styles['round-id']}>
                        {t('Common.round')} #{roundId}
                    </span>
                    <span className={styles['winner']}>{getWinnerText()}</span>
                </div>
                <div className={styles['tooltip-body']}>
                    <div className={styles['score']}>
                        <span className={styles['home-score']}>{result.homeScore}</span>
                        <span className={styles['score-separator']}>-</span>
                        <span className={styles['away-score']}>{result.awayScore}</span>
                    </div>
                    <div className={styles['cards']}>
                        <div className={styles['home-card']}>
                            <span className={styles['card-label']}>{t('RNGSoccer.home')}</span>
                            <span className={styles['card-value']}>
                                {result.home.rank} {t(`RNGSoccer.suit_${result.home.suit}`)}
                            </span>
                        </div>
                        <div className={styles['away-card']}>
                            <span className={styles['card-label']}>{t('RNGSoccer.away')}</span>
                            <span className={styles['card-value']}>
                                {result.away.rank} {t(`RNGSoccer.suit_${result.away.suit}`)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
