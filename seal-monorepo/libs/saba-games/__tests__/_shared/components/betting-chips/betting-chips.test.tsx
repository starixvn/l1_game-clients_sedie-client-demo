import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BettingChips from 'libs/saba-games/src/_shared/components/betting-chips';

describe('BettingChips Component', () => {
    const defaultProps = {
        min: 10,
        max: 1000,
        currentAmount: 0,
        onAmountChange: jest.fn(),
        t: jest.fn((key) => key),
        addCommas: jest.fn((num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all chips with correct labels', () => {
        render(<BettingChips {...defaultProps} />);

        expect(screen.getByText('Common.min_bet')).toBeInTheDocument();
        expect(screen.getByText('+100')).toBeInTheDocument(); // min * 10 = 10 * 10 = 100
        expect(screen.getByText('+500')).toBeInTheDocument(); // min * 50 = 10 * 50 = 500
        expect(screen.getByText('Common.max_bet')).toBeInTheDocument();
    });

    it('should call onAmountChange with min value when min bet chip is clicked', () => {
        render(<BettingChips {...defaultProps} />);

        const minBetChip = screen.getByText('Common.min_bet');
        fireEvent.click(minBetChip);

        expect(defaultProps.onAmountChange).toHaveBeenCalledWith(10);
    });

    it('should call onAmountChange with max value when max bet chip is clicked', () => {
        render(<BettingChips {...defaultProps} />);

        const maxBetChip = screen.getByText('Common.max_bet');
        fireEvent.click(maxBetChip);

        expect(defaultProps.onAmountChange).toHaveBeenCalledWith(1000);
    });

    it('should add amount to current amount when + chip is clicked', () => {
        render(<BettingChips {...defaultProps} currentAmount={50} />);

        const addChip = screen.getByText('+100'); // min * 10 = 100
        fireEvent.click(addChip);

        expect(defaultProps.onAmountChange).toHaveBeenCalledWith(150); // 50 + 100
    });

    it('should disable + chips when adding would exceed max', () => {
        render(<BettingChips {...defaultProps} currentAmount={950} />);

        const addChip = screen.getByText('+100'); // min * 10 = 100
        expect(addChip.closest('a')).toHaveStyle({ opacity: 0.5 });
    });

    it('should format large numbers with K suffix', () => {
        const props = {
            ...defaultProps,
            min: 1000,
            max: 10000,
        };

        render(<BettingChips {...props} />);

        expect(screen.getByText('+10K')).toBeInTheDocument(); // min * 10 = 1000 * 10 = 10000
        expect(screen.getByText('+50K')).toBeInTheDocument(); // min * 50 = 1000 * 50 = 50000
    });

    it('should handle different min and max values', () => {
        const props = {
            ...defaultProps,
            min: 5,
            max: 500,
        };

        render(<BettingChips {...props} />);

        expect(screen.getByText('+50')).toBeInTheDocument(); // min * 10 = 5 * 10 = 50
        expect(screen.getByText('+250')).toBeInTheDocument(); // min * 50 = 5 * 50 = 250
    });

    it('should handle current amount at max value', () => {
        render(<BettingChips {...defaultProps} currentAmount={1000} />);

        const addChip = screen.getByText('+100'); // min * 10 = 100
        expect(addChip.closest('a')).toHaveStyle({ opacity: 0.5 });
    });

    it('should handle current amount near max value', () => {
        render(<BettingChips {...defaultProps} currentAmount={950} />);

        const addChip = screen.getByText('+100'); // min * 10 = 100
        expect(addChip.closest('a')).toHaveStyle({ opacity: 0.5 });
    });

    it('should handle translation function', () => {
        const customT = jest.fn((key) => `translated_${key}`);
        render(<BettingChips {...defaultProps} t={customT} />);

        expect(screen.getByText('translated_Common.min_bet')).toBeInTheDocument();
        expect(screen.getByText('translated_Common.max_bet')).toBeInTheDocument();
    });
}); 
