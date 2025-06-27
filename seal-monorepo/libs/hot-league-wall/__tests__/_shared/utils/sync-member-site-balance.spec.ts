import { SyncMemberSiteBalance } from '../../../src/_shared/utils/callback-singleton/sync-member-site-balance';

describe('SyncMemberSiteBalance', () => {
    let manager: SyncMemberSiteBalance;
    let mockCallback: jest.Mock;

    beforeEach(() => {
        // Reset the singleton instance before each test
        (SyncMemberSiteBalance as any).instance = undefined;
        manager = SyncMemberSiteBalance.getInstance();
        mockCallback = jest.fn();
    });

    describe('getInstance', () => {
        it('should return the same instance on multiple calls', () => {
            // Arrange & Act
            const instance1 = SyncMemberSiteBalance.getInstance();
            const instance2 = SyncMemberSiteBalance.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });

        it('should create a new instance when instance is undefined', () => {
            // Arrange & Act
            const instance = SyncMemberSiteBalance.getInstance();

            // Assert
            expect(instance).toBeInstanceOf(SyncMemberSiteBalance);
        });

        it('should maintain singleton pattern across multiple getInstance calls', () => {
            // Arrange & Act
            const instance1 = SyncMemberSiteBalance.getInstance();
            const instance2 = SyncMemberSiteBalance.getInstance();
            const instance3 = SyncMemberSiteBalance.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe('setSyncBalanceCallback', () => {
        it('should set the sync balance callback', () => {
            // Arrange
            const callback = (totalStake?: number, winBet?: number) => {
                console.log('Balance synced:', totalStake, winBet);
            };

            // Act
            manager.setSyncBalanceCallback(callback);

            // Assert
            expect(manager.getSyncBalanceCallback()).toBe(callback);
        });

        it('should overwrite existing callback when set again', () => {
            // Arrange
            const callback1 = (totalStake?: number, winBet?: number) => {
                console.log('First callback:', totalStake, winBet);
            };
            const callback2 = (totalStake?: number, winBet?: number) => {
                console.log('Second callback:', totalStake, winBet);
            };

            // Act
            manager.setSyncBalanceCallback(callback1);
            manager.setSyncBalanceCallback(callback2);

            // Assert
            expect(manager.getSyncBalanceCallback()).toBe(callback2);
            expect(manager.getSyncBalanceCallback()).not.toBe(callback1);
        });
    });

    describe('getSyncBalanceCallback', () => {
        it('should return null when no callback is set', () => {
            // Arrange & Act
            const callback = manager.getSyncBalanceCallback();

            // Assert
            expect(callback).toBeNull();
        });

        it('should return the set callback function', () => {
            // Arrange
            const callback = (totalStake?: number, winBet?: number) => {
                console.log('Test callback:', totalStake, winBet);
            };
            manager.setSyncBalanceCallback(callback);

            // Act
            const retrievedCallback = manager.getSyncBalanceCallback();

            // Assert
            expect(retrievedCallback).toBe(callback);
        });
    });

    describe('executeSyncBalance', () => {
        it('should execute the callback when callback is set', () => {
            // Arrange
            const totalStake = 100;
            const winBet = 50;
            manager.setSyncBalanceCallback(mockCallback);

            // Act
            manager.executeSyncBalance(totalStake, winBet);

            // Assert
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('should execute callback with no parameters when none provided', () => {
            // Arrange
            manager.setSyncBalanceCallback(mockCallback);

            // Act
            manager.executeSyncBalance();

            // Assert
            expect(mockCallback).toHaveBeenCalledWith(undefined, undefined);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('should not execute callback when no callback is set', () => {
            // Arrange & Act
            manager.executeSyncBalance(100, 50);

            // Assert
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should handle callback with only totalStake parameter', () => {
            // Arrange
            const totalStake = 200;
            manager.setSyncBalanceCallback(mockCallback);

            // Act
            manager.executeSyncBalance(totalStake);

            // Assert
            expect(mockCallback).toHaveBeenCalledWith(totalStake, undefined);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('should handle callback with only winBet parameter', () => {
            // Arrange
            const winBet = 75;
            manager.setSyncBalanceCallback(mockCallback);

            // Act
            manager.executeSyncBalance(undefined, winBet);

            // Assert
            expect(mockCallback).toHaveBeenCalledWith(undefined, winBet);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('integration with CallbackSingleton', () => {
        it('should use CallbackSingleton base functionality', () => {
            // Arrange
            const callback = (totalStake?: number, winBet?: number) => {
                console.log('Test:', totalStake, winBet);
            };

            // Act
            manager.setSyncBalanceCallback(callback);

            // Assert
            expect(manager.getSyncBalanceCallback()).toBe(callback);
            expect((manager as any).hasCallback()).toBe(true);
        });

        it('should handle callback state through base class', () => {
            // Arrange
            expect((manager as any).hasCallback()).toBe(false);

            // Act
            manager.setSyncBalanceCallback(mockCallback);

            // Assert
            expect((manager as any).hasCallback()).toBe(true);
        });

        it('should handle callback removal through base class', () => {
            // Arrange
            manager.setSyncBalanceCallback(mockCallback);
            expect((manager as any).hasCallback()).toBe(true);

            // Act
            (manager as any).callback = null;

            // Assert
            expect((manager as any).hasCallback()).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle callback that throws error', () => {
            // Arrange
            const errorCallback = jest.fn().mockImplementation(() => {
                throw new Error('Sync balance error');
            });
            manager.setSyncBalanceCallback(errorCallback);

            // Act & Assert
            expect(() => manager.executeSyncBalance(100, 50)).toThrow('Sync balance error');
            expect(errorCallback).toHaveBeenCalledWith(100, 50);
        });

        it('should handle callback with complex parameters', () => {
            // Arrange
            const totalStake = 999999.99;
            const winBet = 123456.78;
            manager.setSyncBalanceCallback(mockCallback);

            // Act
            manager.executeSyncBalance(totalStake, winBet);

            // Assert
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
        });
    });
}); 