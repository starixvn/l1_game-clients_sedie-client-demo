import React from 'react';
import * as gc from '@sg/sg-game-client';
import styles from '../fish-prawn-crab-scoreboard.module.scss';
import { FishPrawnCrabResult } from '../../type';
import DiceColumn from './dice-column';

// Result History Component
export interface ResultHistoryProps {
    rounds: gc.RoundHistories.RoundHistory[];
    hasBlink: boolean;
}

const ResultHistory: React.FC<ResultHistoryProps> = ({ rounds, hasBlink }) => {
    return (
        <div className={styles['scoreboard-dice-container']} data-testid="scoreboard-dice-container">
            {[...rounds].reverse().map((round, index) => (
                <div key={round.roundId} className={styles['dice-result']} data-testid={`result-${round.roundId}`}>
                    <DiceColumn
                        result={round.result as unknown as FishPrawnCrabResult}
                        hasBlink={hasBlink && index === 0}
                    />
                </div>
            ))}
            {hasBlink && rounds.length === 0 && (
                <div className={styles['dice-result']} data-testid="empty-result">
                    <DiceColumn result={null} hasBlink={true} />
                </div>
            )}
        </div>
    );
};

export default ResultHistory; 