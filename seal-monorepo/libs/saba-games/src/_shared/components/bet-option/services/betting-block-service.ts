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

        // Map panel visibility states
        const visibilityStates = {
            show: () => {
                this.showPanel(state);
            },
            hide: () => {
                this.hidePanel();
            }
        };

        // Execute the appropriate action based on current visibility
        const action = state.isShowBetSlip ? visibilityStates.show : visibilityStates.hide;
        action();
    }

    getState(): BettingBlockState | null {
        return this.state;
    }

    private showPanel(state: BettingBlockState): void {
        window.parent.postMessage({
            type: 'BETTING_BLOCK_STATE',
            state: {
                ...state,
                isShowBetSlip: true
            }
        }, '*');
    }

    private hidePanel(): void {
        if (this.state) {
            window.parent.postMessage({
                type: 'BETTING_BLOCK_STATE',
                state: {
                    ...this.state,
                    isShowBetSlip: false
                }
            }, '*');
        }
    }

    hideAllPanels(): void {
        window.parent.postMessage({
            type: 'HIDE_ALL_BET_PANELS'
        }, '*');
    }
}

export default BettingBlockService; 