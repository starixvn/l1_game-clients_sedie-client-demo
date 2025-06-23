import { SyncMemberSiteBalance } from "libs/saba-games/src/_shared/utils/sync-member-site-balance";

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
            const instance1 = SyncMemberSiteBalance.getInstance();
            const instance2 = SyncMemberSiteBalance.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('should create a new instance when instance is undefined', () => {
            const instance = SyncMemberSiteBalance.getInstance();
            expect(instance).toBeInstanceOf(SyncMemberSiteBalance);
        });

        it('should maintain singleton pattern across multiple getInstance calls', () => {
            const instance1 = SyncMemberSiteBalance.getInstance();
            const instance2 = SyncMemberSiteBalance.getInstance();
            const instance3 = SyncMemberSiteBalance.getInstance();
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe('setSyncBalanceCallback', () => {
        it('should set the callback function', () => {
            manager.setSyncBalanceCallback(mockCallback);
            expect(manager.getSyncBalanceCallback()).toBe(mockCallback);
        });

        it('should overwrite existing callback when set multiple times', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();

            manager.setSyncBalanceCallback(mockCallback1);
            manager.setSyncBalanceCallback(mockCallback2);

            expect(manager.getSyncBalanceCallback()).toBe(mockCallback2);
            expect(manager.getSyncBalanceCallback()).not.toBe(mockCallback1);
        });

        it('should handle null callback', () => {
            manager.setSyncBalanceCallback(null as any);
            expect(manager.getSyncBalanceCallback()).toBeNull();
        });

        it('should handle undefined callback', () => {
            manager.setSyncBalanceCallback(undefined as any);
            expect(manager.getSyncBalanceCallback()).toBeUndefined();
        });
    });

    describe('getSyncBalanceCallback', () => {
        it('should return null when no callback is set', () => {
            expect(manager.getSyncBalanceCallback()).toBeNull();
        });

        it('should return the set callback', () => {
            manager.setSyncBalanceCallback(mockCallback);
            expect(manager.getSyncBalanceCallback()).toBe(mockCallback);
        });

        it('should return null after setting and then clearing callback', () => {
            manager.setSyncBalanceCallback(mockCallback);
            manager.setSyncBalanceCallback(null as any);
            expect(manager.getSyncBalanceCallback()).toBeNull();
        });

        it('should return undefined after setting and then clearing callback with undefined', () => {
            manager.setSyncBalanceCallback(mockCallback);
            manager.setSyncBalanceCallback(undefined as any);
            expect(manager.getSyncBalanceCallback()).toBeUndefined();
        });
    });

    describe('executeSyncBalance', () => {
        it('should execute the callback with totalStake when set', () => {
            const totalStake = 100;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(totalStake);
            expect(mockCallback).toHaveBeenCalledWith(totalStake, undefined);
        });

        it('should execute the callback with winBet when set', () => {
            const winBet = 200;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(undefined, winBet);
            expect(mockCallback).toHaveBeenCalledWith(undefined, winBet);
        });

        it('should execute the callback with both parameters when set', () => {
            const totalStake = 100;
            const winBet = 200;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(totalStake, winBet);
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
        });

        it('should not throw error when callback is not set', () => {
            expect(() => manager.executeSyncBalance()).not.toThrow();
        });

        it('should not execute callback when not set', () => {
            manager.executeSyncBalance();
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should handle negative totalStake values', () => {
            const totalStake = -100;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(totalStake);
            expect(mockCallback).toHaveBeenCalledWith(totalStake, undefined);
        });

        it('should handle negative winBet values', () => {
            const winBet = -200;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(undefined, winBet);
            expect(mockCallback).toHaveBeenCalledWith(undefined, winBet);
        });

        it('should handle zero values for both parameters', () => {
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(0, 0);
            expect(mockCallback).toHaveBeenCalledWith(0, 0);
        });

        it('should handle decimal values for both parameters', () => {
            const totalStake = 100.50;
            const winBet = 200.75;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(totalStake, winBet);
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
        });

        it('should execute callback with correct order of parameters', () => {
            const totalStake = 100;
            const winBet = 200;
            manager.setSyncBalanceCallback(mockCallback);
            manager.executeSyncBalance(totalStake, winBet);
            expect(mockCallback).toHaveBeenCalledWith(totalStake, winBet);
            expect(mockCallback).not.toHaveBeenCalledWith(winBet, totalStake);
        });
    });
}); 