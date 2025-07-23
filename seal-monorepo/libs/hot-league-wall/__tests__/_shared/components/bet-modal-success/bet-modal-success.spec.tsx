import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BetModalSuccess from '../../../../src/_shared/components/bet-modal-success';
import { SyncMemberSiteBalance } from '../../../../src/_shared/utils/callback-singleton/sync-member-site-balance';

// Mock the external dependencies
jest.mock('@sg/sg-game-client', () => ({
    FormatUtils: {
        numberWithCommas: jest.fn((num: number) => {
            // Handle undefined/null values gracefully
            if (num === undefined || num === null) {
                return '0';
            }
            // Handle NaN values
            if (isNaN(num)) {
                return 'NaN';
            }
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        })
    }
}));

jest.mock('../../../../src/_shared/utils/callback-singleton/sync-member-site-balance');

// Mock the CSS module
jest.mock('../../../../src/_shared/components/bet-modal-success/Success.module.scss', () => ({
    'stake-container': 'stake-container-class',
    'stake': 'stake-class'
}));

describe('BetModalSuccess', () => {
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
            render(<BetModalSuccess totalStake={100} />);

            const stakeElement = screen.getByText('-100');
            expect(stakeElement).toBeInTheDocument();
            expect(stakeElement).toHaveClass('stake-class');

            const containerElement = stakeElement.closest('div');
            expect(containerElement).toHaveClass('stake-container-class');
        });

        it('should render with zero totalStake', () => {
            render(<BetModalSuccess totalStake={0} />);

            const stakeElement = screen.getByText('-0');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should render with large numbers and proper formatting', () => {
            render(<BetModalSuccess totalStake={1234567} />);

            const stakeElement = screen.getByText('-1,234,567');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should render with decimal numbers', () => {
            render(<BetModalSuccess totalStake={99.99} />);

            const stakeElement = screen.getByText('-99.99');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should render with very large numbers', () => {
            render(<BetModalSuccess totalStake={999999999999} />);

            const stakeElement = screen.getByText('-999,999,999,999');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle decimal precision correctly', () => {
            render(<BetModalSuccess totalStake={100.567} />);

            const stakeElement = screen.getByText('-100.567');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle NaN values gracefully', () => {
            render(<BetModalSuccess totalStake={NaN} />);

            const stakeElement = screen.getByText('-NaN');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle Infinity values', () => {
            render(<BetModalSuccess totalStake={Infinity} />);

            const stakeElement = screen.getByText('-Infinity');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle negative Infinity values', () => {
            render(<BetModalSuccess totalStake={-Infinity} />);

            const stakeElement = screen.getByText('--Infinity');
            expect(stakeElement).toBeInTheDocument();
        });
    });

    describe('useEffect Behavior', () => {
        it('should call executeSyncBalance when component mounts', () => {
            render(<BetModalSuccess totalStake={500} />);

            expect(mockGetInstance).toHaveBeenCalledTimes(1);
            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(1);
            expect(mockExecuteSyncBalance).toHaveBeenCalledWith(500);
        });

        it('should call executeSyncBalance when totalStake prop changes', () => {
            const { rerender } = render(<BetModalSuccess totalStake={100} />);

            // Initial render
            expect(mockExecuteSyncBalance).toHaveBeenCalledWith(100);

            // Re-render with different totalStake
            rerender(<BetModalSuccess totalStake={200} />);

            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(2);
            expect(mockExecuteSyncBalance).toHaveBeenLastCalledWith(200);
        });

        it('should handle undefined totalStake in useEffect', () => {
            render(<BetModalSuccess totalStake={undefined} />);

            expect(mockExecuteSyncBalance).toHaveBeenCalledWith(undefined);
        });

        it('should call executeSyncBalance multiple times with different values', () => {
            const { rerender } = render(<BetModalSuccess totalStake={100} />);

            rerender(<BetModalSuccess totalStake={200} />);
            rerender(<BetModalSuccess totalStake={300} />);
            rerender(<BetModalSuccess totalStake={400} />);

            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(4);
            expect(mockExecuteSyncBalance).toHaveBeenNthCalledWith(1, 100);
            expect(mockExecuteSyncBalance).toHaveBeenNthCalledWith(2, 200);
            expect(mockExecuteSyncBalance).toHaveBeenNthCalledWith(3, 300);
            expect(mockExecuteSyncBalance).toHaveBeenNthCalledWith(4, 400);
        });

        it('should not call executeSyncBalance when totalStake prop remains the same', () => {
            const { rerender } = render(<BetModalSuccess totalStake={100} />);

            // Initial render
            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(1);

            // Re-render with same totalStake
            rerender(<BetModalSuccess totalStake={100} />);

            // Should still only be called once
            expect(mockExecuteSyncBalance).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined totalStake gracefully in rendering', () => {
            render(<BetModalSuccess totalStake={undefined} />);

            const stakeElement = screen.getByText('-0');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle null totalStake gracefully in rendering', () => {
            render(<BetModalSuccess totalStake={null} />);

            const stakeElement = screen.getByText('-0');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle negative numbers', () => {
            render(<BetModalSuccess totalStake={-100} />);

            const stakeElement = screen.getByText('--100');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle very small numbers', () => {
            render(<BetModalSuccess totalStake={0.01} />);

            const stakeElement = screen.getByText('-0.01');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle scientific notation numbers', () => {
            render(<BetModalSuccess totalStake={1e6} />);

            const stakeElement = screen.getByText('-1,000,000');
            expect(stakeElement).toBeInTheDocument();
        });

        it('should handle string numbers if supported', () => {
            render(<BetModalSuccess totalStake={'100.50' as any} />);

            const stakeElement = screen.getByText('-100.50');
            expect(stakeElement).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should render with correct HTML structure', () => {
            render(<BetModalSuccess totalStake={100} />);

            const container = screen.getByText('-100').closest('div');
            expect(container).toHaveClass('stake-container-class');
        });

        it('should have correct nested structure', () => {
            const { container } = render(<BetModalSuccess totalStake={100} />);

            const rootElement = container.firstChild as HTMLElement;
            expect(rootElement.tagName).toBe('DIV');
            expect(rootElement.children.length).toBe(1);

            const spanElement = rootElement.children[0] as HTMLElement;
            expect(spanElement.tagName).toBe('SPAN');
            expect(spanElement.textContent).toBe('-100');
        });

        it('should have correct CSS classes', () => {
            render(<BetModalSuccess totalStake={100} />);

            const container = screen.getByText('-100').closest('div');
            expect(container).toHaveClass('stake-container-class');

            const spanElement = screen.getByText('-100');
            expect(spanElement).toHaveClass('stake-class');
        });
    });

    describe('Accessibility', () => {
        it('should have semantic HTML structure', () => {
            render(<BetModalSuccess totalStake={100} />);

            const container = screen.getByText('-100').closest('div');
            expect(container).toBeInTheDocument();

            const spanElement = screen.getByText('-100');
            expect(spanElement.tagName).toBe('SPAN');
        });

        it('should display negative value with minus sign', () => {
            render(<BetModalSuccess totalStake={100} />);

            const stakeElement = screen.getByText('-100');
            expect(stakeElement).toBeInTheDocument();
            expect(stakeElement.textContent).toContain('-');
        });
    });
}); 