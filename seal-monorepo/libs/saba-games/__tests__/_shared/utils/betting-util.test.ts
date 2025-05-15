import { checkValidAmount, parseInputValue, WarnMsgType } from 'libs/saba-games/src/_shared/utils/betting-util';
import { calculateMinMaxAmount } from '../../../src/_shared/utils/betting-util';
import {
    UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE,
    COIN_TOSS_GAME_NAMESPACE,
} from '../../../constant/app';

describe('betting-util', () => {
    describe('checkValidAmount', () => {
        it('should return NOT_NUMBER when amount is NaN', () => {
            // Arrange
            const amount = NaN;
            const min = 10;
            const max = 100;

            // Act
            const result = checkValidAmount(amount, min, max);

            // Assert
            expect(result).toEqual({
                newAmount: min,
                msg: WarnMsgType.NOT_NUMBER
            });
        });

        it('should return LESS_THAN_MIN when amount is less than min', () => {
            // Arrange
            const amount = 5;
            const min = 10;
            const max = 100;

            // Act
            const result = checkValidAmount(amount, min, max);

            // Assert
            expect(result).toEqual({
                newAmount: min,
                msg: WarnMsgType.LESS_THAN_MIN
            });
        });

        it('should return MORE_THAN_MAX when amount is more than max', () => {
            // Arrange
            const amount = 150;
            const min = 10;
            const max = 100;

            // Act
            const result = checkValidAmount(amount, min, max);

            // Assert
            expect(result).toEqual({
                newAmount: max,
                msg: WarnMsgType.MORE_THAN_MAX
            });
        });

        it('should return valid amount when amount is within range', () => {
            // Arrange
            const amount = 50;
            const min = 10;
            const max = 100;

            // Act
            const result = checkValidAmount(amount, min, max);

            // Assert
            expect(result).toEqual({
                newAmount: amount,
                msg: ''
            });
        });

        it('should handle amount equal to min', () => {
            // Arrange
            const amount = 10;
            const min = 10;
            const max = 100;

            // Act
            const result = checkValidAmount(amount, min, max);

            // Assert
            expect(result).toEqual({
                newAmount: amount,
                msg: ''
            });
        });

        it('should handle amount equal to max', () => {
            // Arrange
            const amount = 100;
            const min = 10;
            const max = 100;

            // Act
            const result = checkValidAmount(amount, min, max);

            // Assert
            expect(result).toEqual({
                newAmount: amount,
                msg: ''
            });
        });
    });

    describe('parseInputValue', () => {
        it('should parse numeric string to number', () => {
            // Arrange
            const input = '123';

            // Act
            const result = parseInputValue(input);

            // Assert
            expect(result).toBe(123);
        });

        it('should remove non-numeric characters from input', () => {
            // Arrange
            const input = '1a2b3c';

            // Act
            const result = parseInputValue(input);

            // Assert
            expect(result).toBe(123);
        });

        it('should return 0 for empty string', () => {
            // Arrange
            const input = '';

            // Act
            const result = parseInputValue(input);

            // Assert
            expect(result).toBe(0);
        });

        it('should return 0 for string with only non-numeric characters', () => {
            // Arrange
            const input = 'abc';

            // Act
            const result = parseInputValue(input);

            // Assert
            expect(result).toBe(0);
        });

        it('should handle decimal numbers by removing decimal point', () => {
            // Arrange
            const input = '12.34';

            // Act
            const result = parseInputValue(input);

            // Assert
            expect(result).toBe(1234);
        });

        it('should handle negative numbers by removing minus sign', () => {
            // Arrange
            const input = '-123';

            // Act
            const result = parseInputValue(input);

            // Assert
            expect(result).toBe(123);
        });
    });

    describe('calculateMinMaxAmount', () => {
        const baseMinBet = 10;
        const baseStakeMin = 5;
        const baseMaxBet = 50;
        const baseStakeMax = 40;
        const baseBetChoiceMax = 20;

        it('calculateMinMaxAmount_nonEmptyChoices_shouldReturnMinAsHigherMinBetAndMaxUsingBetChoice', () => {
            // Arrange
            const maxBetPerChoices = { choiceA: baseBetChoiceMax };
            const namespace = 'AnyNamespace';

            // Act
            const { min, max } = calculateMinMaxAmount(
                baseMinBet,
                baseStakeMin,
                baseMaxBet,
                baseStakeMax,
                baseBetChoiceMax,
                maxBetPerChoices,
                namespace
            );

            // Assert
            expect(min).toBe(baseMinBet);
            expect(max).toBe(baseBetChoiceMax);
        });

        it('calculateMinMaxAmount_emptyChoicesAndSpecialNamespace_shouldReturnMinAsHigherMinBetAndMaxAsMinOfMaxBetAndStakeMax', () => {
            // Arrange
            const maxBetPerChoices: Record<string, number> = {};
            const namespace = UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE;
            const customMaxBet = 100;
            const customStakeMax = 80;

            // Act
            const { min, max } = calculateMinMaxAmount(
                baseMinBet,
                baseStakeMin,
                customMaxBet,
                customStakeMax,
                baseBetChoiceMax,
                maxBetPerChoices,
                namespace
            );

            // Assert
            expect(min).toBe(baseMinBet);
            expect(max).toBe(Math.min(customMaxBet, customStakeMax));
        });

        it('calculateMinMaxAmount_emptyChoicesAndOtherNamespace_shouldReturnMinAsHigherMinBetAndMaxUsingBetChoice', () => {
            // Arrange
            const maxBetPerChoices: Record<string, number> = {};
            const namespace = 'OtherGame';
            const choiceMax = 15;
            const customMaxBet = 100;
            const customStakeMax = 80;

            // Act
            const { min, max } = calculateMinMaxAmount(
                baseMinBet,
                baseStakeMin,
                customMaxBet,
                customStakeMax,
                choiceMax,
                maxBetPerChoices,
                namespace
            );

            // Assert
            expect(min).toBe(baseMinBet);
            expect(max).toBe(Math.min(choiceMax, customMaxBet, customStakeMax));
        });

        it('calculateMinMaxAmount_boundaryStakeMinGreaterThanMinBet_shouldReturnStakeMinAsMin', () => {
            // Arrange
            const maxBetPerChoices = { key: 5 };
            const namespace = COIN_TOSS_GAME_NAMESPACE;
            const stakeMinGreater = 20;

            // Act
            const { min, max } = calculateMinMaxAmount(
                baseMinBet,
                stakeMinGreater,
                baseMaxBet,
                baseStakeMax,
                baseBetChoiceMax,
                maxBetPerChoices,
                namespace
            );

            // Assert
            expect(min).toBe(stakeMinGreater);
            expect(max).toBe(Math.min(baseBetChoiceMax, baseMaxBet, baseStakeMax));
        });
    });
}); 
