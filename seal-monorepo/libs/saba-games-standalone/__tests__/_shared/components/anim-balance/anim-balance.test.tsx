import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as gc from '@sg/sg-game-client';
import AnimationBalance from 'libs/saba-games/src/_shared/components/anim-balance';

// Mock the game client dependencies
jest.mock('@sg/sg-game-client', () => ({
    FormatUtils: {
        numberWithCommas: jest.fn((num, decimals) => {
            return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        })
    }
}));

describe('AnimationBalance Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render win amount with correct formatting', () => {
        const winBet = 1000.5;
        render(<AnimationBalance winBet={winBet} />);

        const winAmount = screen.getByText(`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`);
        expect(winAmount).toBeInTheDocument();
        expect(winAmount).toHaveClass('win-amount');
    });

    it('should handle zero win amount', () => {
        const winBet = 0;
        render(<AnimationBalance winBet={winBet} />);

        const winAmount = screen.getByText(`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`);
        expect(winAmount).toBeInTheDocument();
        expect(winAmount).toHaveClass('win-amount');
    });

    it('should handle large numbers with correct formatting', () => {
        const winBet = 1000000.99;
        render(<AnimationBalance winBet={winBet} />);

        const winAmount = screen.getByText(`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`);
        expect(winAmount).toBeInTheDocument();
        expect(winAmount).toHaveClass('win-amount');
    });

    it('should handle negative numbers', () => {
        const winBet = -1000.5;
        render(<AnimationBalance winBet={winBet} />);

        const winAmount = screen.getByText(`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`);
        expect(winAmount).toBeInTheDocument();
        expect(winAmount).toHaveClass('win-amount');
    });

    it('should handle decimal numbers with correct rounding', () => {
        const winBet = 1000.567;
        render(<AnimationBalance winBet={winBet} />);

        const winAmount = screen.getByText(`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`);
        expect(winAmount).toBeInTheDocument();
        expect(winAmount).toHaveClass('win-amount');
    });
}); 
