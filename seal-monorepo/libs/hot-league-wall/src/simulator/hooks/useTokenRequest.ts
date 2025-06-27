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
            console.log(`🧪 [SIMULATION] Returning fake token for click #${currentClickCount}:`, fakeToken);
            return fakeToken;
        }

        try {
            console.log('🕐 [TOKEN_TIMING] Play button clicked in PROTOTYPE - Starting token request at:', new Date().toISOString());
            console.log('🎯 [TOKEN_TIMING] Transitioning from PROTOTYPE to REAL APP...');

            if (currentClickCount === 1) {
                console.log('🔑 [TOKEN_TIMING] First click detected - checking for invalid token simulation');
                console.log('🔑 [TOKEN_TIMING] Proceeding with normal token request flow');
            }

            const result = await requestSSO();
            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`✅ [TOKEN_TIMING] Token request SUCCESS for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);

            return result.token as string | null;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`💥 [TOKEN_TIMING] Token request ERROR for REAL APP - Duration: ${duration.toFixed(2)}ms`);
            console.log(`🔑 [TOKEN_TIMING] Click count: ${currentClickCount}`);
            console.error('[TOKEN_TIMING] Error details:', error);

            return null;
        }
    }, [playButtonClickCount, setPlayButtonClickCount, failCount, isFailureMode]);
}; 