import { 
    calculateMinMaxAmount, 
    checkValidAmount, 
    parseInputValue, 
    WarnMsgType
} from '../../../src/_shared/utils/betting-util';
import { COIN_TOSS_GAME_NAMESPACE } from '../../../constant/app';

describe('betting-util', () => {
    describe('calculateMinMaxAmount', () => {
        it('should calculate min and max amounts correctly for non-coin toss games', () => {
            const result = calculateMinMaxAmount(
                100,    // minBet
                50,     // stakeLevelMinBet
                1000,   // maxBet
                800,    // stakeLevelMaxBet
                500,    // betChoiceMax
                { 'choice1': 300, 'choice2': 400 }, // maxBetPerChoices
                'OtherGame' // namespace
            );

            expect(result).toEqual({
                min: 100, // Math.max(100, 50) = 100
                max: 500  // Math.min(500, 1000, 800) = 500
            });
        });

        it('should calculate min and max amounts correctly for coin toss games with empty maxBetPerChoices', () => {
            const result = calculateMinMaxAmount(
                100,    // minBet
                50,     // stakeLevelMinBet
                1000,   // maxBet
                800,    // stakeLevelMaxBet
                500,    // betChoiceMax
                {},     // maxBetPerChoices (empty)
                COIN_TOSS_GAME_NAMESPACE // namespace
            );

            expect(result).toEqual({
                min: 100, // Math.max(100, 50) = 100
                max: 800  // Math.min(1000, 800) = 800 (ignores betChoiceMax for coin toss)
            });
        });

        it('should use stake level min when it is higher than minBet', () => {
            const result = calculateMinMaxAmount(
                50,     // minBet
                200,    // stakeLevelMinBet (higher)
                1000,   // maxBet
                800,    // stakeLevelMaxBet
                500,    // betChoiceMax
                { 'choice1': 300 }, // maxBetPerChoices
                'OtherGame' // namespace
            );

            expect(result).toEqual({
                min: 200, // Math.max(50, 200) = 200
                max: 500  // Math.min(500, 1000, 800) = 500
            });
        });

        it('should use the lowest max value among all constraints', () => {
            const result = calculateMinMaxAmount(
                100,    // minBet
                50,     // stakeLevelMinBet
                1000,   // maxBet
                300,    // stakeLevelMaxBet (lowest)
                500,    // betChoiceMax
                { 'choice1': 400 }, // maxBetPerChoices
                'OtherGame' // namespace
            );

            expect(result).toEqual({
                min: 100, // Math.max(100, 50) = 100
                max: 300  // Math.min(500, 1000, 300) = 300
            });
        });

        it('should handle zero values correctly', () => {
            const result = calculateMinMaxAmount(
                0,      // minBet
                0,      // stakeLevelMinBet
                0,      // maxBet
                0,      // stakeLevelMaxBet
                0,      // betChoiceMax
                {},     // maxBetPerChoices
                'OtherGame' // namespace
            );

            expect(result).toEqual({
                min: 0, // Math.max(0, 0) = 0
                max: 0  // Math.min(0, 0, 0) = 0
            });
        });

        it('should handle negative values correctly', () => {
            const result = calculateMinMaxAmount(
                -100,   // minBet
                -50,    // stakeLevelMinBet
                1000,   // maxBet
                800,    // stakeLevelMaxBet
                500,    // betChoiceMax
                { 'choice1': 300 }, // maxBetPerChoices
                'OtherGame' // namespace
            );

            expect(result).toEqual({
                min: -50, // Math.max(-100, -50) = -50
                max: 500  // Math.min(500, 1000, 800) = 500
            });
        });
    });

    describe('checkValidAmount', () => {
        it('should return valid amount when amount is within range', () => {
            const result = checkValidAmount(500, 100, 1000);

            expect(result).toEqual({
                newAmount: 500,
                msg: ''
            });
        });

        it('should return NOT_NUMBER error for NaN', () => {
            const result = checkValidAmount(NaN, 100, 1000);

            expect(result).toEqual({
                newAmount: 100,
                msg: WarnMsgType.NOT_NUMBER
            });
        });

        it('should return LESS_THAN_MIN error when amount is below minimum', () => {
            const result = checkValidAmount(50, 100, 1000);

            expect(result).toEqual({
                newAmount: 100,
                msg: WarnMsgType.LESS_THAN_MIN
            });
        });

        it('should return MORE_THAN_MAX error when amount is above maximum', () => {
            const result = checkValidAmount(1500, 100, 1000);

            expect(result).toEqual({
                newAmount: 1000,
                msg: WarnMsgType.MORE_THAN_MAX
            });
        });

        it('should handle amount equal to minimum', () => {
            const result = checkValidAmount(100, 100, 1000);

            expect(result).toEqual({
                newAmount: 100,
                msg: ''
            });
        });

        it('should handle amount equal to maximum', () => {
            const result = checkValidAmount(1000, 100, 1000);

            expect(result).toEqual({
                newAmount: 1000,
                msg: ''
            });
        });

        it('should handle zero values', () => {
            const result = checkValidAmount(0, 0, 1000);

            expect(result).toEqual({
                newAmount: 0,
                msg: ''
            });
        });

        it('should handle negative values', () => {
            const result = checkValidAmount(-50, -100, 1000);

            expect(result).toEqual({
                newAmount: -50,
                msg: ''
            });
        });

        it('should handle negative minimum and maximum', () => {
            const result = checkValidAmount(-150, -200, -50);

            expect(result).toEqual({
                newAmount: -150,
                msg: ''
            });
        });
    });

    describe('parseInputValue', () => {
        it('should parse numeric string correctly', () => {
            const result = parseInputValue('123');
            expect(result).toBe(123);
        });

        it('should remove non-numeric characters', () => {
            const result = parseInputValue('abc123def456');
            expect(result).toBe(123456);
        });

        it('should return 0 for empty string', () => {
            const result = parseInputValue('');
            expect(result).toBe(0);
        });

        it('should return 0 for string with only non-numeric characters', () => {
            const result = parseInputValue('abc!@#$%');
            expect(result).toBe(0);
        });

        it('should handle string with spaces', () => {
            const result = parseInputValue(' 123 456 ');
            expect(result).toBe(123456);
        });

        it('should handle string with special characters', () => {
            const result = parseInputValue('1,234.56');
            expect(result).toBe(123456);
        });

        it('should handle string with letters and numbers mixed', () => {
            const result = parseInputValue('amount123value456');
            expect(result).toBe(123456);
        });

        it('should handle zero', () => {
            const result = parseInputValue('0');
            expect(result).toBe(0);
        });

        it('should handle large numbers', () => {
            const result = parseInputValue('999999999');
            expect(result).toBe(999999999);
        });

        it('should handle string starting with zero', () => {
            const result = parseInputValue('0123');
            expect(result).toBe(123);
        });
    });

    describe('WarnMsgType enum', () => {
        it('should have correct enum values', () => {
            expect(WarnMsgType.NOT_NUMBER).toBe('notNumber');
            expect(WarnMsgType.LESS_THAN_MIN).toBe('lessThanMin');
            expect(WarnMsgType.MORE_THAN_MAX).toBe('moreThanMax');
        });
    });
}); 