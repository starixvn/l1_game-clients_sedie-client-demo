import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BetPercentages } from 'libs/saba-games/src/_shared/components/bet-percentages';
import { Translator } from '@sg/sg-game-client';

// Mock the Translator
jest.mock('@sg/sg-game-client', () => ({
    Translator: {
        t: jest.fn((key) => key)
    }
}));

describe('BetPercentages Component', () => {
    const defaultProps = {
        gameName: 'test-game',
        settlements: [],
        scoreboardCharacter: {
            positiveItemContent: 'player',
            negativeItemContent: 'banker'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with empty settlements', () => {
        render(<BetPercentages {...defaultProps} />);

        expect(screen.getByText('test-game.glossary_player 0%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_banker 0%')).toBeInTheDocument();
    });

    it('should calculate correct percentages for player wins', () => {
        const settlements = [
            { player: true, banker: false },
            { player: true, banker: false },
            { player: false, banker: true },
            { player: true, banker: false }
        ];

        render(
            <BetPercentages
                {...defaultProps}
                settlements={settlements}
            />
        );

        expect(screen.getByText('test-game.glossary_player 75%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_banker 25%')).toBeInTheDocument();
    });

    it('should calculate correct percentages for banker wins', () => {
        const settlements = [
            { player: false, banker: true },
            { player: false, banker: true },
            { player: true, banker: false },
            { player: false, banker: true }
        ];

        render(
            <BetPercentages
                {...defaultProps}
                settlements={settlements}
            />
        );

        expect(screen.getByText('test-game.glossary_player 25%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_banker 75%')).toBeInTheDocument();
    });

    it('should handle equal wins', () => {
        const settlements = [
            { player: true, banker: false },
            { player: false, banker: true },
            { player: true, banker: false },
            { player: false, banker: true }
        ];

        render(
            <BetPercentages
                {...defaultProps}
                settlements={settlements}
            />
        );

        expect(screen.getByText('test-game.glossary_player 50%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_banker 50%')).toBeInTheDocument();
    });

    it('should handle custom scoreboard characters', () => {
        const customProps = {
            ...defaultProps,
            scoreboardCharacter: {
                positiveItemContent: 'red',
                negativeItemContent: 'black'
            },
            settlements: [
                { red: true, black: false },
                { red: true, black: false },
                { red: false, black: true }
            ]
        };

        render(<BetPercentages {...customProps} />);

        expect(screen.getByText('test-game.glossary_red 66.67%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_black 33.33%')).toBeInTheDocument();
    });

    it('should handle large number of settlements', () => {
        const settlements = Array(1000).fill({ player: true, banker: false });
        settlements[0] = { player: false, banker: true }; // One banker win

        render(
            <BetPercentages
                {...defaultProps}
                settlements={settlements}
            />
        );

        expect(screen.getByText('test-game.glossary_player 99.9%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_banker 0.1%')).toBeInTheDocument();
    });

    it('should handle decimal precision correctly', () => {
        const settlements = [
            { player: true, banker: false },
            { player: true, banker: false },
            { player: true, banker: false },
            { player: true, banker: false },
            { player: true, banker: false },
            { player: false, banker: true }
        ];

        render(
            <BetPercentages
                {...defaultProps}
                settlements={settlements}
            />
        );

        expect(screen.getByText('test-game.glossary_player 83.33%')).toBeInTheDocument();
        expect(screen.getByText('test-game.glossary_banker 16.67%')).toBeInTheDocument();
    });

    it('should handle different game names', () => {
        const customProps = {
            ...defaultProps,
            gameName: 'baccarat',
            settlements: [
                { player: true, banker: false },
                { player: false, banker: true }
            ]
        };

        render(<BetPercentages {...customProps} />);

        expect(screen.getByText('baccarat.glossary_player 50%')).toBeInTheDocument();
        expect(screen.getByText('baccarat.glossary_banker 50%')).toBeInTheDocument();
    });
}); 
