import { useCallback } from 'react';
import { requestSSO } from '../../_shared/utils/sso-helper';
import { TokenRequestContext, TokenRequestHookParams } from '../types';

export const useTokenRequest = ({
    playButtonClickCount,
    setPlayButtonClickCount,
    failCount,
    isFailureMode
}: TokenRequestHookParams) => {
    return useCallback(async (context: TokenRequestContext): Promise<string | null> => {
        const startTime = performance.now();
        setPlayButtonClickCount(prev => prev + 1);
        const currentClickCount = playButtonClickCount + 1;

        // Simulate failure for the first N clicks if failure mode is enabled
        if (context === 'FIRST_SSO' && isFailureMode && currentClickCount <= failCount) {
            const fakeToken = `INVALID_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            return fakeToken;
        }

        try {
            const result = await requestSSO();
            const endTime = performance.now();
            const duration = endTime - startTime;

            return result.token as string | null;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            return null;
        }
    }, [playButtonClickCount, setPlayButtonClickCount, failCount, isFailureMode]);
}; 