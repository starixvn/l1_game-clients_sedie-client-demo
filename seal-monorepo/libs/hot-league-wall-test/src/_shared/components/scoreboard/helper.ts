import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

export const hasBlink = (roundState: string) =>
    roundState === ROUND_STATE.LOCKING_BET || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT;
