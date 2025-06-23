import { IGameBaseState } from './index';

/**
 * Extended state interface for the GatewayGameBase component
 */
export interface IGatewayGameBaseState extends IGameBaseState {
    isAuthorized: boolean;
    isSignedIn: boolean;

    // Common game state properties that should be available to all games
    isAllowedBet: boolean;
    activePanelId: any;
    showBetPanel: boolean;
} 