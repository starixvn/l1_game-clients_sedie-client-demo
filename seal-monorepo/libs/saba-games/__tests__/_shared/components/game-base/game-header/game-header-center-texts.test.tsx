import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameHeaderCenterTexts from 'libs/saba-games/src/_shared/components/game-base/game-header/game-header-center-texts';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/game-base/game-header/game-header-center-texts.module.scss', () => ({
    'game-title-text-center-container': 'mock-container',
    'game-title-text-center': 'mock-text-center'
}));

describe('GameHeaderCenterTexts', () => {
    it('renders without crashing', () => {
        const { container } = render(<GameHeaderCenterTexts texts={[]} />);
        const containerElement = container.querySelector('.mock-container');
        expect(containerElement).toBeInTheDocument();
    });

    it('renders empty container when no texts provided', () => {
        const { container } = render(<GameHeaderCenterTexts texts={[]} />);
        const textElements = container.querySelectorAll('.mock-text-center');
        expect(textElements.length).toBe(0);
    });

    it('renders single text correctly', () => {
        const texts = ['Single Text'];
        render(<GameHeaderCenterTexts texts={texts} />);
        expect(screen.getByText('Single Text')).toBeInTheDocument();
    });

    it('renders multiple texts correctly', () => {
        const texts = ['Text 1', 'Text 2', 'Text 3'];
        render(<GameHeaderCenterTexts texts={texts} />);
        texts.forEach(text => {
            expect(screen.getByText(text)).toBeInTheDocument();
        });
    });

    it('applies correct grid template columns based on text count', () => {
        const texts = ['Text 1', 'Text 2', 'Text 3'];
        const { container } = render(<GameHeaderCenterTexts texts={texts} />);
        const containerElement = container.firstChild as HTMLElement;
        expect(containerElement.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('applies correct classes to container and text elements', () => {
        const texts = ['Test Text'];
        const { container } = render(<GameHeaderCenterTexts texts={texts} />);

        const containerElement = container.firstChild;
        expect(containerElement).toHaveClass('mock-container');

        const textElement = container.querySelector('.mock-text-center');
        expect(textElement).toBeInTheDocument();
    });
}); 
