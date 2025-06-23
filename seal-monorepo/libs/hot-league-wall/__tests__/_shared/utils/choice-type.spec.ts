import { getChoicesType } from '../../../src/_shared/utils/choice-type';
import { COIN_TOSS_GAME_NAMESPACE, RNGSoccer_GAME_NAMESPACE } from '../../../constant/app';

describe('choice-type', () => {
    describe('getChoicesType', () => {
        it('should return correct choices type for COIN_TOSS_GAME_NAMESPACE', () => {
            const result = getChoicesType(COIN_TOSS_GAME_NAMESPACE, 'head');
            
            expect(result).toBe(`${COIN_TOSS_GAME_NAMESPACE}.choices_type`);
        });

        it('should return correct choices type for RNGSoccer_GAME_NAMESPACE', () => {
            const result = getChoicesType(RNGSoccer_GAME_NAMESPACE, 'home');
            
            expect(result).toBe(`${RNGSoccer_GAME_NAMESPACE}.choices_type`);
        });

        it('should return default choices_type for other game names', () => {
            const result = getChoicesType('OtherGame', 'someChoice');
            
            expect(result).toBe('choices_type');
        });

        it('should return default choices_type for empty game name', () => {
            const result = getChoicesType('', 'someChoice');
            
            expect(result).toBe('choices_type');
        });

        it('should return default choices_type for null game name', () => {
            const result = getChoicesType(null as any, 'someChoice');
            
            expect(result).toBe('choices_type');
        });

        it('should return default choices_type for undefined game name', () => {
            const result = getChoicesType(undefined as any, 'someChoice');
            
            expect(result).toBe('choices_type');
        });

        it('should work with any betChoice value for COIN_TOSS_GAME_NAMESPACE', () => {
            const testCases = ['head', 'tail', 'random', '', null, undefined];
            
            testCases.forEach(betChoice => {
                const result = getChoicesType(COIN_TOSS_GAME_NAMESPACE, betChoice as any);
                expect(result).toBe(`${COIN_TOSS_GAME_NAMESPACE}.choices_type`);
            });
        });

        it('should work with any betChoice value for RNGSoccer_GAME_NAMESPACE', () => {
            const testCases = ['home', 'away', 'draw', '', null, undefined];
            
            testCases.forEach(betChoice => {
                const result = getChoicesType(RNGSoccer_GAME_NAMESPACE, betChoice as any);
                expect(result).toBe(`${RNGSoccer_GAME_NAMESPACE}.choices_type`);
            });
        });

        it('should work with any betChoice value for other game names', () => {
            const testCases = ['choice1', 'choice2', '', null, undefined];
            
            testCases.forEach(betChoice => {
                const result = getChoicesType('OtherGame', betChoice as any);
                expect(result).toBe('choices_type');
            });
        });

        it('should handle case-sensitive game name matching', () => {
            // Test with different cases
            const result1 = getChoicesType('cointoss', 'head');
            const result2 = getChoicesType('CoinToss', 'head');
            const result3 = getChoicesType('COINTOSS', 'head');
            
            expect(result1).toBe('choices_type');
            expect(result2).toBe(`${COIN_TOSS_GAME_NAMESPACE}.choices_type`);
            expect(result3).toBe('choices_type');
        });

        it('should handle case-sensitive RNGSoccer game name matching', () => {
            // Test with different cases
            const result1 = getChoicesType('rngsoccer', 'home');
            const result2 = getChoicesType('RNGSoccer', 'home');
            const result3 = getChoicesType('RNGSOCCER', 'home');
            
            expect(result1).toBe('choices_type');
            expect(result2).toBe(`${RNGSoccer_GAME_NAMESPACE}.choices_type`);
            expect(result3).toBe('choices_type');
        });

        it('should return consistent results for same inputs', () => {
            const gameName = COIN_TOSS_GAME_NAMESPACE;
            const betChoice = 'head';
            
            const result1 = getChoicesType(gameName, betChoice);
            const result2 = getChoicesType(gameName, betChoice);
            const result3 = getChoicesType(gameName, betChoice);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            expect(result1).toBe(`${COIN_TOSS_GAME_NAMESPACE}.choices_type`);
        });
    });
}); 