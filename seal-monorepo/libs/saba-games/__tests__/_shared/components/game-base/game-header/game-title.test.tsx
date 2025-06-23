import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameTitle from 'libs/saba-games/src/_shared/components/game-base/game-header/game-title';
import * as gc from '@sg/sg-game-client';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/game-base/game-header/game-header.module.scss', () => ({
    'title-with-icon': 'mock-title-with-icon',
    'collapse-btn': 'mock-collapse-btn',
    'collapse-icon': 'mock-collapse-icon',
    'divider': 'mock-divider',
    'game-icon-1': 'mock-game-icon-1'
}));

// Mock getGameSetting
jest.mock('libs/saba-games/src/_shared/app-settings', () => ({
    getGameSetting: jest.fn().mockReturnValue({
        gameName: 'test-game'
    })
}));

// Mock Translator
jest.mock('@sg/sg-game-client', () => ({
    Translator: {
        t: jest.fn().mockImplementation((key) => {
            if (key === 'test-game.game_name') {
                return 'Test Game';
            }
            return key;
        })
    }
}));

describe('GameTitle', () => {
    const defaultProps = {
        gameId: 1
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('renders game icon with correct class', () => {
        const { container } = render(<GameTitle {...defaultProps} />);
        const gameIcon = container.querySelector('.mock-game-icon-1');
        expect(gameIcon).toBeInTheDocument();
    });

    it('renders collapse button with correct classes', () => {
        const { container } = render(<GameTitle {...defaultProps} />);
        const collapseBtn = container.querySelector('.mock-collapse-btn');
        expect(collapseBtn).toBeInTheDocument();
    });

    it('renders divider', () => {
        const { container } = render(<GameTitle {...defaultProps} />);
        const divider = container.querySelector('.mock-divider');
        expect(divider).toBeInTheDocument();
    });

    it('calls onClick when collapse button is clicked', () => {
        const onClick = jest.fn();
        const arrowProps = {
            onClick
        };
        const { container } = render(<GameTitle {...defaultProps} arrowProps={arrowProps} />);
        const collapseBtn = container.querySelector('.mock-collapse-btn');
        expect(collapseBtn).toBeInTheDocument();
        fireEvent.click(collapseBtn!);
        expect(onClick).toHaveBeenCalled();
    });
}); 
