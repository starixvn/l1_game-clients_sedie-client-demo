import * as gc from '@sg/sg-game-client';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import '@testing-library/jest-dom';
import { shouldShowBlinkingDice, getScoreboardTitle } from '../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/utils/scoreboard-utils';

jest.mock('@sg/sg-game-client', () => ({
    Translator: {
        translate: jest.fn()
    }
}));

describe('scoreboard-utils', () => {
    describe('shouldShowBlinkingDice', () => {
        it('should return true when round state is LOCKING_BET', () => {
            // Arrange
            const roundState = ROUND_STATE.LOCKING_BET;

            // Act
            const result = shouldShowBlinkingDice(roundState);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true when round state is SHOW_ANIMATION_RESULT', () => {
            // Arrange
            const roundState = ROUND_STATE.SHOW_ANIMATION_RESULT;

            // Act
            const result = shouldShowBlinkingDice(roundState);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for other round states', () => {
            // Arrange
            const roundStates = [
                ROUND_STATE.PLACING_BET,
                ROUND_STATE.SHOW_RESULT,
                'WAITING_NEXT_ROUND',
                ''
            ];

            // Act & Assert
            roundStates.forEach(state => {
                expect(shouldShowBlinkingDice(state)).toBe(false);
            });
        });
    });

    describe('getScoreboardTitle', () => {
        it('should return the translated scoreboard title', () => {
            // Arrange
            const mockTranslation = 'Scoreboard';
            (gc.Translator.translate as jest.Mock).mockReturnValue(mockTranslation);

            // Act
            const result = getScoreboardTitle();

            // Assert
            expect(gc.Translator.translate).toHaveBeenCalledWith('Common.scoreboard');
            expect(result).toBe(mockTranslation);
        });

        it('should handle empty translation value', () => {
            // Arrange
            (gc.Translator.translate as jest.Mock).mockReturnValue('');

            // Act
            const result = getScoreboardTitle();

            // Assert
            expect(result).toBe('');
            expect(gc.Translator.translate).toHaveBeenCalledWith('Common.scoreboard');
        });
    });
}); 