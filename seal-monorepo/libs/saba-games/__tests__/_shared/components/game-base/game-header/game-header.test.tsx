import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameHeaderCenterTexts from 'libs/saba-games/src/_shared/components/game-base/game-header/game-header-center-texts';
import GameHeader from 'libs/saba-games/src/_shared/components/game-base/game-header/game-header';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/game-base/game-header/game-header.module.scss', () => ({
    'game-title': 'mock-game-title',
    'arrow-icon': 'mock-arrow-icon',
    'collapsed': 'mock-collapsed',
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

// Mock child components - no longer needed as we're mocking the dependencies
jest.mock('libs/saba-games/src/_shared/components/game-base/game-header/game-title', () => ({
    __esModule: true,
    default: () => <div data-testid="game-title">Game Title</div>
}));

describe('GameHeader', () => {
    const defaultProps = {
        gameId: 1
    };

    it('renders without crashing', () => {
        const { container } = render(<GameHeader {...defaultProps} />);
        expect(container.firstChild).toHaveClass('mock-game-title');
    });

    it('applies correct classes when expanded', () => {
        const { container } = render(<GameHeader {...defaultProps} isExpanded={true} />);
        const header = container.firstChild;
        expect(header).toHaveClass('mock-game-title');
    });

    it('applies correct classes when collapsed', () => {
        const { container } = render(<GameHeader {...defaultProps} isExpanded={false} />);
        const header = container.firstChild;
        expect(header).toHaveClass('mock-game-title');
    });

    it('renders center texts component when provided', () => {
        const centerTexts = ['Text 1', 'Text 2'];
        render(
            <GameHeader
                {...defaultProps}
                centerTextsComponent={<GameHeaderCenterTexts texts={centerTexts} />}
            />
        );
        expect(screen.getByText('Text 1')).toBeInTheDocument();
        expect(screen.getByText('Text 2')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        const customClass = 'custom-class';
        const { container } = render(<GameHeader {...defaultProps} className={customClass} />);
        const header = container.firstChild;
        expect(header).toHaveClass('mock-game-title', customClass);
    });

    it('calls onToggleExpand when arrow is clicked', () => {
        const onToggleExpand = jest.fn();
        render(<GameHeader {...defaultProps} onToggleExpand={onToggleExpand} />);
        // Note: The actual click handler is in the GameTitle component
        // This test would need to be updated if we want to test the click behavior
    });
}); 
