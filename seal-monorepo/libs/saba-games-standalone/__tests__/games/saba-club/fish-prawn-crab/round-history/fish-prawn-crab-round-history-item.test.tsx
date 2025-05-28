import React from 'react';
import { render } from '@testing-library/react';
import { FishPrawnCrabRoundHistoryItem } from '../../../../../src/games/saba-club/fish-prawn-crab/round-history/fish-prawn-crab-round-history-item';
import { Size } from '../../../../../src/_shared/constants';
import FishPrawnCrabDice from '../../../../../src/_shared/components/fish-prawn-crab-dice';

// Mock dependencies
jest.mock('../../../../../src/_shared/components/fish-prawn-crab-dice', () => {
    return jest.fn(() => <div data-testid="mock-dice" />);
});

describe('FishPrawnCrabRoundHistoryItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Happy path test - with valid round history
    it('should render dice and arrow with round history data', () => {
        // Arrange
        const mockRoundHistory = {
            roundId: 'round-123',
            result: {
                dice1: 'fish',
                dice2: 'prawn',
                dice3: 'crab'
            },
            settlementResult: {
                fish: true
            }
        };

        // Act
        const { container, getAllByTestId } = render(
            <FishPrawnCrabRoundHistoryItem roundHistory={mockRoundHistory as any} />
        );

        // Assert
        expect(getAllByTestId('mock-dice').length).toBe(3);
        expect(FishPrawnCrabDice).toHaveBeenCalledTimes(3);
        expect(FishPrawnCrabDice).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                symbol: 'fish',
                size: Size.medium
            }),
            expect.anything()
        );
        expect(FishPrawnCrabDice).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                symbol: 'prawn',
                size: Size.medium
            }),
            expect.anything()
        );
        expect(FishPrawnCrabDice).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                symbol: 'crab',
                size: Size.medium
            }),
            expect.anything()
        );

        // Check for arrow element
        expect(container.querySelector('.arrow')).not.toBeNull();
    });

    // Edge case - missing result
    it('should render empty fragment when result is missing', () => {
        // Arrange
        const mockRoundHistory = {
            roundId: 'round-123',
            result: null,
            settlementResult: {
                fish: true
            }
        };

        // Act
        const { container } = render(
            <FishPrawnCrabRoundHistoryItem roundHistory={mockRoundHistory as any} />
        );

        // Assert
        expect(container.firstChild).toBeNull();
        expect(FishPrawnCrabDice).not.toHaveBeenCalled();
    });

    // Edge case - missing settlementResult
    it('should render empty fragment when settlementResult is missing', () => {
        // Arrange
        const mockRoundHistory = {
            roundId: 'round-123',
            result: {
                dice1: 'fish',
                dice2: 'prawn',
                dice3: 'crab'
            },
            settlementResult: null
        };

        // Act
        const { container } = render(
            <FishPrawnCrabRoundHistoryItem roundHistory={mockRoundHistory as any} />
        );

        // Assert
        expect(container.firstChild).toBeNull();
        expect(FishPrawnCrabDice).not.toHaveBeenCalled();
    });

    // Edge case - both result and settlementResult missing
    it('should render empty fragment when both result and settlementResult are missing', () => {
        // Arrange
        const mockRoundHistory = {
            roundId: 'round-123'
        };

        // Act
        const { container } = render(
            <FishPrawnCrabRoundHistoryItem roundHistory={mockRoundHistory as any} />
        );

        // Assert
        expect(container.firstChild).toBeNull();
        expect(FishPrawnCrabDice).not.toHaveBeenCalled();
    });

    // Edge case - empty result object but not null
    it('should render when result is empty object but not null', () => {
        // Arrange
        const mockRoundHistory = {
            roundId: 'round-123',
            result: {},
            settlementResult: { fish: true }
        };

        // Act
        const { container, queryAllByTestId } = render(
            <FishPrawnCrabRoundHistoryItem roundHistory={mockRoundHistory as any} />
        );

        // Assert
        expect(container.firstChild).not.toBeNull();
        expect(queryAllByTestId('mock-dice').length).toBe(3);
        // The dice should be called with undefined symbols
        expect(FishPrawnCrabDice).toHaveBeenCalledWith(
            expect.objectContaining({
                symbol: undefined
            }),
            expect.anything()
        );
    });

    // Edge case - empty settlementResult object but not null
    it('should render when settlementResult is empty object but not null', () => {
        // Arrange
        const mockRoundHistory = {
            roundId: 'round-123',
            result: {
                dice1: 'fish',
                dice2: 'prawn',
                dice3: 'crab'
            },
            settlementResult: {}
        };

        // Act
        const { container, getAllByTestId } = render(
            <FishPrawnCrabRoundHistoryItem roundHistory={mockRoundHistory as any} />
        );

        // Assert
        expect(container.firstChild).not.toBeNull();
        expect(getAllByTestId('mock-dice').length).toBe(3);
    });
}); 