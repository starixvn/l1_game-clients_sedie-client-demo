import { BACCARAT_GAME_NAMESPACE, SE_DIE_GAME_NAMESPACE, UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE, VIP_SE_DIE_GAME_NAMESPACE } from 'libs/saba-games/constant/app';
import { getChoicesType } from 'libs/saba-games/src/_shared/utils/choice-type';
import { BACCARAT_CHOICES, SE_DIE_CHOICES } from 'libs/saba-games/src/games/constants/saba-club';

describe('choice-type', () => {
    describe('getChoicesType', () => {
        describe('SE_DIE_GAME_NAMESPACE and VIP_SE_DIE_GAME_NAMESPACE', () => {
            it('should return choices_type1 for ODD and EVEN choices', () => {
                // Arrange
                const gameName = SE_DIE_GAME_NAMESPACE;
                const oddChoice = SE_DIE_CHOICES.ODD;
                const evenChoice = SE_DIE_CHOICES.EVEN;

                // Act & Assert
                expect(getChoicesType(gameName, oddChoice)).toBe(`${gameName}.choices_type1`);
                expect(getChoicesType(gameName, evenChoice)).toBe(`${gameName}.choices_type1`);
            });

            it('should return choices_type2 for RED and WHITE choices', () => {
                // Arrange
                const gameName = SE_DIE_GAME_NAMESPACE;
                const redChoices = [
                    SE_DIE_CHOICES.RED4,
                    SE_DIE_CHOICES.RED3,
                    SE_DIE_CHOICES.RED2
                ];
                const whiteChoices = [
                    SE_DIE_CHOICES.WHITE4,
                    SE_DIE_CHOICES.WHITE3
                ];

                // Act & Assert
                redChoices.forEach(choice => {
                    expect(getChoicesType(gameName, choice)).toBe(`${gameName}.choices_type2`);
                });
                whiteChoices.forEach(choice => {
                    expect(getChoicesType(gameName, choice)).toBe(`${gameName}.choices_type2`);
                });
            });

            it('should return empty string for invalid choices', () => {
                // Arrange
                const gameName = SE_DIE_GAME_NAMESPACE;
                const invalidChoice = 'invalid_choice';

                // Act & Assert
                expect(getChoicesType(gameName, invalidChoice)).toBe('');
            });

            it('should work with VIP_SE_DIE_GAME_NAMESPACE', () => {
                // Arrange
                const gameName = VIP_SE_DIE_GAME_NAMESPACE;
                const oddChoice = SE_DIE_CHOICES.ODD;
                const redChoice = SE_DIE_CHOICES.RED4;

                // Act & Assert
                expect(getChoicesType(gameName, oddChoice)).toBe(`${gameName}.choices_type1`);
                expect(getChoicesType(gameName, redChoice)).toBe(`${gameName}.choices_type2`);
            });
        });

        describe('UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE', () => {
            it('should return choices_type for any choice', () => {
                // Arrange
                const gameName = UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE;
                const choices = ['choice1', 'choice2', 'choice3'];

                // Act & Assert
                choices.forEach(choice => {
                    expect(getChoicesType(gameName, choice)).toBe(`${gameName}.choices_type`);
                });
            });
        });

        describe('BACCARAT_GAME_NAMESPACE', () => {
            it('should return banker_player for PLAYER and BANKER choices', () => {
                // Arrange
                const gameName = BACCARAT_GAME_NAMESPACE;
                const playerChoice = BACCARAT_CHOICES.PLAYER;
                const bankerChoice = BACCARAT_CHOICES.BANKER;

                // Act & Assert
                expect(getChoicesType(gameName, playerChoice)).toBe(`${gameName}.banker_player`);
                expect(getChoicesType(gameName, bankerChoice)).toBe(`${gameName}.banker_player`);
            });

            it('should return banker_player_pair for PAIR choices', () => {
                // Arrange
                const gameName = BACCARAT_GAME_NAMESPACE;
                const playerPairChoice = BACCARAT_CHOICES.PLAYER_PAIR;
                const bankerPairChoice = BACCARAT_CHOICES.BANKER_PAIR;

                // Act & Assert
                expect(getChoicesType(gameName, playerPairChoice)).toBe(`${gameName}.banker_player_pair`);
                expect(getChoicesType(gameName, bankerPairChoice)).toBe(`${gameName}.banker_player_pair`);
            });

            it('should return glossary_tie for TIE choice', () => {
                // Arrange
                const gameName = BACCARAT_GAME_NAMESPACE;
                const tieChoice = BACCARAT_CHOICES.TIE;

                // Act & Assert
                expect(getChoicesType(gameName, tieChoice)).toBe(`${gameName}.glossary_tie`);
            });

            it('should return empty string for invalid choices', () => {
                // Arrange
                const gameName = BACCARAT_GAME_NAMESPACE;
                const invalidChoice = 'invalid_choice';

                // Act & Assert
                expect(getChoicesType(gameName, invalidChoice)).toBe('');
            });
        });

        it('should return default choices_type for unknown game namespace', () => {
            // Arrange
            const unknownGame = 'unknown_game';
            const anyChoice = 'any_choice';

            // Act & Assert
            expect(getChoicesType(unknownGame, anyChoice)).toBe('choices_type');
        });
    });
}); 
