import { IGameBaseState } from './index';

/**
 * Helper interface that adds common game state properties
 * This can be used to extend game component states to ensure
 * they have the same core properties
 */
export interface IGameStateProperties {
    isAllowedBet: boolean;
    activePanelId: any;
    showBetPanel: boolean;
    isPopupVisible: boolean;
    roundState: string;
    gameId: number;
    roundId: number;
} 