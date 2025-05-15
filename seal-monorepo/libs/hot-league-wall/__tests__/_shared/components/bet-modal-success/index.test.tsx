import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BetModalSuccess from 'libs/saba-games/src/_shared/components/bet-modal-success';
import * as gc from '@sg/sg-game-client';

// Mock the FormatUtils from sg-game-client
jest.mock('@sg/sg-game-client', () => ({
    FormatUtils: {
        numberWithCommas: jest.fn((num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
    }
}));

describe('BetModalSuccess Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with correct total stake', () => {
        const totalStake = 1000;
        render(<BetModalSuccess totalStake={totalStake} />);

        const stakeContainer = screen.getByText(`-${gc.FormatUtils.numberWithCommas(totalStake)}`).parentElement;
        expect(stakeContainer).toBeInTheDocument();
        expect(stakeContainer).toHaveClass('stake-container');
    });

    it('should format large numbers with commas', () => {
        const totalStake = 1000000;
        render(<BetModalSuccess totalStake={totalStake} />);

        const stakeText = screen.getByText('-1,000,000');
        expect(stakeText).toBeInTheDocument();
        expect(stakeText).toHaveClass('stake');
    });

    it('should handle zero stake', () => {
        const totalStake = 0;
        render(<BetModalSuccess totalStake={totalStake} />);

        const stakeText = screen.getByText('-0');
        expect(stakeText).toBeInTheDocument();
        expect(stakeText).toHaveClass('stake');
    });

    it('should handle negative stake', () => {
        const totalStake = -1000;
        render(<BetModalSuccess totalStake={totalStake} />);

        const stakeText = screen.getByText('--1,000');
        expect(stakeText).toBeInTheDocument();
        expect(stakeText).toHaveClass('stake');
    });

    it('should apply correct CSS classes', () => {
        const totalStake = 1000;
        render(<BetModalSuccess totalStake={totalStake} />);

        const stakeContainer = screen.getByText(`-${gc.FormatUtils.numberWithCommas(totalStake)}`).parentElement;
        const stakeText = screen.getByText(`-${gc.FormatUtils.numberWithCommas(totalStake)}`);

        expect(stakeContainer).toHaveClass('stake-container');
        expect(stakeText).toHaveClass('stake');
    });

    it('should call numberWithCommas with correct argument', () => {
        const totalStake = 1000;
        render(<BetModalSuccess totalStake={totalStake} />);

        expect(gc.FormatUtils.numberWithCommas).toHaveBeenCalledWith(totalStake);
    });
}); 
