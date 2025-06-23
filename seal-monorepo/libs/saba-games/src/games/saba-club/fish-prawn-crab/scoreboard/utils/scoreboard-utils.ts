import * as gc from '@sg/sg-game-client';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

/**
 * Determines whether blinking dice should be shown based on round state
 * @param roundState Current round state
 * @returns boolean indicating if blinking dice should be shown
 */
export const shouldShowBlinkingDice = (roundState: string): boolean => {
    return roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
};

/**
 * Gets the translated scoreboard title
 * @returns The translated scoreboard title string
 */
export const getScoreboardTitle = (): string => {
    return gc.Translator.translate('Common.scoreboard');
}; 