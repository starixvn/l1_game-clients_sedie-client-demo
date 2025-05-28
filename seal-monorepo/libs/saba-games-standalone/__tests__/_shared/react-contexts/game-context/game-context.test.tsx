import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameContext, GameContextProvider, GameContextConsumer, useGameContext } from 'libs/saba-games/src/_shared/react-contexts/game-context/game-context';
import type { GamePropsContext } from 'libs/saba-games/src/_shared/components/game-base/type';

describe('GameContext', () => {
    describe('Context Creation', () => {
        it('should have correct display name', () => {
            expect(GameContext.displayName).toBe('GameContext');
        });

        it('should provide default values through consumer', () => {
            const TestComponent = () => (
                <GameContextConsumer>
                    {value => (
                        <div>
                            <div data-testid="default-namespace">{value.namespace}</div>
                            <div data-testid="default-language">{value.language}</div>
                        </div>
                    )}
                </GameContextConsumer>
            );

            render(<TestComponent />);
            expect(screen.getByTestId('default-namespace')).toHaveTextContent('default');
            expect(screen.getByTestId('default-language')).toHaveTextContent('en');
        });
    });

    describe('useGameContext Hook', () => {
        it('should return default context value when used outside provider', () => {
            const TestComponent = () => {
                const context = useGameContext();
                return <div data-testid="context-value">{context.namespace}</div>;
            };

            render(<TestComponent />);
            expect(screen.getByTestId('context-value')).toHaveTextContent('default');
        });

        it('should return provided context value when used inside provider', () => {
            const testContext: GamePropsContext = {
                namespace: 'test-namespace',
                language: 'fr'
            };

            const TestComponent = () => {
                const context = useGameContext();
                return (
                    <div>
                        <div data-testid="namespace">{context.namespace}</div>
                        <div data-testid="language">{context.language}</div>
                    </div>
                );
            };

            render(
                <GameContextProvider value={testContext}>
                    <TestComponent />
                </GameContextProvider>
            );

            expect(screen.getByTestId('namespace')).toHaveTextContent('test-namespace');
            expect(screen.getByTestId('language')).toHaveTextContent('fr');
        });
    });

    describe('GameContextConsumer', () => {
        it('should render with default context value', () => {
            const TestComponent = () => (
                <GameContextConsumer>
                    {value => <div data-testid="consumer-value">{value.namespace}</div>}
                </GameContextConsumer>
            );

            render(<TestComponent />);
            expect(screen.getByTestId('consumer-value')).toHaveTextContent('default');
        });

        it('should render with provided context value', () => {
            const testContext: GamePropsContext = {
                namespace: 'test-namespace',
                language: 'es'
            };

            const TestComponent = () => (
                <GameContextProvider value={testContext}>
                    <GameContextConsumer>
                        {value => (
                            <div>
                                <div data-testid="consumer-namespace">{value.namespace}</div>
                                <div data-testid="consumer-language">{value.language}</div>
                            </div>
                        )}
                    </GameContextConsumer>
                </GameContextProvider>
            );

            render(<TestComponent />);
            expect(screen.getByTestId('consumer-namespace')).toHaveTextContent('test-namespace');
            expect(screen.getByTestId('consumer-language')).toHaveTextContent('es');
        });
    });

    describe('Context Updates', () => {
        it('should update context value when provider value changes', () => {
            const initialContext: GamePropsContext = {
                namespace: 'initial',
                language: 'en'
            };

            const updatedContext: GamePropsContext = {
                namespace: 'updated',
                language: 'fr'
            };

            const TestComponent = ({ context }: { context: GamePropsContext }) => {
                return (
                    <GameContextProvider value={context}>
                        <GameContextConsumer>
                            {value => <div data-testid="context-value">{value.namespace}</div>}
                        </GameContextConsumer>
                    </GameContextProvider>
                );
            };

            const { rerender } = render(<TestComponent context={initialContext} />);
            expect(screen.getByTestId('context-value')).toHaveTextContent('initial');

            rerender(<TestComponent context={updatedContext} />);
            expect(screen.getByTestId('context-value')).toHaveTextContent('updated');
        });
    });
}); 
