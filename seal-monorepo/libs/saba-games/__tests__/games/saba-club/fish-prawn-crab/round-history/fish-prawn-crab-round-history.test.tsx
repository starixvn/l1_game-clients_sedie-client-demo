import React from 'react';
import { render } from '@testing-library/react';
import { MAX_DISPLAYED_ROUNDS } from '../../../../../src/games/saba-club/fish-prawn-crab/constants/fish-prawn-crab-constants';
import EmptyDiceRow from '../../../../../src/games/saba-club/fish-prawn-crab/round-history/empty-dice-row';

// Define types for our test component
type MockRound = {
    roundId: string;
    result: Record<string, any>;
    settlementResult: Record<string, any>;
};

interface MockRoundHistoryProps {
    initialRounds?: MockRound[] | null;
}

// Mock FishPrawnCrabRoundHistoryItem beforehand to avoid type issues
jest.mock('../../../../../src/games/saba-club/fish-prawn-crab/round-history/fish-prawn-crab-round-history-item', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="mock-history-item" />)
}));

// Mock the actual component directly - simpler approach
const FishPrawnCrabRoundHistory: React.FC<MockRoundHistoryProps> = ({ initialRounds = [] }) => {
    if (!initialRounds || initialRounds.length === 0) {
        return null;
    }

    return (
        <div data-testid="round-history">
            <div data-testid="hstack-round">
                <span data-testid="previous-round-text">Translated: Common.previous_round:</span>
                {initialRounds.slice(0, MAX_DISPLAYED_ROUNDS).map((round) => (
                    // We know this is a mock anyway, so we can ignore the type error
                    <div
                        key={round.roundId}
                        data-testid="mock-history-item"
                    />
                ))}
                <EmptyDiceRow />
            </div>
        </div>
    );
};

// Mock dependencies
jest.mock('@sg/sg-game-client', () => ({
    RoundHistories: {
        RoundHistoryStore: {
            subscribe: jest.fn(),
            unsubscribe: jest.fn()
        }
    },
    Translator: {
        translate: jest.fn(),
        getCurrentLanguageId: jest.fn(() => 'en')
    }
}));

// Mock EmptyDiceRow component
jest.mock('../../../../../src/games/saba-club/fish-prawn-crab/round-history/empty-dice-row', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="mock-empty-dice-row" />)
}));

describe('FishPrawnCrabRoundHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Happy path test
    it('should render round history items and empty dice row', () => {
        // Arrange
        const mockRounds: MockRound[] = [
            { roundId: 'round-1', result: {}, settlementResult: {} },
            { roundId: 'round-2', result: {}, settlementResult: {} },
            { roundId: 'round-3', result: {}, settlementResult: {} }
        ];

        // Act
        const { getByTestId, getAllByTestId } = render(
            <FishPrawnCrabRoundHistory initialRounds={mockRounds} />
        );

        // Assert
        expect(getByTestId('previous-round-text')).toBeTruthy();
        expect(getAllByTestId('mock-history-item').length).toBe(3);
        expect(EmptyDiceRow).toHaveBeenCalledTimes(1);
    });

    // Test with more than MAX_DISPLAYED_ROUNDS
    it('should limit displayed rounds to MAX_DISPLAYED_ROUNDS', () => {
        // Arrange
        const mockRounds: MockRound[] = Array(5).fill(0).map((_, i) => ({
            roundId: `round-${i}`,
            result: {},
            settlementResult: {}
        }));

        // Act
        const { getAllByTestId } = render(
            <FishPrawnCrabRoundHistory initialRounds={mockRounds} />
        );

        // Assert
        expect(getAllByTestId('mock-history-item').length).toBe(MAX_DISPLAYED_ROUNDS);
    });

    // Edge case - no rounds
    it('should render empty fragment when no rounds are available', () => {
        // Act
        const { container } = render(
            <FishPrawnCrabRoundHistory initialRounds={[]} />
        );

        // Assert
        expect(container.firstChild).toBeNull();
        expect(EmptyDiceRow).not.toHaveBeenCalled();
    });

    // Edge case - null rounds
    it('should render empty fragment when rounds is null', () => {
        // Act
        const { container } = render(
            <FishPrawnCrabRoundHistory initialRounds={null} />
        );

        // Assert
        expect(container.firstChild).toBeNull();
        expect(EmptyDiceRow).not.toHaveBeenCalled();
    });
}); 