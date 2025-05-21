import { useState, useCallback, useEffect, useRef } from 'react';
import { checkValidAmount, parseInputValue, WarnMsgType, calculateMinMaxAmount } from '../../utils/betting-util';
import { ILatestBetRecord } from './types';
import { localStorageKeys, StorageManager } from '../../utils/storage-manager';
export const useBetPanel = (
    betChoice: string,
    minBet: number,
    maxBet: number,
    stakeLevel: any,
    betChoiceMax: number,
    maxBetPerChoices: any,
    namespace: string,
    clientRoundId: number,
    handleBet: (amount: number, betChoice: string, clientSeed: string) => void,
    clientSeed: string,
    t: (key: string) => string
) => {
    const [amount, setAmount] = useState(stakeLevel?.minBet || 0);
    const [warnMsg, setWarnMsg] = useState('');
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const warningTimeoutRef = useRef<NodeJS.Timeout>();

    const setWarningWithTimeout = useCallback((message: string) => {
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        setWarnMsg(message);

        warningTimeoutRef.current = setTimeout(() => {
            setWarnMsg('');
        }, 60000);
    }, []);

    const handleInputChange = useCallback((event: any) => {
        const numericValue = parseInputValue(event.target.value);
        const { msg } = checkValidAmount(numericValue, min, max);

        if (msg) {
            if (msg === WarnMsgType.LESS_THAN_MIN) {
                setWarnMsg(t('Common.lessthanmin'));
            }
            if (msg === WarnMsgType.MORE_THAN_MAX) {
                setWarnMsg(t('Common.morethanmax'));
            }
        } else {
            setWarnMsg('');
        }

        setAmount(numericValue);
    }, [min, max, t]);

    const handleClear = useCallback(() => {
        setAmount(0);
    }, []);

    const handleClickBet = useCallback(() => {
        const { newAmount: validatedAmount, msg } = checkValidAmount(amount, min, max);

        if (msg) {
            setAmount(validatedAmount);
            if (msg === WarnMsgType.LESS_THAN_MIN) {
                setWarningWithTimeout(t('Common.lessthanmin'));
            }
            if (msg === WarnMsgType.MORE_THAN_MAX) {
                setWarningWithTimeout(t('Common.morethanmax'));
            }
            return;
        }

        if (betChoice) {
            handleBet?.(validatedAmount, betChoice, clientSeed);
            updateLatestBetToStorage(namespace, clientRoundId);
        }
    }, [amount, min, max, betChoice, handleBet, clientSeed, namespace, clientRoundId, t, setWarningWithTimeout]);

    const updateLatestBetToStorage = useCallback((namespace: string, clientRoundId: number) => {
        const existingHistory = StorageManager.get(localStorageKeys.betHistory) as ILatestBetRecord[];
        let betHistory = Array.isArray(existingHistory) ? existingHistory : [];

        const newBet = { namespace, roundId: clientRoundId };
        const existingNamespaceIndex = betHistory.findIndex(bet => bet.namespace === namespace);

        if (existingNamespaceIndex !== -1) {
            betHistory[existingNamespaceIndex].roundId = clientRoundId;
        } else {
            betHistory.push(newBet);
        }

        StorageManager.set(localStorageKeys.betHistory, betHistory);
    }, []);

    useEffect(() => {
        if (!betChoice) return;

        const { min: newMin, max: newMax } = calculateMinMaxAmount(
            minBet,
            stakeLevel?.minBet,
            maxBet,
            stakeLevel?.maxBet,
            betChoiceMax,
            maxBetPerChoices,
            namespace
        );

        setMin(newMin);
        setMax(newMax);

        setAmount((prev) => {
            if (prev < newMin) return newMin;
            if (prev > newMax) return newMax;
            return prev;
        });
    }, [betChoice, minBet, maxBet, stakeLevel, betChoiceMax, maxBetPerChoices, namespace]);

    return {
        amount,
        warnMsg,
        min,
        max,
        handleInputChange,
        handleClear,
        handleClickBet,
        setAmount
    };
}; 