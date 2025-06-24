// Logic for determining the game message based on round state and other state properties
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';

export interface GameState {
    roundState: any;
    placingBetStartTime: number;
    countdownTimer: number;
    isShowNextRoundMessage: boolean;
}

export type Translator = { t: (key: string) => string };

export function getMessage(
    state: GameState,
    translator: Translator
): string | null {
    console.log('🔴 getMessage: Called with state:', state);

    let message: string | null = null;

    switch (state.roundState) {
        case ROUND_STATE.PLACING_BET:
            message = state.placingBetStartTime === state.countdownTimer
                ? translator.t('Common.message_place_bets')
                : null;
            break;
        case ROUND_STATE.LOCKING_BET:
            message = translator.t('Common.message_stop_bet');
            break;
        default:
            message = state.isShowNextRoundMessage
                ? translator.t('Common.message_placebet_next_round')
                : null;
            break;
    }

    console.log('🔴 getMessage: Returning message:', message);
    return message;
} 