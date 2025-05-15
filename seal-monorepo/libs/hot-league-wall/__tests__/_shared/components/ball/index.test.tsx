import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import Ball, { BallStatus } from '../../../../src/_shared/components/ball';
import { getBallColor } from '../../../../src/_shared/components/ball/ball-color-helper';

// Mock the ball-color-helper
jest.mock('../../../../src/_shared/components/ball/ball-color-helper', () => ({
    getBallColor: jest.fn((num) => num % 2 === 0 ? 'red' : 'blue')
}));

// Mock the @sg/sg-game-client dependency
jest.mock('@sg/sg-game-client/dist/game-turn-base/rounds', () => ({
    TURN_ROUND_STATE: {
        SHOW_RESULT: 'SHOW_RESULT'
    }
}));

jest.useFakeTimers();

describe('Ball Component', () => {
    const defaultProps = {
        number: 5,
        delayTime: 1000,
        ballIndex: 0
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should render with default props', () => {
        render(<Ball {...defaultProps} />);

        const ballElement = document.querySelector('.ball');
        expect(ballElement).toBeInTheDocument();
        expect(ballElement).toHaveClass('active');
        expect(ballElement).toHaveClass('delay');
    });

    it('should show ball number after delay', () => {
        const incrementTotalPoint = jest.fn();
        render(<Ball {...defaultProps} incrementTotalPoint={incrementTotalPoint} />);

        // Initially, the ball number should not be visible
        expect(screen.queryByText('5')).not.toBeInTheDocument();

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // After delay, the ball number should be visible
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(incrementTotalPoint).toHaveBeenCalledWith(5);
    });

    it('should apply correct status classes', () => {
        const { rerender } = render(<Ball {...defaultProps} status={BallStatus.NONE} />);
        const ballElement = document.querySelector('.ball');
        expect(ballElement).toHaveClass('blur');

        rerender(<Ball {...defaultProps} status={BallStatus.SHOW} />);
        expect(ballElement).toHaveClass('active');

        // Fast-forward time to show the ball content
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        const ballContent = screen.getByText('5').parentElement;
        expect(ballContent).toHaveClass('display-right-now');
    });

    it('should handle round base state correctly', () => {
        const incrementTotalPoint = jest.fn();
        render(
            <Ball
                {...defaultProps}
                isRoundBase={true}
                roundState="SHOW_RESULT"
                incrementTotalPoint={incrementTotalPoint}
            />
        );

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(incrementTotalPoint).toHaveBeenCalledWith(5);
    });

    it('should not show result when round state is not SHOW_RESULT', () => {
        const incrementTotalPoint = jest.fn();
        render(
            <Ball
                {...defaultProps}
                isRoundBase={true}
                roundState="OTHER_STATE"
                incrementTotalPoint={incrementTotalPoint}
            />
        );

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(incrementTotalPoint).not.toHaveBeenCalled();
    });

    it('should apply custom delay class name', () => {
        render(<Ball {...defaultProps} delayClassName="custom-delay" />);

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        const ballContent = screen.getByText('5').parentElement;
        expect(ballContent).toHaveClass('custom-delay');
    });

    it('should not show ball when number is 0', () => {
        render(<Ball {...defaultProps} number={0} />);

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should cleanup timeout on unmount', () => {
        const { unmount } = render(<Ball {...defaultProps} />);

        unmount();

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // No errors should occur
    });

    it('should apply correct ball color based on number', () => {
        // Clear any previous mock calls
        (getBallColor as jest.Mock).mockClear();

        // Render with number 4 which should get a "red" color
        render(<Ball {...defaultProps} number={4} />);

        // Fast-forward time to ensure component fully renders
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Verify the getBallColor function was called with number 4
        expect(getBallColor).toHaveBeenCalledWith(4);

        // Get the ball content and verify it has the "red" class
        const ballContent = screen.getByText('4').parentElement;
        expect(ballContent).toHaveClass('red');
    });

    it('should handle different ball indices', () => {
        render(<Ball {...defaultProps} ballIndex={2} />);

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        const ballNumber = screen.getByText('5');
        expect(ballNumber).toHaveClass('ball-index-3');
    });
}); 
