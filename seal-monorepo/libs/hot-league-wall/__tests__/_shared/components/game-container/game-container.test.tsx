import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameContainer from 'libs/saba-games/src/_shared/components/game-container';

// Mock SCSS module
jest.mock('libs/saba-games/src/_shared/components/game-container/game-container.module.scss', () => ({
    'game-container': 'mock-game-container',
}));

describe('GameContainer Component', () => {
    it('should render children inside the container', () => {
        render(
            <GameContainer>
                <div>Test Child</div>
            </GameContainer>
        );

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should apply the correct class name from styles', () => {
        const { container } = render(
            <GameContainer>
                <span>Content</span>
            </GameContainer>
        );

        expect(container.firstChild).toHaveClass('mock-game-container');
    });
});
