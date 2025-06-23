import { GameConnectionService } from '../../../../src/games/game-base/services/game-connection-service';
import { GameBaseComponent } from '../../../../src/games/game-base/interfaces/common-types';

describe('GameConnectionService', () => {
    // Mock GameBaseComponent for all tests
    let mockComponent: jest.Mocked<GameBaseComponent>;

    beforeEach(() => {
        // Reset the mock component before each test
        mockComponent = {
            onVisibilityChange: jest.fn(),
            connectToServiceGateway: jest.fn(),
            terminateConnection: jest.fn(),
            resetStateWhenReconnect: jest.fn(),
            setState: jest.fn(),
            state: {
                isConnected: false,
                isConnectFailed: false,
                initialized: false,
                gameId: 0,
                roundId: 0,
                roundState: '',
                isAllowedBet: false,
                isShowNextRoundMessage: false,
                showDisabledPopup: false,
                isOpenStatistic: false,
                activePanelId: null,
                showBetPanel: false,
                isPopupVisible: false,
                isFinishShowResult: false
            }
        } as unknown as jest.Mocked<GameBaseComponent>;

        // Clear all mocks for document.addEventListener between tests
        jest.spyOn(document, 'addEventListener').mockClear();
    });

    describe('createConnection', () => {
        it('should add visibility change event listener and connect to service gateway', () => {
            // Arrange
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

            // Act
            GameConnectionService.createConnection(mockComponent);

            // Assert
            expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', mockComponent.onVisibilityChange);
            expect(mockComponent.connectToServiceGateway).toHaveBeenCalledTimes(1);
        });

        it('should not duplicate event listeners if called multiple times', () => {
            // Arrange
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

            // Act
            GameConnectionService.createConnection(mockComponent);
            GameConnectionService.createConnection(mockComponent);

            // Assert
            expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
            expect(mockComponent.connectToServiceGateway).toHaveBeenCalledTimes(2);
        });

        it('should work with null onVisibilityChange handler', () => {
            // Arrange
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            // @ts-ignore - Intentionally setting to null for testing
            mockComponent.onVisibilityChange = null;

            // Act & Assert - should not throw an error
            expect(() => {
                GameConnectionService.createConnection(mockComponent);
            }).not.toThrow();

            expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', null);
            expect(mockComponent.connectToServiceGateway).toHaveBeenCalledTimes(1);
        });
    });

    describe('terminateConnection', () => {
        it('should call component.terminateConnection', () => {
            // Act
            GameConnectionService.terminateConnection(mockComponent);

            // Assert
            expect(mockComponent.terminateConnection).toHaveBeenCalledTimes(1);
        });

        it('should throw error if component is null', () => {
            // Act & Assert - should throw an error when component is null
            expect(() => {
                GameConnectionService.terminateConnection(null as unknown as GameBaseComponent);
            }).toThrow(TypeError);
        });
    });

    describe('handleReconnect', () => {
        it('should terminate existing connection, create new connection, and reset state', () => {
            // Arrange
            const terminateSpy = jest.spyOn(GameConnectionService, 'terminateConnection');
            const createSpy = jest.spyOn(GameConnectionService, 'createConnection');

            // Act
            GameConnectionService.handleReconnect(mockComponent);

            // Assert
            // Check that methods were called in the correct order
            expect(terminateSpy).toHaveBeenCalledWith(mockComponent);
            expect(createSpy).toHaveBeenCalledWith(mockComponent);
            expect(mockComponent.resetStateWhenReconnect).toHaveBeenCalledTimes(1);

            // Verify the order of calls
            const callOrder = {
                terminate: terminateSpy.mock.invocationCallOrder[0],
                create: createSpy.mock.invocationCallOrder[0],
                resetState: mockComponent.resetStateWhenReconnect.mock.invocationCallOrder[0]
            };

            expect(callOrder.terminate).toBeLessThan(callOrder.create);
            expect(callOrder.create).toBeLessThan(callOrder.resetState);
        });

        it('should handle errors in terminateConnection and continue with reconnection', () => {
            // Arrange - Mock implementation of terminateConnection to throw error
            // Save and restore original implementation
            const originalTerminateConnection = GameConnectionService.terminateConnection;

            // Use stub function as property descriptor to prevent the method from being called at all
            const terminateConnectionStub = jest.fn(() => {
                throw new Error('Connection termination failed');
            });

            Object.defineProperty(GameConnectionService, 'terminateConnection', {
                value: terminateConnectionStub,
                configurable: true
            });

            // Act & Assert
            try {
                expect(() => {
                    GameConnectionService.handleReconnect(mockComponent);
                }).toThrow('Connection termination failed');

                // Verify that the error stopped further execution
                expect(mockComponent.resetStateWhenReconnect).not.toHaveBeenCalled();
            } finally {
                // Restore original method
                Object.defineProperty(GameConnectionService, 'terminateConnection', {
                    value: originalTerminateConnection,
                    configurable: true
                });
            }
        });
    });
}); 