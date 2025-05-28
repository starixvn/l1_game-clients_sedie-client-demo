import React from 'react';
import * as gc from '@sg/sg-game-client';
import styles from '../fish-prawn-crab-result-history.module.scss';
import { DiceDisplay } from './dice-display';
import { ISettlementResultService } from '../../services/settlement-result-service';

interface IResultRowProps {
    roundHistory: gc.RoundHistories.RoundHistory;
    settlementService: ISettlementResultService;
}

export const ResultRow: React.FC<IResultRowProps> = ({
    roundHistory,
    settlementService
}) => {
    return (
        <tr>
            <td className={styles['round-cell']}>
                {gc.Translator.translate('Common.result_no')} {roundHistory.roundId}
            </td>
            <td className={styles['symbols-cell']}>
                {roundHistory.result && roundHistory.settlementResult && (
                    <DiceDisplay result={roundHistory.result} />
                )}
            </td>
            <td className={styles['result-cell']}>
                {roundHistory.settlementResult && (
                    settlementService.getWinningTextListByResult(roundHistory.result).join(', ')
                )}
            </td>
        </tr>
    );
}; 