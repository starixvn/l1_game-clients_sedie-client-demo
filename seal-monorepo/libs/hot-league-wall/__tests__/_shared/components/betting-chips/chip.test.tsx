import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chip from 'libs/saba-games/src/_shared/components/betting-chips/chip';

describe('Chip Component', () => {
    const defaultProps = {
        label: 'Test Chip',
        onClick: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with default props', () => {
        render(<Chip {...defaultProps} />);

        const chip = screen.getByText('Test Chip');
        expect(chip).toBeInTheDocument();
        expect(chip.closest('a')).toHaveStyle({ opacity: 1 });
    });

    it('should call onClick when clicked', () => {
        render(<Chip {...defaultProps} />);

        const chip = screen.getByText('Test Chip').closest('a');
        fireEvent.click(chip!);

        expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('should render with disabled state', () => {
        render(<Chip {...defaultProps} disabled={true} />);

        const chip = screen.getByText('Test Chip').closest('a');
        expect(chip).toHaveStyle({ opacity: 0.5 });
    });

    it('should render with custom label', () => {
        const customLabel = 'Custom Chip Label';
        render(<Chip {...defaultProps} label={customLabel} />);

        expect(screen.getByText(customLabel)).toBeInTheDocument();
    });
}); 
