import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimationBalance from '../../../../src/_shared/components/anim-balance';
import { SyncMemberSiteBalance } from '../../../../src/_shared/utils/sync-member-site-balance';

// Mock the external dependencies
jest.mock('@sg/sg-game-client', () => ({
    FormatUtils: {
        numberWithCommas: jest.fn((num: number, decimals: number) => {
            // Handle undefined/null values gracefully
            if (num === undefined || num === null) {
                return '0.00';
            }
            return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        })
    }
}));

jest.mock('../../../../src/_shared/utils/sync-member-site-balance');

// Mock the CSS module
jest.mock('./balance.module.scss', () => ({
    'win-amount': 'win-amount-class'
}));

describe('AnimationBalance', () => {
    let mockExecuteSyncBalance: jest.Mock;
    let mockGetInstance: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockExecuteSyncBalance = jest.fn();
        mockGetInstance = jest.fn().mockReturnValue({
            executeSyncBalance: mockExecuteSyncBalance
        });
        
        (SyncMemberSiteBalance.getInstance as jest.Mock) = mockGetInstance;
    });

    describe('Component Rendering', () => {
        it('should render the component with correct structure and formatting', () => {
            render(<AnimationBalance winBet={100} />);
            
            const winAmountElement = screen.getByText('+100.00');
            expect(winAmountElement).toBeInTheDocument();
            expect(winAmountElement).toHaveClass('win-amount-class');
        });

        it('should render with zero winBet', () => {
            render(<AnimationBalance winBet={0} />);
            
            const winAmountElement = screen.getByText('+0.00');
            expect(winAmountElement).toBeInTheDocument();
        });

        it('should render with large numbers and proper formatting', () => {
            render(<AnimationBalance winBet={1234567.89} />);
            
            const winAmountElement = screen.getByText('+1,234,567.89');
            expect(winAmountElement).toBeInTheDocument();
        });

        it('should render with decimal numbers', () => {
            render(<AnimationBalance winBet={99.99} />);
            
            const winAmountElement = screen.getByText('+99.99');
            expect(winAmountElement).toBeInTheDocument();
        });
    });

    describe('useEffect Behavior', () => {
        it('should call executeSyncBalance when component mounts', () => {
            render(<AnimationBalance winBet={500} />);
            
            expect(mockGetInstance).toHaveBeenCalledTimes(1);
            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(1);
            expect(mockExecuteSyncBalance).toHaveBeenCalledWith(undefined, 500);
        });

        it('should call executeSyncBalance when winBet prop changes', () => {
            const { rerender } = render(<AnimationBalance winBet={100} />);
            
            // Initial render
            expect(mockExecuteSyncBalance).toHaveBeenCalledWith(undefined, 100);
            
            // Re-render with different winBet
            rerender(<AnimationBalance winBet={200} />);
            
            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(2);
            expect(mockExecuteSyncBalance).toHaveBeenLastCalledWith(undefined, 200);
        });

        it('should handle undefined winBet in useEffect', () => {
            render(<AnimationBalance winBet={undefined} />);
            
            expect(mockExecuteSyncBalance).toHaveBeenCalledWith(undefined, undefined);
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined winBet gracefully in rendering', () => {
            render(<AnimationBalance winBet={undefined} />);
            
            const winAmountElement = screen.getByText('+0.00');
            expect(winAmountElement).toBeInTheDocument();
        });

        it('should handle null winBet gracefully in rendering', () => {
            render(<AnimationBalance winBet={null} />);
            
            const winAmountElement = screen.getByText('+0.00');
            expect(winAmountElement).toBeInTheDocument();
        });

        it('should handle negative numbers', () => {
            render(<AnimationBalance winBet={-100} />);
            
            const winAmountElement = screen.getByText('+-100.00');
            expect(winAmountElement).toBeInTheDocument();
        });
    });
}); 