export class SyncMemberSiteBalance {
    private static instance: SyncMemberSiteBalance;
    private syncBalanceCallback: ((totalStake?: number, winBet?: number) => void) | null = null;

    private constructor() {
        // Private constructor to prevent direct construction calls with the `new` operator
    }

    public static getInstance(): SyncMemberSiteBalance {
        if (!SyncMemberSiteBalance.instance) {
            SyncMemberSiteBalance.instance = new SyncMemberSiteBalance();
        }
        return SyncMemberSiteBalance.instance;
    }

    public setSyncBalanceCallback(callback: (totalStake?: number, winBet?: number) => void): void {
        this.syncBalanceCallback = callback;
    }

    public getSyncBalanceCallback(): ((totalStake?: number, winBet?: number) => void) | null {
        return this.syncBalanceCallback;
    }

    public executeSyncBalance(totalStake?: number, winBet?: number): void {
        if (this.syncBalanceCallback) {
            this.syncBalanceCallback(totalStake, winBet);
        }
    }
} 