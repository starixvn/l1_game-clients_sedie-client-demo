import React from 'react';
import Chip from './chip';
import './betting-chips.scss';
import { useSentryHelper, SentryLogLevel } from 'sg-sentry-dev';

interface BettingChipsProps {
    min: number;
    max: number;
    currentAmount: number;
    onAmountChange: (amount: number) => void;
    t: (key: string) => string;
    addCommas: (num: number) => string;
}

const BettingChips: React.FC<BettingChipsProps> = ({
    min,
    max,
    currentAmount,
    onAmountChange,
    t,
    addCommas
}) => {
    // Initialize SentryHelper for BettingChips
    const { logInfo } = useSentryHelper({
        componentName: 'BettingChips',
        logLevel: SentryLogLevel.ERROR,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Memoize the log data to prevent infinite re-renders
    const logData = React.useMemo(() => ({
        min,
        max,
        currentAmount,
        timestamp: Date.now()
    }), [min, max, currentAmount]);

    // Log component render in useEffect to prevent infinite re-renders
    React.useEffect(() => {
        logInfo('BettingChips rendered', logData);
    }, [logData]);

    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toString() + 'K';
        }
        return num.toString();
    };

    const chips = [
        {
            value: min,
            label: t('Common.min_bet'),
            onClick: () => onAmountChange(min)
        },
        {
            value: min * 10,
            label: `+${formatNumber(min * 10)}`,
            onClick: () => onAmountChange(currentAmount + (min * 10)),
            disabled: currentAmount + (min * 5) > max
        },
        {
            value: min * 50,
            label: `+${formatNumber(min * 50)}`,
            onClick: () => onAmountChange(currentAmount + (min * 50)),
            disabled: currentAmount + (min * 10) > max
        },
        {
            value: max,
            label: t('Common.max_bet'),
            onClick: () => onAmountChange(max)
        }
    ];

    return (
        <div className='c-betting-quick-stake' data-disabled='0'>
            {chips.map((chip, index) => (
                <Chip
                    key={index}
                    label={chip.label}
                    onClick={chip.onClick}
                    disabled={chip.disabled}
                />
            ))}
        </div>
    );
};

export default BettingChips;