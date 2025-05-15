import React from 'react';
import * as gc from '@sg/sg-game-client';
import { GenericDiceDisplay } from '../generic-dice-display';

import styles from './generic-result-row.module.scss';
import { Size } from '../../constants';

interface GenericResultRowProps<T> {
    roundHistory: gc.RoundHistories.RoundHistory;
    settlementService: {
        getWinningTextListByResult: (result: gc.RoundHistories.RoundHistory['result']) => string[];
    };
    DiceComponent: React.ComponentType<{
        symbol: T;
        size?: typeof Size.large | typeof Size.medium | typeof Size.small;
    }>;
}

export function GenericResultRow<T>({
    roundHistory,
    settlementService,
    DiceComponent
}: GenericResultRowProps<T>) {
    return (
        <tr>
            <td className={styles['round-cell']}>
                {gc.Translator.translate('Common.result_no')} {roundHistory.roundId}
            </td>
            <td className={styles['symbols-cell']}>
                {roundHistory.result && roundHistory.settlementResult && (
                    <GenericDiceDisplay result={roundHistory.result} DiceComponent={DiceComponent} />
                )}
            </td>
            <td className={styles['result-cell']}>
                {roundHistory.settlementResult && (
                    settlementService.getWinningTextListByResult(roundHistory.result).join(', ')
                )}
            </td>
        </tr>
    );
} 