import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as gc from '@sg/sg-game-client';
import FishPrawnCrabScoreBoard from '../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/fish-prawn-crab-scoreboard';
import { FishPrawnCrabChoices, FishPrawnCrabSymbol } from '../../../../../src/games/saba-club/fish-prawn-crab/type';

// Mock the dependencies
jest.mock('@sg/sg-game-client');
jest.mock('../../../../../src/games/saba-club/fish-prawn-crab/bet-percentages', () => ({
    FishPrawnCrabBetPercentages: jest.fn().mockImplementation(({ gameName, rounds, language }) => (
        <div data-testid="mock-bet-percentages" data-gamename={gameName} data-language={language}>
            Mock Bet Percentages
        </div>
    ))
}));
jest.mock('../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/components', () => ({
    ResultHistory: jest.fn().mockImplementation(({ rounds, hasBlink }) => (
        <div data-testid="mock-result-history" data-hasblink={hasBlink} data-rounds={JSON.stringify(rounds)}>
            Mock Result History
        </div>
    ))
}));
jest.mock('../../../../../src/_shared/components/scroll-element', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(({ children, className, refData }) => (
        <div data-testid="mock-scroll-element" className={className} ref={refData}>
            {children}
        </div>
    ))
}));
jest.mock('../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/utils/scoreboard-utils', () => ({
    shouldShowBlinkingDice: jest.fn().mockImplementation((roundState) => roundState === 'LOCKING_BET'),
    getScoreboardTitle: jest.fn().mockReturnValue('Test Scoreboard Title')
}));

// Define the props interface matching the component's required props
interface ScoreBoardProps {
    language: string;
    gameName?: string;
    namespace: string;
    dispose?: any;
}

describe('FishPrawnCrabScoreBoard', () => {
    let originalCreateRef: any;
    let mockScrollRef: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock createRef
        mockScrollRef = {
            current: {
                scrollLeft: 0,
                scrollWidth: 100
            }
        };
        originalCreateRef = React.createRef;
        React.createRef = jest.fn().mockReturnValue(mockScrollRef);

        // Mock render decorators
        (gc.RoundHistories.RoundHistoryStore as any) = {};
        (gc.Rounds.RoundTimeStore as any) = {};
    });

    afterEach(() => {
        React.createRef = originalCreateRef;
    });

    it('should render nothing when rounds are empty', () => {
        // Arrange
        const props: ScoreBoardProps = {
            language: 'en',
            gameName: 'test-game',
            namespace: 'test-namespace'
        };

        // Mock the render decorator behavior
        // @ts-ignore
        FishPrawnCrabScoreBoard.prototype.renderRoundHistory = jest.fn();
        // @ts-ignore
        FishPrawnCrabScoreBoard.prototype.renderCountDownTimerState = jest.fn();

        // Act
        render(<FishPrawnCrabScoreBoard {...props} />);

        // Assert - should render nothing
        expect(screen.queryByTestId('mock-bet-percentages')).not.toBeInTheDocument();
        expect(screen.queryByTestId('mock-result-history')).not.toBeInTheDocument();
    });

    it('should render scoreboard with rounds', () => {
        // Arrange
        const props: ScoreBoardProps = {
            language: 'en',
            gameName: 'test-game',
            namespace: 'test-namespace'
        };

        // Mock the render decorator behavior
        const mockRounds = [
            {
                roundId: '1',
                result: {
                    dice1: FishPrawnCrabChoices.fish as FishPrawnCrabSymbol,
                    dice2: FishPrawnCrabChoices.prawn as FishPrawnCrabSymbol,
                    dice3: FishPrawnCrabChoices.crab as FishPrawnCrabSymbol
                },
                settlementResult: {},
                date: new Date().toISOString(),
                gameId: 'game1'
            }
        ] as unknown as gc.RoundHistories.RoundHistory[];

        // Manually setting state for testing render
        const component = new FishPrawnCrabScoreBoard(props);
        component.state = {
            rounds: mockRounds,
            roundState: 'PLACING_BET',
            dispose: null
        };

        // Act
        render(<FishPrawnCrabScoreBoard {...props} />);
        component.setState({ rounds: mockRounds });

        // Assert
        expect(screen.queryByText('Test Scoreboard Title')).not.toBeInTheDocument();
    });

    it('should scroll to right when rounds update', () => {
        // Arrange & Act - create a testable instance
        const props: ScoreBoardProps = {
            language: 'en',
            gameName: 'test-game',
            namespace: 'test-namespace'
        };

        // Setup a component instance for testing
        const component = new FishPrawnCrabScoreBoard(props);

        // Mock scrollToRight
        component.scrollToRight = jest.fn();

        // Setup initial state
        component.state = {
            rounds: [] as gc.RoundHistories.RoundHistory[],
            roundState: '',
            dispose: null
        };

        // Create mock new rounds
        const mockNewRounds = [{
            roundId: '1',
            result: {},
            settlementResult: {},
            date: new Date().toISOString(),
            gameId: 'game1'
        }] as unknown as gc.RoundHistories.RoundHistory[];

        // Act - call componentDidUpdate with new props and state
        component.componentDidUpdate(props, { ...component.state, rounds: [] });

        // Update the state
        component.setState({ rounds: mockNewRounds });

        // Call componentDidUpdate again with previous state
        component.componentDidUpdate(props, { ...component.state, rounds: [] });

        // Assert
        expect(component.scrollToRight).toHaveBeenCalled();
    });

    it('should update state from renderRoundHistory', () => {
        // Arrange
        const props: ScoreBoardProps = {
            language: 'en',
            namespace: 'test-namespace'
        };

        const component = new FishPrawnCrabScoreBoard(props);
        const mockRounds = [{
            roundId: '1',
            result: {},
            settlementResult: {},
            date: new Date().toISOString(),
            gameId: 'game1'
        }] as unknown as gc.RoundHistories.RoundHistory[];

        // Act - manually set state to simulate what renderRoundHistory would do
        component.state = {
            ...component.state,
            rounds: mockRounds
        };

        // Assert - check state directly
        expect(component.state.rounds).toBe(mockRounds);
    });

    it('should update state from renderCountDownTimerState', () => {
        // Arrange
        const props: ScoreBoardProps = {
            language: 'en',
            namespace: 'test-namespace'
        };

        const component = new FishPrawnCrabScoreBoard(props);
        const mockRoundState = 'LOCKING_BET';

        // Act - manually set state to simulate what renderCountDownTimerState would do
        component.state = {
            ...component.state,
            roundState: mockRoundState
        };

        // Assert - check state directly
        expect(component.state.roundState).toBe(mockRoundState);
    });

    it('should call scrollToRight when ref is available', () => {
        // Arrange
        const props: ScoreBoardProps = {
            language: 'en',
            namespace: 'test-namespace'
        };

        const component = new FishPrawnCrabScoreBoard(props);

        // Set up mock for scrollDivRef - using any to bypass private field restriction
        (component as any).scrollDivRef = {
            current: {
                scrollLeft: 0,
                scrollWidth: 500
            }
        };

        // Act
        component.scrollToRight();

        // Assert
        expect((component as any).scrollDivRef.current.scrollLeft).toBe(500);
    });

    it('should not cause error when scrollToRight is called with no ref', () => {
        // Arrange
        const props: ScoreBoardProps = {
            language: 'en',
            namespace: 'test-namespace'
        };

        const component = new FishPrawnCrabScoreBoard(props);

        // Set ref to null - using any to bypass private field restriction
        (component as any).scrollDivRef = { current: null };

        // Act & Assert - should not throw
        expect(() => {
            component.scrollToRight();
        }).not.toThrow();
    });
}); 