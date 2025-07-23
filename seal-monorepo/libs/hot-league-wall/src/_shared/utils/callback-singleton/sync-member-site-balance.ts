import { CallbackSingleton } from './callback-singleton';

export class SyncMemberSiteBalance extends CallbackSingleton<(totalStake?: number, winBet?: number) => void> {
    private constructor() {
        super();
    }

    public static getInstance(): SyncMemberSiteBalance {
        if (!SyncMemberSiteBalance.instance) {
            SyncMemberSiteBalance.instance = new SyncMemberSiteBalance();
        }
        return SyncMemberSiteBalance.instance;
    }

    public setSyncBalanceCallback(callback: (totalStake?: number, winBet?: number) => void): void {
        this.setCallback(callback);
    }

    public getSyncBalanceCallback(): ((totalStake?: number, winBet?: number) => void) | null {
        return this.getCallback();
    }

    public executeSyncBalance(totalStake?: number, winBet?: number): void {
        if (this.hasCallback()) {
            this.callback!(totalStake, winBet);
        }
    }
} 