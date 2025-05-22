export interface BettingBlockState {
    isShowBetSlip: boolean;
    betChoice: string;
    odd: number;
    position: {
        top: number;
        left: number;
    };
}

class BettingBlockService {
    private static instance: BettingBlockService;
    private state: BettingBlockState | null = null;

    private constructor() { }

    static getInstance(): BettingBlockService {
        if (!BettingBlockService.instance) {
            BettingBlockService.instance = new BettingBlockService();
        }
        return BettingBlockService.instance;
    }

    updateState(state: BettingBlockState): void {
        this.state = state;
        // Store state in window object
        (window as any).__BETTING_BLOCK_STATE__ = state;
        this.notifyParent(state);
    }

    getState(): BettingBlockState | null {
        return this.state;
    }

    private notifyParent(state: BettingBlockState): void {
        window.parent.postMessage({
            type: 'BETTING_BLOCK_STATE',
            state
        }, '*');
    }

    hideAllPanels(): void {
        window.parent.postMessage({
            type: 'HIDE_ALL_BET_PANELS'
        }, '*');
    }
}

export default BettingBlockService; 