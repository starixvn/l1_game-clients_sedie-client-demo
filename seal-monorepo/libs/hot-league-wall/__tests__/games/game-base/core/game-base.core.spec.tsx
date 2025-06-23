// Mock dependencies first before any imports
jest.mock('@sg/sg-observer', () => ({
    handle: () => jest.fn(),
    render: () => jest.fn(),
}));

jest.mock('@sg/sg-game-client', () => ({
    Connection: {
        ConnectionHandlers: {
            CloseConnectHandler: 'CLOSE_CONNECT_HANDLER',
            InGameHandler: 'IN_GAME_HANDLER',
        },
        ConnectionStore: {},
    },
    GatewayConnection: {
        GatewayConnectionHandlers: {
            ConnectHandler: 'CONNECT_HANDLER',
        },
    },
    DisabledGame: {
        DisabledGameStore: {},
    },
    GameConfigs: {
        GameConfigStore: {},
    },
    GameServiceMessage: {
        TResult: jest.fn(),
        TSettlementResult: jest.fn(),
    },
}));

jest.mock('../../../../src/_shared/react-contexts/game-context/game-context', () => ({
    GameContextProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="game-context-provider">{children}</div>,
}));

jest.mock('../../../../src/games/game-base/game-container', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="game-container">{children}</div>,
}));

jest.mock('../../../../src/games/game-base/services', () => ({
    GameConnectionService: {
        handleReconnect: jest.fn(),
    },
}));

jest.mock('../../../../src/games/game-base/components', () => ({
    GameDisconnectView: ({ onReconnect }: { onReconnect: () => void }) => (
        <div data-testid="game-disconnect-view">
            <button data-testid="reconnect-button" onClick={onReconnect}>
                Reconnect
            </button>
        </div>
    ),
    GameLoadingView: () => <div data-testid="game-loading-view">Loading...</div>,
}));

// Import dependencies after mocks
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBase from '../../../../src/games/game-base/core/game-base.core';
import * as gc from '@sg/sg-game-client';
import { GameConnectionService } from '../../../../src/games/game-base/services';
import { IGameBaseState, GameStyleOverrides } from '../../../../src/games/game-base/interfaces';
import { GameBaseProps } from '../../../../src/games/game-base/type';

// Create our own props type for the test
type TestGameProps = {
    namespace: string;
    gameId: number;
    minBet: number;
    maxBet: number;
    balanceSymbol: string;
    language: string;
};

// Create a class for testing state transitions
class TestableGameBase extends GameBase<TestGameProps, IGameBaseState> {
    closeConnect = jest.fn();
    joinGame = jest.fn();
    connectLiveGateway = jest.fn();
    processAuthorizationIfRoundMatches = jest.fn();
    showResult = jest.fn().mockResolvedValue(undefined);
    renderGameLayout = jest.fn(() => <div data-testid="game-layout">Game Layout</div>);
    renderNotice = jest.fn(() => <div data-testid="game-notice">Game Notice</div>);

    // Override setState for testing
    setState<K extends keyof IGameBaseState>(
        state: IGameBaseState | ((prevState: Readonly<IGameBaseState>, props: Readonly<TestGameProps>) => IGameBaseState | Pick<IGameBaseState, K> | null) | Pick<IGameBaseState, K> | null,
        callback?: () => void
    ): void {
        if (typeof state === 'function') {
            const updater = state as Function;
            this.state = { ...this.state, ...updater(this.state, this.props) };
        } else {
            this.state = { ...this.state, ...(state as Partial<IGameBaseState>) };
        }
        if (callback) {
            callback();
        }
    }

    // Override these methods for testing specific scenarios
    protected getGameLayout(): JSX.Element | null {
        // Return null by default to test standard layout flow
        return null;
    }

    protected getGameHeaderSection(): JSX.Element {
        return <div data-testid="game-header">Header</div>;
    }

    protected getGameContentSection(): JSX.Element {
        return <div data-testid="game-content">Content</div>;
    }

    protected getGameFooterSection(): JSX.Element {
        return <div data-testid="game-footer">Footer</div>;
    }

    protected getGameHistorySection(): JSX.Element {
        return <div data-testid="game-history">History</div>;
    }

    public testRender(state: Partial<IGameBaseState>) {
        // Update the component state
        this.state = { ...this.state, ...state };

        // Call the actual render method that we're testing
        return this.getRenderTemplate();
    }

    public getState(): IGameBaseState {
        return this.state;
    }
}

// Create a version that overrides getGameLayout for testing custom layouts
class TestableGameBaseWithCustomLayout extends TestableGameBase {
    protected getGameLayout(): JSX.Element {
        return <div data-testid="custom-game-layout">Custom Game Layout</div>;
    }
}

describe('GameBase', () => {
    let gameBase: TestableGameBase;
    let gameBaseWithCustomLayout: TestableGameBaseWithCustomLayout;
    const mockProps: TestGameProps = {
        namespace: 'test-namespace',
        gameId: 123,
        minBet: 10,
        maxBet: 1000,
        balanceSymbol: '$',
        language: 'en'
    };

    beforeEach(() => {
        // Reset mocks between tests
        jest.clearAllMocks();

        // Initialize test instances with a properly initialized state
        gameBase = new TestableGameBase(mockProps);
        gameBase.setState({
            isConnectFailed: false,
            isConnected: false,
            initialized: false,
            showDisabledPopup: false,
            isOpenStatistic: false,
            isFinishShowResult: false,
            activePanelId: null,
            showBetPanel: false,
            isShowNextRoundMessage: false,
            roundId: 0,
            isAllowedBet: false,
            isPopupVisible: false,
            gameId: 0,
            roundState: '',
        });

        gameBaseWithCustomLayout = new TestableGameBaseWithCustomLayout(mockProps);
        gameBaseWithCustomLayout.setState({
            isConnectFailed: false,
            isConnected: false,
            initialized: false,
            showDisabledPopup: false,
            isOpenStatistic: false,
            isFinishShowResult: false,
            activePanelId: null,
            showBetPanel: false,
            isShowNextRoundMessage: false,
            roundId: 0,
            isAllowedBet: false,
            isPopupVisible: false,
            gameId: 0,
            roundState: '',
        });

        // Mock DOM APIs
        document.removeEventListener = jest.fn();
        document.addEventListener = jest.fn();
    });

    describe('lifecycle methods', () => {
        test('should add event listener on componentDidMount', () => {
            // Arrange & Act
            gameBase.componentDidMount();

            // Assert
            expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', gameBase.onVisibilityChange);
        });

        test('should remove event listener and close connection on componentWillUnmount', () => {
            // Arrange & Act
            gameBase.componentWillUnmount();

            // Assert
            expect(document.removeEventListener).toHaveBeenCalledWith('visibilitychange', gameBase.onVisibilityChange);
            expect(gameBase.closeConnect).toHaveBeenCalled();
        });
    });

    describe('connection handlers', () => {
        test('should call inGame with namespace when handleConnected is called with true', () => {
            // Arrange
            const inGameSpy = jest.spyOn(gameBase, 'inGame');

            // Act
            gameBase.handleConnected(true);

            // Assert
            expect(inGameSpy).toHaveBeenCalled();
            expect(gameBase.inGame()).toBe(mockProps.namespace);
        });

        test('should not call inGame when handleConnected is called with false', () => {
            // Arrange
            const inGameSpy = jest.spyOn(gameBase, 'inGame');

            // Act
            gameBase.handleConnected(false);

            // Assert
            expect(inGameSpy).not.toHaveBeenCalled();
        });

        test('should add event listener and connect to service gateway when createConnection is called', () => {
            // Arrange
            const connectToServiceGatewaySpy = jest.spyOn(gameBase, 'connectToServiceGateway');

            // Act
            gameBase.createConnection();

            // Assert
            expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', gameBase.onVisibilityChange);
            expect(connectToServiceGatewaySpy).toHaveBeenCalled();
        });

        test('should call GameConnectionService.handleReconnect when handleReconnect is called', () => {
            // Act
            gameBase.handleReconnect();

            // Assert
            expect(GameConnectionService.handleReconnect).toHaveBeenCalledWith(gameBase);
        });

        test('should reset state when resetStateWhenReconnect is called', () => {
            // Arrange
            jest.spyOn(gameBase, 'setState');
            const resetBettingPanelSpy = jest.spyOn(gameBase, 'resetBettingPanel');

            // Act
            gameBase.resetStateWhenReconnect();

            // Assert
            expect(gameBase.getState().isOpenStatistic).toBe(false);
            expect(resetBettingPanelSpy).toHaveBeenCalled();
        });
    });

    describe('store handlers', () => {
        test('should update isConnectFailed state when handleConnectFail is called with boolean', () => {
            // Arrange
            const setStateSpy = jest.spyOn(gameBase, 'setState');

            // Act
            gameBase.handleConnectFail(true);

            // Assert
            expect(setStateSpy).toHaveBeenCalledWith({ isConnectFailed: true });
            expect(gameBase.getState().isConnectFailed).toBe(true);
        });

        test('should not update state when handleConnectFail is called with null', () => {
            // Arrange
            const setStateSpy = jest.spyOn(gameBase, 'setState');
            const initialState = { ...gameBase.getState() };

            // Act
            gameBase.handleConnectFail(null as any);

            // Assert
            expect(setStateSpy).not.toHaveBeenCalled();
            expect(gameBase.getState()).toEqual(initialState);
        });

        test('should update isConnected state when handleDisconnected is called with boolean', () => {
            // Arrange
            const setStateSpy = jest.spyOn(gameBase, 'setState');

            // Act
            gameBase.handleDisconnected(true);

            // Assert
            expect(setStateSpy).toHaveBeenCalledWith({ isConnected: true });
            expect(gameBase.getState().isConnected).toBe(true);
        });

        test('should not update state when handleDisconnected is called with null', () => {
            // Arrange
            const setStateSpy = jest.spyOn(gameBase, 'setState');
            const initialState = { ...gameBase.getState() };

            // Act
            gameBase.handleDisconnected(null as any);

            // Assert
            expect(setStateSpy).not.toHaveBeenCalled();
            expect(gameBase.getState()).toEqual(initialState);
        });

        test('should update initialized state when handleGameConfigInitialized is called', () => {
            // Arrange
            const setStateSpy = jest.spyOn(gameBase, 'setState');

            // Act
            gameBase.handleGameConfigInitialized(true);

            // Assert
            expect(setStateSpy).toHaveBeenCalledWith({ initialized: true });
            expect(gameBase.getState().initialized).toBe(true);
        });

        test('should join game and update state when handleDisabledGame is called with false when previously true', () => {
            // Arrange
            // Set initial state to show disabled popup
            gameBase.setState({ showDisabledPopup: true });
            expect(gameBase.getState().showDisabledPopup).toBe(true);
            const setStateSpy = jest.spyOn(gameBase, 'setState');

            // Act
            gameBase.handleDisabledGame(false);

            // Assert
            expect(gameBase.joinGame).toHaveBeenCalled();
            expect(setStateSpy).toHaveBeenCalledWith({ showDisabledPopup: false });
            expect(gameBase.getState().showDisabledPopup).toBe(false);
        });

        test('should only update state when handleDisabledGame is called with true', () => {
            // Arrange
            gameBase.setState({ showDisabledPopup: false });
            const setStateSpy = jest.spyOn(gameBase, 'setState');

            // Act
            gameBase.handleDisabledGame(true);

            // Assert
            expect(gameBase.joinGame).not.toHaveBeenCalled();
            expect(setStateSpy).toHaveBeenCalledWith({ showDisabledPopup: true });
            expect(gameBase.getState().showDisabledPopup).toBe(true);
        });
    });

    describe('UI state management', () => {
        test('should reset betting panel state when resetBettingPanel is called', () => {
            // Arrange
            gameBase.setState({
                activePanelId: 'somePanel',
                showBetPanel: true
            });
            const setStateSpy = jest.spyOn(gameBase, 'setState');

            // Act
            gameBase.resetBettingPanel();

            // Assert
            expect(setStateSpy).toHaveBeenCalledWith({
                activePanelId: null,
                showBetPanel: false,
            });
            expect(gameBase.getState().activePanelId).toBeNull();
            expect(gameBase.getState().showBetPanel).toBe(false);
        });

        test('should toggle statistic state when toggleStatistic is called', () => {
            // Arrange
            gameBase.setState({ isOpenStatistic: false });
            expect(gameBase.getState().isOpenStatistic).toBe(false);

            // Act
            gameBase.toggleStatistic();

            // Assert
            expect(gameBase.getState().isOpenStatistic).toBe(true);

            // Toggle back
            gameBase.toggleStatistic();
            expect(gameBase.getState().isOpenStatistic).toBe(false);
        });
    });

    describe('rendering', () => {
        test('should render GameDisconnectView when isConnectFailed is true', () => {
            // Arrange
            const component = gameBase.testRender({ isConnectFailed: true });

            // Act
            render(component);

            // Assert
            expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();
        });

        test('should render GameLoadingView when isFirstInit is true', () => {
            // Arrange
            const component = gameBase.testRender({
                isConnectFailed: false,
                initialized: false,
                showDisabledPopup: false
            });

            // Act
            render(component);

            // Assert
            expect(screen.getByTestId('game-loading-view')).toBeInTheDocument();
        });

        test('should render notice when showDisabledPopup is true', () => {
            // Arrange
            const component = gameBase.testRender({
                isConnectFailed: false,
                showDisabledPopup: true
            });

            // Act
            render(component);

            // Assert
            expect(screen.getByTestId('game-notice')).toBeInTheDocument();
        });

        test('should render GameDisconnectView when isConnected is false', () => {
            // Arrange
            const component = gameBase.testRender({
                isConnectFailed: false,
                initialized: true,
                showDisabledPopup: false,
                isConnected: false
            });

            // Act
            render(component);

            // Assert
            expect(screen.getByTestId('game-disconnect-view')).toBeInTheDocument();
        });

        test('should render standard game layout when all conditions pass', () => {
            // Arrange
            const component = gameBase.testRender({
                isConnectFailed: false,
                initialized: true,
                showDisabledPopup: false,
                isConnected: true
            });

            // Act
            render(component);

            // Assert
            expect(gameBase.renderGameLayout).toHaveBeenCalled();
            expect(screen.getByTestId('game-layout')).toBeInTheDocument();
        });

        test('should render custom game layout when getGameLayout returns an element', () => {
            // Arrange
            const component = gameBaseWithCustomLayout.testRender({
                isConnectFailed: false,
                initialized: true,
                showDisabledPopup: false,
                isConnected: true
            });

            // Act
            render(component);

            // Assert
            expect(gameBaseWithCustomLayout.renderGameLayout).not.toHaveBeenCalled();
            expect(screen.getByTestId('custom-game-layout')).toBeInTheDocument();
        });

        test('should call handleReconnect when reconnect button is clicked', () => {
            // Arrange
            const handleReconnectSpy = jest.spyOn(gameBase, 'handleReconnect');
            const component = gameBase.testRender({ isConnectFailed: true });

            // Act
            render(component);
            fireEvent.click(screen.getByTestId('reconnect-button'));

            // Assert
            expect(handleReconnectSpy).toHaveBeenCalled();
        });
    });
});

// Test the index export
describe('Core index', () => {
    test('should export GameBase as default', () => {
        // Arrange & Act
        const GameBaseModule = require('../../../../src/games/game-base/core/index');

        // Assert
        expect(GameBaseModule.default).toBe(GameBase);
    });
}); 