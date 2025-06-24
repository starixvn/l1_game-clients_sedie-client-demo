import { IGatewayGameBaseState } from '../../../../games/game-base/interfaces/gateway-types';
import { GameBaseProps } from '../../../../games/game-base/type';
import { containerOptions, setting } from '../game-settings';
import { configGameContainer } from '../../../../games/game-base/startup';

export interface IRNGSoccerPageState extends IGatewayGameBaseState {
    isTimerActive: boolean;
    isPopupVisible: boolean;
}

export class RNGSoccerStateManager {
    private state: IRNGSoccerPageState;

    constructor(props: GameBaseProps) {
        console.log('🔵 RNGSoccerStateManager: Constructor called with props:', props);

        const { placingBet } = setting.durations;
        this.state = {
            gameId: setting.id,
            isTimerActive: true,
            isPopupVisible: false,
            roundId: 0,
            placingBetStartTime: placingBet,
        } as IRNGSoccerPageState;

        console.log('🔵 RNGSoccerStateManager: Initial state set:', this.state);

        try {
            configGameContainer(setting.name, containerOptions);
            console.log('🔵 RNGSoccerStateManager: Game container configured successfully');
        } catch (error) {
            console.error('🔵 RNGSoccerStateManager: Error configuring game container:', error);
            // Silent fail on initialization error
        }
    }

    // State management methods
    togglePopup = (setState: (state: Partial<IRNGSoccerPageState>) => void) => {
        console.log('🔵 RNGSoccerStateManager: togglePopup called, current isPopupVisible:', this.state.isPopupVisible);
        const newState = { isPopupVisible: !this.state.isPopupVisible };
        this.state = { ...this.state, ...newState };
        setState(newState);
    }

    setShowBetPanel = (show: boolean, setState: (state: Partial<IRNGSoccerPageState>) => void) => {
        console.log('🔵 RNGSoccerStateManager: setShowBetPanel called with:', show);
        const newState = { showBetPanel: show };
        this.state = { ...this.state, ...newState };
        setState(newState);
    };

    setPanelId = (id: string, setState: (state: Partial<IRNGSoccerPageState>) => void) => {
        console.log('🔵 RNGSoccerStateManager: setPanelId called with:', id);
        const newState = { activePanelId: id };
        this.state = { ...this.state, ...newState };
        setState(newState);
    };

    resetBettingPanel = (setState: (state: Partial<IRNGSoccerPageState>) => void) => {
        const newState = { showBetPanel: false, activePanelId: '' };
        this.state = { ...this.state, ...newState };
        setState(newState);
    };

    handleBetCallback = (setState: (state: Partial<IRNGSoccerPageState>) => void) => {
        console.log('🔵 RNGSoccerStateManager: onBet callback triggered');
        this.resetBettingPanel(setState);
        const newState = { isShowNextRoundMessage: true };
        this.state = { ...this.state, ...newState };
        setState(newState);

        setTimeout(() => {
            const timeoutState = { isShowNextRoundMessage: false };
            this.state = { ...this.state, ...timeoutState };
            setState(timeoutState);
        }, 3000);
    };

    getState(): IRNGSoccerPageState {
        return this.state;
    }

    updateState(newState: Partial<IRNGSoccerPageState>): void {
        this.state = { ...this.state, ...newState };
    }
} 