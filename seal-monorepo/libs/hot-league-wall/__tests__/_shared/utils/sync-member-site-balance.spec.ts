import { SyncMemberSiteBalance } from '../../../src/_shared/utils/sync-member-site-balance';

describe('SyncMemberSiteBalance', () => {
    let instance: SyncMemberSiteBalance;

    beforeEach(() => {
        // Reset the singleton instance before each test
        (SyncMemberSiteBalance as any).instance = undefined;
        instance = SyncMemberSiteBalance.getInstance();
    });

    describe('getInstance', () => {
        it('should return the same instance (singleton pattern)', () => {
            const instance1 = SyncMemberSiteBalance.getInstance();
            const instance2 = SyncMemberSiteBalance.getInstance();
            
            expect(instance1).toBe(instance2);
        });

        it('should create new instance only once', () => {
            const instance1 = SyncMemberSiteBalance.getInstance();
            const instance2 = SyncMemberSiteBalance.getInstance();
            
            expect(instance1).toBe(instance2);
        });
    });

    describe('setSyncBalanceCallback', () => {
        it('should set the sync balance callback', () => {
            const mockCallback = jest.fn();
            
            instance.setSyncBalanceCallback(mockCallback);
            
            expect(instance.getSyncBalanceCallback()).toBe(mockCallback);
        });

        it('should replace existing callback when set again', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            instance.setSyncBalanceCallback(mockCallback1);
            instance.setSyncBalanceCallback(mockCallback2);
            
            expect(instance.getSyncBalanceCallback()).toBe(mockCallback2);
            expect(instance.getSyncBalanceCallback()).not.toBe(mockCallback1);
        });
    });

    describe('getSyncBalanceCallback', () => {
        it('should return null when no callback is set', () => {
            expect(instance.getSyncBalanceCallback()).toBeNull();
        });

        it('should return the set callback', () => {
            const mockCallback = jest.fn();
            instance.setSyncBalanceCallback(mockCallback);
            
            expect(instance.getSyncBalanceCallback()).toBe(mockCallback);
        });
    });

    describe('executeSyncBalance', () => {
        it('should call the callback with correct parameters when callback is set', () => {
            const mockCallback = jest.fn();
            instance.setSyncBalanceCallback(mockCallback);
            
            const totalStake = 1000;
            const winBet = 500;
            
            instance.executeSyncBalance(totalStake, winBet);
            
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
        });

        it('should call the callback with undefined parameters when not provided', () => {
            const mockCallback = jest.fn();
            instance.setSyncBalanceCallback(mockCallback);
            
            instance.executeSyncBalance();
            
            expect(mockCallback).toHaveBeenCalledWith(undefined, undefined);
        });

        it('should not throw error when no callback is set', () => {
            expect(() => {
                instance.executeSyncBalance(100, 50);
            }).not.toThrow();
        });

        it('should not call callback when no callback is set', () => {
            // This test ensures that executeSyncBalance doesn't crash when no callback is set
            expect(() => {
                instance.executeSyncBalance(100, 50);
            }).not.toThrow();
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complete workflow: set callback and execute', () => {
            const mockCallback = jest.fn();
            const totalStake = 2000;
            const winBet = 1500;
            
            // Set callback
            instance.setSyncBalanceCallback(mockCallback);
            
            // Execute sync balance
            instance.executeSyncBalance(totalStake, winBet);
            
            // Verify callback was called correctly
            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
        });

        it('should handle multiple executions with same callback', () => {
            const mockCallback = jest.fn();
            instance.setSyncBalanceCallback(mockCallback);
            
            // Execute multiple times
            instance.executeSyncBalance(100, 50);
            instance.executeSyncBalance(200, 100);
            instance.executeSyncBalance(300, 150);
            
            expect(mockCallback).toHaveBeenCalledTimes(3);
            expect(mockCallback).toHaveBeenNthCalledWith(1, 100, 50);
            expect(mockCallback).toHaveBeenNthCalledWith(2, 200, 100);
            expect(mockCallback).toHaveBeenNthCalledWith(3, 300, 150);
        });
    });
}); 