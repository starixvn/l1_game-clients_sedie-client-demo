import { GameUIService } from '../../../../src/games/game-base/services/game-ui-service';
import { GameBaseComponent } from '../../../../src/games/game-base/interfaces/common-types';

describe('GameUIService', () => {
    // Mock setup and teardown
    let mockComponent: jest.Mocked<GameBaseComponent>;
    let originalSetTimeout: typeof global.setTimeout;

    beforeEach(() => {
        // Save original setTimeout
        originalSetTimeout = global.setTimeout;

        // Mock setTimeout to execute immediately
        jest.useFakeTimers();

        // Create mock component for each test
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
                activePanelId: 'panel-1',
                showBetPanel: true,
                isPopupVisible: false,
                isFinishShowResult: false
            }
        } as unknown as jest.Mocked<GameBaseComponent>;
    });

    afterEach(() => {
        // Restore original setTimeout
        jest.useRealTimers();
        global.setTimeout = originalSetTimeout;
    });

    describe('resetBettingPanel', () => {
        it('should reset activePanelId and showBetPanel state values', () => {
            // Act
            GameUIService.resetBettingPanel(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledWith({
                activePanelId: null,
                showBetPanel: false,
            });
        });

        it('should call setState once with correct values', () => {
            // Act
            GameUIService.resetBettingPanel(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledTimes(1);
            expect(mockComponent.setState.mock.calls[0][0]).toEqual({
                activePanelId: null,
                showBetPanel: false,
            });
        });

        it('should work with a component already in reset state', () => {
            // Arrange - set the component to already be in reset state
            mockComponent.state.activePanelId = null;
            mockComponent.state.showBetPanel = false;

            // Act
            GameUIService.resetBettingPanel(mockComponent);

            // Assert - should still call setState even if no actual change
            expect(mockComponent.setState).toHaveBeenCalledWith({
                activePanelId: null,
                showBetPanel: false,
            });
        });
    });

    describe('handleBetOption', () => {
        it('should reset betting panel and show next round message', () => {
            // Arrange
            const resetSpy = jest.spyOn(GameUIService, 'resetBettingPanel');

            // Act
            GameUIService.handleBetOption(mockComponent);

            // Assert
            expect(resetSpy).toHaveBeenCalledWith(mockComponent);
            expect(mockComponent.setState).toHaveBeenCalledWith({ isShowNextRoundMessage: true });
        });

        it('should hide next round message after 3 seconds', () => {
            // Act
            GameUIService.handleBetOption(mockComponent);

            // Assert - Before timer
            expect(mockComponent.setState).toHaveBeenCalledWith({ isShowNextRoundMessage: true });

            // Advance timer by 3 seconds
            jest.advanceTimersByTime(3000);

            // Assert - After timer
            expect(mockComponent.setState).toHaveBeenLastCalledWith({ isShowNextRoundMessage: false });
            expect(mockComponent.setState).toHaveBeenCalledTimes(3); // Once from resetBettingPanel, twice from handleBetOption
        });

        it('should set correct timeout duration of 3000ms', () => {
            // Arrange
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

            // Act
            GameUIService.handleBetOption(mockComponent);

            // Assert
            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
        });

        it('should work when state is already showing next round message', () => {
            // Arrange
            mockComponent.state.isShowNextRoundMessage = true;

            // Act
            GameUIService.handleBetOption(mockComponent);

            // Assert - Should still update state even if already true
            expect(mockComponent.setState).toHaveBeenCalledWith({ isShowNextRoundMessage: true });
        });
    });

    describe('toggleStatistic', () => {
        it('should toggle isOpenStatistic from false to true', () => {
            // Arrange
            mockComponent.state.isOpenStatistic = false;

            // Act
            GameUIService.toggleStatistic(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledWith({ isOpenStatistic: true });
        });

        it('should toggle isOpenStatistic from true to false', () => {
            // Arrange
            mockComponent.state.isOpenStatistic = true;

            // Act
            GameUIService.toggleStatistic(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledWith({ isOpenStatistic: false });
        });
    });

    describe('togglePopup', () => {
        it('should toggle isPopupVisible from false to true', () => {
            // Arrange
            mockComponent.state.isPopupVisible = false;

            // Act
            GameUIService.togglePopup(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledWith({ isPopupVisible: true });
        });


        it('should toggle isPopupVisible from true to false', () => {
            // Arrange
            mockComponent.state.isPopupVisible = true;

            // Act
            GameUIService.togglePopup(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledWith({ isPopupVisible: false });
        });

        it('should work when isPopupVisible is undefined', () => {
            // Arrange
            mockComponent.state.isPopupVisible = undefined;

            // Act
            GameUIService.togglePopup(mockComponent);

            // Assert
            expect(mockComponent.setState).toHaveBeenCalledWith({ isPopupVisible: true });
        });


    });
}); 