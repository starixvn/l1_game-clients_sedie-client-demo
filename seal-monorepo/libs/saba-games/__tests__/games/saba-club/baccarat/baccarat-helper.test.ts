import * as gc from "@sg/sg-game-client";
import { Choices, BaccaratConfigs, StatisticRuleEntriesBankerPlayer, StatisticRuleMapping, GetTranslateChoiceMapping, ChoiceForTabActive } from 'libs/saba-games/src/games/saba-club/baccarat/baccarat-helper';

// Mock the Translator
jest.mock('@sg/sg-game-client', () => ({
    Translator: {
        t: jest.fn((key) => key)
    }
}));

describe('baccarat-helper', () => {
    describe('Choices', () => {
        it('should have correct choice values', () => {
            expect(Choices.banker).toBe('banker');
            expect(Choices.player).toBe('player');
            expect(Choices.tie).toBe('tie');
            expect(Choices.bankerPair).toBe('bankerPair');
            expect(Choices.playerPair).toBe('playerPair');
        });
    });

    describe('BaccaratConfigs', () => {
        it('should have correct number of choices', () => {
            expect(BaccaratConfigs.choices).toHaveLength(5);
        });

        it('should have correct choice configurations', () => {
            const playerChoice = BaccaratConfigs.choices.find(c => c.name === 'player');
            expect(playerChoice).toBeDefined();
            expect(playerChoice?.style).toBe('player');
            expect(playerChoice?.label()).toBe('Baccarat.glossary_player');

            const bankerChoice = BaccaratConfigs.choices.find(c => c.name === 'banker');
            expect(bankerChoice).toBeDefined();
            expect(bankerChoice?.style).toBe('banker');
            expect(bankerChoice?.label()).toBe('Baccarat.glossary_banker');

            const tieChoice = BaccaratConfigs.choices.find(c => c.name === 'tie');
            expect(tieChoice).toBeDefined();
            expect(tieChoice?.style).toBe('tie');
            expect(tieChoice?.label()).toBe('Baccarat.glossary_tie');

            const playerPairChoice = BaccaratConfigs.choices.find(c => c.name === 'playerPair');
            expect(playerPairChoice).toBeDefined();
            expect(playerPairChoice?.style).toBe('player-pair');
            expect(playerPairChoice?.label()).toBe('Baccarat.glossary_playerPair');

            const bankerPairChoice = BaccaratConfigs.choices.find(c => c.name === 'bankerPair');
            expect(bankerPairChoice).toBeDefined();
            expect(bankerPairChoice?.style).toBe('bank-pair');
            expect(bankerPairChoice?.label()).toBe('Baccarat.glossary_bankerPair');
        });
    });

    describe('StatisticRuleEntriesBankerPlayer', () => {
        it('should calculate correct percentages for player wins', () => {
            const playerRule = StatisticRuleEntriesBankerPlayer.find(([key]) => key === Choices.player)?.[1];
            expect(playerRule).toBeDefined();
            expect(playerRule?.({ player: 3 }, 10)).toBe(30);
            expect(playerRule?.({ player: 0 }, 10)).toBe(0);
        });

        it('should calculate correct percentages for tie', () => {
            const tieRule = StatisticRuleEntriesBankerPlayer.find(([key]) => key === Choices.tie)?.[1];
            expect(tieRule).toBeDefined();
            expect(tieRule?.({ tie: 2 }, 10)).toBe(20);
            expect(tieRule?.({ tie: 0 }, 10)).toBe(0);
        });

        it('should calculate correct percentages for banker wins', () => {
            const bankerRule = StatisticRuleEntriesBankerPlayer.find(([key]) => key === Choices.banker)?.[1];
            expect(bankerRule).toBeDefined();
            expect(bankerRule?.({ player: 3, tie: 2 }, 10)).toBe(50);
            expect(bankerRule?.({ player: 0, tie: 0 }, 10)).toBe(100);
        });
    });

    describe('StatisticRuleMapping', () => {
        it('should contain StatisticRuleEntriesBankerPlayer', () => {
            expect(StatisticRuleMapping).toHaveLength(1);
            expect(StatisticRuleMapping[0]).toBe(StatisticRuleEntriesBankerPlayer);
        });
    });

    describe('GetTranslateChoiceMapping', () => {
        it('should return correct translations for default game name', () => {
            const mapping = GetTranslateChoiceMapping();
            expect(mapping.player).toBe('Baccarat.glossary_player');
            expect(mapping.banker).toBe('Baccarat.glossary_banker');
            expect(mapping.tie).toBe('Baccarat.glossary_tie');
            expect(mapping.playerPair).toBe('Baccarat.glossary_playerPair');
            expect(mapping.bankerPair).toBe('Baccarat.glossary_bankerPair');
        });

        it('should return correct translations for custom game name', () => {
            const mapping = GetTranslateChoiceMapping('CustomBaccarat');
            expect(mapping.player).toBe('CustomBaccarat.glossary_player');
            expect(mapping.banker).toBe('CustomBaccarat.glossary_banker');
            expect(mapping.tie).toBe('CustomBaccarat.glossary_tie');
            expect(mapping.playerPair).toBe('CustomBaccarat.glossary_playerPair');
            expect(mapping.bankerPair).toBe('CustomBaccarat.glossary_bankerPair');
        });
    });

    describe('ChoiceForTabActive', () => {
        it('should have correct choices for active tab', () => {
            expect(ChoiceForTabActive).toHaveLength(1);
            expect(ChoiceForTabActive[0].choice).toEqual(['banker', 'player', 'tie']);
        });
    });
}); 
