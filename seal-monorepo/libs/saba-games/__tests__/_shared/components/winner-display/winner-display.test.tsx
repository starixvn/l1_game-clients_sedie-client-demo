import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WinnerDisplay } from 'libs/saba-games/src/_shared/components/winner-display/winner-display';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/winner-display/winner-display.module.scss', () => ({
    'winner-display': 'mock-winner-display',
    'winner-text': 'mock-winner-text'
}));

describe('WinnerDisplay', () => {
    const defaultProps = {
        resultText: 'Test Winner'
    };

    it('renders without crashing', () => {
        render(<WinnerDisplay {...defaultProps} />);
        expect(screen.getByText('Test Winner')).toBeInTheDocument();
    });

    it('renders with correct text', () => {
        const customText = 'Custom Winner Text';
        render(<WinnerDisplay resultText={customText} />);
        expect(screen.getByText(customText)).toBeInTheDocument();
    });

    it('applies default className', () => {
        const { container } = render(<WinnerDisplay {...defaultProps} />);
        expect(container.firstChild).toHaveClass('mock-winner-display');
    });

    it('applies custom className', () => {
        const customClassName = 'custom-class';
        const { container } = render(
            <WinnerDisplay {...defaultProps} className={customClassName} />
        );
        expect(container.firstChild).toHaveClass('mock-winner-display');
        expect(container.firstChild).toHaveClass(customClassName);
    });

    it('renders with correct structure', () => {
        const { container } = render(<WinnerDisplay {...defaultProps} />);

        // Check wrapper div
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('mock-winner-display');

        // Check paragraph
        const paragraph = wrapper?.firstChild;
        expect(paragraph).toHaveClass('mock-winner-text');
        expect(paragraph).toHaveTextContent('Test Winner');
    });

    it('handles empty resultText', () => {
        const { container } = render(<WinnerDisplay resultText="" />);
        const paragraph = container.querySelector('.mock-winner-text');
        expect(paragraph).toBeInTheDocument();
        expect(paragraph).toBeEmptyDOMElement();
    });

    it('handles special characters in resultText', () => {
        const specialText = 'Winner! 🎉 $100';
        render(<WinnerDisplay resultText={specialText} />);
        expect(screen.getByText(specialText)).toBeInTheDocument();
    });
}); 
