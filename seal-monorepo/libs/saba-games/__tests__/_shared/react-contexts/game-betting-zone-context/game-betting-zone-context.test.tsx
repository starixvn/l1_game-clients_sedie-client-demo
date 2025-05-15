import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    GameBettingZoneContext,
    GameBettingZoneContextProvider,
    GameBettingZoneContextConsumer,
    useGameBettingZoneContext,
    GameBettingOptionsContext,
    useGameBettingOptionsContext
} from 'libs/saba-games/src/_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import type { GameBettingZoneContextProps, GameBettingOptionsContextProps } from 'libs/saba-games/src/_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';

describe('GameBettingZoneContext', () => {
    describe('Context Creation', () => {
        it('should have correct display name', () => {
            expect(GameBettingZoneContext.displayName).toBe('GameBettingZoneContext');
        });

        it('should provide default values through consumer', () => {
            const TestComponent = () => (
                <GameBettingZoneContextConsumer>
                    {value => (
                        <div>
                            <div data-testid="default-game-name">{value.gameName}</div>
                            <div data-testid="default-bet-choice">{value.betChoice}</div>
                            <div data-testid="default-odd">{String(value.odd)}</div>
                        </div>
                    )}
                </GameBettingZoneContextConsumer>
            );

            render(<TestComponent />);
            expect(screen.getByTestId('default-game-name')).toHaveTextContent('');
            expect(screen.getByTestId('default-bet-choice')).toHaveTextContent('');
            expect(screen.getByTestId('default-odd')).toHaveTextContent('undefined');
        });
    });

    describe('useGameBettingZoneContext Hook', () => {
        it('should return default context value when used outside provider', () => {
            const TestComponent = () => {
                const context = useGameBettingZoneContext();
                return (
                    <div>
                        <div data-testid="context-game-name">{context.gameName}</div>
                        <div data-testid="context-bet-choice">{context.betChoice}</div>
                        <div data-testid="context-odd">{String(context.odd)}</div>
                    </div>
                );
            };

            render(<TestComponent />);
            expect(screen.getByTestId('context-game-name')).toHaveTextContent('');
            expect(screen.getByTestId('context-bet-choice')).toHaveTextContent('');
            expect(screen.getByTestId('context-odd')).toHaveTextContent('undefined');
        });

        it('should return provided context value when used inside provider', () => {
            const testContext: GameBettingZoneContextProps = {
                gameName: 'Baccarat',
                betChoice: 'player',
                odd: 1.95
            };

            const TestComponent = () => {
                const context = useGameBettingZoneContext();
                return (
                    <div>
                        <div data-testid="game-name">{context.gameName}</div>
                        <div data-testid="bet-choice">{context.betChoice}</div>
                        <div data-testid="odd">{String(context.odd)}</div>
                    </div>
                );
            };

            render(
                <GameBettingZoneContextProvider value={testContext}>
                    <TestComponent />
                </GameBettingZoneContextProvider>
            );

            expect(screen.getByTestId('game-name')).toHaveTextContent('Baccarat');
            expect(screen.getByTestId('bet-choice')).toHaveTextContent('player');
            expect(screen.getByTestId('odd')).toHaveTextContent('1.95');
        });
    });

    describe('Context Updates', () => {
        it('should update context value when provider value changes', () => {
            const initialContext: GameBettingZoneContextProps = {
                gameName: 'Baccarat',
                betChoice: 'player',
                odd: 1.95
            };

            const updatedContext: GameBettingZoneContextProps = {
                gameName: 'Roulette',
                betChoice: 'red',
                odd: 2.0
            };

            const TestComponent = ({ context }: { context: GameBettingZoneContextProps }) => {
                return (
                    <GameBettingZoneContextProvider value={context}>
                        <GameBettingZoneContextConsumer>
                            {value => (
                                <div>
                                    <div data-testid="context-game-name">{value.gameName}</div>
                                    <div data-testid="context-bet-choice">{value.betChoice}</div>
                                    <div data-testid="context-odd">{String(value.odd)}</div>
                                </div>
                            )}
                        </GameBettingZoneContextConsumer>
                    </GameBettingZoneContextProvider>
                );
            };

            const { rerender } = render(<TestComponent context={initialContext} />);
            expect(screen.getByTestId('context-game-name')).toHaveTextContent('Baccarat');
            expect(screen.getByTestId('context-bet-choice')).toHaveTextContent('player');
            expect(screen.getByTestId('context-odd')).toHaveTextContent('1.95');

            rerender(<TestComponent context={updatedContext} />);
            expect(screen.getByTestId('context-game-name')).toHaveTextContent('Roulette');
            expect(screen.getByTestId('context-bet-choice')).toHaveTextContent('red');
            expect(screen.getByTestId('context-odd')).toHaveTextContent('2');
        });
    });
});

describe('GameBettingOptionsContext', () => {
    describe('Context Creation', () => {
        it('should have correct display name', () => {
            expect(GameBettingOptionsContext.displayName).toBe('GameBettingOptionsContext');
        });

        it('should provide default values through consumer', () => {
            const TestComponent = () => (
                <GameBettingOptionsContext.Consumer>
                    {value => (
                        <div>
                            <div data-testid="default-panel-id">{String(value.panelId)}</div>
                            <div data-testid="default-show">{String(value.show)}</div>
                        </div>
                    )}
                </GameBettingOptionsContext.Consumer>
            );

            render(<TestComponent />);
            expect(screen.getByTestId('default-panel-id')).toHaveTextContent('null');
            expect(screen.getByTestId('default-show')).toHaveTextContent('false');
        });
    });

    describe('useGameBettingOptionsContext Hook', () => {
        it('should return default context value when used outside provider', () => {
            const TestComponent = () => {
                const context = useGameBettingOptionsContext();
                return (
                    <div>
                        <div data-testid="context-panel-id">{String(context.panelId)}</div>
                        <div data-testid="context-show">{String(context.show)}</div>
                    </div>
                );
            };

            render(<TestComponent />);
            expect(screen.getByTestId('context-panel-id')).toHaveTextContent('null');
            expect(screen.getByTestId('context-show')).toHaveTextContent('false');
        });

        it('should return provided context value when used inside provider', () => {
            const testContext: GameBettingOptionsContextProps = {
                panelId: 'test-panel',
                setPanelId: jest.fn(),
                show: true,
                setShow: jest.fn()
            };

            const TestComponent = () => {
                const context = useGameBettingOptionsContext();
                return (
                    <div>
                        <div data-testid="panel-id">{String(context.panelId)}</div>
                        <div data-testid="show">{String(context.show)}</div>
                    </div>
                );
            };

            render(
                <GameBettingOptionsContext.Provider value={testContext}>
                    <TestComponent />
                </GameBettingOptionsContext.Provider>
            );

            expect(screen.getByTestId('panel-id')).toHaveTextContent('test-panel');
            expect(screen.getByTestId('show')).toHaveTextContent('true');
        });

        it('should call setter functions when buttons are clicked', () => {
            const setPanelId = jest.fn();
            const setShow = jest.fn();

            const testContext: GameBettingOptionsContextProps = {
                panelId: 'test-panel',
                setPanelId,
                show: true,
                setShow
            };

            const TestComponent = () => {
                const { setPanelId, setShow } = useGameBettingOptionsContext();
                return (
                    <div>
                        <button data-testid="set-panel-id" onClick={() => setPanelId('new-panel')}>Set Panel ID</button>
                        <button data-testid="set-show" onClick={() => setShow(false)}>Set Show</button>
                    </div>
                );
            };

            render(
                <GameBettingOptionsContext.Provider value={testContext}>
                    <TestComponent />
                </GameBettingOptionsContext.Provider>
            );

            fireEvent.click(screen.getByTestId('set-panel-id'));
            expect(setPanelId).toHaveBeenCalledWith('new-panel');

            fireEvent.click(screen.getByTestId('set-show'));
            expect(setShow).toHaveBeenCalledWith(false);
        });
    });

    describe('Context Updates', () => {
        it('should update context value when provider value changes', () => {
            const initialContext: GameBettingOptionsContextProps = {
                panelId: 'initial-panel',
                setPanelId: jest.fn(),
                show: false,
                setShow: jest.fn()
            };

            const updatedContext: GameBettingOptionsContextProps = {
                panelId: 'updated-panel',
                setPanelId: jest.fn(),
                show: true,
                setShow: jest.fn()
            };

            const TestComponent = ({ context }: { context: GameBettingOptionsContextProps }) => {
                return (
                    <GameBettingOptionsContext.Provider value={context}>
                        <GameBettingOptionsContext.Consumer>
                            {value => (
                                <div>
                                    <div data-testid="context-panel-id">{String(value.panelId)}</div>
                                    <div data-testid="context-show">{String(value.show)}</div>
                                </div>
                            )}
                        </GameBettingOptionsContext.Consumer>
                    </GameBettingOptionsContext.Provider>
                );
            };

            const { rerender } = render(<TestComponent context={initialContext} />);
            expect(screen.getByTestId('context-panel-id')).toHaveTextContent('initial-panel');
            expect(screen.getByTestId('context-show')).toHaveTextContent('false');

            rerender(<TestComponent context={updatedContext} />);
            expect(screen.getByTestId('context-panel-id')).toHaveTextContent('updated-panel');
            expect(screen.getByTestId('context-show')).toHaveTextContent('true');
        });
    });
}); 
